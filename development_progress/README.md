# Ortheon Development Progress

This directory is the planning and progress control center for Ortheon.

Ortheon is being developed as a **standards-aware visual engineering parser** that converts technical drawings into a structured, traceable Engineering Intermediate Representation (EIR). That representation is then available to deterministic standards/tools and to separate language-model reasoning systems.

The roadmap is deliberately staged. Each release must establish a reliable layer that the next release can depend on. A model checkpoint existing is not, by itself, a completed milestone. Humanity has tried that accounting method already.

---

## Files in this directory

- [`README.md`](README.md) — long-term version roadmap, architectural boundaries, release gates, and acceptance criteria.
- [`status.md`](status.md) — live project status: primary focus, side focus, work in progress, blockers, and next tasks.

The live status file should be updated whenever the active development focus changes.

---

# Non-negotiable model boundary

Ortheon has **two separate custom-model research tracks**. They must not be merged conceptually or described as one combined checkpoint.

## 1. Ortheon-One — visual semantic parser

Ortheon-One is Ortheon's own unified visual engineering model.

Its responsibility is:

```text
ENGINEERING DRAWING
        |
        v
   ORTHEON-ONE
        |
        v
semantic engineering parse
        |
        v
      EIR / EDL
```

Target responsibilities include:

- engineering OCR/token recognition,
- primitive and feature detection,
- geometry prediction,
- dimension/tolerance/GD&T parsing,
- datum and annotation recognition,
- engineering entity construction,
- relation prediction,
- constraint recovery,
- confidence and ambiguity prediction,
- structured EIR/EDL generation.

Ortheon-One belongs to the **perception + semantic parsing side** of the system.

It does **not** own general engineering dialogue, broad engineering reasoning, or downstream tool orchestration.

## 2. Engineering MicroLM — downstream language model

The Engineering MicroLM is a different model trained to consume the semantic representation already produced by Ortheon.

Its responsibility is:

```text
EIR / EDL
   |
   v
ENGINEERING MICROLM
   |
   +--> EIR queries
   +--> relation lookup
   +--> constraint comparison
   +--> structured explanation
   +--> uncertainty-aware routing
   `--> engineering tool calls
```

The MicroLM belongs to the **reasoning / interaction side** of the system.

The current research target is approximately **100M-500M parameters**, subject to benchmarking. The hypothesis is not that a 100M-500M model magically becomes a universal engineer. The hypothesis is that a clean semantic engineering representation drastically reduces the amount of model capacity needed for many routine engineering-information tasks.

## Combined architecture

```text
                              PARSING

Engineering Drawing
        |
        +--> modular teacher parser --------+
        |                                    |
        `--> Ortheon-One --------------------+----> EIR / EDL
                                                   |
                              REASONING / ACTION   |
                                                   |
                 +---------------------------------+------------------+
                 |                                 |                  |
                 v                                 v                  v
        deterministic tools               Engineering MicroLM   Large Reasoner
        + standards engine                   100M-500M          2B+ / frontier
```

The modular parser and Ortheon-One are **alternative producers of the same semantic contract**. The MicroLM and larger reasoners are **consumers of that contract**.

### Hard rule

> **Ortheon-One parses the drawing. MicroLM reasons over Ortheon's semantic parse. They are separate models, separate checkpoints, separate training objectives, and separate evaluation tracks.**

This distinction should be preserved in documentation, code organization, model manifests, experiment naming, UI labels, and benchmark reporting.

---

# Development philosophy

The core parsing hierarchy is:

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
   EIR / EDL boundary
        |
        +--> deterministic standards + tools
        +--> Engineering MicroLM
        `--> larger engineering reasoners
```

P0-P6 describe engineering information recovery. P7 reasoning happens **after the EIR/EDL boundary** and may be performed by deterministic tools, MicroLM, larger models, or human review.

The central rule is:

