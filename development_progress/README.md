# Ortheon Development Progress

This directory is the planning and progress control center for Ortheon.

Ortheon is being developed as a **standards-aware visual engineering parser** that converts technical drawings into a structured, traceable Engineering Intermediate Representation (EIR) suitable for deterministic validation, engineering tools, small engineering language models, and larger reasoning models.

The roadmap is deliberately staged. Ortheon should not jump directly from an image to a giant multimodal model. Each release must establish a reliable layer that the next release can depend on.

---

## Files in this directory

- [`README.md`](README.md) — long-term version roadmap, scope, release gates, and acceptance criteria.
- [`status.md`](status.md) — live project status: primary focus, side focus, work in progress, blockers, and next tasks.

The live status file should be updated whenever the active development focus changes.

---

# Development philosophy

Ortheon follows this processing hierarchy:

```text
Drawing / PDF / CAD source
        |
        v
P0  Source normalization
        |
        v
P1  Visual primitives
        |
        v
P2  Recognized tokens
        |
        v
P3  Engineering entities
        |
        v
P4  Relations
        |
        v
P5  Engineering constraints
        |
        v
P6  Standards interpretation
        |
        v
     Engineering IR
        |
        +-------------------+
        |                   |
        v                   v
Engineering MicroLM   Large Engineering Reasoner
        |                   |
        +---------+---------+
                  |
                  v
           Engineering tools
```

The central rule is:

> **Perception extracts evidence. Parsing reconstructs meaning. Standards validate meaning. Language models reason over the reconstructed engineering state.**

---

# Versioning policy

Ortheon uses semantic-style versioning for research milestones:

```text
MAJOR.MINOR.PATCH
```

Interpretation for this project:

- **MAJOR** — a major architectural generation or supported engineering domain.
- **MINOR** — a new research capability or subsystem.
- **PATCH** — stabilization, dataset/schema refinement, benchmark hardening, or completion of a minor milestone.

Examples:

```text
1.4.0  Relation parsing becomes available.
1.4.1  Relation dataset/schema and benchmark are stabilized.
2.0.0  Ortheon expands beyond mechanical technical drawings.
```

A version is not considered complete because code exists. It is complete only when its **release gate** is satisfied.

---

# v1 research objective

## Ortheon v1

**Primary domain:** 2D mechanical manufacturing drawings.

The v1 generation should establish that Ortheon can convert a technical drawing into a traceable engineering representation without relying on an unconstrained end-to-end hallucination-prone VLM pipeline.

The expected v1 transformation is:

```text
technical drawing
      |
      v
visual evidence
      |
      v
engineering entities
      |
      v
relations + constraints
      |
      v
EIR
      |
      +--> deterministic validation
      +--> engineering queries
      +--> language-model reasoning
```

Explicitly out of scope for early v1:

- broad electrical schematic understanding,
- full P&ID parsing,
- architectural plan understanding,
- complete automatic 3D CAD reconstruction,
- arbitrary handwritten drawings,
- standards-compliance certification,
- replacing engineering judgment.

These may become later major-version work.

---

# v1.0.x — Project and research foundation

## v1.0.0 — Research architecture lock

### Goal

Define what Ortheon is before implementation begins.

### Deliverables

- project thesis and scope,
- processing hierarchy P0-P7,
- preliminary Ortheon architecture,
- modular teacher-system concept,
- Ortheon-One long-term unified-model concept,
- dataset strategy,
- development roadmap,
- live project status tracking.

### Research questions established

1. How accurately can engineering primitives and annotations be recovered from raster and vector drawings?
2. How accurately can annotations be associated with their intended geometric features?
3. Does an explicit EIR improve engineering reasoning compared with direct image-to-answer VLM reasoning?
4. Can a sub-billion-parameter engineering model operate effectively when supplied with high-quality structured engineering input?
5. Which parts of the pipeline should remain deterministic and which benefit from learned models?

### Release gate

v1.0.0 is complete when the scope, data strategy, version roadmap, and initial EIR requirements are documented well enough that implementation does not depend on undocumented assumptions.

