/* ==========================================================================
 *  DOMAIN TYPES — Core business entities
 *
 *  Techniques avancées utilisées :
 *  - Template literal types : IDs suffixés par le type d'entité
 *  - Discriminated unions : HeritageStatus, AsyncState
 *  - Utility types : Pick, Omit, Partial pour les mutations
 *  - Mapped types : transformations récurrentes
 *  - Type guards : narrowing runtime
 * ========================================================================== */

/* --------------------------------------------------------------------------
 *  Template literal types pour les IDs
 *  Pourquoi : permet de typer les IDs avec un suffixe indiquant leur nature,
 *  évitant les confusions entre un userId et un heritageId au niveau du type.
 * -------------------------------------------------------------------------- */
export type EntityId<T extends string> = `${string}-${T}`
export type HeritageId = EntityId<'heritage'>
export type UserId = EntityId<'user'>
export type CommentId = EntityId<'comment'>
export type TestId = EntityId<'test'>
export type MediaId = EntityId<'media'>
export type LocationId = EntityId<'location'>
export type TimelineId = EntityId<'timeline'>
export type LeaderboardId = EntityId<'leaderboard'>
export type DiscussId = EntityId<'discuss'>

/* --------------------------------------------------------------------------
 *  Discriminated union pour les statuts
 *  Pourquoi : permet au compilateur de réduire le type via un switch,
 *  garantissant l'exhaustivité du traitement de chaque statut.
 * -------------------------------------------------------------------------- */
export type HeritageStatus =
  | { kind: 'published' }
  | { kind: 'draft' }
  | { kind: 'archived' }
  | { kind: 'pending_review' }

export type HeritageCategory =
  | 'di_san_van_hoa'
  | 'di_tich_lich_su'
  | 'danh_lam_thang_canh'
  | 'le_hoi_truyen_thong'

export type KnowledgeTestStatus =
  | 'active'
  | 'inactive'
  | 'draft'

export type UserRole =
  | 'user'
  | 'admin'
  | 'moderator'

/* --------------------------------------------------------------------------
 *  Coordinates
 * -------------------------------------------------------------------------- */
export interface Coordinates {
  latitude: number
  longitude: number
}

/* --------------------------------------------------------------------------
 *  Media
 * -------------------------------------------------------------------------- */
export interface HeritageMedia {
  id?: MediaId
  url: string
  thumbnailUrl?: string
  type?: 'image' | 'video' | 'audio' | 'document'
  alt?: string
  heritageId?: HeritageId
  createdAt?: string
}

/* --------------------------------------------------------------------------
 *  Location
 * -------------------------------------------------------------------------- */
export interface HeritageLocation {
  id?: LocationId
  name?: string
  address?: string
  latitude?: number
  longitude?: number
  heritageId?: HeritageId
}

/* --------------------------------------------------------------------------
 *  Timeline / Historical event
 * -------------------------------------------------------------------------- */
export interface HistoricalEvent {
  id?: TimelineId
  title: string
  description: string
  eventDate?: string
  heritageId?: HeritageId
}

export type TimelineEntry = HistoricalEvent

/* --------------------------------------------------------------------------
 *  Translation
 * -------------------------------------------------------------------------- */
export interface HeritageTranslation {
  languageCode?: string
  language_code?: string
  title?: string
  summary?: string
  content?: string
  heritageId?: HeritageId
}

/* --------------------------------------------------------------------------
 *  User
 *  Structure normalisée par le normalizeUser() dans authSlice
 * -------------------------------------------------------------------------- */
export interface UserAccount {
  email?: string
  isActive?: boolean
}

