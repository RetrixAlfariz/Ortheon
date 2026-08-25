# Contributing to Ortheon

Ortheon is currently a research-first engineering drawing understanding project. Contributions should preserve reproducibility, traceability, and clear separation between perception, parsing, standards interpretation, and downstream reasoning.

## Current scope

The v1 research scope is **2D mechanical engineering/manufacturing drawings**. Electrical schematics, P&IDs, architecture, full 3D reconstruction, and broad multimodal engineering reasoning are later expansion targets unless a roadmap item explicitly introduces them.

## Development rules

1. **Do not commit large datasets or model weights.** Store manifests, checksums, scripts, schemas, metrics, and small fixtures in Git; keep raw/processed datasets and checkpoints outside tracked repository paths.
2. **Preserve provenance.** Every derived sample should be traceable to its source dataset/version and conversion pipeline.
3. **Separate native and derived labels.** Dataset metadata supplied by an upstream source must not be silently mixed with Ortheon-generated supervision.
4. **Prefer deterministic parsing where the underlying representation is exact.** Vector PDFs/DXF/SVG should preserve native text and geometry rather than rasterizing them and re-detecting information unnecessarily.
5. **Uncertainty is data.** OCR, entity parsing, relation reconstruction, and standards interpretation should preserve confidence/ambiguity rather than collapsing uncertain outputs into a single apparently certain value.
6. **Standards are versioned dependencies.** Do not copy copyrighted standards text into the repository. Store identifiers, editions, derived rule implementations, tests, and provenance instead.
7. **Model training follows contracts.** Do not treat a checkpoint as a milestone until its input/output schema, dataset version, evaluation metrics, and baseline comparison are recorded.

## Branch and version workflow

- `main` is the stable repository line.
- Research work should happen on focused branches.
- The current research branch is `research/dataset-foundation`.
- Version targets and acceptance criteria live in `development_progress/README.md`.
- Current execution status lives in `development_progress/status.md`.

## Experiment record

Every serious experiment should eventually record:

- experiment ID,
- code commit SHA,
- dataset manifest/version,
- preprocessing configuration,
- model/checkpoint identifier,
- random seed(s),
- hardware/software environment,
- metrics,
- artifacts/checksums,
- known failure cases,
- conclusion/decision.

## Pull request expectations

A change should state:

- what research or engineering problem it addresses,
- which roadmap milestone it belongs to,
- what data/contracts it changes,
- how it was validated,
- whether it changes reproducibility or storage requirements.

For parser/schema changes, include a minimal fixture showing the previous and new representation where possible.
