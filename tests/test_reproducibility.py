from __future__ import annotations

import json

from ortheon.reproducibility import append_jsonl_event, make_experiment_id


def test_make_experiment_id() -> None:
    experiment_id = make_experiment_id(
        date="20260825",
        milestone="v1.3.1",
        area="OCR",
        short_name="PP-OCR baseline",
        seed=42,
    )

    assert experiment_id == "20260825_v1.3.1_ocr_pp-ocr-baseline_s42"


def test_append_jsonl_event(tmp_path) -> None:
    path = tmp_path / "events.jsonl"

    append_jsonl_event(
        path,
        experiment_id="20260825_v1.0.1_foundation_smoke_s42",
        event="smoke_test",
        component="foundation",
        data={"ok": True},
    )

    record = json.loads(path.read_text(encoding="utf-8").strip())
    assert record["event"] == "smoke_test"
    assert record["data"] == {"ok": True}
