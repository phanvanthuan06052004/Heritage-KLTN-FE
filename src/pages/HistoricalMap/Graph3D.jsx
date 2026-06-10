import { useRef, useEffect, useMemo, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import { getTypeMeta } from "./mockData";

const idOf = (x) => (typeof x === "object" ? x.id : x);

/**
 * Graph3D — chế độ "vũ trụ lịch sử" 3D (xoay được).
 * Node là cầu phát sáng theo loại, hover hiện tên, hạt chạy dọc cạnh.
 * Khi chọn/hover 1 node: làm nổi bật node đó + hàng xóm + cạnh nối, làm mờ phần còn lại.
 */
export default function Graph3D({ data, width, height, activeId, onSelectNode }) {
  const fgRef = useRef(null);
  const [hoverId, setHoverId] = useState(null);
  const focusId = hoverId || activeId;

  // adjacency để biết node nào liên quan focus
  const adjacency = useMemo(() => {
    const adj = new Map();
    (data?.links ?? []).forEach((l) => {
      const s = idOf(l.source);
      const t = idOf(l.target);
      if (!adj.has(s)) adj.set(s, new Set());
      if (!adj.has(t)) adj.set(t, new Set());
      adj.get(s).add(t);
      adj.get(t).add(s);
    });
    return adj;
  }, [data]);

  const isRelatedNode = (id) =>
    id === focusId || !!adjacency.get(focusId)?.has(id);
  const isFocusLink = (l) => {
    const s = idOf(l.source);
    const t = idOf(l.target);
    return s === focusId || t === focusId;
  };

  useEffect(() => {
    const fg = fgRef.current;
    if (fg) {
      fg.d3Force("charge")?.strength(-120);
      const t = setTimeout(() => fg.zoomToFit?.(800, 60), 400);
      return () => clearTimeout(t);
    }
  }, [data]);

  // Lia camera tới node khi activeId đổi (do search hoặc chọn từ panel)
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || !activeId) return;
    const node = data?.nodes?.find((n) => n.id === activeId);
    if (!node || node.x == null) return;
    const dist = 90;
    const hyp = Math.hypot(node.x, node.y, node.z || 0) || 1;
    const ratio = 1 + dist / hyp;
    fg.cameraPosition(
      { x: node.x * ratio, y: node.y * ratio, z: (node.z || 0) * ratio },
      { x: node.x, y: node.y, z: node.z || 0 },
      900,
    );
  }, [activeId, data]);

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={data}
      width={width}
      height={height}
      backgroundColor="rgba(0,0,0,0)"
      showNavInfo={false}
      nodeColor={(n) => {
        if (!focusId) return getTypeMeta(n.type).color;
        return isRelatedNode(n.id) ? getTypeMeta(n.type).color : "#3a3a42";
      }}
      nodeOpacity={0.95}
      nodeResolution={18}
      nodeRelSize={5}
      nodeVal={(n) => (focusId && n.id === focusId ? 2.4 : 1)}
      nodeLabel={(n) => `<div style="background:rgba(7,17,24,0.9);color:#E7DCC4;border:1px solid rgba(216,162,74,0.4);padding:3px 8px;border-radius:8px;font:600 12px Inter">${n.name}</div>`}
      linkColor={(l) => {
        if (!focusId) return "rgba(216,162,74,0.35)";
        return isFocusLink(l) ? "rgba(242,198,109,0.9)" : "rgba(216,162,74,0.05)";
      }}
      linkOpacity={0.55}
      linkWidth={(l) => (focusId && isFocusLink(l) ? 1.8 : 0.6)}
      linkDirectionalParticles={(l) => {
        if (!focusId) return 2;
        return isFocusLink(l) ? 4 : 0;
      }}
      linkDirectionalParticleColor={() => "#F2C66D"}
      linkDirectionalParticleWidth={1.8}
      nodeThreeObjectExtend={true}
      nodeThreeObject={(n) => {
        // Hiện nhãn cho: node lớn (triều đại/kinh đô/di tích), node đang focus,
        // và các node liên quan khi đang có focus.
        const big = ["dynasty", "capital", "heritage"].includes(n.type);
        const show = focusId ? isRelatedNode(n.id) : big;
        if (!show && n.id !== focusId) return null;
        const s = new SpriteText(n.name);
        s.color = focusId && !isRelatedNode(n.id) ? "#6b6b73" : "#E7DCC4";
        s.textHeight = n.id === focusId ? 4 : 3.2;
        s.fontFace = "Inter, sans-serif";
        s.position.y = -7;
        return s;
      }}
      onNodeHover={(n) => setHoverId(n?.id ?? null)}
      onNodeClick={(n) => onSelectNode?.(n.id)}
    />
  );
}
