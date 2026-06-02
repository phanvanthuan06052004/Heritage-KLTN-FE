import { createSlice, createSelector } from '@reduxjs/toolkit'
import { favoriteSlice as favoriteApi } from '~/store/apis/favoritesSlice'

const initialState = {
  favoriteMap: {},
  isInitialized: false,
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavoriteStatus: (state, action) => {
      const { heritageId, isFavorited } = action.payload
      if (isFavorited) {
        state.favoriteMap[heritageId] = true
      } else {
        delete state.favoriteMap[heritageId]
      }
    },
    resetFavorites: (state) => {
      state.favoriteMap = {}
      state.isInitialized = false
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      favoriteApi.endpoints.getFavoritesByUserId.matchFulfilled,
      (state, { payload }) => {
        if (payload && payload.favoriteMap) {
          state.favoriteMap = payload.favoriteMap
          state.isInitialized = true
        }
      }
    )
  },
})

export const { setFavoriteStatus, resetFavorites } = favoritesSlice.actions

const EMPTY_MAP = {}
const selectRawFavoriteMap = (state) => state.favorites.favoriteMap
export const selectFavoriteMap = createSelector(
  [selectRawFavoriteMap],
  (map) => map ?? EMPTY_MAP
)
export const selectIsFavoriteInitialized = (state) => state.favorites.isInitialized

export const selectIsFavorited = (heritageId) =>
  createSelector(
    [selectRawFavoriteMap],
    (map) => !!(map && map[heritageId])
  )

export default favoritesSlice.reducer
