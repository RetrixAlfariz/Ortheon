import type { Entity, RelationCandidate } from "./types";

export const entities: Entity[] = [
  { id: "H03", kind: "feature", label: "Through hole", value: "Ø20", confidence: 0.994, bbox: { x: 48, y: 42, w: 11, h: 16 } },
  { id: "D14", kind: "dimension", label: "Diameter dimension", value: "Ø20 H7", confidence: 0.982, target: "H03", bbox: { x: 40, y: 24, w: 26, h: 9 } },
  { id: "G02", kind: "gdt", label: "Position tolerance", value: "⌖ ⌀0.05 | A | B | C", confidence: 0.947, target: "H03", bbox: { x: 68, y: 52, w: 25, h: 8 } },
  { id: "A", kind: "datum", label: "Datum A", value: "Primary datum", confidence: 0.991, target: "S02", bbox: { x: 18, y: 61, w: 8, h: 10 } },
];

export const relations: RelationCandidate[] = [
  { id: "R17", source: "D14", target: "H03", confidence: 0.97 },
  { id: "R18", source: "G02", target: "H03", confidence: 0.94 },
];