> **Perception extracts evidence. Parsing reconstructs meaning. Standards validate meaning. Language models reason over the reconstructed engineering state.**

---

# Technology ownership

The planned implementation stack is intentionally split by responsibility.

```text
Python
├── dataset research and normalization
├── model training
├── OCR/CV experiments
├── modular teacher models
├── Ortheon-One training
├── MicroLM training
└── evaluation/research utilities

Rust
├── EIR core as schemas stabilize
├── EDL parser/compiler
├── geometry/relation runtime
├── standards/rule engine
├── high-throughput indexing/preprocessing
├── native application backend
└── CLI/runtime utilities

Desktop UI
├── Tauri
├── Rust backend
├── React/TypeScript frontend
└── drawing/EIR inspection and human correction
```

Python dependency management should use **uv**. Model weights and large datasets are never implicit install dependencies.

---

# Interface strategy

Ortheon is UI-first for visual inspection and correction, while retaining APIs/CLI for automation.

The desktop Engineering Inspector should eventually synchronize:

```text
DRAWING VIEW
     <->
EIR / RELATION GRAPH
     <->
ENTITY / CONSTRAINT INSPECTOR
```

Human corrections should preserve provenance and become candidates for Ortheon-Parse supervision rather than disappearing as UI-only state.

The UI must remain useful before model weights exist. During early milestones it can operate on fixtures, manually encoded EIR, dataset samples, and later real parser outputs.

---

# Versioning policy

Ortheon uses semantic-style research versions:

```text
MAJOR.MINOR.PATCH
```

- **MAJOR** — major architectural generation or supported engineering domain.
- **MINOR** — new research capability or subsystem.
- **PATCH** — stabilization, schema refinement, benchmark hardening, or completion of a minor milestone.

A version is complete only when its **release gate** is satisfied.

---

# v1 research objective

**Primary domain:** 2D mechanical manufacturing drawings.

The v1 generation should establish that Ortheon can convert a technical drawing into a traceable engineering representation without relying on an unconstrained image-to-answer VLM pipeline.

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
EIR / EDL
      |
      +--> deterministic validation/tools
      +--> MicroLM reasoning
      `--> larger-model reasoning
```

Explicitly out of scope for early v1:

- broad electrical schematic understanding,
- full P&ID parsing,
- architectural plan understanding,
- complete automatic 3D CAD reconstruction,
- arbitrary handwritten drawings,
- certification-grade standards compliance,
- replacing professional engineering judgment.

---

# v1.0.x — Project and research foundation

## v1.0.0 — Research architecture lock

### Goal

Define what Ortheon is before implementation begins.

### Deliverables

- project thesis and scope,
- P0-P7 research hierarchy,
- modular teacher-system concept,
- **Ortheon-One as a future unified visual parser**,
- **MicroLM as a separate downstream structured-input model**,
- dataset strategy,
- development roadmap,
- live project status tracking.

### Release gate

Scope, data strategy, architectural boundaries, roadmap, and initial EIR requirements are documented well enough that implementation does not depend on undocumented assumptions.

**Status: DONE.**

---

## v1.0.1 — Repository hygiene and reproducibility

### Goal

Make research reproducible before datasets and model artifacts begin accumulating.

### Deliverables

- standard repository structure,
- `.gitignore` for datasets/caches/checkpoints/generated artifacts,
- project/environment definition,
- experiment naming convention,
- dataset/model manifest conventions,
- deterministic seed policy,
- hardware/runtime metadata capture,
- logging format,
- citation/provenance rules,
- CI smoke tests.

### Release gate

A fresh clone can determine where data, models, outputs, and experiments belong and can execute the foundation checks without committing large artifacts into Git.

**Status: DONE.**

---

# v1.1.x — Dataset foundation

## v1.1.0 — Dataset registry and acquisition layer

### Goal

Turn `dataset/README.md` into a reproducible data-acquisition system.

### Primary datasets

