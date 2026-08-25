# Ortheon Development Status

**Last updated:** 2026-08-25  
**Active branch:** `research/dataset-foundation`  
**Current generation:** `v1`  
**Completed milestone:** `v1.0.x - Project and research foundation`  
**Active milestone:** `v1.1.0 - Dataset registry and acquisition layer`  
**Project state:** Foundation complete; reproducible dataset implementation begins

This file is the live operational status of Ortheon. The long-term roadmap and release gates live in [`README.md`](README.md).

---

# Status legend

| State | Meaning |
| --- | --- |
| `DONE` | Completed for the relevant milestone |
| `ACTIVE` | Primary development focus |
| `IN PROGRESS` | Work has started but is not complete |
| `QUEUED` | Intended next work after active tasks |
| `SIDE` | Parallel research that must not block the active milestone |
| `RESEARCH` | Investigation before an implementation decision |
| `BLOCKED` | Waiting on an unresolved dependency |
| `DEFERRED` | Explicitly postponed to a later version |

---

# Current focus at a glance

```text
PRIMARY / ACTIVE
  v1.1.0 Dataset registry + acquisition
        |
        +--> real manifests for core datasets
        +--> source/version/license/citation identity
        +--> storage estimates before acquisition
        +--> resumable acquisition where practical
        `--> dataset availability checks

SECONDARY / IN PROGRESS
  Ortheon-Parse contract preparation
        |
        +--> primitive vocabulary
        +--> entity vocabulary
        +--> relation vocabulary
        +--> constraint vocabulary
        `--> provenance/confidence fields

SIDE RESEARCH
  EIR/EDL design refinement
  Ortheon-One unified parser architecture
  ~100M-500M Engineering MicroLM hypothesis
  standards-engine survey
  model baseline survey
```

Model training is **not** the active focus yet. The repository should first be able to identify, acquire, validate, version, and reproduce the data used by later experiments.

---

# Completed foundation

## `DONE` - v1.0.0 Research architecture lock

Completed outputs include:

- project thesis and initial scope,
- P0-P7 parsing hierarchy,
- modular teacher-system concept,
- Ortheon-One long-term unified-model concept,
- dataset research plan,
- versioned development roadmap,
- live status tracking,
- initial EIR design notes,
- research questions,
- initial evaluation philosophy.

Completion record: [`v1.0.0-foundation.md`](v1.0.0-foundation.md).

## `DONE` - v1.0.1 Repository hygiene and reproducibility

Completed outputs include:

- root repository architecture/scope README,
- `.gitignore` for datasets/checkpoints/caches/artifacts,
- `pyproject.toml` and package skeleton,
- experiment naming convention,
- JSONL log convention,
- dataset manifest convention,
- model/checkpoint manifest convention,
- deterministic seed utility,
- runtime/package metadata capture,
- provenance/citation rules,
- contribution workflow,
- smoke-test foundation.

Completion record: [`v1.0.1-reproducibility.md`](v1.0.1-reproducibility.md).

### v1.0.x gate

**PASSED.** A fresh repository clone can determine what Ortheon is, where research artifacts belong, how experiments/data/models are identified, and what must be reproducible before model claims are accepted.

---

# Primary focus

## `ACTIVE` - v1.1.0 Dataset registry and acquisition layer

### Objective

Turn [`../dataset/README.md`](../dataset/README.md) from a research inventory into an executable, reproducible dataset registry.

### Core datasets for this milestone

1. **MechVQA**
2. **TriView-CAD**
3. **SketchGraphs filtered data**
4. **Fusion 360 Gallery reconstruction subset**
5. **ABC subset**

The first release gate requires at least the first **three** to be reproducibly registered/acquired.

### `IN PROGRESS`

- `dataset/manifests/` location and manifest contract exist.
- `dataset/schemas/` staging location exists.
- `dataset/scripts/` staging location exists.
- dataset purpose/spec/native-vs-derived-variable documentation exists.

### `ACTIVE` implementation tasks

