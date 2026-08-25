# Ortheon

**Standards-aware visual engineering parsing for technical drawings.**

Ortheon is a research project for converting engineering drawings into a structured, traceable **Engineering Intermediate Representation (EIR)** that can be validated deterministically, consumed by engineering tools, and supplied to language models for engineering-oriented reasoning.

The project deliberately treats OCR as only one part of the problem. Its primary research target is recovering the **engineering structure** encoded by a drawing: geometry, annotations, feature relationships, tolerances, constraints, provenance, uncertainty, and standards interpretation.

## Current status

- Development generation: **v1**
- Current completed foundation: **v1.0.x**
- Next active milestone: **v1.1.x - dataset foundation and Ortheon-Parse specification**
- Research branch: `research/dataset-foundation`
- Initial domain: **2D mechanical manufacturing drawings**

See [`development_progress/status.md`](development_progress/status.md) for the live status and [`development_progress/README.md`](development_progress/README.md) for the full roadmap.

## Core thesis

```text
Engineering drawing
        |
        v
     Ortheon
        |
        v
Engineering Intermediate Representation (EIR)
        |
        +--> deterministic standards/rule validation
        +--> engineering solvers/tools
        +--> Engineering Description Language (EDL)
        +--> small engineering language models
        `--> larger reasoning models
```

The research hypothesis is that a language model does not need to rediscover every engineering relationship directly from pixels if Ortheon first reconstructs a compact, explicit engineering representation.

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

Ortheon v1 focuses on building reliable P0-P6 representations before making strong claims about downstream reasoning.

## Architectural principles

1. **Preserve information before predicting it.** Born-digital vector/text information should be extracted directly rather than rasterized and rediscovered.
2. **Relations are first-class data.** A correctly read dimension attached to the wrong feature is still an engineering failure.
3. **Uncertainty is preserved.** Confidence, alternatives, ambiguity, and provenance must survive parsing.
4. **Standards remain versioned system knowledge.** Standards interpretation is not silently buried inside model weights.
5. **Models perceive; Ortheon reconstructs; standards validate; reasoning systems reason.**
6. **Large artifacts stay out of Git.** Datasets, checkpoints, and generated outputs are tracked through manifests and checksums.

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
- comparison of modular and unified parsing approaches,
- structured-input experiments with genuinely small engineering language models.

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
├── dataset/                  dataset registry, manifests, schemas and tooling
├── development_progress/     roadmap and live project status
├── docs/                     architecture, EIR, evaluation and research contracts
├── experiments/              experiment definitions and summaries
├── models/                   model/checkpoint manifest conventions, not weights
├── src/ortheon/              Ortheon package
├── tests/                    unit and golden-fixture tests
├── CONTRIBUTING.md
├── pyproject.toml
└── README.md
```

Local raw/processed datasets, checkpoints, caches, logs, runs, and generated artifacts are ignored by Git.

## Dataset strategy

The current dataset plan is documented in [`dataset/README.md`](dataset/README.md). Core sources include MechVQA, SketchGraphs, ABC, TriView-CAD, and Fusion 360 Gallery, supplemented by technical-document datasets where useful.

Ortheon's project-native dataset, **Ortheon-Parse**, is planned as a hierarchical P1-P7 supervision corpus rather than a plain OCR dataset.

## EIR and EDL

EIR is the canonical machine representation. Early design notes live in [`docs/EIR_NOTES.md`](docs/EIR_NOTES.md).

EDL (Engineering Description Language) is planned as a compact deterministic textual serialization of supported EIR content for human inspection and language-model input. EDL is not intended to become a second source of truth.

## Evaluation

Ortheon is evaluated above OCR level. Planned metrics include primitive geometry accuracy, CER/WER, entity F1, relation F1, constraint recovery, standards-rule accuracy, uncertainty calibration, and eventually **Engineering Constraint Recovery (ECR)**.

See [`docs/EVALUATION.md`](docs/EVALUATION.md).

## Reproducibility

Research results must identify code, dataset, preprocessing, model, environment, hardware, seed, metrics, and output artifacts. The reproducibility contract is documented in [`docs/REPRODUCIBILITY.md`](docs/REPRODUCIBILITY.md).

## Research questions

The current research questions cover perception, relation reconstruction, EIR design, standards separation, Ortheon-One, model-size reduction through structured representation, and engineering reasoning. See [`docs/RESEARCH_QUESTIONS.md`](docs/RESEARCH_QUESTIONS.md).

## Development

The package is intentionally minimal during the foundation stage. Model training begins only after dataset and representation contracts are stable enough to make benchmark results meaningful.

```bash
python -m pip install -e ".[dev]"
pytest
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) before adding datasets, model artifacts, or schema-changing experiments.

## License

See [`LICENSE`](LICENSE).