1. MechVQA
2. TriView-CAD
3. SketchGraphs filtered data
4. Fusion 360 Gallery reconstruction subset
5. ABC subset

### Planned work

- `dataset/manifests/`,
- source URLs and citations,
- license metadata,
- version identifiers,
- expected checksums where available,
- resumable acquisition where practical,
- raw/processed/cache layout,
- availability checks,
- storage estimation before download,
- uv-based Python tooling.

### Release gate

At least the first three core datasets can be reproducibly registered/acquired without manually reconstructing their download procedure.

---

## v1.1.1 — Dataset validation and normalization

### Goal

Ensure acquired data is trustworthy enough for experiments.

### Planned work

- integrity validation,
- corrupted/missing sample detection,
- duplicate detection,
- split validation,
- statistics,
- schema inspection,
- normalization adapters,
- provenance metadata,
- generated data cards,
- storage/preprocessing reports.

### Release gate

Every experimental dataset can report its source, version, license status, sample/split counts, schema, integrity state, and normalization version.

---

## v1.1.2 — Ortheon-Parse dataset specification

### Goal

Formalize the project-native P0-P7 annotation system that will eventually supervise both modular parsing experiments and Ortheon-One.

### Planned work

- primitive ontology,
- engineering entity ontology,
- relation vocabulary,
- constraint vocabulary,
- evidence references,
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

Create the stable intermediate representation separating visual parsers from downstream engineering reasoning.

### EIR must represent

- sheets and views,
- geometric primitives,
- engineering features,
- text/tokens,
- dimensions and tolerances,
- GD&T entities,
- datums,
- surface/thread annotations,
- relations,
- constraints,
- units,
- coordinate systems,
- source provenance.

### Planned work

- canonical IDs,
- typed entity/relation schema,
- coordinate conventions,
- unit normalization,
- serialization,
- schema validator,
- minimal example corpus.

A Python reference may establish behavior first. Rust becomes appropriate as the contract stabilizes.

### Release gate

A representative drawing can be manually encoded into EIR without losing relationships required for downstream engineering use.

---

## v1.2.1 — Confidence, ambiguity, provenance + Rust core entry

### Goal

Prevent uncertain perception from silently becoming certain engineering facts and begin stabilizing the runtime core.

Each extracted value/relation must support concepts equivalent to:

```text
value
confidence
source evidence
parser/model version
alternatives
ambiguity state
```

### Rust entry point

Once the canonical EIR contract is stable enough, introduce typed Rust structures for the EIR/runtime boundary rather than prematurely rewriting experimental Python schemas.

### Release gate

Downstream consumers can distinguish observed evidence, parsed interpretation, inferred relation, standards-derived meaning, and unresolved ambiguity.

---

## v1.2.2 — EDL serialization/compiler

### Goal

Create a compact Engineering Description Language optimized for inspection and language-model input.

```text
@feature H1 type=HOLE
@dimension D1 type=DIAMETER value=20mm fit=H7 target=H1
@gdt G1 type=POSITION tol=0.05mm target=H1 datums=[A,B,C]
```

### Planned work

- EDL grammar,
- EIR -> EDL serialization,
- EDL -> EIR parser,
- syntax/semantic validation,
- canonical formatting,
- token-efficiency benchmark against JSON,
- Rust parser/compiler where the grammar is stable.

### Release gate

EIR and EDL round-trip without semantic loss for the supported schema.

---

# v1.3.x — Perception baseline

## v1.3.0 — Raster and vector ingestion

### Goal

Produce a common visual-primitive layer regardless of source format.

### Vector path

- vector PDF,
- SVG,
- DXF where practical,
- preserve native text/geometry rather than rasterizing them.

### Raster path

- PNG/JPEG/TIFF,
- scanned PDF,
- deskew/denoise/scale normalization,
- line preservation,
- primitive extraction,
- OCR-region preparation.

