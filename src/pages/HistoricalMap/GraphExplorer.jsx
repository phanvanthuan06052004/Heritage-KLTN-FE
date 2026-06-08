import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Search, ZoomIn, ZoomOut, Maximize2, Box, Square } from "lucide-react";
import { getTypeMeta, NODE_TYPE_META } from "./mockData";

const Graph3D = lazy(() => import("./Graph3D"));

/**
 * GraphExplorer — "Vũ trụ lịch sử Việt Nam".
 * 2D: force-graph có glow, node phân cấp theo degree, cạnh có mũi tên + hạt chạy,
 * legend lọc theo loại, ô tìm node, nút zoom, nền sao. Có toggle sang 3D.
 */
export default function GraphExplorer({ data, activeId, onSelectNode }) {
  const wrapRef = useRef(null);
  const fgRef = useRef(null);
  const [size, setSize] = useState({ w: 600, h: 460 });
  const [hoverId, setHoverId] = useState(null);
  const [mode, setMode] = useState("2d"); // '2d' | '3d'
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(() => new Set(Object.keys(NODE_TYPE_META)));

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: Math.max(320, r.width), h: Math.max(360, r.height) });
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Lọc theo loại đang bật
  const graph = useMemo(() => {
    const nodes = (data?.nodes ?? []).filter((n) => active.has(n.type)).map((n) => ({ ...n }));
    const ids = new Set(nodes.map((n) => n.id));
    const links = (data?.links ?? [])
      .filter((l) => {
        const s = typeof l.source === "object" ? l.source.id : l.source;
        const t = typeof l.target === "object" ? l.target.id : l.target;
        return ids.has(s) && ids.has(t);
      })
      .map((l) => ({ ...l }));
    return { nodes, links };
  }, [data, active]);

  // degree + adjacency
  const { degree, adjacency } = useMemo(() => {
    const deg = new Map();
    const adj = new Map();
    graph.links.forEach((l) => {
      const s = typeof l.source === "object" ? l.source.id : l.source;
      const t = typeof l.target === "object" ? l.target.id : l.target;
      deg.set(s, (deg.get(s) || 0) + 1);
      deg.set(t, (deg.get(t) || 0) + 1);
      if (!adj.has(s)) adj.set(s, new Set());
      if (!adj.has(t)) adj.set(t, new Set());
      adj.get(s).add(t);
      adj.get(t).add(s);
    });
    return { degree: deg, adjacency: adj };
  }, [graph]);

  const focusId = hoverId || activeId;
  const isDimmed = (id) => focusId && id !== focusId && !adjacency.get(focusId)?.has(id);
  const radiusOf = (id) => 3 + Math.min(9, (degree.get(id) || 1) * 0.8);

  useEffect(() => {
    const fg = fgRef.current;
    if (fg && mode === "2d") {
      fg.d3Force("charge")?.strength(-220);
      fg.d3Force("link")?.distance(72);
    }
  }, [graph, mode]);

  const toggleType = (t) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next.size ? next : prev; // không cho tắt hết
    });

  const runSearch = (e) => {
    e?.preventDefault?.();
    const q = query.trim().toLowerCase();
    if (!q || !fgRef.current) return;
    const node = graph.nodes.find((n) => n.name?.toLowerCase().includes(q));
    if (node && node.x != null) {
      fgRef.current.centerAt(node.x, node.y, 800);
      fgRef.current.zoom(3, 800);
      onSelectNode?.(node.id);
    }
  };

  const zoomBy = (f) => fgRef.current?.zoom((fgRef.current.zoom() || 1) * f, 300);
  const fit = () => fgRef.current?.zoomToFit(500, 50);

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden">
      {/* Nền vũ trụ */}
      <div className="vh-stars pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(216,162,74,0.10),transparent_60%)]" />

      {/* Legend lọc */}
      <div className="absolute left-3 top-3 z-10 flex max-w-[62%] flex-wrap gap-1.5 rounded-xl border border-museum-gold/20 bg-museum-black/82 px-2.5 py-2 backdrop-blur">
        {Object.entries(NODE_TYPE_META).map(([k, m]) => {
          const on = active.has(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() => toggleType(k)}
              className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] transition-opacity ${
                on ? "opacity-100" : "opacity-35"
              } text-museum-parchment hover:bg-museum-gold/10`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Controls: search + zoom + 2D/3D */}
      <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-museum-gold/25 bg-museum-black/82 p-1 backdrop-blur">
          <button
            type="button"
            onClick={() => setMode("2d")}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${mode === "2d" ? "bg-museum-gold/20 text-museum-gold-light" : "text-museum-muted"}`}
          >
            <Square className="h-3 w-3" /> 2D
          </button>
          <button
            type="button"
            onClick={() => setMode("3d")}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${mode === "3d" ? "bg-museum-gold/20 text-museum-gold-light" : "text-museum-muted"}`}
          >
            <Box className="h-3 w-3" /> 3D
          </button>
        </div>
        <form onSubmit={runSearch} className="flex items-center rounded-full border border-museum-gold/25 bg-museum-black/82 backdrop-blur">
          <Search className="ml-2.5 h-3.5 w-3.5 text-museum-gold-light/70" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm nhân vật, trận…"
            className="w-36 bg-transparent px-2 py-1.5 text-[11px] text-museum-ivory placeholder:text-museum-muted focus:outline-none"
          />
        </form>
        {mode === "2d" && (
          <div className="flex gap-1.5">
            <button type="button" onClick={() => zoomBy(1.4)} className="rounded-full border border-museum-gold/25 bg-museum-black/82 p-1.5 text-museum-gold-light backdrop-blur hover:bg-museum-gold/10" aria-label="Phóng to">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={() => zoomBy(0.7)} className="rounded-full border border-museum-gold/25 bg-museum-black/82 p-1.5 text-museum-gold-light backdrop-blur hover:bg-museum-gold/10" aria-label="Thu nhỏ">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button type="button" onClick={fit} className="rounded-full border border-museum-gold/25 bg-museum-black/82 p-1.5 text-museum-gold-light backdrop-blur hover:bg-museum-gold/10" aria-label="Vừa khung">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {mode === "3d" ? (
        <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-museum-muted">Đang dựng vũ trụ 3D…</div>}>
          <Graph3D data={graph} width={size.w} height={size.h} activeId={activeId} onSelectNode={onSelectNode} />
        </Suspense>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          graphData={graph}
          width={size.w}
          height={size.h}
          backgroundColor="rgba(0,0,0,0)"
          cooldownTicks={140}
          d3VelocityDecay={0.3}
          onEngineStop={() => fgRef.current?.zoomToFit(500, 55)}
          linkColor={(l) => {
            const s = typeof l.source === "object" ? l.source.id : l.source;
            const t = typeof l.target === "object" ? l.target.id : l.target;
            return focusId && (s === focusId || t === focusId) ? "rgba(242,198,109,0.7)" : "rgba(216,162,74,0.12)";
          }}
          linkWidth={(l) => {
            const s = typeof l.source === "object" ? l.source.id : l.source;
            const t = typeof l.target === "object" ? l.target.id : l.target;
            return focusId && (s === focusId || t === focusId) ? 2 : 0.5;
          }}
          linkDirectionalArrowLength={(l) => {
            const s = typeof l.source === "object" ? l.source.id : l.source;
            const t = typeof l.target === "object" ? l.target.id : l.target;
            return focusId && (s === focusId || t === focusId) ? 3.5 : 0;
          }}
          linkDirectionalArrowRelPos={1}
          linkDirectionalParticles={(l) => {
            const s = typeof l.source === "object" ? l.source.id : l.source;
            const t = typeof l.target === "object" ? l.target.id : l.target;
            return focusId && (s === focusId || t === focusId) ? 3 : 0;
          }}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleColor={() => "#F2C66D"}
          linkCanvasObjectMode={() => "after"}
          linkCanvasObject={(l, ctx, scale) => {
            const s = typeof l.source === "object" ? l.source : null;
            const t = typeof l.target === "object" ? l.target : null;
            if (!s || !t) return;
            const sid = s.id, tid = t.id;
            if (!(focusId && (sid === focusId || tid === focusId))) return;
            const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2;
            const fs = Math.max(8 / scale, 2.4);
            ctx.font = `600 ${fs}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(231,220,196,0.92)";
            ctx.fillText(l.relation || "", mx, my);
          }}
          onNodeClick={(n) => onSelectNode?.(n.id)}
          onNodeHover={(n) => setHoverId(n?.id ?? null)}
          nodeCanvasObject={(node, ctx, scale) => {
            const meta = getTypeMeta(node.type);
            const dim = isDimmed(node.id);
            const isFocus = node.id === focusId;
            const r = radiusOf(node.id) * (isFocus ? 1.25 : 1);

            ctx.globalAlpha = dim ? 0.12 : 1;
            ctx.shadowColor = meta.color;
            ctx.shadowBlur = dim ? 0 : isFocus ? 24 : 9;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
            ctx.fillStyle = meta.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            // điểm sáng nội (highlight)
            ctx.beginPath();
            ctx.arc(node.x - r * 0.3, node.y - r * 0.3, r * 0.35, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fill();
            if (isFocus) {
              ctx.lineWidth = 2 / scale;
              ctx.strokeStyle = "#F7EFE2";
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + 2.5 / scale, 0, 2 * Math.PI);
              ctx.stroke();
            }
            // nhãn: hub (degree cao) luôn hiện; còn lại khi zoom/focus
            const deg = degree.get(node.id) || 1;
            if (isFocus || deg >= 5 || scale > 1.5) {
              const label = node.name;
              const fs = Math.max(11 / scale, 2.6);
              ctx.font = `600 ${fs}px Inter, sans-serif`;
              const tw = ctx.measureText(label).width;
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              const ly = node.y + r + 2 / scale;
              // nền chip cho dễ đọc
              ctx.fillStyle = dim ? "rgba(7,17,24,0.3)" : "rgba(7,17,24,0.72)";
              const pad = 2 / scale;
              ctx.fillRect(node.x - tw / 2 - pad, ly - pad, tw + pad * 2, fs + pad * 2);
              ctx.fillStyle = dim ? "rgba(169,157,138,0.5)" : "#E7DCC4";
              ctx.fillText(label, node.x, ly);
            }
            ctx.globalAlpha = 1;
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radiusOf(node.id) + 4, 0, 2 * Math.PI);
            ctx.fill();
          }}
        />
      )}

      <style>{`
        .vh-stars {
          background-image:
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.35), transparent),
            radial-gradient(1px 1px at 40% 80%, rgba(242,198,109,0.4), transparent),
            radial-gradient(1.5px 1.5px at 85% 25%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 10% 70%, rgba(242,198,109,0.3), transparent);
          background-repeat: no-repeat;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
