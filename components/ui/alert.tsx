'use client'

import * as React from 'react'
import { Alert as ChakraAlert } from '@chakra-ui/react'

import { cn } from '@/lib/utils'

/**
 * HandCash Template Alert — Chakra v3 Alert behind a shadcn-shaped boundary.
 *
 *   <Alert variant="destructive">
 *     <AlertTitle>...</AlertTitle>
 *     <AlertDescription>...</AlertDescription>
 *   </Alert>
 */

type LegacyVariant = 'default' | 'destructive'
type ChakraStatus = 'neutral' | 'info' | 'success' | 'warning' | 'error'

const VARIANT_TO_STATUS: Record<LegacyVariant, ChakraStatus> = {
  default: 'neutral',
  destructive: 'error',
}

type AlertProps = Omit<
  React.ComponentProps<typeof ChakraAlert.Root>,
  'status' | 'variant'
> & {
  variant?: LegacyVariant
}

function Alert({ className, variant = 'default', children, ...props }: AlertProps) {
  return (
    <ChakraAlert.Root
      data-slot="alert"
      role="alert"
      status={VARIANT_TO_STATUS[variant] ?? 'neutral'}
      className={cn(
        'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
        variant === 'default' && 'bg-card text-card-foreground',
        variant === 'destructive' &&
          'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
        className,
      )}
      {...props}
    >
      {children}
    </ChakraAlert.Root>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <ChakraAlert.Title
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <ChakraAlert.Description
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed break-words',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