### Release gate

Raster and vector examples produce normalized primitives consumable by the same downstream parser interface.

---

## v1.3.1 — OCR and annotation baseline

### Goal

Establish measured specialist baselines before developing Ortheon-One.

### Candidate baselines

- current PP-OCR family or equivalent,
- oriented engineering-annotation detector,
- deterministic geometry extraction,
- optional document/table parser for title/revision blocks.

### Metrics

- CER/WER,
- detection precision/recall/mAP,
- geometry deviation,
- latency,
- RAM/VRAM usage.

### Release gate

Baseline performance is reproducibly measured on a fixed Ortheon evaluation subset.

---

## v1.3.2 — Visual debugging and evidence overlay

### Goal

Make perception failures inspectable through the Engineering Inspector UI.

Expected artifacts may include:

```text
drawing.eir.json
drawing.debug.png
drawing.metrics.json
```

UI/debug overlays should expose OCR regions, annotations, primitives, IDs, confidence, and candidate associations.

### Release gate

A failed parse can be visually diagnosed without inspecting raw model tensors/logs.

---

# v1.4.x — Semantic parsing and relation reconstruction

## v1.4.0 — Engineering entity parser

### Goal

Convert tokens and primitives into typed engineering entities.

Initial targets:

- linear/diameter/radius dimensions,
- tolerances,
- thread annotations,
- datum indicators,
- GD&T frames,
- surface finish,
- title-block fields,
- view labels.

### Release gate

Supported annotations can be represented as structured entities rather than raw OCR strings.

---

## v1.4.1 — Relation engine

### Goal

Determine what annotations and constraints apply to.

```text
annotation -> feature
leader -> target
constraint -> feature
datum -> surface
entity -> view
feature -> view
view -> sheet
```

Start with deterministic spatial/topological heuristics: proximity, orientation, intersection, leader direction, containment, alignment, and view boundaries. Learned relation prediction is introduced only when a trustworthy relation dataset exists.

### Metrics

- relation precision/recall/F1,
- ambiguity rate,
- incorrect-confident-association rate.

### Release gate

A useful subset of dimensions/annotations is correctly associated with intended features on the golden evaluation set.

---

## v1.4.2 — Ortheon-Parse alpha + correction capture

### Goal

Create the first project-native parsing dataset containing real supervision.

### Planned contents

- synthetic exact-ground-truth samples,
- manually verified real drawing samples,
- P1-P5 labels,
- relation graph,
- confidence/provenance,
- human corrections captured through the Inspector where practical.

### Release gate

Parsing/relation experiments no longer depend only on third-party datasets or weak labels.

---

# v1.5.x — Standards-aware interpretation

## v1.5.0 — Standards engine foundation

### Goal

Keep standards interpretation deterministic and outside learned model weights.

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
      `--> rule provenance
```

Rust is the preferred long-term implementation for stable standards/rule evaluation.

### Release gate

At least one mechanical-rule subset produces deterministic, versioned, traceable interpretations from EIR.

---

## v1.5.1 — Validation and rule provenance

### Goal

Make every standards-derived conclusion auditable.

Required concepts include rule ID, standard identifier/edition, input entities, result, severity, evidence, and unresolved assumptions.

### Release gate

No standards result is emitted without identifying which rule/profile produced it.

---

# v1.6.x — Ortheon-One unified visual parser

> **This milestone is only about the visual/semantic parser. It does not contain or train the Engineering MicroLM.**

## v1.6.0 — Ortheon-One prototype

### Goal

Test whether one unified trainable model can recover the same engineering structure produced by the modular teacher pipeline.

The modular v1.3-v1.5 pipeline becomes the teacher/baseline.

### Candidate Ortheon-One tasks

- engineering token recognition,
- primitive/entity detection,
- geometry prediction,
- engineering entity parsing,
- relation prediction,
- constraint recovery,
- confidence/ambiguity prediction,
- EDL/EIR generation.

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

