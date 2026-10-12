# Ortheon v1: Verified 2D dataset source notes (2026-10-12)

**Scope:** 2D mechanical drawings first; source schema remains domain-extensible. This is a catalog/metadata review, **not downloaded-data validation**.

## Acquisition priority and supervision

| Dataset | Published scope | Native supervision | Missing for Ortheon JSG |
|---|---|---|---|
| [Cadsy](https://huggingface.co/datasets/cadsy/cad-technical-drawings) | 65 metadata rows/parts, 130 drawings, ~25.9 MB | Annotation boxes, text, type, view | Explicit dimension-to-feature graph |
| [MechVQA](https://huggingface.co/datasets/XiaofengAlg/MechVQA) | 3,371 unique images, 13,515 public SFT QA | Drawing questions/answers, category, metadata | Pixel-level features, verified EIR relationships |
| [TriView-CAD](https://data.mendeley.com/datasets/ynyjsmcjd6/1) | Fixed dataset version 1; sample count not yet verified | Orthographic views, consistency and part-wise splits | Full feature correspondence and dimension labels |
| [SketchGraphs filtered](https://princetonlips.github.io/SketchGraphs/data.html) | Filtered 2D CAD sketch sequences | Primitive/constraint graph, construction order | Final manufacturing drawing annotations |
| [MechAtlas](https://huggingface.co/datasets/XUXU666/MechAtlas) | 49,687 PDF/STEP pairs; gated approval; ~18GB | Document-to-CAD pair IDs | EIR and feature-to-annotation relationship ground truth |

## First download recommendation

1. Validate Cadsy's small public sample and confirm the difference between 65 metadata records and 130 drawings.
2. Inspect a limited MechVQA subset and keep the official evaluation benchmark isolated from training. Hugging Face availability may require authentication; do not assume anonymous access.
3. Verify TriView-CAD v1 sample counts and original part-disjoint splits before relying on published labels.
4. Only then inspect a filtered SketchGraphs subset and verify actual data rights; the repository's MIT license applies to its software, not necessarily the underlying CAD sketches.
5. Request MechAtlas access only when real-PDF supervision is needed. No full dataset download during CI.

## Label origin rules

Use distinct fields/lineage for: (a) upstream-native labels, (b) exact geometry-derived labels, (c) synthetic annotations with known ownership, (d) unverified model pseudo-labels, and (e) human-verified labels. **Proposed labels are not ground truth.**

Ortheon-One JSG's priority missing label is the directed or typed-hyperedge association between a dimension/leader/datum and the precise geometry it constrains. No listed dataset should be treated as complete P0–P5 EIR supervision without inspection and enrichment.

## Proposed own synthetic 2D corpus

Generate SVG/PDF and raster images from a reference 2D scene graph with stable primitive and annotation IDs; export exact known relationships before rendering. Group train/validation/test by base geometry and template *before* creating style or scan augmentations; verify a real-drawing holdout separately.

## Later cross-domain comparators (not initial training requirements)

- [PID2Graph](https://zenodo.org/records/14803338): P&ID graph relationships for testing typed-relation transfer. Patch records aren't independent source sheets; check rights.
- [Open Schematics](https://huggingface.co/datasets/bshada/open-schematics): electronic schematic images paired with native source files; curate a small legal, parseable subset before use.
- [FloorPlanCAD](https://floorplancad.github.io/): 2D plan vector semantics, but noncommercial dataset terms and domain shift apply.

## Reproducibility / licensing

- JSON manifests in `dataset/manifests/*.json` are a zero-dependency, versioned contract. Their `source.version` is publisher identity; `source.revision` is deliberately null until an exact download snapshot is pinned.
- The manifest's `license.declared` reflects the publisher's statement, not Ortheon's legal certification of source or downstream rights.
- Local acquisition locks must retain exact source revision, data hashes where supplied, and separate native versus derived annotations.
- `status` checks presence only; `verify` hashes only declared files and **does not** certify a full dataset.
- No model weights, large archives or dataset content belong in Git.

**Release status:** Metadata registration and lightweight tooling are implemented. The v1.1.0 acquisition acceptance gate remains open until at least MechVQA, TriView-CAD and SketchGraphs are actually acquired or their mandatory manual path is independently reproduced and validated.
