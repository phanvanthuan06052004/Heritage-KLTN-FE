/* eslint-disable no-unused-vars */
import { apiSlice } from "./apiSlice";

/**
 * gamificationApi (B1+B2) — điểm danh, XP/streak và Hộ chiếu di sản.
 * BE bọc payload trong { data: ... } nên transformResponse bóc lớp `data`.
 */
export const gamificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkIn: builder.mutation({
      query: (body) => ({ url: `/gamification/check-in`, method: "POST", body }),
      transformResponse: (res) => res?.data ?? null,
    }),
    getProgress: builder.query({
      query: (userId) => `/gamification/progress/${userId}`,
      transformResponse: (res) => res?.data ?? null,
    }),
    getPassport: builder.query({
      query: (userId) => `/gamification/passport/${userId}`,
      transformResponse: (res) => res?.data?.items ?? [],
    }),
    // Feed cộng đồng (lọc theo heritageId nếu có)
    getCommunity: builder.query({
      query: ({ heritageId, limit } = {}) => {
        const p = new URLSearchParams();
        if (heritageId) p.set("heritageId", heritageId);
        if (limit) p.set("limit", limit);
        const qs = p.toString();
        return `/gamification/community${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (res) => res?.data?.items ?? [],
    }),
    // Danh sách heritageId user đã ghé (cho badge)
    getVisited: builder.query({
      query: (userId) => `/gamification/visited/${userId}`,
      transformResponse: (res) => res?.data?.heritageIds ?? [],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCheckInMutation,
  useGetProgressQuery,
  useGetPassportQuery,
  useGetCommunityQuery,
  useGetVisitedQuery,
} = gamificationApi;
