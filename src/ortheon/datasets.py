"""Dependency-free dataset registry, planning, acquisition and local integrity checks.

This is foundation tooling, not a claim that source data has been inspected.
All large files live outside Git, and no download occurs for list/status/plan/verify.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, cast

_REPO_ROOT = Path(__file__).resolve().parents[2]
_MANIFEST_DIR = _REPO_ROOT / "dataset" / "manifests"
_DATA_ROOT = Path(os.environ.get("ORTHEON_DATA_ROOT", str(_REPO_ROOT / "dataset/local/raw")))
_ID = re.compile(r"^[a-z][a-z0-9_]*$")
_SHA = re.compile(r"^[a-f0-9]{64}$")
_REVISION = re.compile(r"^[a-f0-9]{40}$")


class ManifestError(ValueError):
    """Invalid dataset registration or unsafe source metadata."""


def _safe_path(value: Any) -> str:
    if not isinstance(value, str) or not value or value.startswith(("/", "\\")):
        raise ManifestError("expected a nonempty relative POSIX path")
    if "\\" in value or ":" in value or any(p in ("", ".", "..") for p in value.split("/")):
        raise ManifestError("path contains an unsafe component: " + value)
    return value


def _record(value: Any, name: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ManifestError(name + " must be an object")
    return cast(dict[str, Any], value)


def _string(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ManifestError(field + " must be a nonempty string")
    return value


def _labels(value: Any, field: str) -> list[str]:
    if not isinstance(value, list) or any(not isinstance(v, str) or not v for v in value):
        raise ManifestError(field + " must be a list of nonempty strings")
    if len(set(value)) != len(value):
        raise ManifestError(field + " contains duplicate labels")
    return cast(list[str], value)


def validate_manifest(value: Any) -> dict[str, Any]:
    """Reject invalid metadata before it can influence filesystem operations."""
    m = _record(value, "manifest")
    if m.get("schema_version") != 1:
        raise ManifestError("unsupported manifest schema_version")
    identifier = _string(m.get("id"), "id")
    if not _ID.fullmatch(identifier):
        raise ManifestError("unsafe dataset id: " + identifier)
    _string(m.get("name"), "name")
    _string(m.get("domain"), "domain")
    if m.get("priority") not in ("primary", "supporting", "future"):
        raise ManifestError("invalid priority")
    source = _record(m.get("source"), "source")
    url = _string(source.get("url"), "source.url")
    if not url.startswith("https://"):
        raise ManifestError("source.url must be HTTPS")
    _string(source.get("version"), "source.version")
    revision = source.get("revision")
    if revision is not None and (not isinstance(revision, str) or not _REVISION.fullmatch(revision)):
        raise ManifestError("source.revision must be a 40-character commit SHA or null")
    access = _record(m.get("access"), "access")
    if access.get("method") not in ("huggingface", "manual"):
        raise ManifestError("unsupported access.method")
    if access.get("gated") not in (True, False, None):
        raise ManifestError("access.gated must be boolean or null")
    _string(access.get("instructions"), "access.instructions")
    if access["method"] == "huggingface":
        repo = _string(access.get("repo_id"), "access.repo_id")
        if not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repo):
            raise ManifestError("invalid Hugging Face repo ID")
    usage = _record(m.get("license"), "license")
    _string(usage.get("declared"), "license.declared")
    if usage.get("review_status") not in ("declared_unverified", "rights_review_required"):
        raise ManifestError("invalid license review status")
    _string(usage.get("notes"), "license.notes")
    storage = _record(m.get("storage"), "storage")
    for key in ("download_bytes", "processed_bytes"):
        count = storage.get(key)
        if count is not None and (type(count) is not int or count < 0):
            raise ManifestError("storage." + key + " must be nonnegative or null")
    counts = _record(m.get("counts"), "counts")
    for key, count in counts.items():
        if count is not None and (type(count) is not int or count < 0):
            raise ManifestError("counts." + key + " must be nonnegative or null")
    labels = _record(m.get("supervision"), "supervision")
    native = _labels(labels.get("native"), "supervision.native")
    derived = _labels(labels.get("proposed_derived"), "supervision.proposed_derived")
    if set(native).intersection(derived):
        raise ManifestError("native and proposed labels must not overlap")
    split = _record(m.get("split"), "split")
    group = split.get("group_by")
    if group is not None and not isinstance(group, str):
        raise ManifestError("split.group_by must be a string or null")
    paths = _labels(m.get("expected_paths"), "expected_paths")
    for path in paths:
        _safe_path(path)
    checksum_map = _record(m.get("sha256"), "sha256")
    for path, digest in checksum_map.items():
        _safe_path(path)
        if not isinstance(digest, str) or not _SHA.fullmatch(digest):
            raise ManifestError("invalid sha256 for " + path)
        if path not in paths:
            raise ManifestError("sha256 path must also be expected: " + path)
    return m


def load_registry(directory: Path = _MANIFEST_DIR) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for path in sorted(directory.glob("*.json")):
        try:
            manifest = validate_manifest(json.loads(path.read_text(encoding="utf-8")))
        except (ValueError, OSError) as exc:
            raise ManifestError(str(path) + ": " + str(exc)) from exc
        identifier = cast(str, manifest["id"])
        if identifier != path.stem or identifier in result:
            raise ManifestError("manifest ID/path mismatch or duplicate: " + str(path))
        result[identifier] = manifest
    if not result:
        raise ManifestError("no dataset manifests found in " + str(directory))
    return result


def quick_status(manifest: dict[str, Any], data_root: Path) -> dict[str, Any]:
    folder = data_root / cast(str, manifest["id"])
    required = cast(list[str], manifest["expected_paths"])
    if not folder.is_dir():
        state = "missing"
        missing = required
    else:
        missing = [p for p in required if not (folder / p).exists()]
        has_assets = any(
            f.is_file() and f.name != ".ortheon_acquisition.json"
            for f in folder.rglob("*")
        )
        state = "partial" if missing or not has_assets else "present_unverified"
    return {
        "id": manifest["id"],
        "state": state,
        "path": str(folder),
        "missing_paths": missing,
        "note": "Presence is not proof of data validity or license clearance.",
    }


def plan(manifest: dict[str, Any], data_root: Path) -> dict[str, Any]:
    source = cast(dict[str, Any], manifest["source"])
    access = cast(dict[str, Any], manifest["access"])
    return {
        "id": manifest["id"],
        "source": source,
        "access": access,
        "license": manifest["license"],
        "estimated_storage": manifest["storage"],
        "expected_paths": manifest["expected_paths"],
        "destination": str(data_root / cast(str, manifest["id"])),
        "requires_pinned_revision": access["method"] == "huggingface"
        and source["revision"] is None,
        "warning": "Use source terms; published labels are not automatically EIR ground truth.",
    }


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def verify_dataset(manifest: dict[str, Any], data_root: Path) -> dict[str, Any]:
    state = quick_status(manifest, data_root)
    if state["state"] in ("missing", "partial"):
        return state
    folder = data_root / cast(str, manifest["id"])
    declared = cast(dict[str, str], manifest["sha256"])
    tested = 0
    mismatches: list[str] = []
    for rel_path, expected in declared.items():
        actual = _sha256_file(folder / rel_path)
        tested += 1
        if actual != expected:
            mismatches.append(rel_path)
    acquisition_file = folder / ".ortheon_acquisition.json"
    locked_revision: str | None = None
    if acquisition_file.is_file():
        try:
            lock = _record(json.loads(acquisition_file.read_text(encoding="utf-8")), "lock")
            if lock.get("dataset_id") == manifest["id"]:
                locked_revision = lock.get("revision")
        except (OSError, ValueError):
            pass
    state.update({
        "state": "checksum_failed" if mismatches else (
            "verified_subset" if tested else "present_unverified"
        ),
        "known_checksums_checked": tested,
        "checksum_failures": mismatches,
        "acquisition_revision": locked_revision,
        "note": "Only declared files were hashed; dataset contents and rights are NOT fully certified.",
    })
    return state


def _show(value: Any) -> None:
    print(json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False))


def _fetch(
    manifest: dict[str, Any],
    data_root: Path,
    revision: str | None,
    *,
    dry_run: bool,
) -> int:
    access = cast(dict[str, Any], manifest["access"])
    if access["method"] == "manual":
        _show({
            "state": "manual_acquisition_required",
            "id": manifest["id"],
            "source": manifest["source"],
            "instructions": access["instructions"],
            "destination": str(data_root / cast(str, manifest["id"])),
        })
        return 0 if dry_run else 2
    source = cast(dict[str, Any], manifest["source"])
    revision = revision or cast(str | None, source["revision"])
    if revision is None or not _REVISION.fullmatch(revision):
        raise ManifestError(
            "A pinned 40-character Hugging Face commit SHA is required. "
            "Find the revision in the dataset's Files and versions history."
        )
    destination = data_root / cast(str, manifest["id"])
    command = [
        "hf", "download", cast(str, access["repo_id"]), "--repo-type", "dataset",
        "--revision", revision, "--local-dir", str(destination),
    ]
    if dry_run:
        _show({"state": "dry_run", "command": command,
               "warning": "Dataset terms and authentication may require additional steps."})
        return 0
    if shutil.which("hf") is None:
        raise ManifestError("Missing 'hf' CLI. Install huggingface_hub then retry.")
    if destination.exists() and any(destination.iterdir()):
        raise ManifestError(
            "Destination already contains files; inspect before acquiring another revision."
        )
    destination.mkdir(parents=True, exist_ok=True)
    completed = subprocess.run(command, check=False)
    if completed.returncode != 0:
        return completed.returncode
    lock = {
        "dataset_id": manifest["id"],
        "source": manifest["source"]["url"],
        "revision": revision,
        "acquired_at_utc": datetime.now(UTC).isoformat(),
        "method": "huggingface_snapshot",
        "integrity": "unverified",
    }
    (destination / ".ortheon_acquisition.json").write_text(
        json.dumps(lock, indent=2) + "\n", encoding="utf-8"
    )
    _show(verify_dataset(manifest, data_root))
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Ortheon reproducible dataset foundation")
    parser.add_argument("--manifest-dir", type=Path, default=_MANIFEST_DIR)
    parser.add_argument("--data-root", type=Path, default=_DATA_ROOT)
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("list", help="List registered sources without downloading")
    sub.add_parser("status", help="Check local availability without hashing files")
    sub.add_parser("validate", help="Validate all manifest contracts")
    for name in ("plan", "verify", "fetch"):
        cmd = sub.add_parser(name)
        cmd.add_argument("dataset_id")
        if name == "fetch":
            cmd.add_argument("--revision", help="Pinned Hugging Face dataset commit SHA")
            cmd.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)
    try:
        registry = load_registry(args.manifest_dir)
        if args.command == "list":
            _show([{
                "id": entry["id"], "domain": entry["domain"], "priority": entry["priority"],
                "native_labels": entry["supervision"]["native"],
                "gated": entry["access"]["gated"],
            } for entry in registry.values()])
        elif args.command == "validate":
            _show({"valid_manifests": len(registry), "ids": sorted(registry)})
        elif args.command == "status":
            _show([quick_status(entry, args.data_root) for entry in registry.values()])
        else:
            if args.dataset_id not in registry:
                raise ManifestError("Unknown dataset: " + args.dataset_id)
            entry = registry[args.dataset_id]
            if args.command == "plan":
                _show(plan(entry, args.data_root))
            elif args.command == "verify":
                result = verify_dataset(entry, args.data_root)
                _show(result)
                return 1 if result["state"] in ("missing", "partial", "checksum_failed") else 0
            else:
                return _fetch(
                    entry, args.data_root, args.revision, dry_run=args.dry_run
                )
        return 0
    except (ManifestError, OSError) as exc:
        print("ortheon dataset error: " + str(exc), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
