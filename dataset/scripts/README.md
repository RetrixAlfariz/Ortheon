# Dataset Tooling

Download, conversion, and validation tooling will be implemented in v1.1.x.

Planned structure:

```text
scripts/
├── download/
├── convert/
└── validate/
```

All acquisition tools should be resumable where practical, record the source/version they acquired, and avoid silently modifying upstream data.