- [ ] Create a real manifest for MechVQA.
- [ ] Create a real manifest for TriView-CAD.
- [ ] Create a real manifest for SketchGraphs filtered data.
- [ ] Create a real manifest for Fusion 360 reconstruction data.
- [ ] Create a real manifest for the initial ABC subset.
- [ ] Record canonical source/citation/license/version information.
- [ ] Define expected local paths for each dataset.
- [ ] Add storage-estimation metadata.
- [ ] Implement registry loader/validator.
- [ ] Implement acquisition commands/scripts where upstream distribution permits automation.
- [ ] Make downloads resumable where practical.
- [ ] Implement an availability/status check without downloading everything.

### v1.1.0 release gate

At least MechVQA, TriView-CAD, and SketchGraphs can be reproducibly registered and acquired (or deterministically directed through a required manual upstream step) without reconstructing instructions from conversation history.

---

# Secondary focus

## `IN PROGRESS` - Ortheon-Parse specification preparation

This work prepares v1.1.2 but must not destabilize v1.1.0.

Current hierarchy:

```text
P0 Source
P1 Primitive
P2 Token
P3 Engineering entity
P4 Relation
P5 Engineering constraint
P6 Standards interpretation
P7 Engineering reasoning/judgment
```

### Current design requirements

- native upstream vs Ortheon-derived labels remain distinguishable,
- each derived item can retain source evidence,
- confidence and ambiguity are first-class fields,
- relation labels are explicit rather than reconstructed downstream repeatedly,
- schema/version identity is preserved,
- synthetic and human-verified supervision are distinguishable.

### `QUEUED`

- machine-readable P1 primitive schema,
- P2 token schema,
- P3 entity schema,
- P4 relation schema,
- P5 constraint schema,
- sample Ortheon-Parse records,
- validator tests.

---

# Side research

## `SIDE / RESEARCH` - EIR and EDL

Initial design notes exist under [`../docs/EIR_NOTES.md`](../docs/EIR_NOTES.md).

Do not freeze the canonical schema until the v1.1 dataset/annotation work exposes the representation requirements with real samples.

## `SIDE / RESEARCH` - Ortheon-One

Long-term goal: test a unified model capable of jointly producing text, engineering entities, geometry, relations, and structured EIR/EDL.

This is not yet a training task. The modular parsing pipeline and Ortheon-Parse dataset will act as teacher/baseline infrastructure.

## `SIDE / RESEARCH` - Engineering MicroLM

Research hypothesis:

> High-quality EIR/EDL may allow a genuinely small, roughly 100M-500M parameter language model to handle routine structured engineering interaction, while larger 2B+ or frontier models are reserved for deeper reasoning.

No MicroLM training should begin until EIR/EDL tasks and evaluation contracts exist.

## `SIDE / RESEARCH` - Standards engine

Continue surveying standards representation and rule provenance, but do not implement broad standards logic before the core entity/constraint representation stabilizes.

---

# Queued milestones

## `QUEUED` - v1.1.1 Dataset validation and normalization

After acquisition/registration works:

- integrity checks,
- corrupted/missing sample detection,
- duplicate checks,
- split validation,
- dataset statistics,
- normalization adapters,
- provenance reports,
- data cards.

## `QUEUED` - v1.1.2 Ortheon-Parse specification

After real dataset structures are inspected:

- formal P1-P5 schemas,
- ontology/vocabulary definitions,
- annotation guidelines,
- ambiguity/confidence representation,
- schema/version validator,
- reference fixtures.

## `DEFERRED` - v1.2.x EIR freeze

The exploratory EIR design exists, but schema stabilization remains intentionally deferred until v1.1.x is complete.

## `DEFERRED` - v1.3.x model/perception baseline

No model benchmark is considered an active milestone yet.

---

# Current blockers

No hard blocker exists for v1.1.0.

Potential upcoming constraints that must be verified per dataset:

- upstream licenses and redistribution rules,
- datasets requiring authenticated/manual acquisition,
- dataset size and storage requirements,
- unstable/moving upstream URLs,
- source-code license differing from underlying-data license.

These are registry metadata problems first, not excuses to download 300 GB and discover the terms afterward.

---

# Definition of current success

The current milestone succeeds when a new contributor can run the dataset registry/acquisition workflow and answer:

```text
What is this dataset?
Where does it come from?
Which exact version is being used?
What is its license status?
How large is it?
Which variables are native?
Which variables will Ortheon derive?
Is it available locally?
Is the local copy valid enough to proceed?
```

Only after that foundation exists should Ortheon move into normalization, parsing schemas, and eventually model experiments.
