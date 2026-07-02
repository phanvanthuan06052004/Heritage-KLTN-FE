import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Network, MapPin, ShieldCheck, Map as MapIcon, Share2, MessageCircle, Landmark, ChevronRight } from "lucide-react";
import MuseumSectionHeader from "~/components/common/MuseumSectionHeader";
import VietnamHistoryMap from "./VietnamHistoryMap";
import RelationFlow from "./RelationFlow";
import GraphExplorer from "./GraphExplorer";
import TimeSlider from "./TimeSlider";
import TimelineStrip from "./TimelineStrip";
import PersonaChat from "./PersonaChat";
import { NODE_TYPE_META, getTypeMeta } from "./mockData";
import { TypeIcon } from "./typeIcons";
import {
  FALLBACK_MAP_LOCATIONS,
  FALLBACK_OVERVIEW,
  FALLBACK_TIMELINE,
  FALLBACK_FULL_GRAPH,
} from "./graphFallback";
import {
  useGetMapLocationsQuery,
  useGetGraphOverviewQuery,
  useGetGraphTimelineQuery,
  useGetFullGraphQuery,
} from "~/store/apis/graphApi";
import { hasRoutes, ROUTE_STYLE } from "./campaignRoutes";

const YEAR_MIN = 1225;
const YEAR_MAX = 1300;

// Một địa điểm "phủ" cửa sổ năm nếu khoảng tồn tại của nó giao với [from,to].
const overlaps = (loc, from, to) => {
  const s = loc.yearStart ?? loc.yearEnd;
  const e = loc.yearEnd ?? loc.yearStart;
  if (s == null) return true;
  return e >= from && s <= to;
};

// Xây neighbors cho một node bất kỳ trong đồ thị đầy đủ (dùng ở chế độ Đồ thị).
function buildNeighborsFromGraph(id, graph) {
  const byId = new Map(graph.nodes.map((n) => [n.id, n]));
  const out = [];
  for (const l of graph.links) {
    const s = typeof l.source === "object" ? l.source.id : l.source;
    const t = typeof l.target === "object" ? l.target.id : l.target;
    if (s === id && byId.get(t)) {
      const m = byId.get(t);
      out.push({ relation: l.relation, direction: "out", node: { id: m.id, name: m.name, type: m.type } });
    } else if (t === id && byId.get(s)) {
      const m = byId.get(s);
      out.push({ relation: l.relation, direction: "in", node: { id: m.id, name: m.name, type: m.type } });
    }
  }
  return out;
}

/**
 * HistoricalMap — "Vietnam Historical Universe".
 * A1: bản đồ lịch sử động (slider thời gian + niên biểu).
 * A4: knowledge graph explorer (đồ thị lực, dữ liệu Neo4j qua BE).
 */
