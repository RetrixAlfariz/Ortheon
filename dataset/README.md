# Ortheon Dataset Plan

This directory documents the datasets planned for Ortheon and the role each dataset plays in the research pipeline.

Ortheon is not intended to learn engineering drawings as a plain `image -> text` OCR task. The target is a parsing-first system that can recover visual primitives, engineering entities, spatial relations, constraints, and eventually a standards-aware Engineering Intermediate Representation (EIR).

The dataset strategy therefore mixes four kinds of supervision:

1. **Engineering-drawing reasoning data** for recognition, reasoning, and judgment.
2. **CAD geometry and constraint data** for learning geometric structure and relationships.
3. **Large technical-drawing corpora** for visual pretraining.
4. **Ortheon-generated parsing data** with explicit entity, relation, constraint, and provenance labels.

> Important: this repository should store manifests, download scripts, schemas, checksums, and annotations. Large third-party datasets should not be committed directly into Git.

---

## Dataset overview

| Dataset | Approximate scale | Primary supervision | Ortheon role | Priority |
| --- | ---: | --- | --- | --- |
| **MechVQA** | 3,371 public SFT images / 13,515 public SFT QA records; public benchmark also available | Mechanical drawing QA + capability metadata | Engineering recognition, reasoning, and judgment | **Core** |
| **SketchGraphs** | 15M CAD sketches | Geometric entities + designer-imposed constraints + construction sequences | Relation and constraint learning | **Core** |
| **ABC Dataset** | 1M CAD models | Exact parameterized curves and surfaces | Geometry prior + synthetic drawing generation | **Core** |
| **TriView-CAD** | Three-view mechanical drawing combinations | Front/top/side images + consistency label + fixed splits | Orthographic cross-view consistency | **Core** |
| **Fusion 360 Gallery** | 8,625 reconstruction sequences; additional assembly and segmentation subsets | CAD construction sequences, B-Rep, mesh, operation labels, joints | CAD semantics + reconstruction prior | **Core** |
| **DeepPatent2** | ~2M compound figures / ~2.7M segmented figures | Technical-drawing images + figure metadata | Large-scale technical visual pretraining | Supporting / subset-first |
| **AI2D** | ~5K science diagrams; >118K constituents; ~53K relations | Diagram constituents + relations + QA | Generic diagram relation pretraining | Supporting |
| **DocLayNet** | 80,863 pages | 11-class layout bounding boxes + document metadata | Page/layout region prior | Supporting |
| **PubTables-1M** | Nearly 1M tables | Table detection, structure, headers, cell locations | Title block / revision table / BOM structure prior | Supporting |
| **Ortheon-Parse** | Generated and manually corrected by this project | P1-P7 parsing hierarchy | Main Ortheon-specific supervision | **Primary research dataset** |

---

# Core datasets

## 1. MechVQA

**Source**

- Repository: https://github.com/xiaofengShi/MechVQA
- Paper: *MechVQA: Benchmarking and Enhancing Multimodal LLMs on Comprehensive Mechanical Drawing Understanding* (ICML 2026)
- Public SFT dataset: `XiaofengAlg/MechVQA`

### Specification

The public release currently includes:

- **3,371 unique drawing images** in the public VQA-only SFT release.
- **13,515 public SFT records**:
  - 12,749 train records
  - 766 validation records
- A separate public evaluation benchmark with:
  - 1,185 QA records
  - 562 packaged drawing images
- 10 fine-grained tasks grouped under three capability levels:
  - `Recognition`
  - `Reasoning`
  - `Judging`

The benchmark record schema includes message data, image paths, and metadata such as capability, subcategory, difficulty, language, and quality score.

### Why Ortheon needs it

MechVQA gives Ortheon something geometry datasets do not: **actual mechanical-drawing reasoning supervision**.

It is especially useful for the high-level stages of Ortheon-One where the model must move from:

```text
I can see these symbols
```

to:

```text
I understand what the drawing implies
```

It will be used for:

- mechanical-drawing domain adaptation,
- recognition tasks,
- assembly and view reasoning,
- engineering QA,
- judgment tasks,
- evaluation against a current mechanical-drawing benchmark.

### Native variables / annotations

| Variable | Meaning |
| --- | --- |
| `messages` | User question and reference assistant answer |
| `images` | Drawing image path(s) |
| `metadata.capability` | Recognition / Reasoning / Judging |
| `metadata.subcategory` | Fine-grained task category |
| `metadata.difficulty` | Difficulty category |
| `metadata.language` | QA language |
| `qualityscore` | Data quality score |

