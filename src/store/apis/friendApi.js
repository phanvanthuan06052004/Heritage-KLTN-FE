import { apiSlice } from './apiSlice'

// Chuẩn hoá: BE bọc { data } qua ResponseInterceptor
const unwrap = (res) => res?.data ?? res

export const friendApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Tìm user để kết bạn (kèm trạng thái quan hệ)
    searchUsersToAdd: builder.query({
      query: (q = '') => ({ url: `/friends/search`, method: 'GET', params: { q } }),
      transformResponse: unwrap,
      providesTags: ['Friends'],
    }),

    // Tổng quan: bạn bè + lời mời đến + lời mời đã gửi
    getFriendOverview: builder.query({
      query: () => ({ url: `/friends`, method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Friends'],
    }),

    // Danh sách bạn bè (đã chấp nhận)
    getFriends: builder.query({
      query: () => ({ url: `/friends/list`, method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Friends'],
    }),

    // Lời mời đến (chờ mình xử lý)
    getFriendRequests: builder.query({
      query: () => ({ url: `/friends/requests`, method: 'GET' }),
      transformResponse: unwrap,
      providesTags: ['Friends'],
    }),

    // Gửi lời mời kết bạn
    sendFriendRequest: builder.mutation({
      query: (addresseeId) => ({
        url: `/friends/request`,
        method: 'POST',
        body: { addresseeId },
      }),
      invalidatesTags: ['Friends'],
    }),

    // Chấp nhận / từ chối lời mời
    respondFriendRequest: builder.mutation({
      query: ({ friendshipId, accept }) => ({
        url: `/friends/${friendshipId}/respond`,
        method: 'POST',
        body: { accept },
      }),
      invalidatesTags: ['Friends'],
    }),

    // Huỷ kết bạn / thu hồi lời mời theo userId đối phương
    removeFriendByUser: builder.mutation({
      query: (userId) => ({ url: `/friends/user/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Friends'],
    }),
  }),
})

export const {
  useSearchUsersToAddQuery,
  useLazySearchUsersToAddQuery,
  useGetFriendOverviewQuery,
  useGetFriendsQuery,
  useGetFriendRequestsQuery,
  useSendFriendRequestMutation,
  useRespondFriendRequestMutation,
  useRemoveFriendByUserMutation,
} = friendApi
