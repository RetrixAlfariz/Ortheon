# Reproducibility Contract

Every result used to justify an Ortheon design or model decision should be reproducible from recorded repository and dataset state.

## Minimum experiment identity

Record:

- Ortheon commit SHA,
- experiment/config identifier,
- dataset manifest versions,
- source dataset versions/snapshots,
- preprocessing/conversion versions,
- model/checkpoint identifier,
- random seed(s),
- software environment,
- hardware summary,
- metrics and output artifact checksums.

## Dataset rule

Raw third-party data is external to Git. The repository stores enough metadata to identify and validate the exact data used.

## Artifact rule

Large generated artifacts and weights remain external to Git. Small golden fixtures, schemas, metrics, and summaries may be tracked.

## Provenance rule

Every Ortheon-derived sample should be traceable to:

```text
upstream dataset/sample
        -> conversion step(s)
        -> Ortheon annotation/version
        -> training/evaluation split
```

## No silent mutation

Conversion tools should write derived data separately rather than changing raw source data in place.

## Future automation

v1.1.x and later should add machine-readable manifests and validation commands so these requirements are enforced rather than merely requested in prose.