### Ortheon-derived variables

MechVQA does **not** natively provide the full Ortheon parse graph. We may enrich selected samples with:

- drawing entities,
- text spans,
- feature IDs,
- entity coordinates,
- cross-view relationships,
- dimension-to-feature relations,
- EIR records.

---

## 2. SketchGraphs

**Source**

- Repository: https://github.com/PrincetonLIPS/SketchGraphs
- Project documentation: https://princetonlips.github.io/SketchGraphs/

### Specification

SketchGraphs contains approximately **15 million CAD sketches** extracted from real CAD models.

Each sketch is represented as a **geometric constraint graph**:

- graph nodes represent geometric primitives/entities,
- graph edges represent designer-imposed geometric constraints.

Available forms include:

- raw Onshape JSON archives: approximately **43 GB**,
- compact construction-sequence representation: approximately **15 GB**,
- filtered train / validation / test construction-sequence splits.

### Why Ortheon needs it

SketchGraphs is one of the most important datasets for Ortheon's **relation layer**.

A technical drawing is not just a set of symbols. Engineering meaning depends on relationships such as:

```text
parallel
perpendicular
coincident
concentric
tangent
equal
horizontal
vertical
```

SketchGraphs allows us to teach a model that geometry forms a **constraint graph**, not merely a collection of pixels.

It is especially valuable for:

- pretraining the Ortheon relation transformer,
- geometric graph representation learning,
- constraint prediction,
- graph completion,
- learning construction order,
- developing EIR geometry/constraint schemas.

### Native variables / annotations

Depending on the selected representation, useful fields include:

- geometric entity / primitive type,
- geometric parameters,
- entity identifiers,
- constraint type,
- constraint endpoints / related entities,
- construction sequence order,
- graph topology.

Conceptually:

```text
entity_i
entity_j
constraint(entity_i, entity_j)
```

### Ortheon-derived variables

From SketchGraphs we can derive:

- normalized primitive tokens,
- normalized relation tokens,
- geometry graph embeddings,
- EIR-compatible relation triples,
- synthetic 2D renderings paired with their exact constraint graph.

### Licensing note

The SketchGraphs repository code is MIT licensed, but the original CAD sketch content has separate ownership/terms. Do not redistribute the raw data from Ortheon without verifying the upstream dataset terms.

---

## 3. ABC Dataset

**Source**

- Paper: https://openaccess.thecvf.com/content_CVPR_2019/html/Koch_ABC_A_Big_CAD_Model_Dataset_for_Geometric_Deep_Learning_CVPR_2019_paper.html

### Specification

ABC contains approximately **1 million CAD models**.

Its key property is that shapes are described using **explicitly parameterized curves and surfaces**, which provides high-quality geometric ground truth.

The dataset supports ground truth for tasks including:

- differential geometric quantities,
- patch segmentation,
- geometric feature detection,
- shape reconstruction.

### Why Ortheon needs it

ABC gives Ortheon a source of **exact CAD geometry** from which we can manufacture controlled engineering-drawing data.

Instead of manually labeling every projected line, circle, or feature, we can generate:

```text
CAD model
   -> orthographic projection
   -> technical drawing
   -> exact ground-truth geometry
```

This makes ABC ideal for Ortheon's synthetic-data engine.

### Native variables / annotations

Useful native information includes:

- CAD model geometry,
- parameterized surfaces,
- parameterized curves,
- surface / curve type,
- geometric patches,
- feature curves,
- shape topology / reconstruction ground truth.

### Ortheon-derived variables

ABC can be rendered into an Ortheon dataset containing:

- front / top / side views,
- line / arc / circle primitives,
- projected feature identifiers,
- cross-view feature correspondences,
- synthetic dimension annotations,
- synthetic tolerances,
- synthetic datum and GD&T annotations,
- exact EIR geometry.

---

## 4. TriView-CAD

**Source**

- Dataset: https://data.mendeley.com/datasets/ynyjsmcjd6/1
- Published: 13 July 2026
- License: CC BY 4.0

### Specification

TriView-CAD is specifically designed for **three-view mechanical engineering drawing consistency verification**.

Each sample contains orthographic views such as:

- front view,
- top view,
- side view,
- consistency label.

Consistent samples use views belonging to the same part. Inconsistent samples are generated by combining views from different parts.

The authors provide fixed train / validation / test splits based on part identifiers before constructing inconsistent combinations, reducing cross-split leakage.

