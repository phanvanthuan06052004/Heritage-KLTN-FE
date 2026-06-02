/* ==========================================================================
 *  SOCKET TYPES — Socket.IO event names and payloads
 *
 *  Techniques avancées utilisées :
 *  - Template literal types : noms d'événements typés (kebab-case → TypeScript)
 *  - Mapped types : transformation événement → callback
 *  - Discriminated unions : payloads par événement
 * ========================================================================== */

import type { UserId, ChatMessage } from './domain'

/* --------------------------------------------------------------------------
 *  Template literal types pour les noms d'événements
 *  Pourquoi : transforme les chaînes kebab-case en types TypeScript
 *  sûrs, avec autocomplétion et vérification statique. Impossible
 *  d'émettre 'join-room' avec une faute de frappe.
 * -------------------------------------------------------------------------- */
export type SocketEvent =
  | 'connect'
  | 'disconnect'
  | 'join-room'
  | 'leave-room'
  | 'room-joined'
  | 'user-joined'
  | 'user-left'
  | 'room-users'
  | 'new-message'
  | 'typing'
  | 'user-typing'
  | 'room-messages'
  | 'join-dm'
  | 'send-dm'
  | 'new-dm'
  | 'get-dm-messages'
  | 'dm-messages'
  | 'error'
  | 'get-messages'

/* --------------------------------------------------------------------------
 *  Mapped type : associe chaque événement à son payload
 *  Pourquoi : un seul point de vérité pour tous les payloads socket.
 *  L'ajout d'un nouvel événement dans ce type propage automatiquement
 *  les vérifications partout où il est utilisé.
 * -------------------------------------------------------------------------- */
export interface SocketPayloadMap {
  'connect': void
  'disconnect': void
  'join-room': { heritageId: string; userData: RoomUser }
  'leave-room': { heritageId: string; userId: string }
  'room-joined': { heritageId: string; users: RoomUser[] }
  'user-joined': { heritageId: string; user: RoomUser }
  'user-left': { heritageId: string; userId: string }
  'room-users': { heritageId: string; users: RoomUser[] }
  'new-message': { roomId: string; message: ChatMessage }
  'typing': { roomId: string; isTyping: boolean }
  'user-typing': { roomId: string; userId: string; isTyping: boolean }
  'room-messages': { roomId: string; messages: ChatMessage[] }
  'join-dm': { userId1: UserId; userId2: UserId; userData: RoomUser }
  'send-dm': { dmRoomId: string; userId: string; message: string }
  'new-dm': { dmRoomId: string; message: ChatMessage }
  'get-dm-messages': { dmRoomId: string; limit: number }
  'dm-messages': { dmRoomId: string; messages: ChatMessage[] }
  'error': string
  'get-messages': { roomId: string; limit: number; lastMessageTimestamp?: string | null }
}

export interface RoomUser {
  userId: string
  username: string
}

/* --------------------------------------------------------------------------
 *  Conditional type : extrait le payload d'un événement
 *  Pourquoi : permet d'écrire des fonctions génériques qui s'adaptent
 *  automatiquement au type de payload de chaque événement.
 * -------------------------------------------------------------------------- */
export type SocketPayload<E extends SocketEvent> =
  E extends keyof SocketPayloadMap ? SocketPayloadMap[E] : unknown

/* --------------------------------------------------------------------------
 *  Mapped type : transforme la map d'événements en callbacks typés
 *  Pourquoi : utilisé pour typer la méthode on() du service socket.
 *  Garantit que le callback reçoit le bon type de payload.
 * -------------------------------------------------------------------------- */
export type SocketCallbacks = {
  [E in SocketEvent]: E extends keyof SocketPayloadMap
    ? SocketPayloadMap[E] extends void
      ? () => void
      : (data: SocketPayloadMap[E]) => void
    : () => void
}

/* --------------------------------------------------------------------------
 *  Interface du SocketService typée
 * -------------------------------------------------------------------------- */
export interface ISocketService {
  connect(userData: RoomUser): import('socket.io-client').Socket | null
  disconnect(): void
  joinRoom(heritageId: string, userData: RoomUser): void
  leaveRoom(params: { heritageId: string; userId: string }): void
  joinDirectRoom(userId1: string, userId2: string, userData: RoomUser): void
  sendMessage(roomId: string, message: string): void
  sendDirectMessage(dmRoomId: string, userId: string, message: string): void
  startTyping(roomId: string): void
  stopTyping(roomId: string): void
  getMessages(roomId: string, limit?: number, lastMessageTimestamp?: string | null): void
  getDirectMessages(dmRoomId: string, limit?: number): void
  on<E extends SocketEvent>(event: E, callback: SocketCallbacks[E]): void
  off<E extends SocketEvent>(event: E, callback: SocketCallbacks[E]): void
}

/* --------------------------------------------------------------------------
 *  Type guard pour les événements socket
 *  Pourquoi : vérifie qu'une chaîne est un événement socket valide,
 *  réduisant le type à SocketEvent pour les appels dynamiques.
 *  Set utilise une table de hachage → O(1) lookup vs O(n) pour Array.includes.
 * -------------------------------------------------------------------------- */
const SOCKET_EVENTS_SET: ReadonlySet<string> = new Set([
  'connect', 'disconnect', 'join-room', 'leave-room', 'room-joined',
  'user-joined', 'user-left', 'room-users', 'new-message', 'typing',
  'user-typing', 'room-messages', 'join-dm', 'send-dm', 'new-dm',
  'get-dm-messages', 'dm-messages', 'error', 'get-messages',
])

export function isSocketEvent(event: string): event is SocketEvent {
  return (SOCKET_EVENTS_SET as ReadonlySet<string>).has(event)
}
