/* ==========================================================================
 *  UI TYPES — Component props, variants, design system tokens
 *
 *  Techniques avancées utilisées :
 *  - Template literal types : variants de composants
 *  - Discriminated unions : variantes mutuellement exclusives
 *  - Generic constraints : composants réutilisables avec types préservés
 *  - Mapped types : thème responsive
 * ========================================================================== */

import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'

/* --------------------------------------------------------------------------
 *  Button variants — discriminated union
 *  Pourquoi : garantit qu'on ne peut pas passer à la fois variant="link"
 *  ET size="icon" de manière incohérente, chaque variant définit
 *  exactement ce qui est attendu.
 * -------------------------------------------------------------------------- */

// Objet des variantes (pour les classes CSS)
export interface ButtonVariantRecord {
  variant: Record<ButtonVariant, string>
  size: Record<ButtonSize, string>
}

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'ghost' | 'link'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

type ButtonAttributes = ButtonHTMLAttributes<HTMLButtonElement>
type AnchorAttributes = AnchorHTMLAttributes<HTMLAnchorElement>

export interface ButtonBaseProps {
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  children?: ReactNode
}

// On utilise un type intersection simple, pas de discriminated union
// car un bouton peut être un <button> ou un <a> → deux ensembles de props
export type ButtonProps = ButtonBaseProps &
  (ButtonAttributes | (AnchorAttributes & { href: string }))

/* --------------------------------------------------------------------------
 *  Card variants
 * -------------------------------------------------------------------------- */
export type CardTone = 'default' | 'muted'

export interface CardProps {
  children: ReactNode
  className?: string
  tone?: CardTone
}

/* --------------------------------------------------------------------------
 *  Input / Textarea
 * -------------------------------------------------------------------------- */
export interface InputProps {
  className?: string
  label?: string
  error?: string
  id?: string
}

export interface TextareaProps {
  className?: string
  label?: string
  error?: string
  id?: string
  rows?: number
}

/* --------------------------------------------------------------------------
 *  Avatar
 * -------------------------------------------------------------------------- */
export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps {
  src?: string | null
  alt?: string
  size?: AvatarSize
  fallback?: string
  className?: string
}

/* --------------------------------------------------------------------------
 *  Skeleton
 * -------------------------------------------------------------------------- */
export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card'

export interface SkeletonProps {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  className?: string
  count?: number
}

/* --------------------------------------------------------------------------
 *  Tabs
 * -------------------------------------------------------------------------- */
export interface Tab {
  id: string
  label: string
  content?: ReactNode
}

export interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  onChange?: (tabId: string) => void
  className?: string
}

/* --------------------------------------------------------------------------
 *  Dialog / Modal
 * -------------------------------------------------------------------------- */
export interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

/* --------------------------------------------------------------------------
 *  Pagination
 * -------------------------------------------------------------------------- */
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/* --------------------------------------------------------------------------
 *  Loading
 * -------------------------------------------------------------------------- */
export interface LoadingScreenProps {
  fullScreen?: boolean
  message?: string
}

/* --------------------------------------------------------------------------
 *  Motion / Animation
 * -------------------------------------------------------------------------- */
export type MotionDirection = 'up' | 'down' | 'left' | 'right'

export interface MotionRevealProps {
  children: ReactNode
  direction?: MotionDirection
  delay?: number
  duration?: number
  className?: string
}

export interface MuseumSectionHeaderProps {
  title: string
  subtitle?: string
  className?: string
}

/* --------------------------------------------------------------------------
 *  Template literal types pour les classes Tailwind responsives
 *  Pourquoi : permet d'écrire des classes responsive typées
 *  comme 'sm:flex', 'md:grid-cols-3', 'lg:text-lg'
 * -------------------------------------------------------------------------- */
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type ResponsiveClass<B extends Breakpoint, T extends string> = `${B}:${T}`

export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>

/* --------------------------------------------------------------------------
 *  Type guard pour les variantes
 *  Pourquoi : vérifie à runtime qu'une variante est valide avant de
 *  l'utiliser comme index dans un objet de classes CSS.
 * -------------------------------------------------------------------------- */
export function isButtonVariant(variant: string): variant is ButtonVariant {
  const variants: readonly ButtonVariant[] = ['default', 'destructive', 'outline', 'ghost', 'link']
  return (variants as readonly string[]).includes(variant)
}

export function isButtonSize(size: string): size is ButtonSize {
  const sizes: readonly ButtonSize[] = ['default', 'sm', 'lg', 'icon']
  return (sizes as readonly string[]).includes(size)
}

/* --------------------------------------------------------------------------
 *  Variant helper — extrait les classes d'une variante avec fallback
 *  Pourquoi : fonction utilitaire générique pour tous les composants
 *  qui ont des variantes. Le type contraint K aux clés de V.
 * -------------------------------------------------------------------------- */
export function getVariantClasses<V extends Record<string, string>>(
  variants: V,
  key: string,
  defaultKey: keyof V,
): string {
  return variants[key as keyof V] ?? variants[defaultKey]!
}


