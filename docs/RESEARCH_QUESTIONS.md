# Ortheon Research Questions

The v1 research program is organized around the following questions.

## RQ1 - Perception

How accurately can textual and geometric primitives be recovered from heterogeneous raster and vector mechanical engineering drawings?

## RQ2 - Relation reconstruction

How reliably can engineering annotations be associated with the geometric features they constrain?

This includes dimension-to-feature, leader-to-feature, datum-to-surface, GD&T-to-feature, and cross-view relationships.

## RQ3 - Structured representation

What Engineering Intermediate Representation best preserves geometry, semantics, relationships, uncertainty, provenance, and standards references for downstream machine reasoning?

## RQ4 - Standards-aware interpretation

Does separating deterministic, versioned standards interpretation from learned perception improve reliability and maintainability compared with asking a single generative model to memorize drafting rules?

## RQ5 - Unified model

Can a unified Ortheon-One model jointly recover textual, geometric, relational, and semantic engineering information while matching or exceeding a specialist modular pipeline?

## RQ6 - Model-size reduction through representation

Does providing structured EIR/EDL input reduce the language-model capacity required for useful engineering drawing interaction?

Planned comparison:

```text
raw drawing -> generic VLM
raw drawing -> engineering VLM
Ortheon EIR -> sub-billion Engineering MicroLM
Ortheon EIR -> 2B+ reasoning model
```

## RQ7 - Engineering reasoning

Does explicit engineering structure improve reasoning accuracy, traceability, uncertainty behavior, and hallucination rate relative to direct visual reasoning?