### Why Ortheon needs it

This dataset directly supports one of Ortheon's hardest future abilities:

> determining whether multiple orthographic projections describe the same 3D object.

It can be used for:

- cross-view representation learning,
- orthographic consistency checking,
- multi-view feature matching,
- front/top/side reasoning,
- evaluation of the Ortheon relation model across views.

### Native variables / annotations

Useful variables include:

- front-view image,
- top-view image,
- side-view image,
- sample / part identity information,
- binary consistency label,
- fixed dataset split.

### Ortheon-derived variables

We can later add:

- corresponding feature pairs across views,
- projected edge relationships,
- candidate 3D feature identity,
- cross-view relation confidence,
- EIR view graph.

---

## 5. Fusion 360 Gallery Dataset

**Source**

- Repository: https://github.com/AutodeskAILab/Fusion360GalleryDataset
- Autodesk Research: https://www.research.autodesk.com/publications/fusion-360-gallery/

### Specification

Useful released subsets include:

| Subset | Scale |
| --- | ---: |
| Reconstruction | **8,625 sequences** (~2.0 GB) |
| Assembly | **8,251 assemblies / 154,468 parts** |
| Assembly Joint | **32,148 joints / 23,029 parts** (~2.8 GB) |
| Segmentation | **35,680 parts** (~3.1 GB) |

The reconstruction subset contains sequential CAD design data focused on sketch and extrude operations.

Representations include:

- B-Rep,
- STEP / SMT geometry,
- mesh / OBJ,
- construction-sequence JSON,
- thumbnails.

The reconstruction metadata can include sketch curves, profiles, timeline entries, extrusion operations, bodies, and face references.

### Why Ortheon needs it

Fusion 360 Gallery gives us the bridge between:

```text
drawing semantics
```

and:

```text
how CAD geometry was actually constructed
```

It is useful for:

- learning feature construction sequences,
- recovering sketch/extrude programs,
- CAD reconstruction experiments,
- connecting 2D features to 3D B-Rep entities,
- assembly relationship learning,
- face-level semantic pretraining.

### Native variables / annotations

Useful variables include:

- design timeline index,
- entity UUID / references,
- sketch data,
- points,
- curves,
- profiles,
- extrusion direction,
- extrusion distance,
- extrusion operation type,
- bodies,
- faces,
- start / end / side face references,
- assembly hierarchy,
- joints / connectivity in the assembly subsets,
- segmentation labels.

The segmentation dataset includes face labels such as:

- `ExtrudeSide`
- `ExtrudeEnd`
- `CutSide`
- `CutEnd`
- `Fillet`
- `Chamfer`
- `RevolveSide`
- `RevolveEnd`

### Ortheon-derived variables

Possible derived data:

- 2D orthographic projections,
- projected face IDs,
- feature-to-view correspondences,
- CAD-program targets,
- EIR-to-CAD reconstruction targets.

---

# Supporting datasets

## 6. DeepPatent2

**Source**

- Paper/data description: https://www.nature.com/articles/s41597-023-02653-7

### Specification

DeepPatent2 contains approximately:

- **2 million compound PNG figures**,
- **2.7 million segmented PNG figures**,
- **314 GB compressed total data**,
- metadata stored in JSON.

Metadata includes document- and figure-level information.

### Why Ortheon needs it

DeepPatent2 is useful for **large-scale technical-line-drawing visual pretraining**.

It should not be treated as engineering-constraint ground truth, but it can make the visual encoder substantially less dependent on photographic-image priors.

We should initially use controlled subsets instead of downloading the full 314 GB corpus.

### Native variables / annotations

Useful metadata includes:

- patent ID,
- original figure filename,
- segmented figure,
- object name,
- viewpoint,
- figure label,
- bounding box,
- segmented-figure label,
- caption-derived information.

### Ortheon-derived variables

Possible derived supervision:

- technical-line-art representation learning,
- view classification,
- object/view contrastive learning,
- weakly supervised technical-figure embeddings.

---

## 7. AI2D

**Source**

- Paper: https://ai2-website.s3.amazonaws.com/publications/Diagrams_ECCV2016.pdf

### Specification

AI2D contains approximately **5,000 science diagrams**, with:

- more than **118,000 diagram constituents**,
- approximately **53,000 annotated relationships**,
- more than **15,000 multiple-choice questions**.

### Why Ortheon needs it

Although AI2D is not an engineering-drawing dataset, it provides useful generic supervision for:

```text
entity -> relation -> entity
```

and diagram-level reasoning.

