# Models and Checkpoints

This directory documents model/checkpoint identity. **Do not commit model weights here.**

## Model manifest convention

Each model used in a reported experiment should eventually have a small manifest, for example:

```yaml
name: ppocr_baseline
family: PP-OCR
source: upstream_model_identifier
revision: exact_revision_or_hash
license: verify_upstream_license
role: token_recognition
precision: fp16
quantization: null
input_contract: ortheon.visual_region.v1
output_contract: ortheon.token.v1
weights:
  location: external
  sha256: null
training:
  base_model: null
  dataset_manifests: []
  seed: null
  code_commit: null
```

## Required identity

A checkpoint used for a benchmark should identify:

- model family/name,
- upstream source,
- exact revision/checksum where possible,
- license status,
- role in Ortheon,
- input/output contract versions,
- precision/quantization,
- training datasets and versions for project-trained checkpoints,
- deterministic seed,
- Ortheon code commit,
- external weight checksum.

## Artifact rule

Weights belong in ignored paths such as:

```text
weights/
checkpoints/
models/local/
```

The repository stores identity and reproducibility metadata, not gigabytes of tensors masquerading as source code.
