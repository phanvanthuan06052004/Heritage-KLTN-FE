/* eslint-disable no-unused-vars */
import { apiSlice } from "./apiSlice";

export const chatSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Heritage LLM Wiki query through NestJS BE
    queryRAG: builder.mutation({
      query: ({ question, heritageId, topK, collectionName, language }) => {
        const body = {
          question,
          topK: topK || 5,
          collectionName: collectionName || "heritage_documents",
          // Ngôn ngữ câu trả lời theo cờ hiện tại; fallback localStorage 'lang'
          language: language || localStorage.getItem("lang") || "vi",
        };

        // Only include heritageId if it's provided
        if (heritageId) {
          body.heritageId = heritageId;
        }

        return {
          url: "/rag/query",
          method: "POST",
          body,
        };
      },
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),

    getApiResponse: builder.mutation({
      query: ({ question, sessionId, model }) => ({
        url: "/rag/query",
        method: "POST",
        body: { question, sessionId, model },
      }),
      invalidatesTags: (result, error, { sessionId }) =>
        sessionId ? [{ type: "Chat", id: sessionId }] : [],
    }),

    getChatHistory: builder.query({
      query: () => "/rag/wiki?limit=20",
      transformResponse: (response) =>
        Array.isArray(response?.data) ? response.data : [],
      providesTags: (result, error, sessionId) =>
        sessionId
          ? [
              { type: "Chat", id: sessionId },
              { type: "Chat", id: "LIST" },
            ]
          : [{ type: "Chat", id: "LIST" }],
    }),

    uploadDocument: builder.mutation({
      query: (payload = {}) => {
        const selectedFile = payload?.file || payload;
        const title = payload?.title;
        const knowledgeType = payload?.knowledgeType;
        const formData = new FormData();
        if (selectedFile?.name) {
          formData.append("file", selectedFile, selectedFile.name);
        }
        if (title) formData.append("title", title);
        if (knowledgeType) formData.append("knowledgeType", knowledgeType);
        return {
          url: "/rag/import",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (result, error) => [
        { type: "Chat", id: "LIST" },
        { type: "KnowledgeBase", id: "LIST" },
      ],
    }),

    uploadWebsite: builder.mutation({
      query: (payload) => ({
        url: "/rag/import",
        method: "POST",
        body: (() => {
          const formData = new FormData();
          if (payload?.url) formData.append("url", payload.url);
          if (payload?.title) formData.append("title", payload.title);
          if (payload?.knowledgeType) {
            formData.append("knowledgeType", payload.knowledgeType);
          }
          return formData;
        })(),
      }),
      invalidatesTags: (result, error) => [
        { type: "Chat", id: "LIST" },
        { type: "KnowledgeBase", id: "LIST" },
      ],
    }),

    uploadJson: builder.mutation({
      query: (data) => ({
        url: "/rag/import",
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) => [{ type: "Chat", id: "LIST" }],
    }),

    getKnowledgeProgress: builder.query({
      query: (sourceId) => `/rag/sources/${sourceId}/progress`,
      providesTags: (result, error, sourceId) => [
        { type: "KnowledgeBase", id: sourceId },
      ],
    }),

    searchKnowledgeBase: builder.query({
      query: ({ q, limit = 10, pageType } = {}) => {
        const params = new URLSearchParams();
        if (q) params.append("q", q);
        params.append("limit", limit.toString());
        if (pageType) params.append("pageType", pageType);
        return `/rag/search?${params.toString()}`;
      },
      providesTags: [{ type: "KnowledgeBase", id: "SEARCH" }],
    }),

    getWikiPages: builder.query({
      query: ({ limit = 50, offset = 0, pageType } = {}) => {
        const params = new URLSearchParams();
        params.append("limit", limit.toString());
        params.append("offset", offset.toString());
        if (pageType) params.append("pageType", pageType);
        return `/rag/wiki?${params.toString()}`;
      },
      providesTags: [{ type: "KnowledgeBase", id: "LIST" }],
    }),

    getWikiPage: builder.query({
      query: (slug) => `/rag/wiki/${encodeURIComponent(slug)}`,
      providesTags: (result, error, slug) => [
        { type: "KnowledgeBase", id: slug },
      ],
    }),
  }),
});

export const {
  useQueryRAGMutation,
  useGetApiResponseMutation,
  useGetChatHistoryQuery,
  useUploadDocumentMutation,
  useUploadWebsiteMutation,
  useUploadJsonMutation,
  useGetKnowledgeProgressQuery,
  useLazyGetKnowledgeProgressQuery,
  useSearchKnowledgeBaseQuery,
  useLazySearchKnowledgeBaseQuery,
  useGetWikiPagesQuery,
  useGetWikiPageQuery,
} = chatSlice;
