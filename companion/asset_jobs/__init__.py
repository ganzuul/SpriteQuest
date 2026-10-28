"""OpenJD-shaped asset job scheduling for SpriteQuest.

This package is a spike: it proves the job/resource/cancellation model before
the game depends on a production asset service.
"""

from .comfy import ComfyUIProvider, UrllibTransport
from .manifest import build_manifest, write_manifest
from .model import (
    JobTemplate,
    TemplateError,
    load_job_template,
    parse_job_template,
    resolve_parameters,
)
from .providers import (
    Artifact,
    MockProvider,
    Provider,
    ProviderCapabilities,
    ProviderError,
    ProviderRequest,
    ProviderResult,
)
from .resources import Reservation, ResourcePool, SwapGroup
from .scheduler import (
    Job,
    JobState,
    LockRecord,
    Outcome,
    PendingAsset,
    PreemptionPolicy,
    Priority,
    RegenerationPolicy,
    RegenerationRefused,
    Scheduler,
    StepRun,
    StepState,
)

__all__ = [
    "Artifact",
    "ComfyUIProvider",
    "Job",
    "JobState",
    "JobTemplate",
    "MockProvider",
    "Outcome",
    "PreemptionPolicy",
    "Priority",
    "RegenerationPolicy",
    "RegenerationRefused",
    "Provider",
    "ProviderCapabilities",
    "ProviderError",
    "ProviderRequest",
    "ProviderResult",
    "Reservation",
    "ResourcePool",
    "Scheduler",
    "StepRun",
    "StepState",
    "SwapGroup",
    "TemplateError",
    "UrllibTransport",
    "build_manifest",
    "load_job_template",
    "parse_job_template",
    "resolve_parameters",
    "write_manifest",
]
