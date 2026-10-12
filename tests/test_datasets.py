"""Offline v1.1.0 dataset registry tests: zero source downloads."""

from __future__ import annotations

import hashlib
import json

import pytest

from ortheon.datasets import (
    ManifestError,
    _fetch,
    load_registry,
    plan,
    quick_status,
    validate_manifest,
    verify_dataset,
)


def test_manifest_catalog_contains_2d_sources() -> None:
    registry = load_registry()
    assert {"cadsy", "mechvqa", "triview_cad", "sketchgraphs_filtered", "mechatlas"} <= set(
        registry
    )
    assert registry["cadsy"]["counts"]["records"] == 65
    assert registry["cadsy"]["counts"]["drawings"] == 130
    assert registry["mechvqa"]["counts"]["qa_records"] == 13515
    assert "dimension_to_feature" in registry["cadsy"]["supervision"]["proposed_derived"]
    assert "dimension_to_feature" not in registry["cadsy"]["supervision"]["native"]


def test_registry_works_without_data_or_network(tmp_path) -> None:
    item = load_registry()["cadsy"]
    assert quick_status(item, tmp_path)["state"] == "missing"
    assert plan(item, tmp_path)["requires_pinned_revision"] is True
    assert _fetch(item, tmp_path, "a" * 40, dry_run=True) == 0
    assert not list(tmp_path.iterdir())


def test_reject_unsafe_path() -> None:
    item = json.loads(json.dumps(load_registry()["cadsy"]))
    item["expected_paths"] = ["../../secret.txt"]
    with pytest.raises(ManifestError):
        validate_manifest(item)


def test_requires_pinned_hf_revision(tmp_path) -> None:
    item = load_registry()["mechvqa"]
    with pytest.raises(ManifestError, match="pinned"):
        _fetch(item, tmp_path, None, dry_run=True)


def test_verify_declared_hash_only(tmp_path) -> None:
    item = json.loads(json.dumps(load_registry()["cadsy"]))
    item["expected_paths"] = ["metadata.jsonl"]
    payload = b'{"part_id":"part_0001"}\n'
    item["sha256"] = {"metadata.jsonl": hashlib.sha256(payload).hexdigest()}
    folder = tmp_path / "cadsy"
    folder.mkdir()
    (folder / "metadata.jsonl").write_bytes(payload)
    actual = verify_dataset(item, tmp_path)
    assert actual["state"] == "verified_subset"
    assert actual["known_checksums_checked"] == 1
    assert "NOT fully certified" in actual["note"]


def test_detect_bad_digest(tmp_path) -> None:
    item = json.loads(json.dumps(load_registry()["cadsy"]))
    item["expected_paths"] = ["metadata.jsonl"]
    item["sha256"] = {"metadata.jsonl": "0" * 64}
    folder = tmp_path / "cadsy"
    folder.mkdir()
    (folder / "metadata.jsonl").write_text("changed")
    assert verify_dataset(item, tmp_path)["state"] == "checksum_failed"


def test_manual_acquisition_requires_manual_action(tmp_path) -> None:
    item = load_registry()["triview_cad"]
    assert _fetch(item, tmp_path, None, dry_run=True) == 0
    assert _fetch(item, tmp_path, None, dry_run=False) == 2
