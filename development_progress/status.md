# Ortheon Development Status

**Last updated:** 2026-08-24  
**Active branch:** `research/dataset-foundation`  
**Current generation:** `v1`  
**Current milestone:** `v1.0.x -> v1.1.x` foundation transition  
**Project state:** Research architecture and dataset foundation

This file is the live operational status of Ortheon. Unlike the long-term roadmap in [`README.md`](README.md), this file should reflect what the project is focused on **right now**.

---

# Status legend

| State | Meaning |
| --- | --- |
| `DONE` | Completed for the current milestone |
| `ACTIVE` | Primary development focus |
| `IN PROGRESS` | Work has started and is not yet complete |
| `QUEUED` | Next work after active items |
| `SIDE` | Useful parallel research, but must not block the primary milestone |
| `RESEARCH` | Investigation / experiment before an implementation decision |
| `BLOCKED` | Cannot proceed until another dependency is resolved |
| `DEFERRED` | Deliberately postponed to a later version |

---

# Current focus at a glance

```text
PRIMARY
  Dataset foundation + reproducibility
        |
        +--> dataset manifests
        +--> acquisition/validation strategy
        +--> Ortheon-Parse schema preparation

SECONDARY
  EIR v0 design
        |
        +--> entity ontology
        +--> relation ontology
        +--> provenance/confidence model

SIDE RESEARCH
  Ortheon-One unified parser
  Engineering MicroLM
  standards-engine survey
  model baseline survey
```

The project should currently resist the temptation to begin training models. The data representation, provenance rules, and evaluation contracts need to exist first. Otherwise we will obtain a very sophisticated checkpoint and absolutely no idea what it is supposed to be correct about.

---

# Primary focus

## `ACTIVE` — Dataset foundation

### Objective

Build the reproducible data layer required for every later Ortheon experiment.

### Current workstream

- establish dataset registry,
- define manifests,
- define storage layout,
- record dataset versions/licenses/provenance,
- decide normalized schemas,
- prepare validation tooling,
- define Ortheon-Parse annotation hierarchy.

### Why this is primary

Every planned subsystem depends on trustworthy data:

```text
datasets
   |
   +--> perception baseline
   +--> relation parser
   +--> Ortheon-Parse
   +--> Ortheon-One
   +--> Engineering MicroLM
   +--> evaluation
```

Without this foundation, later comparisons become unreliable.

---

# Secondary focus

## `SIDE / RESEARCH` — EIR v0 specification

EIR is the architectural contract between perception and reasoning, but implementation should remain lightweight until the dataset schemas are inspected.

### Currently being defined conceptually

- entity IDs,
- primitive types,
- engineering entity types,
- typed relations,
- engineering constraints,
- units,
- coordinate systems,
- confidence,
- alternative hypotheses,
- provenance,
- standards references.

### Constraint

Do **not** prematurely freeze the full EIR schema before representative samples from the first core datasets have been inspected.

---

# Side research

These topics are intentionally kept parallel to the main development path. They may produce notes or experiments, but should not delay v1.1.x.

## `SIDE` — Ortheon-One

Long-term unified visual engineering parser.

Current questions:

- can a single model recover OCR + entities + relations + EDL?
- what portions require explicit prediction heads?
- how small can the unified model become?
- which supervision should be distilled from the modular teacher pipeline?

**Implementation:** deferred until the modular baseline and EIR are measurable.

---

## `SIDE` — Engineering MicroLM

Hypothesis:

> A genuinely small language model, potentially in the ~100M-500M range, may perform useful engineering interaction when its input is structured EIR/EDL rather than raw visual/OCR information.

Current research topics:

- engineering-focused tokenizer,
- EDL token efficiency,
- structured QA,
- relation lookup,
- tool routing,
- uncertainty handling,
- distillation from stronger reasoning models.

**Implementation:** deferred until EIR/EDL exists.

---

## `SIDE` — Standards engine

Current goal is architectural research only.

Questions:

- how should standards profiles be versioned?
- how should deterministic rules cite their origin?
- which minimum ISO/ASME subsets are required for v1 mechanical drawings?
- how should unresolved/ambiguous standard interpretation be represented?

**Implementation:** v1.5.x.

---

## `SIDE` — Model baseline survey

Candidate categories under consideration:

- OCR,
- oriented annotation detection,
- document/title-block parsing,
- deterministic geometry extraction,
- relation models,
- high-resolution unified visual encoders.

No model should currently be considered permanently selected. Baselines will be locked only when v1.3.x experiments are reproducible.

---

# Completed work

## `DONE` — Repository created

Repository:

```text
RetrixAlfariz/Ortheon
```

---

## `DONE` — Research branch created

```text
research/dataset-foundation
```

Purpose:

- establish research architecture,
- establish dataset strategy,
- prepare reproducible data foundation before model implementation.

---

## `DONE` — Dataset research plan

Created:

```text
dataset/README.md
```

Documented datasets include:

- MechVQA,
- SketchGraphs,
- ABC,
- TriView-CAD,
- Fusion 360 Gallery,
- DeepPatent2,
- AI2D,
- DocLayNet,
- PubTables-1M,
- proposed Ortheon-Parse.

The dataset plan records:

- scale/specification,
- why each dataset is useful,
- native variables/annotations,
- Ortheon-derived variables,
- intended training stage,
- storage/provenance/licensing considerations.

---

## `DONE` — P0-P7 parsing hierarchy defined conceptually

```text
P0 Source
P1 Visual primitives
P2 Recognized tokens
P3 Engineering entities
P4 Relations
P5 Engineering constraints
P6 Standards interpretation
P7 Engineering reasoning/judgment
```

This hierarchy is the current foundation of Ortheon-Parse and EIR planning.

---

## `DONE` — Development roadmap established

