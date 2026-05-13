'use client'

import * as React from 'react'
import { Avatar as ArkAvatar } from '@ark-ui/react/avatar'

import { cn } from '@/lib/utils'

/**
 * HandCash Template Avatar — Ark UI Avatar behind a shadcn-shaped boundary.
 *
 *   <Avatar>
 *     <AvatarImage src="..." alt="..." />
 *     <AvatarFallback>JD</AvatarFallback>
 *   </Avatar>
 *
 * We deliberately use Ark UI directly here (not Chakra's `Avatar`) because
 * Chakra's Avatar recipe forces `width: var(--avatar-size)` and
 * `height: var(--avatar-size)` at the recipe layer with a default size of
 * "md" (sizes.10). Because the recipe sits in a higher CSS layer than
 * Tailwind utilities, consumer `size-*` classes lose the cascade and every
 * avatar collapses to a single size regardless of context.
 *
 * Ark UI gives us the same state machine (image load tracking, fallback
 * toggle, status events) without the sizing recipe, so Tailwind owns the
 * dimensions and per-location sizing works as expected.
 */

type AvatarRootProps = React.ComponentProps<typeof ArkAvatar.Root>

function Avatar({ className, ...props }: AvatarRootProps) {
  return (
    <ArkAvatar.Root
      data-slot="avatar"
      className={cn(
        'relative flex size-8 shrink-0 overflow-hidden rounded-full',
        className,
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof ArkAvatar.Image>) {
  return (
    <ArkAvatar.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full object-cover', className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof ArkAvatar.Fallback>) {
  return (
    <ArkAvatar.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'bg-muted flex size-full items-center justify-center rounded-full',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