---

## v1.0.1 — Repository hygiene and reproducibility

### Goal

Make research reproducible before datasets and model artifacts begin accumulating.

### Planned work

- standard project directory structure,
- `.gitignore` for datasets, caches, checkpoints, and generated artifacts,
- environment definition,
- experiment naming convention,
- dataset manifest convention,
- model/checkpoint manifest convention,
- deterministic seed policy,
- hardware/runtime metadata capture,
- logging format,
- citation/provenance rules.

### Release gate

A fresh clone can reproduce the repository structure and understand where data, models, outputs, and experiments belong without committing large artifacts into Git.

---

# v1.1.x — Dataset foundation

## v1.1.0 — Dataset registry and acquisition layer

### Goal

Turn `dataset/README.md` from a research plan into a reproducible data-acquisition system.

### Primary datasets

Initial priority:

1. MechVQA
2. TriView-CAD
3. SketchGraphs filtered data
4. Fusion 360 Gallery reconstruction subset
5. ABC subset

Supporting datasets are introduced only when their supervision is needed.

### Planned work

- `dataset/manifests/`,
- dataset source URLs and citations,
- license metadata,
- version identifiers,
- expected checksums when available,
- download scripts,
- resumable downloads where practical,
- local raw/processed/cache layout,
- dataset availability checks,
- storage estimation before download.

### Release gate

At least the first three core datasets can be reproducibly acquired or registered through manifests without manually reconstructing download steps.

---

## v1.1.1 — Dataset validation and normalization

### Goal

Ensure downloaded data is trustworthy enough for experiments.

### Planned work

- integrity validation,
- corrupted/missing sample detection,
- duplicate detection,
- split validation,
- dataset statistics,
- schema inspection,
- normalization adapters,
- provenance metadata,
- generated data cards,
- storage and preprocessing reports.

### Release gate

Every dataset used in an experiment can report:

```text
source
version
license status
sample count
split sizes
schema
checksum/integrity state
normalization version
```

---

## v1.1.2 — Ortheon-Parse dataset specification

### Goal

Formalize the project-native P0-P7 annotation system.

### Planned work

- primitive ontology,
- engineering entity ontology,
- relation vocabulary,
- constraint vocabulary,
- source-evidence references,
- confidence representation,
- ambiguity representation,
- annotation guidelines,
- synthetic vs human-verified labels,
- annotation versioning.

### Release gate

Two independent implementations can read the same Ortheon-Parse record and reconstruct the same semantic graph.

---

# v1.2.x — Engineering Intermediate Representation

## v1.2.0 — EIR core schema

### Goal

Create the stable intermediate representation that separates perception models from downstream engineering reasoning.

### EIR must represent

- sheets,
- views,
- geometric primitives,
- engineering features,
- text/tokens,
- dimensions,
- tolerances,
- GD&T entities,
- datums,
- surface annotations,
- relations,
- constraints,
- units,
- coordinate systems,
- source provenance.

### Planned work

- canonical IDs,
- typed entity schema,
- typed relation schema,
- coordinate conventions,
- unit normalization,
- serialization format,
- schema validator,
- minimal example corpus.

### Release gate

A representative drawing can be manually encoded into EIR without losing the engineering relationships required for downstream reasoning.

---

## v1.2.1 — Confidence, ambiguity, and provenance

### Goal

Prevent uncertain perception from silently becoming certain engineering facts.

### Planned work

Each extracted value or relation should support:

```text
value
confidence
source evidence
parser/model version
alternatives
ambiguity state
```

### Release gate

A downstream consumer can distinguish:

- directly observed evidence,
- parsed interpretation,
- inferred relation,
- standards-derived meaning,
- unresolved ambiguity.

---

## v1.2.2 — EDL serialization

### Goal

Create a compact Engineering Description Language (EDL) optimized for human inspection and language-model input.

### Example direction

```text
@feature H1 type=HOLE
@dimension D1 type=DIAMETER value=20mm fit=H7 target=H1
@gdt G1 type=POSITION tol=0.05mm target=H1 datums=[A,B,C]
```

