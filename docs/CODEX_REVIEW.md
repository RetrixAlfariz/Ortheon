# Codex Review Workflow

This document defines how Codex should be used to audit Ortheon development without silently changing the project scope.

## Current review target

At the time this workflow was introduced, the active development target is:

```text
branch: research/dataset-foundation
completed: v1.0.x project/research foundation
active: v1.1.0 dataset registry and acquisition
next: v1.1.1 dataset validation/normalization
then: v1.1.2 Ortheon-Parse specification
```

The Engineering Inspector UI has completed its current design/prototype pass. Treat UI work as **parked / bugfix-only** unless a task explicitly reopens UI development.

Model downloads and model training are **not part of the current milestone**.

## Documents Codex must read first

Before judging progress, inspect:

1. `README.md`
2. `development_progress/README.md`
3. `development_progress/status.md`
4. `dataset/README.md`
5. `docs/ARCHITECTURE.md`
6. `docs/EIR_NOTES.md`
7. `docs/REPRODUCIBILITY.md`
8. `CONTRIBUTING.md`
9. `.github/workflows/ci.yml`
10. `pyproject.toml`

Do not infer milestone requirements from filenames alone. Use the release gates documented in the roadmap.

## What Codex should check now

### 1. Repository truthfulness

Verify that `development_progress/status.md` matches the code that actually exists.

Flag any task marked complete when its implementation, tests, documentation, or reproducibility evidence is missing.

### 2. v1.1.0 release-gate progress

Audit the dataset registry/acquisition work against the roadmap. In particular check whether the repository has, or still lacks:

- real manifests for MechVQA, TriView-CAD, SketchGraphs, Fusion 360 Gallery, and the initial ABC subset,
- canonical source/version/citation/license information,
- expected local-path definitions,
- storage estimates before acquisition,
- registry loading and manifest validation,
- availability/status checks that do not require downloading everything,
- reproducible acquisition instructions or commands,
- resumable acquisition where practical,
- deterministic handling of datasets that require manual/authenticated upstream steps.

The v1.1.0 release gate is not passed until at least MechVQA, TriView-CAD, and SketchGraphs can be reproducibly registered and acquired, or routed through clearly documented mandatory manual upstream steps.

### 3. Python environment

Ortheon intends to use `uv` for Python dependency management.

Check whether the repository consistently supports:

```bash
uv sync --extra dev
uv run pytest -q
uv run ruff check .
uv run mypy src
```

Report remaining plain-pip-only CI or documentation paths and whether an `uv.lock` exists and is appropriate to commit.

Do not add heavy ML dependencies during the foundation milestone.

### 4. CI and tests

Check that CI covers the existing Python package and desktop frontend without requiring model weights or large datasets.

Run or inspect the relevant tests/builds when the environment permits. Distinguish verified failures from untested assumptions.

### 5. Architecture boundaries

Verify that implementation and documentation preserve these contracts:

```text
Drawing -> modular teacher parser OR Ortheon-One -> EIR / EDL
EIR / EDL -> deterministic tools / standards / MicroLM / larger reasoner
```

- Ortheon-One is the future unified visual/OCR/semantic parser.
- Engineering MicroLM is a separate downstream language model over EIR/EDL.
- standards logic remains deterministic/versioned where possible.
- uncertainty and provenance remain first-class data.

Flag code or docs that blur these boundaries.

### 6. Scope protection

Unless explicitly requested, Codex must **not**:

- redesign or expand the UI,
- download OCR/detector/VLM checkpoints,
- download large datasets merely to prove the downloader works,
- start Ortheon-One training,
- start MicroLM training,
- freeze EIR before v1.1.x exposes real representation requirements,
- implement broad standards logic before the entity/constraint representation stabilizes,
- expand into electrical/P&ID/architecture domains.

## Expected audit output

Codex should return a concise engineering review with these sections:

```text
VERDICT
- current milestone state
- whether the documented status is truthful
- whether the current release gate passes

PASS
- verified completed items with file/test evidence

PARTIAL
- implemented but incomplete items

FAIL / MISSING
- required items that do not exist or do not work

RISKS
- reproducibility, licensing, architecture, test, or scope risks

NEXT ACTIONS
- ordered tasks required to reach the current release gate

COMMANDS VERIFIED
- commands actually run and their results
```

Use exact paths, tests, commands, or commits as evidence wherever possible. Do not mark something as passing because the README says it should exist.

## Fix policy

For a review-only request, do not modify the repository. Report findings first.

If the user explicitly asks Codex to implement fixes afterward, prefer the smallest changes needed to satisfy the active release gate. Update `development_progress/status.md` only after the corresponding implementation is verified.
