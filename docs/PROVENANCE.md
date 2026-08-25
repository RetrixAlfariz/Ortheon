# Citation and Provenance Rules

Ortheon treats provenance as part of the engineering data model rather than optional bibliography decoration.

## External datasets

For every registered dataset record:

- preserve the canonical upstream source URL,
- record the dataset/release/snapshot version,
- record the upstream citation or paper,
- record license status separately from source-code licensing,
- record acquisition date when downloaded,
- record checksums when practical,
- do not redistribute data unless upstream terms permit it.

## Derived samples

An Ortheon-derived sample should retain a lineage chain:

```text
upstream dataset
  -> upstream sample identifier
  -> source asset checksum
  -> conversion/normalization version
  -> Ortheon annotation/schema version
  -> train/validation/test assignment
```

Native upstream labels and Ortheon-derived labels must remain distinguishable.

## Model outputs

Generated detections/parses used as weak labels should record:

- model/checkpoint identifier,
- model revision/checksum,
- inference configuration,
- code commit,
- confidence,
- timestamp or experiment ID,
- whether a human verified/corrected the output.

## Engineering standards

Do not commit purchased/copyrighted standards documents merely because Ortheon implements rules derived from them.

A standards-derived result should identify, where applicable:

- standards family,
- document identifier,
- edition/revision,
- Ortheon rule/profile identifier,
- input EIR entities,
- validation/interpretation result.

## Publications and reports

Any published Ortheon result should cite both:

1. the upstream datasets/models that contributed evidence or training data, and
2. the exact Ortheon repository/dataset/model versions used for the result.

The goal is simple: a future researcher should be able to determine **where a fact, label, prediction, or benchmark result came from** without reverse-engineering filenames and human memory.
