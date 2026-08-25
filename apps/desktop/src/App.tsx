import { useMemo, useState } from "react";
import { Activity, Box, BrainCircuit, ChevronDown, CircleDot, Database, Eye, FileCode2, FileText, Layers3, Play, RotateCcw, Search, Settings2, SlidersHorizontal, Sparkles, Waypoints } from "lucide-react";
import { entities, relations } from "./mock";
import type { Entity, LayerKey } from "./types";

const layerLabels: Record<LayerKey, string> = { geometry: "Geometry", ocr: "OCR", dimensions: "Dimensions", gdt: "GD&T", datums: "Datums", relations: "Relations", confidence: "Confidence" };

function confidenceLabel(value: number) {
  if (value >= 0.95) return "high";
  if (value >= 0.8) return "review";
  return "low";
}

function App() {
  const [selectedId, setSelectedId] = useState("D14");
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({ geometry: true, ocr: false, dimensions: true, gdt: true, datums: true, relations: true, confidence: false });
  const selected = useMemo(() => entities.find((entity) => entity.id === selectedId) ?? entities[0], [selectedId]);
  const selectedRelations = relations.filter((relation) => relation.source === selected.id || relation.target === selected.id);

  const toggleLayer = (key: LayerKey) => setLayers((current) => ({ ...current, [key]: !current[key] }));

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Waypoints size={18}/></div><div><strong>Ortheon</strong><span>Engineering Inspector</span></div></div>
      <div className="document-pill"><FileText size={15}/><span>shaft_bracket_A.pdf</span><span className="muted">Sheet 1 / 1</span></div>
      <div className="top-actions"><button className="ghost"><RotateCcw size={15}/>Reset view</button><button className="primary"><Play size={15} fill="currentColor"/>Parse drawing</button></div>
    </header>

    <aside className="rail">
      <button className="rail-item active" title="Inspector"><Eye size={19}/></button>
      <button className="rail-item" title="Datasets"><Database size={19}/></button>
      <button className="rail-item" title="Models"><BrainCircuit size={19}/></button>
      <button className="rail-item" title="EIR"><FileCode2 size={19}/></button>
      <div className="rail-spacer"/>
      <button className="rail-item" title="Settings"><Settings2 size={19}/></button>
    </aside>

    <aside className="sidebar">
      <section><div className="section-label">Workspace</div><div className="search"><Search size={14}/><span>Search drawing entities</span><kbd>⌘K</kbd></div></section>
      <section><div className="section-heading"><span>Drawing tree</span><span className="count">8</span></div><div className="tree">
        <div className="tree-row root"><ChevronDown size={14}/><FileText size={14}/><span>shaft_bracket_A.pdf</span></div>
        <div className="tree-row depth-1"><ChevronDown size={14}/><Box size={14}/><span>Front View</span></div>
        {entities.map((entity) => <button key={entity.id} className={`tree-row depth-2 ${selectedId === entity.id ? "selected" : ""}`} onClick={() => setSelectedId(entity.id)}><CircleDot size={12}/><span>{entity.id}</span><small>{entity.label}</small></button>)}
      </div></section>
      <section className="layers"><div className="section-heading"><span>Overlay layers</span><SlidersHorizontal size={14}/></div>{(Object.keys(layerLabels) as LayerKey[]).map((key) => <label className="layer-row" key={key}><input type="checkbox" checked={layers[key]} onChange={() => toggleLayer(key)}/><span>{layerLabels[key]}</span><span className={`dot ${key}`}/></label>)}</section>
      <section className="models"><div className="section-heading"><span>Model status</span><Activity size={14}/></div><ModelStatus name="OCR" state="Not installed"/><ModelStatus name="Detector" state="Not installed"/><ModelStatus name="VLM reviewer" state="Not installed"/></section>
    </aside>

    <main className="workspace">
      <div className="canvas-toolbar"><div><button className="tool active">Select</button><button className="tool">Pan</button><button className="tool">Measure</button></div><div className="zoom">86% <ChevronDown size={13}/></div></div>
      <DrawingCanvas selectedId={selectedId} onSelect={setSelectedId} layers={layers}/>
      <section className="graph-panel"><div className="panel-title"><span><Waypoints size={14}/>EIR relation graph</span><button className="ghost compact">Open graph</button></div><div className="graph-flow"><GraphNode title="D14" subtitle="Ø20 H7" active={selectedId === "D14"}/><div className="edge"><span>applies_to</span><i>97%</i></div><GraphNode title="H03" subtitle="Through hole" active={selectedId === "H03"}/><div className="edge"><span>controlled_by</span><i>94%</i></div><GraphNode title="G02" subtitle="Position 0.05" active={selectedId === "G02"}/></div></section>
    </main>

    <aside className="inspector"><div className="inspector-head"><div><span className={`kind ${selected.kind}`}>{selected.kind}</span><h2>{selected.id}</h2><p>{selected.label}</p></div><span className={`confidence ${confidenceLabel(selected.confidence)}`}>{Math.round(selected.confidence*100)}%</span></div>
      <Property label="Value" value={selected.value ?? "—"}/><Property label="Entity type" value={selected.kind.toUpperCase()}/><Property label="Target" value={selected.target ?? "—"}/><Property label="Evidence" value="source region + parser"/>
      <div className="subhead">Relations</div>{selectedRelations.length ? selectedRelations.map((relation) => <div className="relation-card" key={relation.id}><div><Waypoints size={14}/><strong>{relation.source} → {relation.target}</strong></div><span>{Math.round(relation.confidence*100)}%</span></div>) : <div className="empty">No direct relations</div>}
      <div className="subhead">Human correction</div><div className="correction-box"><Sparkles size={16}/><p>Corrections are recorded as human-verified provenance for future Ortheon-Parse supervision.</p><button>Correct relation</button></div>
      <div className="subhead">Raw EIR preview</div><pre>{`@${selected.kind} ${selected.id}\nlabel="${selected.label}"\nconfidence=${selected.confidence.toFixed(3)}${selected.target ? `\ntarget=${selected.target}` : ""}`}</pre>
    </aside>
  </div>;
}

