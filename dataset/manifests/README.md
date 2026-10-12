# Dataset registry: machine-readable manifests

Each `*.json` file is schema v1 and identifies an external dataset. JSON is used intentionally so registry operations require no additional Python dependencies.

Required fields are validated by `ortheon.datasets`: `id`, `name`, `domain`, `priority`, source URL/publisher version/revision, acquisition method, declared license and rights review, storage estimates, record counts, native vs proposed-derived supervision, split group key, local expected paths, known SHA-256.

**Null `source.revision` means no exact snapshot has been pinned.** It must not be presented as a reproducibly downloaded version. HF acquisition requires the caller to supply a real 40-character dataset commit SHA. Manually acquired Mendeley/SketchGraphs sources must have local archive hashes documented before use.

Run offline:

    uv run python -m ortheon.datasets validate
    uv run python -m ortheon.datasets list
    uv run python -m ortheon.datasets status
    uv run python -m ortheon.datasets plan cadsy
    uv run python -m ortheon.datasets verify cadsy

Preview pinned public HF acquisition (does not download):

    uv run python -m ortheon.datasets fetch cadsy --revision <40-char-commit-sha> --dry-run

To acquire for real remove `--dry-run` after reviewing rights and installing/authenticating the `hf` CLI. All outputs stay under the Git-ignored `dataset/local/raw/` (override using `ORTHEON_DATA_ROOT`).

Manual sources print publisher instructions rather than silently guessing download URLs. A file existing locally is **not** proof it has valid schema, full integrity, independent samples, or redistribution rights.
