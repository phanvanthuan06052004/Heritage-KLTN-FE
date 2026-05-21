import { BASE_URL } from '~/constants/fe.constant'
import { apiSlice } from './apiSlice'
import { normalizeHeritage } from './heritageApi'

// Helper function to get current language
const getCurrentLanguage = () => {
  return localStorage.getItem('lang') || 'vi'
}

export const favoriteSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFavoritesByUserId: builder.query({
      query: ({ userId, page = 1, limit = 9, language }) => {
        const params = new URLSearchParams()
        params.append('page', page.toString())
        params.append('limit', limit.toString())
        params.append('language', language || getCurrentLanguage())
        return `${BASE_URL}/favorites/user/${userId}?${params.toString()}`
      },
      transformResponse: (response, _meta, arg) => {
        const payload = response?.data || response || {}
        const rawItems = Array.isArray(payload?.items) ? payload.items : []
        const language = arg?.language || getCurrentLanguage()
        const items = rawItems
          .map((item) => {
            if (!item) return null

            const heritage = item.heritage || item
            const normalized = normalizeHeritage(heritage, {
              media: heritage.media || [],
              locations: heritage.locations || [],
              translations: heritage.translations || [],
              timelines: heritage.timelines || [],
              language,
            })

            if (!normalized?._id) return null

            return {
              ...normalized,
              favoriteAddedAt: item.favoriteAddedAt || item.addedAt || null,
            }
          })
          .filter(Boolean)

        const favoriteMap = items.reduce((map, item) => {
          map[item._id] = true
          return map
        }, {})

        return {
          ...payload,
          items,
          favoriteMap,
          pagination: payload.pagination || {
            page: 1,
            limit: items.length,
            totalItems: items.length,
            totalPages: items.length ? 1 : 0,
          },
        }
      },
      providesTags: (result) =>
        result?.items
          ? [
            ...result.items
              .filter(({ _id }) => Boolean(_id))
              .map(({ _id }) => ({ type: 'Favorites', id: _id })),
            { type: 'Favorites', id: 'LIST' },
          ]
          : [{ type: 'Favorites', id: 'LIST' }],
    }),

    addToFavorites: builder.mutation({
      query: ({ userId, heritageId }) => ({
        url: `${BASE_URL}/favorites`,
        method: 'POST',
        body: { userId, heritageId },
      }),
      invalidatesTags: [{ type: 'Favorites', id: 'LIST' }],
    }),

    removeFromFavorites: builder.mutation({
      query: ({ userId, heritageId }) => ({
        url: `${BASE_URL}/favorites/user/${userId}/heritage/${heritageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Favorites', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetFavoritesByUserIdQuery,
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} = favoriteSlice
