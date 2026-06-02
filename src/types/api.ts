/* ==========================================================================
 *  API TYPES — RTK Query endpoints, request/response shapes, tag system
 *
 *  Techniques avancées utilisées :
 *  - Generics avec contraintes : PaginatedResponse<T>, ApiResponse<T>
 *  - Template literal types : TagType, ApiEndpoint
 *  - Mapped types : auto-génération des hooks typés
 *  - Conditional types : unwrapResponse
 * ========================================================================== */

import type {
  HeritageCard,
  CreateHeritagePayload,
  UpdateHeritagePayload,
  HeritageId,
  UserId,
  PaginatedQuery,
  CommentId,
  DiscussItem,
  DiscussId,
  TestId,
  HeritageId as LeaderboardHeritageId,
  LanguageCode,
  FavoriteItem,
  FavoriteMap,
} from './domain'

/* --------------------------------------------------------------------------
 *  Template literal types pour les endpoints et tags
 *  Pourquoi : empêche les fautes de frappe et permet l'autocomplétion
 *  des noms d'endpoints et tags dans toute l'application.
 * -------------------------------------------------------------------------- */
export type ApiEndpoint =
  | `/heritage`
  | `/heritage/${string}`
  | `/heritage/slug/${string}`
  | `/auth/signup`
  | `/auth/signin`
  | `/auth/verify-otp`
  | `/auth/resend-otp`
  | `/auth/forgot-password`
  | `/auth/verify-forgot-password-otp`
  | `/auth/reset-password`
  | `/auth/refresh-token`
  | `/auth/logout`
  | `/auth/change-password`
  | `/auth/metamask/${string}`
  | `/media/${string}`
  | `/media/heritage/${string}`
  | `/media/upload`
  | `/location/${string}`
  | `/location/heritage/${string}`
  | `/timeline/${string}`
  | `/timeline/heritage/${string}`
  | `/translation/heritage/${string}`
  | `/users/`
  | `/users/${string}`
  | `/users/me`
  | `/users/upload`
  | `/comments/`
  | `/comments/${string}`
  | `/comments/${string}/like`
  | `/favorites/${string}`
  | `/favorites/user/${string}`
  | `/favorites/user/${string}/heritage/${string}`
  | `/discuss`
  | `/knowledge-tests/${string}`
  | `/knowledge-tests/heritage/${string}`
  | `/knowledge-tests/${string}/attempt`
  | `/knowledge-tests/upload`
  | `/leaderBoards/${string}`
  | `/leaderBoards/heritage/${string}`
  | `/rag/query`
  | `/rag/import`
  | `/rag/wiki`
  | `/rag/wiki/${string}`
  | `/rag/search`
  | `/rag/sources/${string}/progress`

export type TagType =
  | 'User'
  | 'Users'
  | 'Heritage'
  | 'Heritages'
  | 'Chat'
  | 'Favorites'
  | 'KnowledgeTests'
  | 'Leaderboards'
  | 'KnowledgeBase'
  | 'Comments'
  | 'Discuss'

/* --------------------------------------------------------------------------
 *  Generic API response wrapper
 *  Pourquoi : tous les endpoints BE renvoient { data, message, statusCode }.
 *  Un type générique avec contrainte évite la duplication.
 * -------------------------------------------------------------------------- */
export interface ApiResponse<T> {
  data: T
  message?: string
  statusCode?: number
  pagination?: import('./domain').Pagination
}

export type UnwrappedResponse<T> = T extends ApiResponse<infer U> ? U : T

/* --------------------------------------------------------------------------
 *  Conditional type pour l'unwrapping
 *  Pourquoi : extrait automatiquement le type contenu dans ApiResponse
 *  sans avoir à le faire manuellement à chaque endpoint.
 * -------------------------------------------------------------------------- */
export type UnwrapApiResponse<T> =
  T extends ApiResponse<infer U> ? U
  : T extends { data: infer U } ? U
  : T

/* --------------------------------------------------------------------------
 *  Endpoint argument types
 *  Utilise Partial<> et Pick<> pour exprimer les paramètres optionnels
 * -------------------------------------------------------------------------- */
export interface HeritageListQuery extends PaginatedQuery {
  name?: string
  status?: string
  type?: string
  sort?: string
  order?: 'asc' | 'desc'
  language?: LanguageCode
}

export interface HeritageDetailQuery {
  id: HeritageId
  language?: LanguageCode
}

export interface HeritageSlugQuery {
  nameSlug: string
  language?: LanguageCode
}

export interface NearestQuery {
  latitude: number
  longitude: number
  limit?: number
  language?: LanguageCode
}

export interface CreateHeritageArg {
  data: CreateHeritagePayload
}

export interface UpdateHeritageArg {
  id: HeritageId
  data: UpdateHeritagePayload
}

