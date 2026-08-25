# Ortheon v1 Architecture

Ortheon is developed as a parsing-first engineering intelligence component. Its primary responsibility is to convert technical drawings into a structured, traceable representation that other systems can reason over safely.

## v1 scope

Primary domain:

- 2D mechanical engineering / manufacturing drawings.

Initial source types:

- raster images,
- scanned PDF pages,
- born-digital/vector PDF,
- future DXF/SVG adapters.

Explicitly deferred from the initial v1 scope:

- electrical schematics,
- P&IDs,
- architectural floor plans,
- handwriting-heavy drawings,
- unrestricted photographs of drawings,
- complete 3D CAD reconstruction,
- broad engineering-language-model training.

## Layered architecture

```text
Source
  |
  v
P0 Source normalization
  |
  +-- raster path
  `-- vector-native path
  |
  v
P1 Visual primitives
  |
  v
P2 Recognized tokens
  |
  v
P3 Engineering entities
  |
  v
P4 Relations
  |
  v
P5 Engineering constraints
  |
  +---------------------> EIR
  |                        |
  v                        +--> EDL serialization
P6 Standards interpretation|
  |                        +--> validation / solvers
  v                        `--> language-model interface
P7 Engineering reasoning
```

## Core rule: preserve information before predicting it

If a source already contains machine-readable geometry or text, Ortheon should preserve that information rather than rasterize and rediscover it through ML.

Examples:

- vector PDF text -> native text extraction before OCR fallback,
- DXF line -> exact vector primitive instead of Hough-line detection,
- CAD identifier -> preserved provenance link where available.

## Model boundary

The v1 architecture intentionally separates:

- **perception** - what visual/textual objects are present,
- **parsing** - what engineering entities those observations encode,
- **relations** - what applies to what,
- **standards** - how formal drawing rules interpret constraints,
- **reasoning** - what conclusions follow from the structured engineering information.

The long-term unified `Ortheon-One` model may collapse several perception/parsing stages into one checkpoint, but EIR and the standards/tool interfaces remain explicit system boundaries.

## Current non-goal

The current foundation milestone does not optimize a model or claim engineering-drawing understanding performance. It establishes reproducible contracts so later accuracy claims have a stable meaning.
