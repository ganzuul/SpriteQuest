"""A deliberately small, documented subset of Open Job Description.

The scheduler only needs the portable parts of OpenJD: a job template, ordered
steps, parameters, host requirements, and a command to run. This module does
not attempt to implement the full specification. It rejects features it cannot
honour instead of silently ignoring them.

Reference: https://github.com/OpenJobDescription/openjd-specifications
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping, Sequence

_SPEC_PREFIX = "jobtemplate-"
_PARAM_RE = re.compile(r"\{\{\s*Param\.([A-Za-z_][A-Za-z0-9_]*)\s*\}\}")


class TemplateError(ValueError):
    """The template cannot be interpreted by this OpenJD subset."""


@dataclass(frozen=True)
class Parameter:
    name: str
    type: str
    default: Any = None
    allowed_values: tuple[Any, ...] = ()


@dataclass(frozen=True)
class AmountRequirement:
    name: str
    min: float


@dataclass(frozen=True)
class AttributeRequirement:
    name: str
    any_of: tuple[str, ...]


@dataclass(frozen=True)
class HostRequirements:
    amounts: tuple[AmountRequirement, ...] = ()
    attributes: tuple[AttributeRequirement, ...] = ()

    def amount_map(self) -> dict[str, float]:
        return {item.name: item.min for item in self.amounts}

    def attribute_map(self) -> dict[str, tuple[str, ...]]:
        return {item.name: item.any_of for item in self.attributes}


@dataclass(frozen=True)
class StepScript:
    command: str
    args: tuple[str, ...] = ()


@dataclass(frozen=True)
class Step:
    name: str
    dependencies: tuple[str, ...]
    host_requirements: HostRequirements
    script: StepScript
    timeout_seconds: float = 300.0
    retry: int = 0
    requires: tuple[str, ...] = ()


@dataclass(frozen=True)
class JobTemplate:
    name: str
    specification_version: str
    parameters: tuple[Parameter, ...]
    steps: tuple[Step, ...]
    source_path: Path | None = None

    def parameter_map(self) -> dict[str, Parameter]:
        return {parameter.name: parameter for parameter in self.parameters}

    def step_map(self) -> dict[str, Step]:
        return {step.name: step for step in self.steps}

    def canonical_json(self) -> str:
        return json.dumps(
            {
                "name": self.name,
                "specificationVersion": self.specification_version,
                "parameters": [
                    {
                        "name": parameter.name,
                        "type": parameter.type,
                        "default": parameter.default,
                        "allowedValues": list(parameter.allowed_values),
                    }
                    for parameter in self.parameters
                ],
                "steps": [
                    {
                        "name": step.name,
                        "dependencies": list(step.dependencies),
                        "hostRequirements": {
                            "amounts": [
                                {"name": amount.name, "min": amount.min}
                                for amount in step.host_requirements.amounts
                            ],
                            "attributes": [
                                {"name": attribute.name, "anyOf": list(attribute.any_of)}
                                for attribute in step.host_requirements.attributes
                            ],
                        },
                        "script": {
                            "actions": {
                                "onRun": {
                                    "command": step.script.command,
                                    "args": list(step.script.args),
                                }
                            }
                        },
                        "timeoutSeconds": step.timeout_seconds,
                        "retry": step.retry,
                        "requires": list(step.requires),
                    }
                    for step in self.steps
                ],
            },
            sort_keys=True,
            separators=(",", ":"),
        )

    def sha256(self) -> str:
        return hashlib.sha256(self.canonical_json().encode("utf-8")).hexdigest()


def load_job_template(path: str | Path) -> JobTemplate:
    source = Path(path)
    try:
        data = json.loads(source.read_text(encoding="utf-8"))
    except OSError as exc:
        raise TemplateError(f"cannot read template {source}: {exc}") from exc
    except ValueError as exc:
        raise TemplateError(f"template {source} is not valid JSON: {exc}") from exc
    template = parse_job_template(data)
    return JobTemplate(
        name=template.name,
        specification_version=template.specification_version,
        parameters=template.parameters,
        steps=template.steps,
        source_path=source,
    )


def parse_job_template(data: Mapping[str, Any]) -> JobTemplate:
    if not isinstance(data, Mapping):
        raise TemplateError("a job template must be a JSON object")
    name = _string(data.get("name"), "name")
    specification = _string(data.get("specificationVersion"), "specificationVersion")
    if not specification.startswith(_SPEC_PREFIX):
        raise TemplateError(
            f"specificationVersion must start with {_SPEC_PREFIX!r}, got {specification!r}"
        )
    if "parameterSpace" in data:
        raise TemplateError("parameterSpace is not supported by this subset")
    parameters = _parse_parameters(data.get("parameters", []))
    steps = _parse_steps(data.get("steps"))
    _validate_dependencies(steps)
    _validate_parameters_used(steps, parameters)
    return JobTemplate(
        name=name,
        specification_version=specification,
        parameters=parameters,
        steps=steps,
    )


def resolve_parameters(
    template: JobTemplate,
    supplied: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    supplied = dict(supplied or {})
    known = template.parameter_map()
    unknown = sorted(set(supplied) - set(known))
    if unknown:
        raise TemplateError(f"unknown parameter(s): {', '.join(unknown)}")
    values: dict[str, Any] = {}
    for parameter in template.parameters:
        value = supplied.get(parameter.name, parameter.default)
        if value is None:
            raise TemplateError(f"parameter {parameter.name!r} has no value and no default")
        if parameter.type == "INT":
            if isinstance(value, bool) or not isinstance(value, int):
                raise TemplateError(f"parameter {parameter.name!r} must be an INT")
        elif parameter.type == "FLOAT":
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                raise TemplateError(f"parameter {parameter.name!r} must be a FLOAT")
            value = float(value)
        elif parameter.type == "STRING":
            if not isinstance(value, str):
                raise TemplateError(f"parameter {parameter.name!r} must be a STRING")
        else:
            raise TemplateError(f"unsupported parameter type {parameter.type!r}")
        if parameter.allowed_values and value not in parameter.allowed_values:
            raise TemplateError(
                f"parameter {parameter.name!r} must be one of {parameter.allowed_values!r}"
            )
        values[parameter.name] = value
    return values


def substitute(value: str, parameters: Mapping[str, Any]) -> str:
    """Resolve the one expression form this subset supports: ``{{Param.Name}}``."""

    def replace(match: re.Match[str]) -> str:
        name = match.group(1)
        if name not in parameters:
            raise TemplateError(f"unknown parameter reference {name!r}")
        return str(parameters[name])

    return _PARAM_RE.sub(replace, value)


def _string(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise TemplateError(f"{field_name} must be a non-empty string")
    return value


def _parse_parameters(raw: Any) -> tuple[Parameter, ...]:
    if raw is None:
        return ()
    if not isinstance(raw, list):
        raise TemplateError("parameters must be a list")
    parameters: list[Parameter] = []
    seen: set[str] = set()
    for item in raw:
        if not isinstance(item, Mapping):
            raise TemplateError("each parameter must be an object")
        name = _string(item.get("name"), "parameter.name")
        if name in seen:
            raise TemplateError(f"duplicate parameter {name!r}")
        seen.add(name)
        param_type = _string(item.get("type"), f"parameter {name}.type").upper()
        if param_type not in {"STRING", "INT", "FLOAT"}:
            raise TemplateError(f"parameter {name!r} has unsupported type {param_type!r}")
        default = item.get("default")
        allowed = item.get("allowedValues", ())
        if not isinstance(allowed, (list, tuple)):
            raise TemplateError(f"parameter {name}.allowedValues must be a list")
        allowed_values = tuple(allowed)
        if default is not None:
            if param_type == "INT" and (isinstance(default, bool) or not isinstance(default, int)):
                raise TemplateError(f"parameter {name!r} default must be an INT")
            if param_type == "FLOAT" and (
                isinstance(default, bool) or not isinstance(default, (int, float))
            ):
                raise TemplateError(f"parameter {name!r} default must be a FLOAT")
            if param_type == "STRING" and not isinstance(default, str):
                raise TemplateError(f"parameter {name!r} default must be a STRING")
            if allowed_values and default not in allowed_values:
                raise TemplateError(f"parameter {name!r} default is not in allowedValues")
        parameters.append(Parameter(name, param_type, default, allowed_values))
    return tuple(parameters)


def _parse_steps(raw: Any) -> tuple[Step, ...]:
    if not isinstance(raw, list) or not raw:
        raise TemplateError("steps must be a non-empty list")
    steps: list[Step] = []
    seen: set[str] = set()
    for item in raw:
        if not isinstance(item, Mapping):
            raise TemplateError("each step must be an object")
        name = _string(item.get("name"), "step.name")
        if name in seen:
            raise TemplateError(f"duplicate step {name!r}")
        seen.add(name)
        if "parameterSpace" in item:
            raise TemplateError(f"step {name!r}: parameterSpace is not supported by this subset")
        dependencies_raw = item.get("dependencies", ())
        if not isinstance(dependencies_raw, (list, tuple)):
            raise TemplateError(f"step {name}.dependencies must be a list")
        dependencies = tuple(
            _string(dependency, f"step {name}.dependencies[]")
            for dependency in dependencies_raw
        )
        host_requirements = _parse_host_requirements(item.get("hostRequirements"), name)
        script = _parse_script(item.get("script"), name)
        requires_raw = item.get("requires", ())
        if not isinstance(requires_raw, (list, tuple)):
            raise TemplateError(f"step {name}.requires must be a list of asset identifiers")
        requires = tuple(
            _string(item_id, f"step {name}.requires[]") for item_id in requires_raw
        )
        timeout = item.get("timeoutSeconds", 300.0)
        if isinstance(timeout, bool) or not isinstance(timeout, (int, float)) or timeout <= 0:
            raise TemplateError(f"step {name}.timeoutSeconds must be a positive number")
        retry = item.get("retry", 0)
        if isinstance(retry, bool) or not isinstance(retry, int) or retry < 0:
            raise TemplateError(f"step {name}.retry must be a non-negative integer")
        steps.append(
            Step(
                name=name,
                dependencies=dependencies,
                host_requirements=host_requirements,
                script=script,
                timeout_seconds=float(timeout),
                retry=retry,
                requires=requires,
            )
        )
    return tuple(steps)


def _parse_host_requirements(raw: Any, step_name: str) -> HostRequirements:
    if raw is None:
        return HostRequirements()
    if not isinstance(raw, Mapping):
        raise TemplateError(f"step {step_name}.hostRequirements must be an object")
    amounts_raw = raw.get("amounts", ())
    attributes_raw = raw.get("attributes", ())
    if not isinstance(amounts_raw, (list, tuple)):
        raise TemplateError(f"step {step_name}.hostRequirements.amounts must be a list")
    if not isinstance(attributes_raw, (list, tuple)):
        raise TemplateError(f"step {step_name}.hostRequirements.attributes must be a list")
    amounts: list[AmountRequirement] = []
    for item in amounts_raw:
        if not isinstance(item, Mapping):
            raise TemplateError(f"step {step_name}: each amount must be an object")
        name = _string(item.get("name"), f"step {step_name}.amount.name")
        minimum = item.get("min")
        if isinstance(minimum, bool) or not isinstance(minimum, (int, float)) or minimum < 0:
            raise TemplateError(f"step {step_name}: amount {name!r} min must be non-negative")
        amounts.append(AmountRequirement(name, float(minimum)))
    attributes: list[AttributeRequirement] = []
    for item in attributes_raw:
        if not isinstance(item, Mapping):
            raise TemplateError(f"step {step_name}: each attribute must be an object")
        name = _string(item.get("name"), f"step {step_name}.attribute.name")
        any_of = item.get("anyOf")
        if not isinstance(any_of, (list, tuple)) or not any_of:
            raise TemplateError(f"step {step_name}: attribute {name!r} needs a non-empty anyOf")
        values = tuple(_string(value, f"step {step_name}.attribute.anyOf[]") for value in any_of)
        attributes.append(AttributeRequirement(name, values))
    return HostRequirements(tuple(amounts), tuple(attributes))


def _parse_script(raw: Any, step_name: str) -> StepScript:
    if not isinstance(raw, Mapping):
        raise TemplateError(f"step {step_name}.script must be an object")
    actions = raw.get("actions")
    if not isinstance(actions, Mapping):
        raise TemplateError(f"step {step_name}.script.actions must be an object")
    on_run = actions.get("onRun")
    if not isinstance(on_run, Mapping):
        raise TemplateError(f"step {step_name}.script.actions.onRun must be an object")
    command = _string(on_run.get("command"), f"step {step_name}.command")
    args_raw = on_run.get("args", ())
    if not isinstance(args_raw, (list, tuple)):
        raise TemplateError(f"step {step_name}.args must be a list")
    args = tuple(_string(arg, f"step {step_name}.args[]") for arg in args_raw)
    return StepScript(command, args)


def _validate_dependencies(steps: Sequence[Step]) -> None:
    names = {step.name for step in steps}
    for step in steps:
        for dependency in step.dependencies:
            if dependency not in names:
                raise TemplateError(f"step {step.name!r} depends on unknown step {dependency!r}")
            if dependency == step.name:
                raise TemplateError(f"step {step.name!r} cannot depend on itself")
    # Kahn's algorithm gives a deterministic cycle check.
    incoming = {step.name: set(step.dependencies) for step in steps}
    ready = [name for name, deps in incoming.items() if not deps]
    visited: list[str] = []
    while ready:
        name = ready.pop(0)
        visited.append(name)
        for other, deps in incoming.items():
            if name in deps:
                deps.remove(name)
                if not deps and other not in visited and other not in ready:
                    ready.append(other)
    if len(visited) != len(steps):
        cycle = sorted(set(incoming) - set(visited))
        raise TemplateError(f"dependency cycle among steps: {', '.join(cycle)}")


def _validate_parameters_used(steps: Sequence[Step], parameters: Sequence[Parameter]) -> None:
    known = {parameter.name for parameter in parameters}
    for step in steps:
        for value in (step.script.command, *step.script.args):
            for match in _PARAM_RE.finditer(value):
                if match.group(1) not in known:
                    raise TemplateError(
                        f"step {step.name!r} references unknown parameter {match.group(1)!r}"
                    )


def topological_order(steps: Sequence[Step]) -> tuple[Step, ...]:
    """Return a deterministic dependency-first ordering."""

    incoming = {step.name: set(step.dependencies) for step in steps}
    by_name = {step.name: step for step in steps}
    ready = sorted(name for name, deps in incoming.items() if not deps)
    ordered: list[Step] = []
    while ready:
        name = ready.pop(0)
        ordered.append(by_name[name])
        for other, deps in incoming.items():
            if name in deps:
                deps.remove(name)
                if not deps and other not in {step.name for step in ordered} and other not in ready:
                    ready.append(other)
        ready.sort()
    if len(ordered) != len(steps):
        raise TemplateError("dependency cycle")
    return tuple(ordered)


__all__ = [
    "AmountRequirement",
    "AttributeRequirement",
    "HostRequirements",
    "JobTemplate",
    "Parameter",
    "Step",
    "StepScript",
    "TemplateError",
    "load_job_template",
    "parse_job_template",
    "resolve_parameters",
    "substitute",
    "topological_order",
]