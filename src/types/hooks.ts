/* ==========================================================================
 *  HOOK TYPES — Typed Redux hooks and custom hooks
 *
 *  Techniques avancées utilisées :
 *  - Generics avec contraintes pour préserver les types des callbacks
 *  - Utility types (ReturnType) pour inférer le state depuis le store
 * ========================================================================== */

import type { TypedUseSelectorHook } from 'react-redux'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from './store'

/* --------------------------------------------------------------------------
 *  Hooks Redux typés
 *  Pourquoi : useAppDispatch et useAppSelector remplacent les hooks
 *  natifs pour éviter de retyper à chaque usage.
 *  useAppDispatch infère automatiquement le type des actions (thunks, etc.)
 *  useAppSelector infère automatiquement la structure du state.
 * -------------------------------------------------------------------------- */
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

/* --------------------------------------------------------------------------
 *  Hook générique pour la pagination
 *  Pourquoi : réutilisable pour toute liste paginée, avec un type
 *  générique contraint pour les callbacks de changement de page.
 * -------------------------------------------------------------------------- */
export interface UsePaginationReturn {
  currentPage: number
  totalPages: number
  goToPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  hasNextPage: boolean
  hasPrevPage: boolean
  startIndex: number
  endIndex: number
}

/* --------------------------------------------------------------------------
 *  Hook générique pour le debounce
 *  Pourquoi : préserve le type de la valeur debouncée.
 * -------------------------------------------------------------------------- */
export type UseDebounceReturn<T> = T

/* --------------------------------------------------------------------------
 *  Hook de favoris typé
 * -------------------------------------------------------------------------- */
export interface UseFavoriteReturn {
  isFavorited: boolean
  toggleFavorite: () => Promise<void>
  isLoading: boolean
}

/* --------------------------------------------------------------------------
 *  Hook socket typé
 * -------------------------------------------------------------------------- */
export interface UseSocketReturn {
  isConnected: boolean
  joinRoom: (heritageId: string, userData: { userId: string; username: string }) => void
  leaveRoom: (heritageId: string, userId: string) => void
  sendMessage: (roomId: string, message: string) => void
  startTyping: (roomId: string) => void
  stopTyping: (roomId: string) => void
}
