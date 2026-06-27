import { apiSlice } from './apiSlice';

export const mcpTokenSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createMcpToken: builder.mutation({
      query: ({ name }) => ({
        url: '/mcp-tokens',
        method: 'POST',
        body: { name },
      }),
      invalidatesTags: [{ type: 'McpToken', id: 'LIST' }],
    }),

    listMcpTokens: builder.query({
      query: () => '/mcp-tokens',
      transformResponse: (response) => response?.data || [],
      providesTags: [{ type: 'McpToken', id: 'LIST' }],
    }),

    revokeMcpToken: builder.mutation({
      query: (id) => ({
        url: `/mcp-tokens/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'McpToken', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateMcpTokenMutation,
  useListMcpTokensQuery,
  useRevokeMcpTokenMutation,
} = mcpTokenSlice;