export interface DeleteHeritageArg {
  id: HeritageId
}

export interface MediaArg {
  heritageId: HeritageId
  data?: Record<string, unknown>
}

export interface MediaUpdateArg {
  id: string
  data: Record<string, unknown>
}

export interface TimelineArg {
  heritageId: HeritageId
  data?: Record<string, unknown>
}

export interface LocationArg {
  heritageId: HeritageId
  data?: Record<string, unknown>
}

export interface RAGQueryArg {
  question: string
  heritageId?: HeritageId
  topK?: number
  collectionName?: string
  sessionId?: string
  model?: string
}

export interface UploadDocumentArg {
  file: File
  title?: string
  knowledgeType?: string
}

export interface UploadWebsiteArg {
  url: string
  title?: string
  knowledgeType?: string
}

export interface SearchKnowledgeArg {
  q?: string
  limit?: number
  pageType?: string
}

export interface WikiPagesQuery {
  limit?: number
  offset?: number
  pageType?: string
}

export interface CommentQuery extends PaginatedQuery {
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  heritageId?: HeritageId
}

export interface CreateCommentArg {
  content: string
  heritageId: HeritageId
  parentId?: CommentId | null
}

export interface UpdateCommentArg {
  id: CommentId
  content: string
}

export interface DiscussQuery {
  heritageId: HeritageId
  parentId?: DiscussId | null
}

export interface CreateDiscussArg {
  content: string
  heritageId: HeritageId
  parentId?: DiscussId | null
  userId?: UserId
}

export interface DeleteDiscussArg {
  heritageId: HeritageId
  commentId: DiscussId
  parentId?: DiscussId
}

export interface FavoritesQuery extends PaginatedQuery {
  userId: UserId
  language?: LanguageCode
}

export interface AddFavoriteArg {
  userId?: UserId
  heritageId: HeritageId
}

export interface RemoveFavoriteArg {
  userId?: UserId
  heritageId: HeritageId
}

export interface KnowledgeTestQuery extends PaginatedQuery {
  search?: string
  status?: string
}

export interface CreateKnowledgeTestArg {
  data: Record<string, unknown>
}

export interface UpdateKnowledgeTestArg {
  testId: TestId
  data: Record<string, unknown>
}

export interface SubmitAttemptArg {
  userId: UserId
  userName: string
  testId: TestId
  answers: number[]
}

export interface LeaderboardQuery {
  heritageId: HeritageId
  page?: number
  limit?: number
}

export interface AuthSignUpArg {
  email: string
  password: string
  displayname: string
}

export interface AuthSignInArg {
  email: string
  password: string
}

export interface UserQuery extends PaginatedQuery {
  search?: string
  role?: string
  sort?: string
  order?: string
}

export interface UpdateUserArg {
  id: UserId
  [key: string]: unknown
}

/* --------------------------------------------------------------------------
 *  Response types
 *  Utilise Pick<> pour exprimer les sous-ensembles
 * -------------------------------------------------------------------------- */
export interface HeritageListResponse {
  heritages: HeritageCard[]
  items: HeritageCard[]
  total: number
  pagination: import('./domain').Pagination
}

export interface NearestHeritagesResponse {
  heritages: (HeritageCard & { distanceKm: number })[]
}

export interface FavoritesResponse {
  items: FavoriteItem[]
  favoriteMap: FavoriteMap
  pagination: import('./domain').Pagination
  total?: number
}

export interface DiscussResponse {
  discussArray: DiscussItem[]
}

export interface AuthResponse {
  user: import('./domain').User
  accessToken: string
  refreshToken: string
  sessionId: string
}

export interface ActiveUsersResponse {
  users: import('./domain').User[]
}

export interface UserListResponse {
  users: import('./domain').User[]
  pagination: import('./domain').Pagination
}

export type UserProfile = Pick<import('./domain').User, 'id' | 'email' | 'displayname' | 'role' | 'avatar' | 'phone' | 'address' | 'createdAt'>

/* --------------------------------------------------------------------------
 *  API Error shape
 * -------------------------------------------------------------------------- */
export interface ApiError {
  status: number | 'FETCH_ERROR' | 'CUSTOM_ERROR'
  data?: {
    message?: string
    errors?: Record<string, string[]>
  }
  error?: string
}

/* --------------------------------------------------------------------------
 *  Type guard pour les erreurs API
 *  Pourquoi : permet de vérifier à runtime si une erreur est une ApiError
 *  et d'accéder à ses propriétés en toute sécurité.
 * -------------------------------------------------------------------------- */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('status' in error || 'data' in error)
  )
}

export function getApiErrorMessage(error: unknown): string {
  if (isApiError(error) && error.data?.message) {
    return error.data.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Đã xảy ra lỗi'
}
