/* eslint-disable no-unused-vars */
import { apiSlice } from "./apiSlice";

const API_BASE_URL = "http://localhost:8000";

export const chatSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // RAG Query - Naver CLOVA Studio RAG System
    queryRAG: builder.mutation({
      query: ({ question, heritageId, topK, collectionName }) => {
        const body = {
          question,
          topK: topK || 5,
          collectionName: collectionName || "heritage_documents",
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
        url: `${API_BASE_URL}/chat`,
        method: "POST",
        body: { question, session_id: sessionId, model },
      }),
      invalidatesTags: (result, error, { sessionId }) =>
        sessionId ? [{ type: "Chat", id: sessionId }] : [],
    }),

    getChatHistory: builder.query({
      query: (sessionId) => `${API_BASE_URL}/chat/history/${sessionId}`,
      transformResponse: (response) =>
        Array.isArray(response) ? response : [],
      providesTags: (result, error, sessionId) =>
        sessionId
          ? [
              { type: "Chat", id: sessionId },
              { type: "Chat", id: "LIST" },
            ]
          : [{ type: "Chat", id: "LIST" }],
    }),

    uploadDocument: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file, file.name);
        return {
          url: `${API_BASE_URL}/upload-file`,
          method: "POST",
          body: formData,
          headers: {}, // Remove Content-Type for FormData
        };
      },
      invalidatesTags: (result, error) => [{ type: "Chat", id: "LIST" }],
    }),

    uploadWebsite: builder.mutation({
      query: (payload) => ({
        url: `${API_BASE_URL}/upload-website`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error) => [{ type: "Chat", id: "LIST" }],
    }),

    uploadJson: builder.mutation({
      query: (data) => ({
        url: `${API_BASE_URL}/upload-landmark-info`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error) => [{ type: "Chat", id: "LIST" }],
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
} = chatSlice;