### Planned work

- EDL grammar,
- EIR -> EDL compiler,
- EDL -> EIR parser,
- syntax validation,
- canonical formatting,
- token-efficiency benchmark against JSON.

### Release gate

EIR and EDL round-trip without semantic loss for the supported v1 schema.

---

# v1.3.x — Perception baseline

## v1.3.0 — Raster and vector ingestion

### Goal

Produce a common `VisualPrimitive` layer regardless of source format.

### Vector path

Planned support:

- vector PDF,
- SVG,
- DXF where practical.

Preserve native text and geometry instead of rasterizing and rediscovering them.

### Raster path

Planned support:

- PNG,
- JPEG,
- TIFF,
- scanned PDF pages.

### Raster processing

- deskew,
- denoise,
- scale normalization,
- line preservation,
- primitive detection,
- OCR region preparation.

### Release gate

Raster and vector examples produce a normalized primitive representation consumable by the same downstream parser interfaces.

---

## v1.3.1 — OCR and annotation baseline

### Goal

Establish measured baselines before developing Ortheon-specific models.

### Planned baselines

- PP-OCR family or current equivalent,
- oriented object detector baseline,
- deterministic geometry extraction,
- optional specialist document parser for tables/title blocks.

### Metrics

- CER/WER,
- detection precision/recall,
- mAP where applicable,
- geometry deviation,
- latency,
- VRAM/RAM usage.

### Release gate

Baseline performance is reproducibly measured on a fixed Ortheon evaluation subset.

---

## v1.3.2 — Visual debugging and evidence overlay

### Goal

Make perception failures inspectable.

### Planned outputs

For each processed drawing:

```text
drawing.eir.json
drawing.debug.png
drawing.metrics.json
```

Debug overlays should show:

- OCR regions,
- detected engineering annotations,
- geometry primitives,
- IDs,
- confidence,
- candidate associations.

### Release gate

A failed parse can be visually diagnosed without stepping through model tensors or raw logs.

---

# v1.4.x — Semantic parsing and relation reconstruction

## v1.4.0 — Engineering entity parser

### Goal

Convert tokens and primitives into typed engineering entities.

### Initial entity targets

- linear dimensions,
- diameter dimensions,
- radius dimensions,
- tolerances,
- thread annotations,
- datum indicators,
- GD&T frames,
- surface-finish annotations,
- title-block fields,
- view labels.

### Release gate

Supported annotations can be represented as structured entities rather than raw OCR strings.

---

## v1.4.1 — Relation engine

### Goal

Determine what annotations apply to.

### Initial relations

```text
annotation -> feature
leader -> target
constraint -> feature
datum -> surface
entity -> view
feature -> view
view -> sheet
```

### Initial approach

Use deterministic spatial/topological heuristics first:

- proximity,
- orientation,
- intersection,
- leader direction,
- containment,
- alignment,
- view boundaries.

Learned relation models should be added only after a trustworthy labeled relation dataset exists.

### Metrics

- relation precision,
- relation recall,
- relation F1,
- ambiguity rate,
- incorrect-confident-association rate.

### Release gate

The system can correctly associate a useful subset of dimensions and annotations with their intended features on the golden evaluation set.

---

## v1.4.2 — Ortheon-Parse alpha

### Goal

Create the first project-native dataset containing real parsing supervision.

### Planned contents

- synthetic exact-ground-truth samples,
- manually verified real drawing samples,
- P1-P5 labels,
- relation graph,
- confidence/provenance fields.

### Release gate

The relation and parsing experiments no longer depend only on third-party datasets or weak labels.

---

# v1.5.x — Standards-aware interpretation

## v1.5.0 — Standards engine foundation

### Goal

Separate standards interpretation from learned model weights.

### Initial standards focus

Mechanical drawing subsets relevant to:

- representation,
- dimensions,
- tolerancing,
- GD&T.

Profiles should identify exact standard family, identifier, and edition.

