# Ortheon

**Standards-aware visual engineering parsing for technical drawings.**

Ortheon is a research project for converting engineering drawings into a structured, traceable **Engineering Intermediate Representation (EIR)** that can be validated deterministically, consumed by engineering tools, and supplied to language models for engineering-oriented reasoning.

The project deliberately treats OCR as only one part of the problem. Its primary research target is recovering the **engineering structure** encoded by a drawing: geometry, annotations, feature relationships, tolerances, constraints, provenance, uncertainty, and standards interpretation.

## Current status

- Development generation: **v1**
- Current completed foundation: **v1.0.x**
- Active milestone: **v1.1.x - dataset foundation and Ortheon-Parse specification**
- Research branch: `research/dataset-foundation`
- Initial domain: **2D mechanical manufacturing drawings**
- Desktop research UI: engineering-inspector prototype under `apps/desktop/`; current design/polish pass is **parked / bugfix-only**
- Model weights: **not downloaded during the current foundation stage**

See [`development_progress/status.md`](development_progress/status.md) for the live status and [`development_progress/README.md`](development_progress/README.md) for the full roadmap.

## Core thesis

```text
Engineering drawing
        |
        v
visual engineering parser
        |
        |  early v1: modular teacher pipeline
        |  later v1: Ortheon-One unified parser
        v
Engineering Intermediate Representation (EIR)
        |
        +--> deterministic standards/rule validation
        +--> engineering solvers/tools
        +--> Engineering Description Language (EDL)
        +--> Engineering MicroLM
        `--> larger reasoning models
```

The research hypothesis is that a language model does not need to rediscover every engineering relationship directly from pixels if Ortheon first reconstructs a compact, explicit engineering representation.

---

# Model boundary contract

This distinction is architectural and must remain explicit throughout the project.

## Ortheon-One

**Ortheon-One is Ortheon's own unified visual engineering parsing model.**

Its job is:

```text
engineering drawing
        |
        v
   Ortheon-One
        |
        v
semantic engineering representation
      EIR / EDL
```

Ortheon-One is intended to learn visual and structural parsing tasks such as:

- engineering text/token recognition,
- visual primitive and feature detection,
- geometry prediction,
- dimension/tolerance/GD&T entity extraction,
- datum and annotation recognition,
- relation reconstruction,
- engineering constraint recovery,
- confidence/ambiguity prediction,
- structured EIR/EDL generation.

It is **not** the downstream engineering language model.

During early development, Ortheon-One does not exist yet. A modular teacher/baseline pipeline built from specialist OCR/detection models plus deterministic geometry/relation/standards components is developed first. That pipeline helps create trustworthy supervision and Ortheon-Parse data before Ortheon-One is trained.

## Engineering MicroLM

**The Engineering MicroLM is a separate downstream language model.**

Its job begins only after semantic parsing already exists:

```text
Drawing
  |
  v
Ortheon parser
(modular or Ortheon-One)
  |
  v
EIR / EDL
  |
  v
Engineering MicroLM
  |
  +--> EIR queries
  +--> relation lookup
  +--> constraint comparison
  +--> explanation
  +--> uncertainty-aware routing
  `--> engineering tool calls
```

The MicroLM is therefore **not merged into Ortheon-One**. It consumes Ortheon's semantic output rather than sharing the same checkpoint with the visual parser.

The planned research range is approximately **100M-500M parameters**, subject to experiments. Its purpose is to test whether high-quality structured engineering input allows a genuinely small language model to handle useful engineering interaction.

## Large reasoners

Larger language/reasoning models are another downstream consumer of EIR/EDL. They are reserved for problems where broader knowledge, multidisciplinary reasoning, or difficult trade-offs exceed the MicroLM/tool layer.

The intended separation is:

```text
                       PERCEPTION / PARSING

Drawing ──> modular teacher parser ──┐
                                     ├──> EIR / EDL
Drawing ──> Ortheon-One ─────────────┘

                       REASONING / ACTION

EIR / EDL ──> deterministic tools / standards
          ├──> Engineering MicroLM
          `──> larger engineering reasoner
