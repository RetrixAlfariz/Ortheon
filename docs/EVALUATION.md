# Ortheon Evaluation Philosophy

Ortheon should not be evaluated as OCR alone. A drawing can have excellent character recognition while still reconstructing the wrong engineering meaning.

The evaluation stack therefore follows the parsing hierarchy.

## P1 - Visual primitives

Candidate metrics:

- precision / recall / F1 for primitive detection,
- geometric deviation for lines/arcs/circles,
- endpoint/intersection accuracy,
- orientation error.

## P2 - Recognized tokens

Candidate metrics:

- character error rate (CER),
- word/token error rate,
- exact match for engineering symbols and numeric values,
- confidence calibration.

Engineering-critical substitutions (for example `0.05` -> `0.08`) should be reported separately from ordinary text errors.

## P3 - Engineering entities

Candidate metrics:

- entity precision / recall / F1,
- structured field exact match,
- value/unit parsing accuracy,
- entity type confusion matrix.

## P4 - Relations

Candidate metrics:

- relation precision / recall / F1,
- target-association accuracy,
- graph edge accuracy,
- graph edit distance where useful,
- ambiguity/calibration quality.

Relation evaluation is a primary Ortheon research target because a correctly read dimension attached to the wrong feature is an engineering failure.

## P5 - Engineering constraints

Candidate metrics:

- complete-constraint exact match,
- numeric value accuracy,
- unit accuracy,
- tolerance/modifier accuracy,
- controlled-feature accuracy.

## P6 - Standards interpretation

Candidate metrics:

- rule-selection accuracy,
- interpretation accuracy,
- validation precision/recall,
- version/edition provenance correctness.

The standards engine should be tested deterministically against curated fixtures rather than evaluated only through language-model answers.

## P7 - Engineering reasoning

Candidate metrics:

- task accuracy,
- grounded-answer rate,
- unsupported-claim/hallucination rate,
- tool-routing accuracy,
- traceability to EIR evidence,
- uncertainty behavior.

## Engineering Constraint Recovery (ECR)

Ortheon's eventual headline metric should measure recovery of **engineering meaning**, not merely text.

Initial conceptual definition:

```text
ECR = correctly recovered ground-truth engineering constraints
      -------------------------------------------------------
               total ground-truth constraints
```

The exact scoring policy is intentionally deferred. Later versions should decide how partial credit, relation errors, numeric errors, and standards modifiers are weighted.

## Required benchmark comparisons

Later model milestones should compare at least:

1. generic OCR / parser baseline,
2. specialist modular Ortheon pipeline,
3. unified Ortheon-One model,
4. direct generic VLM where appropriate.

For downstream reasoning experiments, compare:

1. raw image -> generic VLM,
2. raw image -> engineering VLM,
3. Ortheon EIR -> general language model,
4. Ortheon EIR -> engineering-specialized model.

This separation lets the research test whether better representation reduces model-size requirements and improves reasoning reliability.
