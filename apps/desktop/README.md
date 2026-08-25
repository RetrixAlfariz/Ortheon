# Ortheon Desktop UI

Research workstation shell for Ortheon. This UI is intentionally useful before any model weights are installed: it visualizes mock EIR entities, relation confidence, overlay layers, model availability, and the planned human-correction workflow.

## Current scope

- drawing workspace with zoom-style canvas shell,
- selectable engineering entities,
- geometry / dimension / GD&T / datum / relation overlays,
- synchronized drawing tree and property inspector,
- compact EIR relation graph,
- model status showing all inference models as not installed,
- human correction placeholder for future Ortheon-Parse annotation capture.

The sample drawing is synthetic UI fixture data. It is not a parser result.

## Run as web frontend

```bash
cd apps/desktop
npm install
npm run dev
```

## Run as Tauri desktop application

Install the current Tauri prerequisites for your OS first, then:

```bash
cd apps/desktop
npm install
npm run tauri dev
```

No OCR/VLM/detector weights are downloaded by this UI.