### Planned architecture

```text
EIR constraint
      |
      v
standards profile
      |
      v
rule engine
      |
      +--> interpretation
      +--> validation result
      +--> rule provenance
```

### Release gate

At least one supported rule subset can produce deterministic, versioned, traceable interpretations from EIR.

---

## v1.5.1 — Validation and rule provenance

### Goal

Make every standards-derived conclusion auditable.

### Planned fields

- rule ID,
- standard identifier,
- edition,
- input entities,
- result,
- severity,
- evidence,
- unresolved assumptions.

### Release gate

No standards result is emitted without identifying which rule/profile produced it.

---

# v1.6.x — Ortheon-One unified parser research

## v1.6.0 — Ortheon-One prototype

### Goal

Test whether a single unified trainable model can recover multiple layers of engineering structure.

The modular v1.3-v1.5 system becomes the teacher/baseline.

### Candidate unified tasks

- token recognition,
- primitive/entity detection,
- geometry prediction,
- entity parsing,
- relation prediction,
- EDL generation.

### Architecture direction

```text
high-resolution visual encoder
          |
          v
shared engineering representation
          |
    +-----+------+------+
    |            |      |
  text        geometry entity
    |            |      |
    +------+-----+------+
           |
           v
   relation reasoning
           |
           v
       EDL / EIR
```

### Release gate

A unified model can be evaluated fairly against the modular teacher system using identical EIR-level metrics.

---

## v1.6.1 — Distillation and model-size study

### Goal

Measure how much engineering structure can be retained as model size decreases.

### Candidate size bands

```text
~100M
~250M
~500M
~750M
```

Exact sizes are experimental, not promises.

### Measurements

- OCR accuracy,
- entity F1,
- relation F1,
- Engineering Constraint Recovery,
- hallucination/error rate,
- throughput,
- peak memory,
- performance per parameter.

### Release gate

Ortheon has a defensible answer to whether unified sub-billion parsing is competitive with the modular system for supported tasks.

---

# v1.7.x — Engineering language-model interface

## v1.7.0 — Engineering MicroLM research

### Goal

Test the central hypothesis that high-quality EIR/EDL allows a genuinely small language model to perform useful engineering interaction.

### Candidate model range

Approximately **100M-500M parameters**, subject to benchmarking.

### Primary tasks

- EIR querying,
- relation lookup,
- constraint comparison,
- structured explanation,
- uncertainty reporting,
- tool routing,
- standards-result explanation.

The MicroLM is not intended to replace broad engineering reasoning.

### Release gate

A sub-billion model demonstrably outperforms equivalent raw-text/OCR-only input on a defined structured engineering QA benchmark.

---

## v1.7.1 — Reasoning escalation

### Goal

Route difficult problems to larger reasoning models without making them mandatory for routine work.

### Planned routing states

```text
DETERMINISTIC
MICROLM
LARGE_REASONER
HUMAN_REVIEW
```

Escalation signals may include:

- low parse confidence,
- unresolved relations,
- multidisciplinary reasoning requirement,
- complex design trade-offs,
- unsupported standards rules.

### Release gate

A request can be routed based on uncertainty and task complexity while preserving EIR provenance across model boundaries.

---

# v1.8.x — Engineering tools and reconstruction

## v1.8.0 — Tool interface

### Goal

Allow reasoning systems to use deterministic engineering computation rather than improvising numerical results.

### Candidate tool categories

- unit conversion,
- tolerance stack-up,
- geometric calculations,
- material-property lookup,
- CAD queries,
- numerical solvers,
- later FEA/SPICE integrations.

### Release gate

The language-model layer can request structured tool execution and consume results without bypassing EIR provenance.

---

## v1.8.1 — 2D reconstruction/export

### Goal

Export parsed drawings into useful machine-readable geometry.

### Initial targets

- JSON/EIR,
- EDL,
- SVG,
- DXF subset where feasible.

### Release gate

A supported drawing can be round-tripped into a structured 2D representation with measurable geometric and annotation fidelity.

---

