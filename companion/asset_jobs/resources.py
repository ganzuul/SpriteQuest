"""Resource pools and exclusive swap groups for the asset scheduler.

A pool is one worker or one remote provider slot set. It advertises amounts
(CPU, memory, GPU, VRAM) and string attributes (model, provider, swap group).
A swap group is an exclusive resource shared by pools that cannot hold two of
its models at once -- the llama-swap case.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass, field
from typing import Mapping

from .model import HostRequirements


@dataclass
class SwapGroup:
    """An exclusive model-residency group, e.g. llama-swap's ``image`` group."""

    id: str
    capacity: int = 1
    _in_use: int = 0
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def try_acquire(self) -> bool:
        with self._lock:
            if self._in_use >= self.capacity:
                return False
            self._in_use += 1
            return True

    def release(self) -> None:
        with self._lock:
            if self._in_use <= 0:
                raise RuntimeError(f"swap group {self.id!r} released too many times")
            self._in_use -= 1

    @property
    def in_use(self) -> int:
        with self._lock:
            return self._in_use


@dataclass
class Reservation:
    """A held pool slot and, when applicable, a held swap group."""

    pool: "ResourcePool"
    requirements: HostRequirements
    swap_group: SwapGroup | None
    _released: bool = False

    def release(self) -> None:
        if self._released:
            return
        self._released = True
        self.pool._release(self.requirements)
        if self.swap_group is not None:
            self.swap_group.release()


@dataclass
class ResourcePool:
    """A worker or provider capacity pool.

    ``amounts`` are total capacities (for example ``amount.worker.vcpu: 16``).
    ``attributes`` are string capabilities (for example
    ``attr.worker.model: ("moss-image-sft",)``). A pool with a ``swap_group``
    is specialised: it only accepts steps that request that group, so a
    llama-swap group cannot be consumed by an unrelated task.
    """

    id: str
    kind: str
    amounts: dict[str, float] = field(default_factory=dict)
    attributes: dict[str, tuple[str, ...]] = field(default_factory=dict)
    swap_group: str | None = None
    capacity: int = 1
    _running: int = 0
    _used: dict[str, float] = field(default_factory=dict)
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def supports(self, requirements: HostRequirements) -> bool:
        """True when the pool could satisfy the requirements if it were idle."""

        requested = requirements.attribute_map().get("attr.worker.swap_group", ())
        if self.swap_group is None and requested:
            return False
        if self.swap_group is not None and self.swap_group not in requested:
            return False
        for name, minimum in requirements.amount_map().items():
            if self.amounts.get(name, 0.0) < minimum:
                return False
        for name, any_of in requirements.attribute_map().items():
            values = set(self.attributes.get(name, ()))
            if not values.intersection(any_of):
                return False
        return True

    def try_reserve(
        self,
        requirements: HostRequirements,
        swap_groups: Mapping[str, SwapGroup],
    ) -> Reservation | None:
        if not self.supports(requirements):
            return None
        swap: SwapGroup | None = None
        if self.swap_group is not None:
            swap = swap_groups.get(self.swap_group)
            if swap is None:
                return None
            if not swap.try_acquire():
                return None
        with self._lock:
            if self._running >= self.capacity:
                if swap is not None:
                    swap.release()
                return None
            for name, minimum in requirements.amount_map().items():
                if self._used.get(name, 0.0) + minimum > self.amounts.get(name, 0.0):
                    if swap is not None:
                        swap.release()
                    return None
            self._running += 1
            for name, minimum in requirements.amount_map().items():
                self._used[name] = self._used.get(name, 0.0) + minimum
        return Reservation(self, requirements, swap)

    def _release(self, requirements: HostRequirements) -> None:
        with self._lock:
            if self._running <= 0:
                raise RuntimeError(f"pool {self.id!r} released too many times")
            self._running -= 1
            for name, minimum in requirements.amount_map().items():
                remaining = self._used.get(name, 0.0) - minimum
                if remaining <= 0:
                    self._used.pop(name, None)
                else:
                    self._used[name] = remaining

    @property
    def running(self) -> int:
        with self._lock:
            return self._running

    @property
    def used(self) -> dict[str, float]:
        with self._lock:
            return dict(self._used)


__all__ = ["Reservation", "ResourcePool", "SwapGroup"]