function ModelStatus({name,state}:{name:string;state:string}) { return <div className="model-row"><span>{name}</span><span className="status-dot"/><small>{state}</small></div>; }
function Property({label,value}:{label:string;value:string}) { return <div className="property"><span>{label}</span><strong>{value}</strong></div>; }
function GraphNode({title,subtitle,active}:{title:string;subtitle:string;active?:boolean}) { return <div className={`graph-node ${active ? "active" : ""}`}><strong>{title}</strong><span>{subtitle}</span></div>; }

function DrawingCanvas({selectedId,onSelect,layers}:{selectedId:string;onSelect:(id:string)=>void;layers:Record<LayerKey,boolean>}) {
  return <div className="canvas-wrap"><div className="paper">
    <svg viewBox="0 0 1000 680" aria-label="Mock engineering drawing">
      <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#15191f"/></marker></defs>
      <rect x="85" y="130" width="650" height="370" fill="none" stroke="#191d23" strokeWidth="3"/>
      <rect x="190" y="215" width="440" height="200" rx="6" fill="none" stroke="#191d23" strokeWidth="3"/>
      <circle cx="465" cy="315" r="55" fill="none" stroke="#191d23" strokeWidth="3"/>
      <line x1="465" y1="230" x2="465" y2="400" stroke="#717782" strokeWidth="1.5" strokeDasharray="12 8"/>
      <line x1="380" y1="315" x2="550" y2="315" stroke="#717782" strokeWidth="1.5" strokeDasharray="12 8"/>
      <line x1="410" y1="205" x2="520" y2="205" stroke="#191d23" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)"/>
      <line x1="410" y1="205" x2="410" y2="255" stroke="#191d23"/><line x1="520" y1="205" x2="520" y2="255" stroke="#191d23"/>
      <text x="438" y="188" fontFamily="ui-monospace, monospace" fontSize="22" fill="#15191f">Ø20 H7</text>
      <line x1="618" y1="515" x2="535" y2="365" stroke="#191d23" strokeWidth="2" markerEnd="url(#arrow)"/>
      <rect x="620" y="500" width="255" height="42" fill="white" stroke="#191d23" strokeWidth="2"/>
      <text x="633" y="527" fontFamily="ui-monospace, monospace" fontSize="18" fill="#15191f">⌖ ⌀0.05 | A | B | C</text>
      <rect x="102" y="480" width="44" height="44" fill="white" stroke="#191d23" strokeWidth="2"/><text x="116" y="510" fontFamily="ui-monospace, monospace" fontSize="24">A</text>
      <rect x="645" y="570" width="280" height="75" fill="none" stroke="#191d23" strokeWidth="2"/><line x1="645" y1="600" x2="925" y2="600" stroke="#191d23"/><text x="660" y="592" fontFamily="ui-monospace, monospace" fontSize="14">SHAFT BRACKET A</text><text x="660" y="626" fontFamily="ui-monospace, monospace" fontSize="12">SCALE 1:2     MATERIAL: AISI 304</text>

      {layers.dimensions && <rect className={`overlay dimension ${selectedId === "D14" ? "selected" : ""}`} x="420" y="158" width="130" height="48" rx="5" onClick={() => onSelect("D14")}/>} 
      {layers.geometry && <circle className={`overlay feature ${selectedId === "H03" ? "selected" : ""}`} cx="465" cy="315" r="68" onClick={() => onSelect("H03")}/>} 
      {layers.gdt && <rect className={`overlay gdt ${selectedId === "G02" ? "selected" : ""}`} x="610" y="488" width="278" height="66" rx="5" onClick={() => onSelect("G02")}/>} 
      {layers.datums && <rect className={`overlay datum ${selectedId === "A" ? "selected" : ""}`} x="92" y="470" width="64" height="64" rx="5" onClick={() => onSelect("A")}/>} 
      {layers.relations && <g className="relation-overlay"><path d="M485 207 C520 235, 515 255, 490 270"/><text x="535" y="245">applies_to · 97%</text><path d="M620 510 C590 465, 550 415, 505 370"/><text x="595" y="432">controls · 94%</text></g>}
      {layers.confidence && <><text className="confidence-tag" x="510" y="295">H03 99%</text><text className="confidence-tag" x="430" y="145">D14 98%</text></>}
    </svg>
  </div></div>;
}

export default App;
