/* eslint-disable no-unused-vars */
import { apiSlice } from "./apiSlice";

/**
 * graphApi — "Vietnam Historical Universe" (knowledge graph lịch sử).
 * Gọi các endpoint /graph/* của BE (NestJS → Neo4j, có fallback dataset).
 * BE bọc payload trong { data: ... } nên transformResponse bóc lớp `data`.
 */
export const graphApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Điểm trên bản đồ + ego-graph, lọc theo khoảng năm (slider thời gian — A1)
    getMapLocations: builder.query({
      query: ({ from, to } = {}) => {
        const params = new URLSearchParams();
        if (from != null) params.set("from", from);
        if (to != null) params.set("to", to);
        const qs = params.toString();
        return `/graph/map-locations${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (res) => res?.data ?? { items: [], source: "unknown" },
    }),

    // Thống kê tổng quan
    getGraphOverview: builder.query({
      query: () => `/graph/overview-stats`,
      transformResponse: (res) => res?.data ?? [],
    }),

    // Dòng thời gian (A1)
    getGraphTimeline: builder.query({
      query: () => `/graph/timeline`,
      transformResponse: (res) => res?.data ?? [],
    }),

    // Toàn bộ đồ thị {nodes, links} cho explorer (A4)
    getFullGraph: builder.query({
      query: () => `/graph/full`,
      transformResponse: (res) =>
        res?.data ?? { nodes: [], links: [], source: "unknown" },
    }),

    // Ego-graph 1 hop của một node
    getNodeNeighbors: builder.query({
      query: (id) => `/graph/node/${id}/neighbors`,
      transformResponse: (res) => res?.data ?? null,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMapLocationsQuery,
  useGetGraphOverviewQuery,
  useGetGraphTimelineQuery,
  useGetFullGraphQuery,
  useGetNodeNeighborsQuery,
} = graphApi;
