# Experiments

This directory stores **small, reviewable experiment definitions and summaries**, not large outputs.

## Experiment ID

Canonical format:

```text
YYYYMMDD_<milestone>_<area>_<short-name>_s<seed>
```

Example:

```text
20260825_v1.3.1_ocr_ppocr-baseline_s42
```

Rules:

- use UTC or local calendar date consistently within a study,
- use the roadmap milestone that motivated the experiment,
- use lowercase kebab-case for the short name,
- include the deterministic seed when randomness is involved,
- reruns with materially different configuration receive a different ID.

## Tracked experiment record

A serious experiment should eventually have a small tracked directory such as:

```text
experiments/
└── 20260825_v1.3.1_ocr_ppocr-baseline_s42/
    ├── config.json
    ├── summary.md
    └── metrics.json
```

Large logs, predictions, images, checkpoints, and caches belong under ignored runtime paths such as `runs/` or `artifacts/`.

## Required metadata

Each experiment should identify:

- experiment ID,
- Ortheon commit SHA,
- roadmap milestone,
- dataset manifest/version,
- preprocessing/normalization version,
- model/checkpoint manifest,
- random seed,
- runtime/hardware metadata,
- metrics,
- output artifact checksums where retained,
- known failure cases,
- conclusion or decision.

## Logging contract

Machine logs should use JSON Lines (`.jsonl`) where practical, one event per line.

Recommended event fields:

```json
{
  "timestamp": "2026-08-25T14:00:00+07:00",
  "experiment_id": "20260825_v1.3.1_ocr_ppocr-baseline_s42",
  "level": "INFO",
  "event": "evaluation_complete",
  "component": "ocr",
  "data": {}
}
```

Human-readable summaries belong in Markdown; machine-readable metrics belong in JSON.
