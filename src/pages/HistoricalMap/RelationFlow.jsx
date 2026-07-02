import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { getTypeMeta } from "./mockData";
import { TypeIcon } from "./typeIcons";

/**
 * RelationFlow — ego-network của node đang chọn, vẽ bằng React Flow.
 * Hub ở giữa, hàng xóm toả vòng (gom theo loại). Node-card có icon + tên,
 * cạnh cong có nhãn quan hệ + mũi tên chiều. Click node để điều hướng.
 */

// Node-card tuỳ biến
function EntityNode({ data }) {
  const meta = getTypeMeta(data.type);
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 shadow-lg backdrop-blur transition-transform ${
        data.isHub ? "scale-100" : "hover:scale-105"
      }`}
      style={{
        background: data.isHub ? `${meta.color}26` : "rgba(7,17,24,0.85)",
        borderColor: `${meta.color}${data.isHub ? "" : "66"}`,
        borderWidth: data.isHub ? 2 : 1,
        maxWidth: 150,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
        style={{ background: `${meta.color}26`, color: meta.color, border: `1px solid ${meta.color}55` }}
      >
        <TypeIcon type={data.type} className="h-3 w-3" />
      </span>
      <span
        className={`truncate text-[11px] font-medium leading-tight ${data.isHub ? "text-museum-ivory" : "text-museum-parchment"}`}
        title={data.label}
      >
        {data.label}
      </span>
    </div>
  );
}

const nodeTypes = { entity: EntityNode };

export default function RelationFlow({ location, onSelectNode }) {
  const { nodes, edges } = useMemo(() => {
    if (!location) return { nodes: [], edges: [] };
    const neighbors = location.neighbors || [];
    const n = neighbors.length;

    // gom theo loại để cùng loại nằm gần nhau trên vòng
    const sorted = [...neighbors].sort((a, b) => a.node.type.localeCompare(b.node.type));
    const R = 150 + Math.max(0, n - 6) * 12;

    const hub = {
      id: `hub-${location.id}`,
      type: "entity",
      position: { x: 0, y: 0 },
      data: { label: location.name, type: location.type, isHub: true },
      draggable: false,
    };

    const ns = [hub];
    const es = [];
    sorted.forEach((nb, i) => {
      const angle = (i / Math.max(1, n)) * 2 * Math.PI - Math.PI / 2;
      const x = Math.cos(angle) * R;
      const y = Math.sin(angle) * R * 0.82;
      const nid = `${nb.node.id}-${i}`;
      ns.push({
        id: nid,
        type: "entity",
        position: { x, y },
        data: { label: nb.node.name, type: nb.node.type, realId: nb.node.id },
      });
      const out = nb.direction === "out";
      es.push({
        id: `e-${i}`,
        source: out ? hub.id : nid,
        target: out ? nid : hub.id,
        label: nb.relation,
        type: "default",
        animated: true,
        style: { stroke: "rgba(216,162,74,0.55)", strokeWidth: 1.3 },
        labelStyle: { fill: "#A99D8A", fontSize: 8, fontFamily: "monospace" },
        labelBgStyle: { fill: "rgba(7,17,24,0.85)" },
        labelBgPadding: [3, 2],
        labelBgBorderRadius: 4,
        markerEnd: { type: MarkerType.ArrowClosed, color: "rgba(216,162,74,0.7)", width: 14, height: 14 },
      });
    });
    return { nodes: ns, edges: es };
  }, [location]);

  const onNodeClick = useCallback(
    (_e, node) => {
      const realId = node?.data?.realId;
      if (realId) onSelectNode?.(realId);
    },
    [onSelectNode],
  );

  if (!location) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-museum-muted">
        <span className="text-4xl opacity-60">🧭</span>
        <p className="text-sm">Chọn một nút để xem mạng lưới quan hệ.</p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[340px] w-full">
      <ReactFlow
        key={location.id}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        preventScrolling={false}
      >
        <Background color="rgba(216,162,74,0.12)" gap={22} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
      <style>{`
        .react-flow__controls { box-shadow: none; border-radius: 10px; overflow: hidden; }
        .react-flow__controls-button {
          background: rgba(7,17,24,0.85); border-bottom: 1px solid rgba(216,162,74,0.18);
        }
        .react-flow__controls-button svg { fill: #D8A24A; }
        .react-flow__controls-button:hover { background: rgba(216,162,74,0.18); }
        .react-flow__edge-text { font-family: monospace; }
        .react-flow__attribution { display: none; }
      `}</style>
    </div>
  );
}
