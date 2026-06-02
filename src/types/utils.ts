/* ==========================================================================
 *  UTILITY TYPES — Helpers, mapped types, conditional types, type guards
 *
 *  Ces types sont des outils génériques réutilisables dans toute
 *  l'application. Ils implémentent les techniques avancées demandées.
 * ========================================================================== */

/* --------------------------------------------------------------------------
 *  Mapped type : rend toutes les clés optionnelles récursivement
 *  Pourquoi : DeepPartial est nécessaire pour les mises à jour partielles
 *  d'objets imbriqués (ex: formulaire avec champs optionnels).
 *  Un simple Partial<T> ne traite que le premier niveau.
 * -------------------------------------------------------------------------- */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/* --------------------------------------------------------------------------
 *  Mapped type : rend toutes les clés obligatoires récursivement
 *  Pourquoi : l'opposé de DeepPartial, utile pour normaliser des données.
 * -------------------------------------------------------------------------- */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

/* --------------------------------------------------------------------------
 *  Mapped type : sélectionne uniquement les clés d'un certain type
 *  Pourquoi : extrait dynamiquement les propriétés d'un objet dont
 *  la valeur correspond à un type donné (ex: toutes les strings).
 * -------------------------------------------------------------------------- */
export type PickByType<T, V> = {
  [P in keyof T as T[P] extends V ? P : never]: T[P]
}

export type OmitByType<T, V> = {
  [P in keyof T as T[P] extends V ? never : P]: T[P]
}

/* --------------------------------------------------------------------------
 *  Template literal type : union de préfixes
 *  Pourquoi : crée des unions de chaînes à partir d'un préfixe et
 *  d'une union de suffixes. Évite la duplication manuelle.
 * -------------------------------------------------------------------------- */
export type PrefixedString<P extends string, S extends string> = `${P}${S}`

// Exemple pour les clés localStorage
export type StorageKey = PrefixedString<'heritage_', '' | 'favorites' | 'language' | 'theme'>

/* --------------------------------------------------------------------------
 *  Mapped type : transforme les nullables en optionnels
 *  Pourquoi : dans les réponses API, les champs peuvent être null.
 *  Ce type transforme T | null en T | undefined pour éviter les
 *  vérifications null redondantes.
 * -------------------------------------------------------------------------- */
export type NullToOptional<T> = {
  [K in keyof T]: T[K] extends null ? Exclude<T[K], null> | undefined : T[K]
}

/* --------------------------------------------------------------------------
 *  Mapped type : renomme les clés d'un objet
 *  Pourquoi : transforme un type en renommant certaines clés selon
 *  un mapping. Utile pour les transformations API → UI.
 * -------------------------------------------------------------------------- */
export type RenameKeys<T, R extends Partial<Record<keyof T, string>>> = {
  [K in keyof T as K extends keyof R ? R[K] extends string ? R[K] : K : K]: T[K]
}

/* --------------------------------------------------------------------------
 *  Type guard générique
 *  Pourquoi : version typée de la vérification d'existence. Évite
 *  les `if (x !== null && x !== undefined)` répétitifs.
 * -------------------------------------------------------------------------- */
export function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

export function hasValue<T>(value: T | null | undefined | ''): value is T {
  return value !== null && value !== undefined && value !== ''
}

/* --------------------------------------------------------------------------
 *  Type guard pour les tableaux
 *  Pourquoi : vérifie qu'une valeur est un tableau non vide,
 *  réduisant le type pour éviter les vérifications .length.
 * -------------------------------------------------------------------------- */
export function isNonEmptyArray<T>(value: T[] | null | undefined): value is [T, ...T[]] {
  return Array.isArray(value) && value.length > 0
}

export function isArrayOf<T>(
  value: unknown,
  guard: (item: unknown) => item is T,
): value is T[] {
  return Array.isArray(value) && value.every(guard)
}

/* --------------------------------------------------------------------------
 *  Type guard pour les enregistrements (Record)
 * -------------------------------------------------------------------------- */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}