# v1.9.x — Integrated evaluation and v1 hardening

## v1.9.0 — End-to-end benchmark

### Goal

Evaluate Ortheon as an engineering-information system rather than a collection of isolated models.

### Core metrics

- OCR CER/WER,
- primitive geometry error,
- entity F1,
- relation F1,
- constraint accuracy,
- standards interpretation accuracy,
- EIR validity,
- hallucination/error rate,
- latency,
- memory,
- **Engineering Constraint Recovery (ECR)**.

### Main system comparison

```text
A. Generic VLM: image -> answer
B. Engineering VLM: image -> answer
C. Modular Ortheon -> EIR -> language model
D. Ortheon-One -> EIR -> language model
E. Ortheon -> EIR -> Engineering MicroLM
F. Ortheon -> EIR -> larger engineering reasoner
```

### Release gate

The project can quantify which architecture is better, where it fails, and how much explicit engineering structure contributes to downstream reasoning.

---

## v1.9.1 — v1 release candidate

### Goal

Stabilize interfaces and documentation before the first major public research release.

### Planned work

- API freeze for supported EIR subset,
- benchmark freeze,
- reproducible experiments,
- model/data cards,
- limitations,
- known failure modes,
- example gallery,
- citation instructions,
- installation path,
- minimal inference workflow.

### Release gate

A new researcher can reproduce the supported v1 pipeline and benchmark without private undocumented knowledge.

---

# v2.0.0 — Multi-domain engineering representation

v2 begins only after the mechanical-drawing v1 system is stable enough to determine which abstractions are truly domain-independent.

Potential v2 domains:

- electrical/electronic schematics,
- P&ID,
- architectural/civil drawings,
- assembly-heavy drawings,
- welding documentation.

The intended architecture is not five unrelated parsers. It is:

```text
mechanical parser --------+
schematic parser ---------+
P&ID parser --------------+----> shared Engineering IR
architectural parser -----+
CAD/document adapters ----+
```

v2 should therefore test whether EIR can become a common machine representation across engineering modalities.

---

# Research gates summary

| Version | Main question |
| --- | --- |
| **1.0.x** | Do we have a coherent research architecture? |
| **1.1.x** | Is the data reproducible and trustworthy? |
| **1.2.x** | Can engineering meaning be represented cleanly? |
| **1.3.x** | Can we reliably recover visual evidence? |
| **1.4.x** | Can we reconstruct engineering entities and relationships? |
| **1.5.x** | Can standards interpretation remain deterministic and traceable? |
| **1.6.x** | Can one unified model recover the same structure? |
| **1.7.x** | Can very small language models exploit high-quality EIR? |
| **1.8.x** | Can the representation drive tools and reconstruction? |
| **1.9.x** | Does the integrated system actually outperform simpler baselines? |
| **2.0.0** | Can the representation generalize across engineering domains? |

---

# What should not happen

To protect the research from scope collapse:

1. Do not train Ortheon-One before the modular baseline and EIR exist.
2. Do not claim standards compliance from model output alone.
3. Do not use a large VLM as a hidden replacement for missing parser logic.
4. Do not commit large datasets/checkpoints into Git.
5. Do not optimize only OCR accuracy while ignoring entity/relation correctness.
6. Do not silently collapse uncertain relations into certain constraints.
7. Do not expand into another engineering domain before v1 mechanical parsing is measurable.

---

# Definition of success for Ortheon v1

Ortheon v1 succeeds if it can demonstrate, on a reproducible mechanical-drawing benchmark, that:

1. drawing evidence can be converted into valid EIR,
2. important engineering entities and relations are recovered with measurable accuracy,
3. uncertainty and provenance remain visible,
4. deterministic standards/tool layers can operate on the representation,
5. structured EIR improves downstream engineering QA/reasoning relative to raw OCR or direct visual prompting,
6. at least one genuinely small language-model configuration can exploit EIR for useful engineering interaction,
7. larger reasoning models benefit from receiving structured engineering state rather than being forced to reconstruct everything from pixels.