export default function HistoricalMap() {
  const [view, setView] = useState("map"); // 'map' | 'graph'
  const [range, setRange] = useState({ from: YEAR_MIN, to: YEAR_MAX });
  const [selectedId, setSelectedId] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [personaChat, setPersonaChat] = useState(null); // {id,name,summary} | null
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "vi";
  // Chọn tên/summary theo ngôn ngữ (fallback về tiếng Việt nếu thiếu bản EN)
  const pickName = (o) => (lang === "en" && o?.nameEn ? o.nameEn : o?.name);
  const pickSummary = (o) => (lang === "en" && o?.summaryEn ? o.summaryEn : o?.summary);

  // ── Dữ liệu (API → Postgres, fallback offline) ──
  const { data: locData } = useGetMapLocationsQuery({});
  const allLocationsRaw = locData?.items?.length ? locData.items : FALLBACK_MAP_LOCATIONS;

  const { data: ovData } = useGetGraphOverviewQuery();
  const overview = ovData?.length ? ovData : FALLBACK_OVERVIEW;

  const { data: tlData } = useGetGraphTimelineQuery();
  const timelineRaw = tlData?.length ? tlData : FALLBACK_TIMELINE;

  const { data: fgData } = useGetFullGraphQuery();
  const fullGraphRaw =
    fgData?.nodes?.length ? { nodes: fgData.nodes, links: fgData.links } : FALLBACK_FULL_GRAPH;

  // ── Bản địa hoá tên/summary theo cờ; downstream dùng các biến này ──
  const allLocations = useMemo(
    () =>
      allLocationsRaw.map((l) => ({
        ...l,
        name: pickName(l),
        summary: pickSummary(l),
        neighbors: (l.neighbors || []).map((nb) => ({
          ...nb,
          node: { ...nb.node, name: pickName(nb.node) },
        })),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allLocationsRaw, lang],
  );
  const timeline = useMemo(
    () => timelineRaw.map((e) => ({ ...e, name: pickName(e), summary: pickSummary(e) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [timelineRaw, lang],
  );
  const fullGraph = useMemo(
    () => ({
      nodes: fullGraphRaw.nodes.map((n) => ({ ...n, name: pickName(n), summary: pickSummary(n) })),
      links: fullGraphRaw.links,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fullGraphRaw, lang],
  );

  // ── Lọc theo cửa sổ thời gian (client-side cho mượt) ──
  const filtered = useMemo(
    () => allLocations.filter((l) => overlaps(l, range.from, range.to)),
    [allLocations, range.from, range.to],
  );

  // Chọn mặc định / khi danh sách đổi
  useEffect(() => {
    if (view !== "map") return;
    if (!selectedId || !allLocations.some((l) => l.id === selectedId)) {
      setSelectedId(filtered[0]?.id ?? allLocations[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLocations, view]);

  // ── "Tự chạy" dòng thời gian (reveal dần) ──
  const playRef = useRef(null);
  useEffect(() => {
    if (!playing) {
      if (playRef.current) clearInterval(playRef.current);
      return;
    }
    setRange({ from: YEAR_MIN, to: YEAR_MIN });
    let cur = YEAR_MIN;
    playRef.current = setInterval(() => {
      cur += 3;
      if (cur >= YEAR_MAX) {
        cur = YEAR_MAX;
        setRange({ from: YEAR_MIN, to: cur });
        setPlaying(false);
        clearInterval(playRef.current);
        return;
      }
      setRange({ from: YEAR_MIN, to: cur });
    }, 420);
    return () => clearInterval(playRef.current);
  }, [playing]);

  // ── Node đang chọn (map: là location; graph: node bất kỳ + neighbors dựng từ đồ thị) ──
  const selected = useMemo(() => {
    if (!selectedId) return null;
    // Ưu tiên dữ liệu map-location (đầy đủ neighbors); nếu không có (vd nhân vật,
    // kẻ địch...) thì dựng từ đồ thị đầy đủ để điều hướng được mọi node.
    const loc = allLocations.find((l) => l.id === selectedId);
    if (loc) return loc;
    const n = fullGraph.nodes.find((x) => x.id === selectedId);
    if (!n) return null;
    return { ...n, neighbors: buildNeighborsFromGraph(selectedId, fullGraph) };
  }, [selectedId, allLocations, fullGraph]);

  const meta = selected ? getTypeMeta(selected.type) : null;
  const legendTypes = ["battle", "person", "heritage", "capital", "enemy"];

  return (
    <section className="museum-shell min-h-screen overflow-hidden pt-navbar-mobile sm:pt-navbar">
      <div className="lcn-container relative !max-w-[1720px]">
        <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/35 to-transparent" />

        <MuseumSectionHeader
          eyebrow={t("map.eyebrow")}
          title={t("map.title")}
          description={t("map.description")}
          align="center"
        />

        {/* Dải thống kê tổng quan */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {overview.map((s) => (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-2xl border border-museum-gold/20 bg-museum-black/55 px-4 py-3.5 transition-colors hover:border-museum-gold/45"
            >
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-museum-gold/60 to-transparent opacity-60 transition-opacity group-hover:opacity-100" />
              <span className="block font-display text-2xl font-bold text-museum-gold-light">
                {s.value}
              </span>
              <span className="text-[11px] font-medium tracking-wide text-museum-muted">
                {t(`map.stats.${s.key}`, s.label)}
              </span>
            </div>
          ))}
        </div>

        {/* Toggle chế độ + slider thời gian */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-stretch">
          <div className="flex shrink-0 items-center gap-1 self-start rounded-2xl border border-museum-gold/20 bg-museum-black/55 p-1">
            <button
              type="button"
              onClick={() => setView("map")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                view === "map"
                  ? "bg-museum-gold/15 text-museum-gold-light"
                  : "text-museum-muted hover:text-museum-parchment"
              }`}
            >
              <MapIcon className="h-4 w-4" /> {t("map.tabMap")}
            </button>
            <button
              type="button"
              onClick={() => setView("graph")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                view === "graph"
                  ? "bg-museum-gold/15 text-museum-gold-light"
                  : "text-museum-muted hover:text-museum-parchment"
              }`}
            >
              <Share2 className="h-4 w-4" /> {t("map.tabGraph")}
            </button>
          </div>

          {view === "map" && (
            <div className="flex-1">
              <TimeSlider
                min={YEAR_MIN}
                max={YEAR_MAX}
                from={range.from}
                to={range.to}
                onChange={setRange}
                playing={playing}
                onTogglePlay={() => setPlaying((p) => !p)}
              />
            </div>
          )}
        </div>

        {/* Bản đồ/Đồ thị + Panel chi tiết */}
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="museum-card relative h-[78vh] min-h-[600px] flex-1 overflow-hidden rounded-[2rem] bg-museum-black/55 p-2.5 shadow-museum-card">
            <div className="relative h-full overflow-hidden rounded-[1.6rem] ring-1 ring-museum-gold/15">
              {view === "map" ? (
                <>
                  <VietnamHistoryMap
                    locations={filtered}
                    activeId={selectedId}
                    onSelect={setSelectedId}
                    range={range}
                  />
                  <div className="absolute bottom-4 left-4 z-10 flex max-w-[70%] flex-col gap-1.5 rounded-xl border border-[#8a6d3f]/40 bg-[#f3e6c6]/90 px-3.5 py-2 backdrop-blur">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {legendTypes.map((lt) => {
                        const m = NODE_TYPE_META[lt];
                        return (
                          <span key={lt} className="flex items-center gap-1.5 text-[11px] font-medium text-[#4a3a1f]">
                            <span className="h-2.5 w-2.5 rounded-full border border-[#5e4a2e]/50" style={{ background: m.color }} />
                            {t(`map.nodeType.${lt}`, m.label)}
                          </span>
                        );
                      })}
                    </div>
                    {hasRoutes(range.from, range.to) && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-[#8a6d3f]/30 pt-1.5">
                        {Object.entries(ROUTE_STYLE).map(([k, s]) => (
                          <span key={k} className="flex items-center gap-1.5 text-[11px] font-medium text-[#4a3a1f]">
                            <span className="h-0.5 w-4 rounded" style={{ background: s.color }} />
                            {s.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border border-[#8a6d3f]/45 bg-[#f3e6c6]/90 px-3 py-1.5 text-[10px] font-semibold text-[#5e4a2e] backdrop-blur">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t("map.sovereigntyBadge")}
                  </div>
                </>
              ) : (
                <GraphExplorer
                  data={fullGraph}
                  activeId={selectedId}
                  onSelectNode={setSelectedId}
                />
              )}
            </div>
          </div>

          {/* Panel chi tiết + cây quan hệ */}
          <aside className="museum-card flex w-full flex-col overflow-hidden rounded-[2rem] bg-museum-black/60 shadow-museum-card lg:w-[372px]">
            {selected ? (
              <>
                <div className="relative border-b border-museum-gold/12 bg-gradient-to-b from-museum-gold/10 to-transparent p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}55` }}
                    >
                      <TypeIcon type={selected.type} className="h-3 w-3" /> {t(`map.nodeType.${selected.type}`, meta.label)}
                    </span>
                    <span className="rounded-full border border-museum-gold/20 bg-museum-black/40 px-2.5 py-1 text-[10px] font-mono text-museum-muted">
                      {t("map.relationsCount", { count: selected.neighbors?.length ?? 0 })}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-bold leading-tight text-museum-ivory">
                    {selected.name}
                  </h3>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-museum-muted">
                    {selected.year && <span className="text-museum-gold-light/80">{selected.year}</span>}
                    {selected.province && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {selected.province}
                      </span>
                    )}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-museum-parchment">
                    {selected.summary}
                  </p>

                  {(selected.type === "person" || selected.type === "enemy") && (
                    <button
                      type="button"
                      onClick={() =>
                        setPersonaChat({
                          id: selected.id,
                          name: selected.name,
                          summary: selected.summary,
                        })
                      }
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-museum-gold/35 bg-museum-gold/12 px-4 py-2.5 text-sm font-medium text-museum-gold-light transition-colors hover:bg-museum-gold/20"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t("map.chatWith", { name: selected.name })}
                    </button>
                  )}

                  {selected.heritageSlug && (
                    <Link
                      to={`/heritage/${selected.heritageSlug}`}
                      className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-museum-gold px-4 py-2.5 text-sm font-semibold text-museum-black transition-colors hover:bg-museum-gold-light"
                    >
                      <Landmark className="h-4 w-4" />
                      {t("map.viewHeritage")}
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2 px-5 pt-4 text-museum-gold-light">
                  <Network className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    {t("map.relationNetwork")}
                  </span>
                  <span className="ml-auto h-px flex-1 bg-gradient-to-r from-museum-gold/30 to-transparent" />
                </div>

                <div className="flex-1 overflow-hidden">
                  <RelationFlow location={selected} onSelectNode={setSelectedId} />
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-museum-muted">
                <span className="text-4xl opacity-60">🧭</span>
                <p className="text-sm">
                  {view === "graph" ? t("map.emptyGraph") : t("map.emptyMap")}
                </p>
              </div>
            )}
          </aside>
        </div>

        {/* Niên biểu (A1) — chỉ ở chế độ bản đồ */}
        {view === "map" && (
          <TimelineStrip
            events={timeline}
            from={range.from}
            to={range.to}
            activeId={selectedId}
            onSelect={setSelectedId}
          />
        )}

        {/* Chọn nhanh địa điểm (chế độ bản đồ) */}
        {view === "map" && (
          <div className="mt-6 flex flex-wrap gap-2">
            {filtered.map((loc) => {
              const m = getTypeMeta(loc.type);
              const active = loc.id === selectedId;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setSelectedId(loc.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-museum-gold/60 bg-museum-gold/15 text-museum-gold-light"
                      : "border-museum-gold/20 bg-museum-black/40 text-museum-parchment hover:border-museum-gold/40 hover:bg-museum-gold/10"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                  {loc.name}
                </button>
              );
            })}
          </div>
        )}

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-[11px] text-museum-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-museum-gold/70" />
          {t("map.footerNote")}
        </p>
      </div>

      {personaChat && (
        <PersonaChat persona={personaChat} onClose={() => setPersonaChat(null)} />
      )}
    </section>
  );
}
