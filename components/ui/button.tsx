'use client'

import * as React from 'react'
import { Button as ChakraButton } from '@chakra-ui/react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * HandCash Template Button — Chakra v3 Button behind a shadcn-shaped boundary.
 *
 *   <Button>Default</Button>
 *   <Button variant="destructive" size="sm" />
 *   <Button asChild><Link href="/x">Link</Link></Button>
 *
 * Existing variant/size props map to Chakra's variant + colorPalette + size.
 * `buttonVariants` (CVA) is exported for backward compatibility with any
 * other component that uses the classes directly (AlertDialog Action/Cancel,
 * link-styled anchors, etc.).
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

type LegacyVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
type LegacySize = NonNullable<VariantProps<typeof buttonVariants>['size']>

type ChakraVariant = 'solid' | 'outline' | 'ghost' | 'subtle' | 'plain' | 'surface'
type ChakraSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const VARIANT_TO_CHAKRA: Record<
  LegacyVariant,
  { variant: ChakraVariant; colorPalette?: string; extraClass?: string }
> = {
  default: { variant: 'solid', colorPalette: 'primary' },
  destructive: { variant: 'solid', colorPalette: 'danger' },
  outline: { variant: 'outline' },
  secondary: { variant: 'subtle', colorPalette: 'gray' },
  ghost: { variant: 'ghost' },
  link: {
    variant: 'plain',
    extraClass: 'underline-offset-4 hover:underline px-0 h-auto text-primary',
  },
}

const SIZE_TO_CHAKRA: Record<LegacySize, { size: ChakraSize; extraClass?: string }> = {
  default: { size: 'md' },
  sm: { size: 'sm' },
  lg: { size: 'lg' },
  icon: { size: 'md', extraClass: 'aspect-square px-0' },
  'icon-sm': { size: 'sm', extraClass: 'aspect-square px-0' },
  'icon-lg': { size: 'lg', extraClass: 'aspect-square px-0' },
}

type ChakraButtonProps = React.ComponentProps<typeof ChakraButton>

export type ButtonProps = Omit<ChakraButtonProps, 'variant' | 'size'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild, colorPalette, ...props },
  ref,
) {
  const v = (variant ?? 'default') as LegacyVariant
  const s = (size ?? 'default') as LegacySize
  const variantMap = VARIANT_TO_CHAKRA[v] ?? VARIANT_TO_CHAKRA.default
  const sizeMap = SIZE_TO_CHAKRA[s] ?? SIZE_TO_CHAKRA.default

  return (
    <ChakraButton
      ref={ref}
      data-slot="button"
      variant={variantMap.variant}
      colorPalette={colorPalette ?? variantMap.colorPalette}
      size={sizeMap.size}
      asChild={asChild}
      className={cn(variantMap.extraClass, sizeMap.extraClass, className)}
      {...props}
    />
  )
})

export { Button, buttonVariants }