Created:

```text
development_progress/README.md
```

The roadmap currently covers:

```text
v1.0.x  Research foundation
v1.1.x  Dataset foundation
v1.2.x  EIR / EDL
v1.3.x  Perception baseline
v1.4.x  Parsing and relations
v1.5.x  Standards engine
v1.6.x  Ortheon-One
v1.7.x  Engineering MicroLM
v1.8.x  Tools/reconstruction
v1.9.x  End-to-end validation
v2.0.0  Multi-domain expansion
```

---

# Work in progress

## `IN PROGRESS` — v1.0.0 architecture lock

### Already established

- Ortheon is not plain OCR.
- Mechanical technical drawings are the first supported domain.
- EIR is the stable interface between perception and reasoning.
- standards reasoning should remain deterministic/versioned where possible.
- the modular system should be built before Ortheon-One.
- large language models are downstream reasoning partners, not mandatory perception engines.
- small language-model research should use EIR/EDL as high-quality structured input.

### Still needed before marking v1.0.0 complete

- concise top-level project architecture document,
- initial terminology glossary,
- explicit supported/not-supported v1 drawing features,
- initial metric definitions,
- initial repository architecture.

---

## `IN PROGRESS` — v1.1.0 dataset registry design

### Needed

```text
dataset/manifests/
dataset/scripts/download/
dataset/scripts/validate/
dataset/schemas/
```

Initial manifest targets:

```text
mechvqa.yaml
triview_cad.yaml
sketchgraphs.yaml
fusion360.yaml
abc.yaml
```

Each manifest should eventually include:

```text
name
version
source
citation
license
expected files
checksum information
splits
raw size
processed size
normalization adapter
```

---

# Next tasks

The order below is intentional.

## `QUEUED 1` — Repository reproducibility foundation

Target version: **v1.0.1**

- expand `.gitignore`,
- define local dataset/checkpoint/cache directories,
- establish environment/package structure,
- define experiment and output naming,
- define runtime metadata capture.

---

## `QUEUED 2` — Dataset manifests

Target version: **v1.1.0**

Create manifests first for:

1. MechVQA
2. TriView-CAD
3. SketchGraphs
4. Fusion 360 Gallery reconstruction subset
5. ABC subset

Do not download DeepPatent2 in full at this stage.

---

## `QUEUED 3` — Dataset acquisition scripts

Target version: **v1.1.0**

Requirements:

- idempotent where possible,
- resumable where supported,
- clear progress reporting,
- pre-download storage estimate,
- explicit destination,
- no silent overwrite,
- no data committed to Git.

---

## `QUEUED 4` — Dataset validation

Target version: **v1.1.1**

- sample counts,
- split integrity,
- corrupt/missing files,
- duplicates,
- schema validation,
- normalization statistics,
- provenance report.

---

## `QUEUED 5` — Ortheon-Parse schema v0

Target version: **v1.1.2**

Define machine-readable schemas for:

- P1 primitives,
- P2 tokens,
- P3 entities,
- P4 relations,
- P5 constraints,
- provenance/confidence.

This becomes the bridge into EIR v1.2.x.

---

# Explicitly not being worked on yet

These are important, but beginning them now would create unnecessary coupling.

| Work | State | Planned milestone |
| --- | --- | --- |
| Full OCR benchmark | `DEFERRED` | v1.3.1 |
| Annotation detector training | `DEFERRED` | v1.3.x |
| Relation Transformer | `DEFERRED` | after v1.4.1 baseline |
| Ortheon-One training | `DEFERRED` | v1.6.x |
| Engineering MicroLM training | `DEFERRED` | v1.7.x |
| Standards rule implementation | `DEFERRED` | v1.5.x |
| DXF/SVG reconstruction | `DEFERRED` | v1.8.x |
| Electrical schematic support | `DEFERRED` | v2+ |
| P&ID support | `DEFERRED` | v2+ |
| Architectural plans | `DEFERRED` | v2+ |

---

# Current blockers

## `NONE` — hard blockers

There is currently no known hard blocker preventing v1.0.x/v1.1.x work.

### Risks to watch

1. **Dataset licensing** — code licenses and data licenses may differ.
2. **Dataset scale** — some corpora are too large to acquire before their value is demonstrated.
3. **Schema over-design** — EIR must be tested against real samples before becoming rigid.
4. **Standards copyright** — purchased/copyrighted standards documents must not be committed into the repository.
5. **Scope growth** — electrical/P&ID/architecture must not contaminate the first mechanical-drawing benchmark.
6. **Metric blindness** — OCR accuracy alone must never become the project success criterion.

---

# Current research hypotheses

These should remain testable rather than becoming assumptions.

### H1 — Structured parsing improves reasoning

Explicit entities, relations, and constraints should improve downstream engineering QA relative to raw OCR or direct image prompting.

### H2 — EIR reduces model-size requirements

A sub-billion language model should perform substantially better on engineering interaction when supplied with EIR/EDL instead of noisy OCR text.

### H3 — Modular teacher -> unified student is viable

A modular high-precision pipeline can generate supervision and teacher targets for a smaller unified Ortheon-One model.

### H4 — Deterministic geometry remains valuable

Exact/vector geometry extraction and deterministic spatial rules should outperform generative inference on a meaningful subset of drawing semantics.

### H5 — Standards should remain external to model weights

Versioned deterministic standards interpretation should be more auditable and maintainable than asking a model to memorize standards behavior.

---

# Status update rule

When active development changes, update this file by changing:

1. `Current milestone`,
2. `Primary focus`,
3. `Work in progress`,
4. `Next tasks`,
5. `Blockers`,
6. completed items.

Do not rewrite historical completion as though it never happened. Move completed work into the `Completed work` section so the repository retains a lightweight development history.
