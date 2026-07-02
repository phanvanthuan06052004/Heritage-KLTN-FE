import { apiSlice } from "./apiSlice";

/**
 * tripApi — Hành trình khám phá di sản (tracking GPS).
 * BE bọc payload trong { data: ... }.
 */
export const tripApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTrip: builder.mutation({
      query: (body) => ({ url: `/trips`, method: "POST", body }),
      transformResponse: (res) => res?.data ?? null,
      invalidatesTags: ["Trips"],
    }),
    getUserTrips: builder.query({
      query: (userId) => `/trips/user/${userId}`,
      transformResponse: (res) => res?.data ?? [],
      providesTags: ["Trips"],
    }),
    getCommunityTrips: builder.query({
      query: (limit = 30) => `/trips/community?limit=${limit}`,
      transformResponse: (res) => res?.data ?? [],
      providesTags: ["Trips"],
    }),
    getTrip: builder.query({
      query: (id) => `/trips/${id}`,
      transformResponse: (res) => res?.data ?? null,
      providesTags: (r, e, id) => [{ type: "Trips", id }],
    }),
    setTripVisibility: builder.mutation({
      query: ({ id, userId, visibility }) => ({
        url: `/trips/${id}/visibility`,
        method: "PATCH",
        body: { userId, visibility },
      }),
      invalidatesTags: ["Trips"],
    }),
    deleteTrip: builder.mutation({
      query: ({ id, userId }) => ({
        url: `/trips/${id}?userId=${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Trips"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateTripMutation,
  useGetUserTripsQuery,
  useGetCommunityTripsQuery,
  useGetTripQuery,
  useSetTripVisibilityMutation,
  useDeleteTripMutation,
} = tripApi;
