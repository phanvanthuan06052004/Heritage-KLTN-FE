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
  }),
  overrideExisting: false,
});

export const { useCheckInMutation, useGetProgressQuery, useGetPassportQuery } =
  gamificationApi;
