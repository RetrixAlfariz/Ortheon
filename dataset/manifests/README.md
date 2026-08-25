# Dataset Manifests

Dataset manifests become a required reproducibility contract in Ortheon v1.1.x.

Each manifest should eventually record at minimum:

```yaml
name: dataset_name
version: upstream_version_or_snapshot
source: upstream_url
license: verify_upstream_license
citation: upstream_citation
acquired_at: null
sha256: null
splits:
  train: null
  validation: null
  test: null
storage:
  raw_bytes: null
  processed_bytes: null
supervision:
  native: []
  ortheon_derived: []
```

The v1.0.0 foundation defines the contract location only. Concrete manifests are part of v1.1.0.