export interface User {
  id: UserId
  _id: UserId
  email: string | null
  displayname: string
  displayName?: string
  username?: string
  role: UserRole
  account: UserAccount
  avatar?: string
  phone?: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

export type AuthUser = Pick<User, 'id' | '_id' | 'email' | 'displayname' | 'role' | 'avatar'>

/* --------------------------------------------------------------------------
 *  Heritage — entité principale
 *  Utilise Pick<>, Omit<>, Partial<> pour exprimer différentes vues
 * -------------------------------------------------------------------------- */
export interface HeritageStats {
  averageRating: number
  totalReviews: number
}

export interface AdditionalInfo {
  historicalEvents: HistoricalEvent[]
}

export interface Heritage {
  _id: HeritageId
  id: HeritageId
  name: string
  title?: string
  nameSlug: string
  slug?: string
  description: string
  summary?: string
  content?: string
  history?: string
  culturalSignificance?: string
  location: string
  media: HeritageMedia[]
  locations: HeritageLocation[]
  timelines: TimelineEntry[]
  translations: HeritageTranslation[]
  primaryLocation?: HeritageLocation
  images: string[]
  coordinates?: Coordinates
  additionalInfo: AdditionalInfo
  stats: HeritageStats
  dynasty?: string
  province?: string
  status?: HeritageStatus
  category?: HeritageCategory
  distanceKm?: number
  favoriteAddedAt?: string | null
}

/* --------------------------------------------------------------------------
 *  Vues partielles via types utilitaires
 *  Pourquoi : Pick/Omit permettent de définir des vues sans dupliquer
 *  les définitions, garantissant la cohérence avec Heritage complet.
 * -------------------------------------------------------------------------- */

// Carte de visite (card) : champs essentiels pour l'affichage en grille
export type HeritageCard = Pick<
  Heritage,
  '_id' | 'name' | 'nameSlug' | 'description' | 'location' | 'images' | 'coordinates'
> & Partial<Pick<Heritage, 'dynasty' | 'province' | 'stats' | 'distanceKm'>>

// Mutation de création : tous les champs optionnels sauf le nom
export type CreateHeritagePayload = Omit<
  Partial<Heritage>,
  '_id' | 'id' | 'nameSlug' | 'images' | 'coordinates' | 'additionalInfo'
> & { name: string }

// Mutation de mise à jour : tout est partiel
export type UpdateHeritagePayload = Partial<Omit<Heritage, '_id' | 'id'>> & { id: HeritageId }

/* --------------------------------------------------------------------------
 *  Commentaire / Discussion
 * -------------------------------------------------------------------------- */
export interface Comment {
  _id: CommentId
  id?: CommentId
  content: string
  heritageId: HeritageId
  userId?: UserId
  user?: Pick<User, 'id' | 'displayname' | 'avatar'>
  username?: string
  parentId?: CommentId | null
  createdAt: string
  updatedAt?: string
  likes?: number
  isLiked?: boolean
}

export interface DiscussItem {
  _id: DiscussId
  content: string
  heritageId: HeritageId
  userId?: UserId
  user?: Pick<User, 'id' | 'displayname'>
  username: string
  parentId?: DiscussId | null
  createdAt: string
}

/* --------------------------------------------------------------------------
 *  Knowledge Test
 * -------------------------------------------------------------------------- */
export interface KnowledgeQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

export interface KnowledgeTest {
  _id: TestId
  id?: TestId
  title: string
  description?: string
  heritageId?: HeritageId
  questions: KnowledgeQuestion[]
  status: KnowledgeTestStatus
  timeLimit?: number
  passingScore?: number
  createdAt?: string
  updatedAt?: string
}

export interface KnowledgeTestAttempt {
  userId: UserId
  userName: string
  testId: TestId
  answers: number[]
  score?: number
  completedAt?: string
}

/* --------------------------------------------------------------------------
 *  Leaderboard entry
 * -------------------------------------------------------------------------- */
export interface LeaderboardEntry {
  _id: LeaderboardId
  userId: UserId
  userName: string
  testId: TestId
  heritageId: HeritageId
  score: number
  totalQuestions: number
  completedAt: string
}

/* --------------------------------------------------------------------------
 *  Favorites
 * -------------------------------------------------------------------------- */
export interface FavoriteItem extends HeritageCard {
  favoriteAddedAt: string | null
}

export type FavoriteMap = Record<HeritageId, boolean>

/* --------------------------------------------------------------------------
 *  Message de chat / socket
 * -------------------------------------------------------------------------- */
export interface ChatMessage {
  id: string
  roomId: string
  userId: UserId
  username: string
  content: string
  timestamp: string
  type?: 'user' | 'system' | 'bot'
}

export interface ChatSession {
  sessionId: string
  heritageId?: HeritageId
  messages: ChatMessage[]
}

/* --------------------------------------------------------------------------
 *  RAG / Knowledge Base
 * -------------------------------------------------------------------------- */
export interface WikiPage {
  id: string
  slug: string
  title: string
  content: string
  pageType?: string
  createdAt?: string
  updatedAt?: string
}

export interface KnowledgeBaseSource {
  sourceId: string
  title: string
  status: 'processing' | 'completed' | 'failed'
  progress?: number
}

/* --------------------------------------------------------------------------
 *  Pagination
 *  Pourquoi : type générique réutilisable pour toutes les listes paginées
 * -------------------------------------------------------------------------- */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  totalItems?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  pagination: Pagination
}

export interface PaginatedQuery {
  page?: number
  limit?: number
}

/* --------------------------------------------------------------------------
 *  Discriminated union pour l'état asynchrone
 *  Pourquoi : permet un narrowing parfait — impossible d'accéder à `data`
 *  sans avoir vérifié que `status === 'success'` au préalable.
 * -------------------------------------------------------------------------- */
export type AsyncState<T, E = Error> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: E }

/* --------------------------------------------------------------------------
 *  Type guards
 *  Pourquoi : fonctions de narrowing runtime qui permettent à TS de
 *  déduire le type après vérification conditionnelle.
 * -------------------------------------------------------------------------- */
export function isHeritage(entity: unknown): entity is Heritage {
  return (
    typeof entity === 'object' &&
    entity !== null &&
    '_id' in entity &&
    'name' in entity
  )
}

export function isHeritageCard(entity: unknown): entity is HeritageCard {
  return isHeritage(entity) || (typeof entity === 'object' && entity !== null && 'nameSlug' in entity)
}

export function isAuthenticatedUser(user: unknown): user is AuthUser {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'role' in user
  )
}

export function hasCoordinates(entity: unknown): entity is { coordinates: Coordinates } {
  return (
    typeof entity === 'object' &&
    entity !== null &&
    'coordinates' in entity &&
    entity.coordinates !== undefined
  )
}

export type LanguageCode = 'vi' | 'en'