This can help pretrain relationship reasoning before specialization on mechanical drawings.

### Native variables / annotations

- diagram image,
- constituent segmentation / entity regions,
- diagram relationships,
- question,
- multiple-choice answers / labels.

### Ortheon-derived variables

- normalized entity/relation graph,
- arrow / connector relation targets,
- relation-attention pretraining samples.

---

## 8. DocLayNet

**Source**

- Repository: https://github.com/DS4SD/DocLayNet
- Hugging Face: `ds4sd/DocLayNet`

### Specification

DocLayNet contains **80,863 human-annotated pages** from six document categories and supplies layout segmentation using bounding boxes for **11 layout classes**.

Published split sizes:

- 69,375 train
- 6,489 validation
- 4,999 test

Core dataset size is approximately 28 GiB, with optional PDF/text-cell extras.

### Why Ortheon needs it

Technical drawings still contain conventional document regions such as:

- titles,
- notes,
- tables,
- figures,
- page metadata.

DocLayNet can help pretrain a page-layout backbone before Ortheon specializes it for title blocks, general notes, BOMs, and revision regions.

### Native variables / annotations

Hugging Face fields include:

- `image_id`
- `image`
- `width`
- `height`
- `doc_category`
- `collection`
- `doc_name`
- `page_no`
- `objects`

The COCO annotations provide object bounding boxes and class labels.

### Ortheon-derived variables

- title-block-like region proposals,
- drawing-note region proposals,
- normalized layout tokens,
- layout-to-EIR region mappings.

---

## 9. PubTables-1M

**Source**

- Microsoft Research: https://www.microsoft.com/en-us/research/publication/pubtables-1m/

### Specification

PubTables-1M contains **nearly one million tables** extracted from scientific articles with detailed table-structure ground truth.

It supports:

- table detection,
- table structure recognition,
- functional analysis,
- header information,
- cell locations.

### Why Ortheon needs it

Engineering drawings frequently contain structured tabular regions such as:

- title blocks,
- revision tables,
- bills of materials,
- general tolerance tables,
- inspection tables.

PubTables-1M is therefore useful as generic table-structure pretraining, not as engineering semantics itself.

### Native variables / annotations

Useful supervision includes:

- table location,
- row / column structure,
- header structure,
- cell location,
- structural relationships,
- table functional information.

### Ortheon-derived variables

- title-block cell graph,
- revision-table parser targets,
- BOM row/column targets,
- table-to-EIR metadata mappings.

---

# Ortheon-Parse: project-native dataset

Existing datasets solve important pieces of the problem, but none of them provides the complete supervision Ortheon requires.

The main research dataset should therefore be **Ortheon-Parse**, a parser-level corpus generated from CAD sources, synthetic renderers, teacher models, and manually verified real drawings.

## Parsing hierarchy

Ortheon-Parse should use a progressive hierarchy.

### P0 - Source image

```text
drawing.png
```

Variables:

- image ID,
- source type,
- raster/vector source,
- resolution,
- sheet metadata,
- provenance.

### P1 - Visual primitives

Examples:

```text
LINE
POLYLINE
ARC
CIRCLE
ELLIPSE
ARROW
TEXT_REGION
HATCH
CENTERLINE
```

Variables:

- primitive ID,
- primitive type,
- coordinates,
- orientation,
- geometry parameters,
- confidence,
- source/provenance.

### P2 - Recognized tokens

Examples:

```text
Ø20
H7
±0.02
Ra 1.6
M12x1.5
```

Variables:

- token ID,
- text value,
- bounding region,
- orientation,
- OCR confidence,
- alternative hypotheses.

### P3 - Engineering entities

Examples:

```text
DIMENSION
DATUM
GD&T_FRAME
SURFACE_FINISH
THREAD_NOTE
HOLE
SLOT
VIEW
TITLE_BLOCK
```

Variables:

- entity ID,
- entity type,
- parsed values,
- source token IDs,
- visual evidence IDs,
- entity confidence.

### P4 - Relations

Examples:

```text
DIMENSION_1 --applies_to--> HOLE_3
DATUM_A --assigned_to--> SURFACE_7
LEADER_2 --points_to--> FEATURE_4
VIEW_FRONT --corresponds_to--> VIEW_TOP
```

Variables:

- relation ID,
- source entity,
- relation type,
- target entity,
- geometric evidence,
- relation confidence,
- alternative candidate targets.

### P5 - Engineering constraints

Examples:

```text
hole diameter = 20 mm
fit = H7
position tolerance = 0.05 mm
datum reference = A | B | C
```

Variables:

- constraint ID,
- constraint type,
- nominal value,
- units,
- upper/lower tolerance,
- modifiers,
- controlled feature(s),
- datum references,
- provenance.

### P6 - Standards interpretation

Standards are not simply labels memorized by a model. They should be versioned and interpreted through a standards engine.

Variables:

- standard family,
- standard identifier,
- edition / revision,
- applicable rule ID,
- interpreted semantic meaning,
- validation result,
- ambiguity state.

Example:

```json
{
  "standard_family": "ISO",
  "standard": "ISO 1101",
  "edition": "2017",
  "constraint_id": "gdt_004"
}
```

### P7 - Engineering reasoning / judgment

Example tasks:

- Which feature does this tolerance control?
- Are the front/top/side views mutually consistent?
- Which dimensions are ambiguous?
- Which datum sequence controls a given feature?
- Does the parsed drawing contain conflicting constraints?

Variables:

- question / task,
- relevant EIR nodes,
- expected answer,
- reasoning category,
- difficulty,
- validation evidence.

---

# Proposed dataset usage by training stage

| Training stage | Main datasets | Goal |
| --- | --- | --- |
| Technical visual pretraining | DeepPatent2 subset, ABC renders | Learn technical line-art features |
| Layout / region pretraining | DocLayNet, PubTables-1M | Learn page regions and table structure |
| Geometric representation | ABC, SketchGraphs | Learn primitives, geometry, and constraints |
| CAD semantics | Fusion 360 Gallery | Learn features, operations, construction sequences |
| Diagram relations | SketchGraphs, AI2D | Learn entity-relation graphs |
| Orthographic reasoning | TriView-CAD, ABC/Fusion synthetic projections | Learn cross-view consistency |
| Mechanical drawing reasoning | MechVQA | Recognition, reasoning, judgment |
| Ortheon parsing | Ortheon-Parse | P1-P7 structured engineering interpretation |

---

# Data acquisition order

Recommended order for the first implementation:

1. **MechVQA** - small enough to inspect immediately and directly relevant.
2. **TriView-CAD** - direct orthographic reasoning data.
3. **SketchGraphs filtered split** - relation and constraint research.
4. **Fusion 360 reconstruction subset** - manageable CAD sequence data.
5. **ABC subset** - synthetic geometry/rendering experiments.
6. **DocLayNet / PubTables subsets** - layout and table baselines.
7. **AI2D** - relation-pretraining experiments.
8. **DeepPatent2 subset only** - scale up technical visual pretraining after the pipeline is stable.

Do not begin by downloading every available dataset in full. Storage consumption would become enormous before we have established which supervision actually improves Ortheon.

---

# Storage layout

Large datasets should remain external to Git.

Suggested local structure:

```text
dataset/
├── README.md
├── manifests/
│   ├── mechvqa.yaml
│   ├── sketchgraphs.yaml
│   ├── abc.yaml
│   ├── triview_cad.yaml
│   └── fusion360.yaml
├── schemas/
│   ├── primitive.schema.json
│   ├── entity.schema.json
│   ├── relation.schema.json
│   └── eir.schema.json
├── scripts/
│   ├── download/
│   ├── convert/
│   └── validate/
└── local/                 # gitignored
    ├── raw/
    ├── processed/
    ├── cache/
    └── ortheon_parse/
```

Recommended manifest metadata:

```yaml
name: dataset_name
version: dataset_version
source: upstream_url
license: verify-upstream-license
sha256: null
storage:
  raw_bytes: null
  processed_bytes: null
splits:
  train: null
  validation: null
  test: null
```

---

# Licensing and provenance rules

Before any dataset is redistributed, mirrored, or packaged with an Ortheon release:

1. verify the upstream dataset license,
2. preserve the original citation,
3. preserve source/provenance metadata,
4. do not assume the source-code repository license also licenses the underlying data,
5. do not commit copyrighted engineering standards or purchased standards documents,
6. record the exact dataset version used for every experiment.

---

# Research objective

The dataset strategy exists to support the following progression:

```text
pixels
  -> primitives
  -> tokens
  -> engineering entities
  -> relations
  -> constraints
  -> standards-aware EIR
  -> engineering reasoning
```

The long-term research target is not simply higher OCR accuracy. It is **Engineering Constraint Recovery**: how much of the actual engineering meaning encoded in a drawing can Ortheon reconstruct correctly, with traceable evidence and uncertainty.
