"""Small reproducibility helpers used by Ortheon experiments.

The v1.0.x foundation intentionally keeps this module dependency-light. Optional
scientific frameworks are seeded when present, but Ortheon does not require them
until later milestones introduce concrete model pipelines.
"""

from __future__ import annotations

import importlib
import importlib.metadata
import json
import os
import platform
import random
import re
import sys
from collections.abc import Iterable
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


DEFAULT_SEED = 42
_EXPERIMENT_PART = re.compile(r"[^a-z0-9.-]+")


@dataclass(frozen=True)
class RuntimeMetadata:
    """Runtime identity required for a reproducible experiment record."""

    captured_at: str
    python_version: str
    python_executable: str
    platform: str
    machine: str
    processor: str
    implementation: str
    environment: dict[str, str | None]
    package_versions: dict[str, str | None]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _safe_part(value: str) -> str:
    normalized = value.strip().lower().replace("_", "-")
    normalized = _EXPERIMENT_PART.sub("-", normalized)
    return normalized.strip("-")


def make_experiment_id(
    *,
    date: str,
    milestone: str,
    area: str,
    short_name: str,
    seed: int,
) -> str:
    """Create the canonical Ortheon experiment identifier.

    Expected output resembles::

        20260825_v1.3.1_ocr_ppocr-baseline_s42
    """

    if not re.fullmatch(r"\d{8}", date):
        raise ValueError("date must use YYYYMMDD format")

    parts = [_safe_part(milestone), _safe_part(area), _safe_part(short_name)]
    if any(not part for part in parts):
        raise ValueError("milestone, area, and short_name must be non-empty")

    return f"{date}_{parts[0]}_{parts[1]}_{parts[2]}_s{seed}"


def set_deterministic_seed(seed: int = DEFAULT_SEED) -> dict[str, bool]:
    """Seed Python and supported optional scientific frameworks.

    The returned mapping records which optional frameworks were available and
    configured. This function improves repeatability but does not promise
    bit-for-bit determinism for every accelerator/kernel; experiments must still
    record their runtime and framework configuration.
    """

    os.environ["PYTHONHASHSEED"] = str(seed)
    random.seed(seed)

    configured = {"python": True, "numpy": False, "torch": False}

    try:
        numpy = importlib.import_module("numpy")
    except ImportError:
        numpy = None

    if numpy is not None:
        random_module = getattr(numpy, "random", None)
        seed_function = getattr(random_module, "seed", None)
        if callable(seed_function):
            seed_function(seed)
            configured["numpy"] = True

    try:
        torch = importlib.import_module("torch")
    except ImportError:
        torch = None

    if torch is not None:
        manual_seed = getattr(torch, "manual_seed", None)
        if callable(manual_seed):
            manual_seed(seed)
            configured["torch"] = True

        cuda = getattr(torch, "cuda", None)
        cuda_available = getattr(cuda, "is_available", None)
        manual_seed_all = getattr(cuda, "manual_seed_all", None)
        if callable(cuda_available) and cuda_available() and callable(manual_seed_all):
            manual_seed_all(seed)

        backends = getattr(torch, "backends", None)
        cudnn = getattr(backends, "cudnn", None)
        if cudnn is not None:
            if hasattr(cudnn, "deterministic"):
                cudnn.deterministic = True
            if hasattr(cudnn, "benchmark"):
                cudnn.benchmark = False

    return configured


def _package_version(name: str) -> str | None:
    try:
        return importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError:
        return None


def capture_runtime_metadata(
    packages: Iterable[str] = ("ortheon", "numpy", "torch", "opencv-python", "paddleocr"),
) -> RuntimeMetadata:
    """Capture lightweight runtime/hardware-adjacent metadata.

    GPU-specific information will be expanded when GPU model pipelines are
    introduced. v1.0.x records enough information to identify the Python/runtime
    environment without introducing accelerator dependencies.
    """

    environment_keys = (
        "CUDA_VISIBLE_DEVICES",
        "CUBLAS_WORKSPACE_CONFIG",
        "PYTHONHASHSEED",
        "OMP_NUM_THREADS",
        "MKL_NUM_THREADS",
    )

    return RuntimeMetadata(
        captured_at=datetime.now().astimezone().isoformat(),
        python_version=platform.python_version(),
        python_executable=sys.executable,
        platform=platform.platform(),
        machine=platform.machine(),
        processor=platform.processor(),
        implementation=platform.python_implementation(),
        environment={key: os.environ.get(key) for key in environment_keys},
        package_versions={name: _package_version(name) for name in packages},
    )


def append_jsonl_event(
    path: str | Path,
    *,
    experiment_id: str,
    event: str,
    component: str,
    data: dict[str, Any] | None = None,
    level: str = "INFO",
) -> None:
    """Append one machine-readable event using the Ortheon JSONL convention."""

    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)

    record = {
        "timestamp": datetime.now().astimezone().isoformat(),
        "experiment_id": experiment_id,
        "level": level.upper(),
        "event": event,
        "component": component,
        "data": data or {},
    }

    with destination.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True))
        handle.write("\n")
