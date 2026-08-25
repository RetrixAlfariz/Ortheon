import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Database,
  Download,
  Eye,
  FileCode2,
  FileText,
  History,
  Layers3,
  Moon,
  MoreHorizontal,
  Play,
  Search,
  Settings2,
  Sun,
  Waypoints,
  X,
} from "lucide-react";
import { entities, relations } from "./mock";
import type { LayerKey } from "./types";

const layerLabels: Record<LayerKey, string> = {
  geometry: "Geometry",
  ocr: "OCR tokens",
  dimensions: "Dimensions",
  gdt: "GD&T",
  datums: "Datums",
  relations: "Relations",
  confidence: "Confidence",
};

const issues = [
  { level: "warning", title: "Unresolved feature reference", detail: "Datum A points to S02, which is not present in this fixture." },
  { level: "info", title: "Model pipeline unavailable", detail: "UI is running from synthetic EIR data. No OCR or detector weights are installed." },
  { level: "warning", title: "Human verification recommended", detail: "G02 → H03 relation confidence is below the preferred 0.95 threshold." },
];

function App() {
  const [selectedId, setSelectedId] = useState("H03");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [inspectorTab, setInspectorTab] = useState<"properties" | "standards" | "provenance">("properties");
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    geometry: true,
    ocr: false,
    dimensions: true,
    gdt: true,
    datums: true,
    relations: true,
    confidence: false,
  });

  const selected = useMemo(
    () => entities.find((entity) => entity.id === selectedId) ?? entities[0],
    [selectedId],
  );
  const selectedRelations = relations.filter(
    (relation) => relation.source === selected.id || relation.target === selected.id,
  );

  const toggleLayer = (key: LayerKey) => {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="app-shell" data-theme={theme}>
      <header className="topbar">
        <div className="brand">
          <OrtheonMark />
          <div className="wordmark">Ortheon</div>
        </div>

        <div className="file-tab">
          <FileText size={14} />
          <strong>SHAFT-BRACKET-A.pdf</strong>
          <span className="file-state">fixture</span>
          <X size={13} />
        </div>

        <div className="global-search">
          <Search size={15} />
          <span>Search entities, dimensions, notes…</span>
          <kbd>Ctrl K</kbd>
        </div>

        <div className="top-actions">
          <button className="action outline"><Play size={15} />Parse drawing</button>
          <button className="action outline"><Check size={15} />Validate</button>
          <button className="action primary"><Download size={15} />Export EIR<ChevronDown size={13} /></button>
          <button className="icon-button" title="History"><History size={17} /></button>
          <button className="icon-button" title="Notifications"><Bell size={17} /></button>
          <button
            className="icon-button"
            title="Toggle theme"
            onClick={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button className="icon-button" title="Settings"><Settings2 size={17} /></button>
        </div>
      </header>

      <aside className="sidebar">
        <section className="project-head">
          <div><span className="eyebrow">Project</span><strong>Motor Mount Bracket</strong></div>
          <MoreHorizontal size={17} />
        </section>

        <section className="navigator">
          <NavRow icon={<FileText size={14} />} label="Drawing" expanded />
          <button className="nav-file active"><span className="tree-line" /><FileCode2 size={14} /><span>SHAFT-BRACKET-A.pdf</span><MoreHorizontal size={14} /></button>
          <NavRow icon={<Waypoints size={14} />} label="Entities" count="152" expanded />
          <NavRow depth={1} icon={<Box size={14} />} label="Geometry" count="46" />
          <NavRow depth={1} icon={<CircleDot size={14} />} label="Dimensions" count="38" />
          <NavRow depth={1} icon={<FileCode2 size={14} />} label="GD&T" count="22" />
          <NavRow depth={1} icon={<Box size={14} />} label="Datums" count="6" />
          <NavRow depth={1} icon={<Waypoints size={14} />} label="Relations" count="24" />
        </section>

        <section className="sidebar-section">
          <div className="section-title"><span>Layers</span><Layers3 size={14} /></div>
          {(Object.keys(layerLabels) as LayerKey[]).map((key) => (
            <label className={`layer-row ${layers[key] ? "enabled" : ""}`} key={key}>
              <input type="checkbox" checked={layers[key]} onChange={() => toggleLayer(key)} />
              <Eye size={14} />
              <span className={`layer-swatch ${key}`} />
              <span>{layerLabels[key]}</span>
              <small>{key === "geometry" ? "46" : key === "dimensions" ? "38" : key === "gdt" ? "22" : ""}</small>
            </label>
          ))}
        </section>

        <section className="sidebar-section entity-list-section">
          <div className="section-title"><span>Detected fixture entities</span><span>{entities.length}</span></div>
          <div className="entity-list">
            {entities.map((entity) => (
              <button
                key={entity.id}
                className={selectedId === entity.id ? "entity-row active" : "entity-row"}
                onClick={() => setSelectedId(entity.id)}
              >
                <span className={`entity-kind-dot ${entity.kind}`} />
                <span><strong>{entity.id}</strong><small>{entity.label}</small></span>
                <em>{Math.round(entity.confidence * 100)}%</em>
              </button>
            ))}
          </div>
        </section>

        <div className="sidebar-footer">
          <Database size={14} />
          <span>Dataset stage</span>
          <strong>v1.1.0</strong>
        </div>
      </aside>

      <main className="workspace">
        <div className="canvas-toolbar">
          <div className="tool-group">
            <button className="tool active">Select</button>
            <button className="tool">Pan</button>
            <button className="tool">Measure</button>
          </div>
          <div className="canvas-meta">
            <span>Sheet 1 / 1</span>
            <span>Scale 1:2</span>
            <button>86% <ChevronDown size={12} /></button>
          </div>
        </div>

        <DrawingCanvas selectedId={selectedId} onSelect={setSelectedId} layers={layers} />

        <div className="analysis-dock">
          <section className="dock-panel graph-panel">
            <div className="dock-heading"><span>EIR graph</span><MoreHorizontal size={15} /></div>
            <div className="graph-layout">
              <div className="datum-column">
                <GraphNode title="A" subtitle="Datum plane" compact />
                <GraphNode title="B" subtitle="Datum plane" compact />
                <GraphNode title="C" subtitle="Datum plane" compact />
              </div>
              <div className="graph-edge-line horizontal" />
              <GraphNode title="H03" subtitle="Ø20 through hole" active={selectedId === "H03"} onClick={() => setSelectedId("H03")} />
              <div className="graph-stack">
                <GraphNode title="D14" subtitle="Ø20 H7" active={selectedId === "D14"} onClick={() => setSelectedId("D14")} />
                <GraphNode title="G02" subtitle="⌖ ⌀0.05 | A B C" active={selectedId === "G02"} onClick={() => setSelectedId("G02")} />
              </div>
            </div>
            <div className="graph-legend"><span><i className="solid" />Resolved relation</span><span><i className="dashed" />Candidate / provenance</span></div>
          </section>

          <section className="dock-panel issues-panel">
            <div className="dock-heading"><span>Issues & validation</span><span className="issue-count">3</span></div>
            <div className="issue-tabs"><button className="active">All</button><button>Warnings <b>2</b></button><button>Info <b>1</b></button></div>
            <div className="issues-list">
              {issues.map((issue) => (
                <button className="issue-row" key={issue.title}>
                  <span className={`issue-icon ${issue.level}`}>{issue.level === "warning" ? <AlertTriangle size={14} /> : <CircleDot size={14} />}</span>
                  <span><strong>{issue.title}</strong><small>{issue.detail}</small></span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      <aside className="inspector">
        <div className="inspector-title"><span>Inspector</span><X size={16} /></div>
        <div className="entity-summary">
          <div className={`summary-glyph ${selected.kind}`}><CircleDot size={28} /></div>
          <div><span className="entity-type">{selected.kind}</span><h2>{selected.label}</h2><p>ID: {selected.id}</p></div>
        </div>

        <div className="inspector-tabs">
          {(["properties", "standards", "provenance"] as const).map((tab) => (
            <button key={tab} className={inspectorTab === tab ? "active" : ""} onClick={() => setInspectorTab(tab)}>{tab}</button>
          ))}
        </div>

        {inspectorTab === "properties" && (
          <>
            <div className="properties-grid">
              <Property label="Type" value={selected.kind.toUpperCase()} />
              <Property label="Value" value={selected.value ?? "—"} mono />
              <Property label="Target" value={selected.target ?? "—"} mono />
              <Property label="Confidence" value={`${Math.round(selected.confidence * 100)}%`} accent />
              <Property label="Status" value={selected.confidence >= 0.95 ? "Resolved" : "Review"} accent={selected.confidence >= 0.95} />
            </div>

            <InspectorSection title="Evidence">
              <EvidenceRow label="Source" value="Synthetic fixture / sheet 1" />
              <EvidenceRow label="Region" value={`${selected.bbox.x}, ${selected.bbox.y}, ${selected.bbox.w}, ${selected.bbox.h}`} />
              <EvidenceRow label="Parser" value="UI fixture adapter" />
            </InspectorSection>

            <InspectorSection title={`Relation candidates (${selectedRelations.length})`}>
              {selectedRelations.length ? selectedRelations.map((relation, index) => (
                <button className="candidate-row" key={relation.id}>
                  <span className="candidate-symbol"><Waypoints size={16} /></span>
                  <span><strong>{relation.source} → {relation.target}</strong><small>Confidence {relation.confidence.toFixed(2)}</small></span>
                  <em>{index === 0 ? "Primary" : "Candidate"}</em>
                  <ChevronRight size={14} />
                </button>
              )) : <div className="empty-state">No direct relation candidates for this entity.</div>}
            </InspectorSection>
          </>
        )}

        {inspectorTab === "standards" && (
          <div className="empty-state large">Standards interpretation stays deterministic and versioned. It will appear here once the v1.5 standards engine is connected.</div>
        )}

        {inspectorTab === "provenance" && (
          <pre className="eir-preview">{`@${selected.kind} ${selected.id}\nlabel="${selected.label}"\nconfidence=${selected.confidence.toFixed(3)}${selected.target ? `\ntarget=${selected.target}` : ""}\nsource=fixture:sheet-1`}</pre>
        )}

        <InspectorSection title="Model status">
          <ModelStatus name="OCR" role="Text recognition" />
          <ModelStatus name="Detector" role="Geometry / annotation detection" />
          <ModelStatus name="VLM reviewer" role="Semantic fallback" />
          <div className="overall-confidence"><span>Runtime model stack</span><strong>Not installed</strong></div>
        </InspectorSection>

        <div className="correction-card">
          <div><Waypoints size={16} /><span><strong>Human correction</strong><small>Future edits become human-verified Ortheon-Parse provenance.</small></span></div>
          <button>Correct selected entity</button>
        </div>
      </aside>

      <footer className="statusbar">
        <div><span>Units: MMGS (mm)</span><span>Sheet: 1 / 1</span><span>Scale: 1 : 2</span></div>
        <div><span className="status-led" />Prototype fixture active</div>
      </footer>
    </div>
  );
}

function OrtheonMark() {
  return (
    <svg className="ortheon-mark" viewBox="0 0 100 100" aria-label="Ortheon logo" role="img">
      <polygon className="mark-frame" points="15,17 52,3 53,16 26,26 22,64 9,70" />
      <polygon className="mark-frame" points="60,6 93,33 91,79 53,94 55,81 79,72 82,40 59,23" />
      <polygon className="mark-frame" points="11,74 24,67 47,83 47,97" />
      <polygon className="mark-core" points="50,43 59,52 50,61 41,52" />
    </svg>
  );
}

function NavRow({ icon, label, count, depth = 0, expanded = false }: { icon: ReactNode; label: string; count?: string; depth?: number; expanded?: boolean }) {
  return <button className="nav-row" style={{ paddingLeft: `${12 + depth * 19}px` }}>{expanded ? <ChevronDown size={13} /> : <span className="nav-spacer" />}{icon}<span>{label}</span>{count && <em>{count}</em>}</button>;
}

function Property({ label, value, mono = false, accent = false }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return <div className="property"><span>{label}</span><strong className={`${mono ? "mono" : ""} ${accent ? "accent" : ""}`}>{value}</strong></div>;
}

function EvidenceRow({ label, value }: { label: string; value: string }) {
  return <div className="evidence-row"><span>{label}</span><strong>{value}</strong></div>;
}

function InspectorSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="inspector-section"><div className="inspector-section-title">{title}</div>{children}</section>;
}

function ModelStatus({ name, role }: { name: string; role: string }) {
  return <div className="model-row"><span className="model-glyph"><Box size={15} /></span><span><strong>{name}</strong><small>{role}</small></span><em>Not installed</em></div>;
}

function GraphNode({ title, subtitle, active = false, compact = false, onClick }: { title: string; subtitle: string; active?: boolean; compact?: boolean; onClick?: () => void }) {
  return <button className={`graph-node ${active ? "active" : ""} ${compact ? "compact" : ""}`} onClick={onClick}><strong>{title}</strong><span>{subtitle}</span></button>;
}

function DrawingCanvas({ selectedId, onSelect, layers }: { selectedId: string; onSelect: (id: string) => void; layers: Record<LayerKey, boolean> }) {
  return (
    <div className="canvas-wrap">
      <svg className="drawing-sheet" viewBox="0 0 1100 690" aria-label="Synthetic Ortheon engineering drawing fixture">
        <defs>
          <marker id="arrow-cyan" markerWidth="7" markerHeight="7" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" className="cyan-fill" /></marker>
          <marker id="arrow-base" markerWidth="7" markerHeight="7" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" className="drawing-fill" /></marker>
        </defs>

        <rect className="sheet-border" x="28" y="24" width="1044" height="620" />
        <path className="part-line" d="M210 183 L640 183 Q690 183 713 217 L815 237 Q840 242 840 275 L829 443 Q826 468 799 482 L685 534 Q661 545 625 545 L238 545 Q210 545 210 517 Z" />
        <circle className="part-line" cx="246" cy="216" r="18" />
        <circle className="part-line" cx="246" cy="512" r="18" />
        <circle className="part-line" cx="516" cy="216" r="18" />
        <circle className="part-line" cx="516" cy="512" r="18" />
        <circle className="part-line" cx="735" cy="365" r="48" />
        <circle className="center-detail" cx="735" cy="365" r="25" />
        <rect className="part-line" x="275" y="340" width="210" height="46" rx="23" />

        {layers.geometry && <>
          <line className="centerline" x1="660" y1="365" x2="810" y2="365" />
          <line className="centerline" x1="735" y1="294" x2="735" y2="438" />
          <line className="centerline" x1="516" y1="179" x2="516" y2="252" />
          <line className="centerline" x1="246" y1="179" x2="246" y2="252" />
        </>}

        {layers.dimensions && <>
          <DimensionLine x1={246} y1={135} x2={735} y2={135} label="120.00 ±0.10" />
          <DimensionLine x1={296} y1={174} x2={516} y2={174} label="60.00" />
          <DimensionLine x1={277} y1={589} x2={516} y2={589} label="65.00 ±0.10" />
          <DimensionLine x1={838} y1={286} x2={838} y2={445} label="100.00 ±0.10" vertical />
          <g className={selectedId === "D14" ? "annotation selected" : "annotation"} onClick={() => onSelect("D14")}>
            <line className="leader cyan" x1="820" y1="242" x2="769" y2="336" />
            <rect className="annotation-box" x="820" y="222" width="147" height="30" rx="3" />
            <text className="annotation-text" x="833" y="243">Ø 20 H7</text>
          </g>
        </>}

        {layers.datums && <g className={selectedId === "A" ? "annotation datum selected" : "annotation datum"} onClick={() => onSelect("A")}>
          <path className="datum-leader" d="M735 319 L735 125" />
          <polygon className="datum-tip" points="730,326 740,326 735,316" />
          <rect className="datum-box" x="720" y="95" width="30" height="30" rx="2" />
          <text className="datum-text" x="731" y="116">A</text>
        </g>}

        {layers.gdt && <g className={selectedId === "G02" ? "annotation gdt selected" : "annotation gdt"} onClick={() => onSelect("G02")}>
          <path className="leader" d="M167 170 L190 170 L218 198" />
          <rect className="gdt-box" x="70" y="152" width="126" height="30" />
          <line className="gdt-divider" x1="100" y1="152" x2="100" y2="182" />
          <line className="gdt-divider" x1="143" y1="152" x2="143" y2="182" />
          <text className="gdt-text" x="78" y="172">⌖</text>
          <text className="gdt-text" x="108" y="172">⌀0.05</text>
          <text className="gdt-text" x="153" y="172">A B C</text>
        </g>}

        <g className={selectedId === "H03" ? "feature-target selected" : "feature-target"} onClick={() => onSelect("H03")}>
          <circle cx="735" cy="365" r="59" />
          <circle className="feature-core" cx="735" cy="365" r="6" />
        </g>

        {layers.relations && <>
          <path className="relation-path" d="M858 253 C825 288 805 315 781 340" />
          <path className="relation-path candidate" d="M185 183 C320 238 505 292 682 346" />
        </>}

        {layers.confidence && <>
          <text className="confidence-text" x="785" y="376">H03 99%</text>
          <text className="confidence-text" x="845" y="215">D14 98%</text>
        </>}

        {layers.ocr && <>
          <rect className="ocr-region" x="824" y="217" width="151" height="42" rx="3" />
          <rect className="ocr-region" x="63" y="147" width="139" height="41" rx="3" />
        </>}

        <g className="drawing-notes">
          <text x="875" y="92">NOTES:</text>
          <text x="875" y="116">1. BREAK ALL SHARP EDGES 0.2–0.5</text>
          <text x="875" y="138">2. ALL DIMENSIONS IN MILLIMETERS</text>
        </g>

        <g className="title-block">
          <rect x="824" y="525" width="220" height="94" />
          <line x1="824" y1="558" x2="1044" y2="558" />
          <line x1="824" y1="586" x2="1044" y2="586" />
          <text className="title-brand" x="850" y="549">ORTHEON</text>
          <text x="842" y="578">MOTOR MOUNT BRACKET</text>
          <text x="842" y="607">SCALE 1:2   SHEET 1 OF 1</text>
        </g>
      </svg>
    </div>
  );
}

function DimensionLine({ x1, y1, x2, y2, label, vertical = false }: { x1: number; y1: number; x2: number; y2: number; label: string; vertical?: boolean }) {
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const width = Math.max(86, label.length * 8.2);
  return <g className="dimension-line"><line x1={x1} y1={y1} x2={x2} y2={y2} markerStart="url(#arrow-cyan)" markerEnd="url(#arrow-cyan)" />{vertical ? <><rect className="dimension-label-box" x={x1 + 13} y={midY - 14} width={width} height="28" rx="2" /><text className="dimension-label" x={x1 + 21} y={midY + 5}>{label}</text></> : <><rect className="dimension-label-box" x={midX - width / 2} y={y1 - 15} width={width} height="28" rx="2" /><text className="dimension-label" x={midX} y={y1 + 5} textAnchor="middle">{label}</text></>}</g>;
}

export default App;