```

**Do not describe Ortheon-One and the Engineering MicroLM as one combined model.** Their separation is a core Ortheon design decision.

---

## Parsing hierarchy

```text
P0  Source normalization
P1  Visual/vector primitives
P2  Recognized tokens
P3  Engineering entities
P4  Relations
P5  Engineering constraints
P6  Standards interpretation
P7  Engineering reasoning / judgment
```

Ortheon v1 focuses on building reliable P0-P6 representations before making strong claims about downstream reasoning. Ortheon-One targets the visual/semantic parsing side; MicroLM and larger reasoning models operate downstream over EIR/EDL.

## Architectural principles

1. **Preserve information before predicting it.** Born-digital vector/text information should be extracted directly rather than rasterized and rediscovered.
2. **Relations are first-class data.** A correctly read dimension attached to the wrong feature is still an engineering failure.
3. **Uncertainty is preserved.** Confidence, alternatives, ambiguity, and provenance must survive parsing.
4. **Standards remain versioned system knowledge.** Standards interpretation is not silently buried inside model weights.
5. **Models perceive; Ortheon reconstructs; standards validate; reasoning systems reason.**
6. **Ortheon-One parses; MicroLM reasons over the parse.** They are separate models with separate training objectives and checkpoints.
7. **Large artifacts stay out of Git.** Datasets, checkpoints, and generated outputs are tracked through manifests and checksums.

## v1 scope

### In scope

- 2D mechanical/manufacturing drawings,
- raster and scanned sources,
- born-digital/vector sources,
- dimensions and tolerances,
- GD&T and datum relationships,
- surface/thread/title-block parsing,
- geometric and annotation relations,
- EIR/EDL,
- versioned standards-rule integration,
- modular teacher parsing pipeline,
- **Ortheon-One unified visual parser research**,
- **separate Engineering MicroLM structured-input research**,
- larger-reasoner comparisons over the same EIR/EDL representation.

### Deferred

- broad electrical schematic understanding,
- P&ID parsing,
- architectural plans,
- unrestricted handwritten drawings,
- complete automatic 3D CAD reconstruction,
- certification-grade standards compliance,
- replacing professional engineering judgment.

## Repository layout

```text
Ortheon/
├── apps/desktop/             Tauri/React engineering-inspector UI
├── dataset/                  dataset registry, manifests, schemas and tooling
├── development_progress/     roadmap and live project status
├── docs/                     architecture, EIR, evaluation and research contracts
├── experiments/              experiment definitions and summaries
├── models/                   model/checkpoint manifest conventions, not weights
├── src/ortheon/              Python research package
├── tests/                    unit and golden-fixture tests
├── CONTRIBUTING.md
├── pyproject.toml
└── README.md
```

Local raw/processed datasets, checkpoints, caches, logs, runs, and generated artifacts are ignored by Git.

## Dataset strategy

The current dataset plan is documented in [`dataset/README.md`](dataset/README.md). Core sources include MechVQA, SketchGraphs, ABC, TriView-CAD, and Fusion 360 Gallery, supplemented by technical-document datasets where useful.

Ortheon's project-native dataset, **Ortheon-Parse**, is planned as a hierarchical P1-P7 supervision corpus rather than a plain OCR dataset. It is expected to become the bridge from the modular teacher system to Ortheon-One training.

## EIR and EDL

EIR is the canonical machine representation. Early design notes live in [`docs/EIR_NOTES.md`](docs/EIR_NOTES.md).

EDL (Engineering Description Language) is planned as a compact deterministic textual serialization of supported EIR content for human inspection and language-model input. EDL is not intended to become a second source of truth.

Both the Engineering MicroLM and larger reasoners consume EIR/EDL **after** parsing. They are not part of the Ortheon-One visual checkpoint.

## Evaluation

Ortheon is evaluated above OCR level. Planned metrics include primitive geometry accuracy, CER/WER, entity F1, relation F1, constraint recovery, standards-rule accuracy, uncertainty calibration, and eventually **Engineering Constraint Recovery (ECR)**.

The unified-parser experiments compare the modular teacher pipeline against Ortheon-One at the same EIR-level outputs. Downstream reasoning experiments separately compare MicroLM and larger reasoners over those outputs.

See [`docs/EVALUATION.md`](docs/EVALUATION.md).

## Reproducibility

Research results must identify code, dataset, preprocessing, model, environment, hardware, seed, metrics, and output artifacts. Different checkpoints for Ortheon-One, MicroLM, and any teacher/baseline model must be tracked independently.

The reproducibility contract is documented in [`docs/REPRODUCIBILITY.md`](docs/REPRODUCIBILITY.md).

## Research questions

The current research questions cover perception, relation reconstruction, EIR design, standards separation, Ortheon-One, model-size reduction through structured representation, and engineering reasoning. See [`docs/RESEARCH_QUESTIONS.md`](docs/RESEARCH_QUESTIONS.md).

## Development

The package is intentionally minimal during the foundation stage. Model training begins only after dataset and representation contracts are stable enough to make benchmark results meaningful.

Python development is intended to use `uv`:

```bash
uv sync --extra dev
uv run pytest -q
uv run ruff check .
uv run mypy src
```

The current desktop frontend can be run independently without downloading model weights:

```bash
cd apps/desktop
npm install
npm run dev
```

Then open `http://localhost:5173`.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) before adding datasets, model artifacts, or schema-changing experiments.

## Codex review workflow

Codex is intended to be used as a repository auditor/checker between implementation passes. The detailed audit contract is in [`docs/CODEX_REVIEW.md`](docs/CODEX_REVIEW.md).

For the current milestone, Codex should focus on **v1.1.0 dataset registry and acquisition** and verify the repository against the documented release gate rather than starting later research early.

Current review priorities:

```text
1. Verify development_progress/status.md matches the repository.
2. Audit v1.1.0 dataset manifests, registry, acquisition, storage metadata and availability checks.
3. Verify the Python workflow is consistently uv-based and reproducible.
4. Verify CI/tests pass without downloading models or large datasets.
5. Preserve the Ortheon-One / MicroLM / standards boundaries.
6. Treat the current UI as parked / bugfix-only.
```

A review-only Codex run should **not modify the repository**. It should report `PASS`, `PARTIAL`, `FAIL / MISSING`, risks, verified commands, and the ordered actions required to reach the active release gate. Implementation should only begin in a separate task after review findings are accepted.

During the current foundation stage, a Codex review must not download model weights, start model training, download large datasets merely for testing, redesign the UI, freeze EIR prematurely, or expand into additional engineering domains.

## License

See [`LICENSE`](LICENSE).