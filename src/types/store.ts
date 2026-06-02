/* ==========================================================================
 *  STORE TYPES — Redux store, slices, actions, selectors
 *
 *  Techniques avancées utilisées :
 *  - ReturnType : inférer le type du store depuis configureStore
 *  - Discriminated union : actions Redux typées
 *  - Mapped types : transformation des action creators
 * ========================================================================== */

import type { store } from '../store'
import type {
  User,
  AuthUser,
  HeritageId,
  FavoriteMap,
  Comment,
  CommentId,
} from './domain'

/* --------------------------------------------------------------------------
 *  Inférence du RootState et AppDispatch depuis le store lui-même
 *  Pourquoi : plutôt que de définir manuellement l'interface RootState
 *  (qui se désynchroniserait), on utilise ReturnType pour l'inférer
 *  automatiquement. Toute modification d'un slice mettra à jour le type.
 * -------------------------------------------------------------------------- */
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/* --------------------------------------------------------------------------
 *  Types des slices individuelles
 *  Pourquoi : utilisés par les selectors et les composants qui accèdent
 *  à une partie spécifique du state.
 * -------------------------------------------------------------------------- */

export interface AuthState {
  userInfo: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  sessionId: string | null
}

export interface PaginationState {
  heritages: {
    currentPage: number
    itemsPerPage: number
    searchQuery: string
  }
  favorites: {
    currentPage: number
    itemsPerPage: number
  }
}

export interface FavoritesState {
  favoriteMap: FavoriteMap
  isInitialized: boolean
}

export interface CommentState {
  comments: Comment[]
  loading: boolean
  error: string | null
}

/* --------------------------------------------------------------------------
 *  Action types pour les slices
 *  Pourquoi : permet de typer les action creators manuellement si nécessaire
 * -------------------------------------------------------------------------- */
export interface SetCredentialsPayload {
  user: User
  accessToken: string
  refreshToken: string
  sessionId: string
}

export interface SetAccessTokenPayload {
  accessToken: string
}

export interface SetFavoriteStatusPayload {
  heritageId: HeritageId
  isFavorited: boolean
}

export interface AddCommentPayload {
  content: string
  heritageId: HeritageId
  parentId?: CommentId | null
}

export interface SetHeritagesPagePayload {
  page: number
}

export interface SetHeritagesSearchQueryPayload {
  query: string
}

export interface SetFavoritesPagePayload {
  page: number
}

/* --------------------------------------------------------------------------
 *  Type guard pour le state auth
 *  Pourquoi : vérifie à runtime si l'utilisateur est connecté, et réduit
 *  le type de userInfo de AuthUser | null à AuthUser.
 * -------------------------------------------------------------------------- */
export function isAuthenticated(state: RootState): state is RootState & { auth: { userInfo: AuthUser } } {
  return state.auth.userInfo !== null
}

export function getCurrentUserId(state: RootState): string | null {
  return state.auth.userInfo?.id ?? state.auth.userInfo?._id ?? null
}


