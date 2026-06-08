import { useRef, useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import { getTypeMeta } from "./mockData";

/**
 * Graph3D — chế độ "vũ trụ lịch sử" 3D (xoay được).
 * Node là cầu phát sáng theo loại, hover hiện tên, hạt chạy dọc cạnh.
 * Lazy-load để không nặng bundle khi không dùng.
 */
export default function Graph3D({ data, width, height, activeId, onSelectNode }) {
  const fgRef = useRef(null);

  useEffect(() => {
    const fg = fgRef.current;
    if (fg) {
      fg.d3Force("charge")?.strength(-120);
      // tự xoay nhẹ lúc đầu
      const t = setTimeout(() => fg.zoomToFit?.(800, 60), 400);
      return () => clearTimeout(t);
    }
  }, [data]);

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={data}
      width={width}
      height={height}
      backgroundColor="rgba(0,0,0,0)"
      showNavInfo={false}
      nodeColor={(n) => getTypeMeta(n.type).color}
      nodeOpacity={0.95}
      nodeResolution={18}
      nodeRelSize={5}
      nodeLabel={(n) => `<div style="background:rgba(7,17,24,0.9);color:#E7DCC4;border:1px solid rgba(216,162,74,0.4);padding:3px 8px;border-radius:8px;font:600 12px Inter">${n.name}</div>`}
      linkColor={() => "rgba(216,162,74,0.35)"}
      linkOpacity={0.5}
      linkWidth={0.6}
      linkDirectionalParticles={2}
      linkDirectionalParticleColor={() => "#F2C66D"}
      linkDirectionalParticleWidth={1.6}
      nodeThreeObjectExtend={true}
      nodeThreeObject={(n) => {
        // chỉ gắn nhãn cho node là nhân vật/triều đại/di tích lớn để đỡ rối
        if (!["dynasty", "capital", "heritage"].includes(n.type) && n.id !== activeId) return null;
        const s = new SpriteText(n.name);
        s.color = "#E7DCC4";
        s.textHeight = 3.2;
        s.fontFace = "Inter, sans-serif";
        s.position.y = -7;
        return s;
      }}
      onNodeClick={(n) => onSelectNode?.(n.id)}
    />
  );
}
