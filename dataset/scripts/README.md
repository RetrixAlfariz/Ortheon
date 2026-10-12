# Dataset Tooling

Current executable foundation lives in the dependency-free `src/ortheon/datasets.py` module and is available with `uv run python -m ortheon.datasets`.

Supported subcommands: `validate`, `list`, `status`, `plan`, `verify` and `fetch` (manual or pinned Hugging Face CLI acquisition). No download is executed by any command except an explicit real `fetch` of a Hugging Face source.

Raw/processed conversion, per-sample label adapters, image integrity, cross-source deduplication, split leakage reports and generated EIR fixtures are queued for v1.1.1/v1.1.2.

Datasets/model weights are never CI dependencies. See `dataset/manifests/README.md` and `dataset/2D_SOURCE_AUDIT.md`.
