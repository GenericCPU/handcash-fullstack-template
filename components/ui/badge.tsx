'use client'

import * as React from 'react'
import { Badge as ChakraBadge } from '@chakra-ui/react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * HandCash Template Badge — Chakra v3 Badge behind a shadcn-shaped boundary.
 * `badgeVariants` is exported for backward-compatible direct use of classes.
 */

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

type LegacyVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

type ChakraBadgeVariant = 'solid' | 'subtle' | 'outline' | 'surface' | 'plain'

const VARIANT_TO_CHAKRA: Record<
  LegacyVariant,
  { variant: ChakraBadgeVariant; colorPalette?: string }
> = {
  default: { variant: 'solid', colorPalette: 'primary' },
  secondary: { variant: 'subtle', colorPalette: 'gray' },
  destructive: { variant: 'solid', colorPalette: 'danger' },
  outline: { variant: 'outline' },
}

type ChakraBadgeProps = React.ComponentProps<typeof ChakraBadge>

export type BadgeProps = Omit<ChakraBadgeProps, 'variant'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
  }

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, asChild, colorPalette, ...props },
  ref,
) {
  const v = (variant ?? 'default') as LegacyVariant
  const map = VARIANT_TO_CHAKRA[v] ?? VARIANT_TO_CHAKRA.default
  return (
    <ChakraBadge
      ref={ref}
      data-slot="badge"
      variant={map.variant}
      colorPalette={colorPalette ?? map.colorPalette}
      asChild={asChild}
      className={cn(className)}
      {...props}
    />
  )
})

export { Badge, badgeVariants }