### Explicit exclusions

Ortheon-One does not need to perform:

- open-ended engineering chat,
- broad multidisciplinary language reasoning,
- final tool orchestration,
- standards rules that can be represented deterministically.

Those are downstream responsibilities.

### Release gate

Ortheon-One can be evaluated fairly against the modular teacher using identical EIR-level parsing metrics.

---

## v1.6.1 — Ortheon-One model-size/distillation study

### Goal

Measure how much **visual parsing capability** survives as Ortheon-One is compressed.

Candidate size bands:

```text
~100M
~250M
~500M
~750M
```

These are Ortheon-One parser variants, **not MicroLM variants**.

### Measurements

- OCR/token accuracy,
- entity F1,
- relation F1,
- Engineering Constraint Recovery,
- hallucination/error rate,
- throughput,
- peak memory,
- performance per parameter.

### Release gate

Ortheon has a defensible answer to whether unified sub-billion **visual parsing** is competitive with the modular teacher system.

---

# v1.7.x — Separate Engineering MicroLM

> **MicroLM receives EIR/EDL from Ortheon. It is not a component/head of Ortheon-One.**

## v1.7.0 — Engineering MicroLM research

### Goal

Test whether high-quality EIR/EDL allows a genuinely small **language model** to perform useful engineering interaction.

### Input boundary

Default MicroLM input:

```text
validated/relevant EIR or EDL
+ optional standards/tool context
+ user request
```

The MicroLM should not be trained as the primary drawing parser. Raw pixels are not its normal input contract.

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

### Training directions

- EIR/EDL -> answer,
- EIR/EDL + request -> structured query,
- EIR/EDL + request -> tool call,
- engineering prose -> constrained EDL/query where useful,
- teacher-model distillation without requiring hidden chain-of-thought supervision.

### Release gate

A sub-billion MicroLM demonstrates useful structured engineering interaction and outperforms equivalent raw-text/OCR-only input on a defined benchmark.

---

## v1.7.1 — Reasoning escalation

### Goal

Route requests among deterministic logic, MicroLM, larger reasoning models, and human review.

```text
DETERMINISTIC
MICROLM
LARGE_REASONER
HUMAN_REVIEW
```

Escalation signals may include low parse confidence, unresolved relations, unsupported standards rules, multidisciplinary reasoning requirements, or complex design trade-offs.

### Release gate

Requests can be routed by uncertainty/task complexity while preserving EIR provenance across every boundary.

---

# v1.8.x — Engineering tools and reconstruction

## v1.8.0 — Tool interface

### Goal

Allow reasoning systems to call deterministic engineering computation instead of improvising numerical results.

Candidate tool categories:

- unit conversion,
- tolerance stack-up,
- geometry calculations,
- material lookup,
- CAD queries,
- numerical solvers,
- later FEA/SPICE integrations.

### Release gate

MicroLM or larger reasoners can request structured tool execution and consume results without bypassing EIR provenance.

---

## v1.8.1 — 2D reconstruction/export

### Goal

Export parsed drawings into useful machine-readable representations.

Initial targets:

- JSON/EIR,
- EDL,
- SVG,
- DXF subset where feasible.

### Release gate

A supported drawing can be reconstructed into structured 2D output with measurable geometry/annotation fidelity.

---

# v1.9.x — Integrated evaluation and v1 hardening

## v1.9.0 — End-to-end benchmark

### Goal

Evaluate Ortheon as an engineering-information system rather than as isolated models.

### Core parsing metrics

- OCR CER/WER,
- primitive geometry error,
- entity F1,
- relation F1,
- constraint accuracy,
- standards interpretation accuracy,
- EIR validity,
- hallucination/error rate,
- latency/memory,
- **Engineering Constraint Recovery (ECR)**.

### Parsing comparison

```text
P1. Specialist modular teacher pipeline -> EIR
P2. Ortheon-One -> EIR
```

