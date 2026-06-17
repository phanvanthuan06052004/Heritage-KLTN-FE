import { apiSlice } from "./apiSlice";

/**
 * graphAdminApi — CRUD quản trị Bản đồ Lịch sử (admin).
 * BE: /admin/graph/{nodes,edges} (AdminGuard). Ghi Postgres + sync Neo4j.
 * BE bọc payload trong { data }, nên transformResponse bóc lớp `data`.
 */
const unwrap = (res) => res?.data ?? res;

export const graphAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminGraphNodes: builder.query({
      query: () => `/admin/graph/nodes`,
      transformResponse: (res) => unwrap(res) ?? [],
      providesTags: [{ type: "GraphNodes", id: "LIST" }],
    }),
    getAdminGraphEdges: builder.query({
      query: () => `/admin/graph/edges`,
      transformResponse: (res) => unwrap(res) ?? [],
      providesTags: [{ type: "GraphEdges", id: "LIST" }],
    }),

    createGraphNode: builder.mutation({
      query: (body) => ({ url: `/admin/graph/nodes`, method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: "GraphNodes", id: "LIST" }],
    }),
    updateGraphNode: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/graph/nodes/${id}`, method: "PUT", body }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: "GraphNodes", id: "LIST" }],
    }),
    deleteGraphNode: builder.mutation({
      query: (id) => ({ url: `/admin/graph/nodes/${id}`, method: "DELETE" }),
      transformResponse: unwrap,
      // xoá node có thể xoá kèm cạnh -> làm mới cả 2
      invalidatesTags: [{ type: "GraphNodes", id: "LIST" }, { type: "GraphEdges", id: "LIST" }],
    }),

    createGraphEdge: builder.mutation({
      query: (body) => ({ url: `/admin/graph/edges`, method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: "GraphEdges", id: "LIST" }],
    }),
    deleteGraphEdge: builder.mutation({
      query: (id) => ({ url: `/admin/graph/edges/${id}`, method: "DELETE" }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: "GraphEdges", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAdminGraphNodesQuery,
  useGetAdminGraphEdgesQuery,
  useCreateGraphNodeMutation,
  useUpdateGraphNodeMutation,
  useDeleteGraphNodeMutation,
  useCreateGraphEdgeMutation,
  useDeleteGraphEdgeMutation,
} = graphAdminApi;
