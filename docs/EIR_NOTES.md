# Engineering Intermediate Representation (EIR) - Initial Notes

> Status: exploratory contract for v1.0.x. The schema is intentionally **not frozen** until v1.2.x.

EIR is Ortheon's canonical machine representation of engineering information recovered from technical drawings. It should preserve not only recognized values, but also geometry, relationships, evidence, provenance, and uncertainty.

## Design goals

EIR should be:

- **traceable** - every parsed fact can point back to source evidence,
- **typed** - geometry, annotation, feature, relation, and constraint types are explicit,
- **uncertainty-aware** - confidence and alternatives are representable,
- **standards-neutral at the core** - standards interpretations attach as versioned semantic layers,
- **serializable** - JSON is the initial canonical exchange form,
- **LLM-friendly through EDL** - EDL may provide a compact textual serialization without replacing EIR,
- **extensible** - v1 focuses on mechanical drawings, while later domains can add specialized entity types.

## Proposed top-level concepts

```text
Document
|- Sheet
|- View
|- Primitive
|- Token
|- Entity
|- Relation
|- Constraint
|- StandardInterpretation
|- Evidence
`- Provenance
```

## Identity

Every addressable object should have a stable identifier within a parse result, for example:

```text
sheet:S1
view:V1
primitive:P42
token:T19
entity:H1
relation:R7
constraint:C3
```

## Evidence and provenance

A parsed engineering fact should be able to retain:

- source file/document ID,
- page/sheet ID,
- pixel or vector coordinates,
- upstream dataset/sample ID when applicable,
- extraction method/model/version,
- confidence,
- alternative hypotheses,
- transformation history.

## Example (illustrative only)

```json
{
  "entity": {
    "id": "H1",
    "type": "hole"
  },
  "constraint": {
    "id": "C1",
    "type": "diameter",
    "nominal": 20.0,
    "unit": "mm",
    "applies_to": "H1",
    "confidence": 0.98,
    "evidence": ["T12", "P33", "P34"]
  }
}
```

## Relation philosophy

Relationships are first-class data rather than inferred repeatedly downstream.

Examples:

```text
DIMENSION --applies_to--> FEATURE
LEADER --points_to--> FEATURE
DATUM --assigned_to--> SURFACE
GD&T --controls--> FEATURE
VIEW --corresponds_to--> VIEW
FEATURE --projected_as--> PRIMITIVE
```

## EDL relationship

EIR is the canonical structured representation. **Engineering Drawing Language (EDL)** is a compact textual serialization for model training and language-model interaction.

Conceptually:

```text
Drawing -> Ortheon -> EIR -> EDL -> language model
                      |
                      +-> standards engine / solver / validator
```

EDL must be deterministically convertible to/from the supported EIR subset; it should not become a second source of truth.

## Open design questions for v1.2.x

- How should normalized vs source coordinates coexist?
- Should primitive geometry use a common tagged-union schema?
- How should multi-view correspondences reference 3D latent feature identity?
- Should constraints be entities or a separate typed collection?
- How should competing relation hypotheses be represented?
- How granular should standards rule provenance be?
- How should EIR preserve born-digital PDF/DXF object identifiers?

These questions are deliberately deferred until dataset manifests and Ortheon-Parse schemas exist.