This comparison evaluates **drawing understanding**, not language reasoning.

### Downstream reasoning comparison

```text
R1. Generic VLM: image -> answer
R2. Engineering VLM: image -> answer
R3. Modular Ortheon -> EIR -> general LLM
R4. Ortheon-One -> EIR -> general LLM
R5. Ortheon parser -> EIR -> Engineering MicroLM
R6. Ortheon parser -> EIR -> larger engineering reasoner
```

This separation prevents a MicroLM result from being misreported as Ortheon-One parser performance, or vice versa.

### Release gate

The project can quantify:

- modular vs unified parsing,
- value of explicit engineering structure,
- MicroLM capability over structured input,
- larger-model gains from structured input,
- failure modes and uncertainty.

---

## v1.9.1 — v1 release candidate

### Goal

Stabilize interfaces and documentation before the first major public research release.

### Planned work

- supported EIR API freeze,
- benchmark freeze,
- reproducible experiments,
- separate model cards for Ortheon-One and MicroLM,
- model/data manifests,
- limitations/failure modes,
- example gallery,
- citation instructions,
- installation workflow,
- minimal inference workflow.

### Release gate

A new researcher can reproduce the supported v1 parsing and downstream reasoning experiments without private undocumented knowledge.

---

# v2.0.0 — Multi-domain engineering representation

v2 begins only after the mechanical-drawing v1 system is stable enough to determine which abstractions are truly domain-independent.

Potential domains:

- electrical/electronic schematics,
- P&ID,
- architectural/civil drawings,
- assembly-heavy drawings,
- welding documentation.

The goal is not five unrelated parsers:

```text
mechanical parser --------+
schematic parser ---------+
P&ID parser --------------+----> shared Engineering IR
architectural parser -----+
CAD/document adapters ----+
```

The same downstream reasoning boundary remains applicable: parsers produce EIR, reasoning systems consume it.

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
| **1.6.x** | Can **Ortheon-One** unify visual/semantic parsing? |
| **1.7.x** | Can a **separate MicroLM** exploit Ortheon's EIR/EDL? |
| **1.8.x** | Can EIR drive deterministic tools and reconstruction? |
| **1.9.x** | Does the integrated architecture beat simpler baselines? |
| **2.0.0** | Can EIR generalize across engineering domains? |

---

# What should not happen

1. Do not train Ortheon-One before the modular baseline and EIR/Ortheon-Parse contracts exist.
2. **Do not merge Ortheon-One and Engineering MicroLM into one conceptual or physical model simply for convenience.**
3. Do not report MicroLM reasoning scores as Ortheon-One parsing performance.
4. Do not report Ortheon-One parser scores as evidence of general engineering reasoning.
5. Do not claim standards compliance from model output alone.
6. Do not use a large VLM as a hidden replacement for missing parser logic.
7. Do not commit large datasets/checkpoints into Git.
8. Do not optimize only OCR while ignoring entity/relation correctness.
9. Do not silently collapse uncertain relations into certain constraints.
10. Do not expand into another engineering domain before v1 mechanical parsing is measurable.

---

# Definition of success for Ortheon v1

Ortheon v1 succeeds if it can demonstrate, on a reproducible mechanical-drawing benchmark, that:

1. drawing evidence can be converted into valid EIR,
2. important engineering entities and relations are recovered with measurable accuracy,
3. uncertainty and provenance remain visible,
4. deterministic standards/tool layers can operate on the representation,
5. Ortheon-One can be compared honestly with the modular visual parser at the same EIR boundary,
6. structured EIR improves downstream engineering QA/reasoning relative to raw OCR or direct visual prompting,
7. at least one genuinely small **separate Engineering MicroLM** can exploit EIR for useful engineering interaction,
8. larger reasoning models benefit from structured engineering state rather than being forced to reconstruct everything from pixels.
