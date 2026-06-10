import { apiSlice } from "./apiSlice"
import { BASE_URL } from "~/constants/fe.constant"

// Chuẩn hoá 1 discuss từ BE -> shape mà component đang dùng
const nameOf = (u) =>
  u?.displayName || u?.displayname || u?.email?.split("@")[0] || "Người dùng"

const normalize = (d) => ({
  ...d,
  _id: d.id ?? d._id,
  username: nameOf(d.user),
  comment_left: d.commentLeft ?? d.comment_left,
  comment_right: d.commentRight ?? d.comment_right,
  user: {
    id: d.user?.id,
    displayname: nameOf(d.user),
    avatar: d.user?.avatar,
  },
})

export const discussSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDiscussByParentId: builder.query({
      query: ({ heritageId, parentId }) => {
        const params = new URLSearchParams()
        params.append("heritageId", heritageId)
        if (parentId) params.append("parentId", parentId)
        return `${BASE_URL}/discusses?${params.toString()}`
      },
      transformResponse: (response) => {
        // BE bọc { data: [...] } (Response.OK). Cũng chấp nhận mảng trực tiếp.
        const arr = Array.isArray(response) ? response : (response?.data ?? [])
        return { discussArray: arr.map(normalize) }
      },
      providesTags: (result, error, arg) => [
        { type: "Discuss", id: `HERITAGE-${arg.heritageId}` },
        ...(arg.parentId ? [{ type: "Discuss", id: `PARENT-${arg.parentId}` }] : []),
        { type: "Discuss", id: "LIST" },
      ],
    }),

    createDiscuss: builder.mutation({
      query: (data) => ({
        url: `${BASE_URL}/discusses`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, arg) => {
        const tags = [
          { type: "Discuss", id: `HERITAGE-${arg.heritageId}` },
          { type: "Discuss", id: "LIST" },
        ]
        if (arg.parentId) tags.push({ type: "Discuss", id: `PARENT-${arg.parentId}` })
        return tags
      },
    }),

    deleteDiscuss: builder.mutation({
      query: ({ heritageId, commentId }) => ({
        url: `${BASE_URL}/discusses?heritageId=${heritageId}&discussId=${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Discuss", id: arg.commentId },
        { type: "Discuss", id: `HERITAGE-${arg.heritageId}` },
        { type: "Discuss", id: "LIST" },
        ...(arg.parentId ? [{ type: "Discuss", id: `PARENT-${arg.parentId}` }] : []),
      ],
    }),
  }),
})

export const {
  useGetDiscussByParentIdQuery,
  useLazyGetDiscussByParentIdQuery,
  useCreateDiscussMutation,
  useDeleteDiscussMutation,
} = discussSlice
