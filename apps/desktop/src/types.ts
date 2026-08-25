export type LayerKey = "geometry" | "ocr" | "dimensions" | "gdt" | "datums" | "relations" | "confidence";

export type EntityKind = "feature" | "dimension" | "gdt" | "datum";

export interface Entity {
  id: string;
  kind: EntityKind;
  label: string;
  value?: string;
  confidence: number;
  target?: string;
  bbox: { x: number; y: number; w: number; h: number };
}

export interface RelationCandidate {
  id: string;
  source: string;
  target: string;
  confidence: number;
}
