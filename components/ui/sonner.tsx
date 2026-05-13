'use client'

import * as React from 'react'
import {
  Toaster as ChakraToaster,
  Toast,
  createToaster,
  Spinner,
  Stack,
  Box,
} from '@chakra-ui/react'

import { cn } from '@/lib/utils'

/**
 * HandCash Template Toaster — Chakra v3 Toaster behind a sonner-compatible API.
 *
 * Consumers keep their existing call shape:
 *   import { toast } from '@/components/ui/sonner'
 *   toast.success('Saved', { description: '…' })
 *   toast.promise(p, { loading, success, error })
 *
 * Internally this routes to Chakra's `toaster` (createToaster) so the
 * rendered toast is themed by our system tokens. The legacy export name
 * `sonner.tsx` is kept so existing imports of `<Toaster>` keep working.
 */

const chakraToaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true,
  max: 5,
  overlap: false,
})

type SonnerOptions = {
  id?: string | number
  description?: React.ReactNode
  duration?: number
  action?:
    | {
        label: string
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
      }
    | React.ReactNode
  cancel?: {
    label: string
    onClick?: () => void
  }
  onDismiss?: () => void
  onAutoClose?: () => void
  closeButton?: boolean
  className?: string
}

type ChakraToastType = 'info' | 'success' | 'error' | 'warning' | 'loading'

function normalizeMessage(message: React.ReactNode, opts?: SonnerOptions, type?: ChakraToastType) {
  const id = opts?.id != null ? String(opts.id) : undefined
  const action = (() => {
    const a = opts?.action as
      | { label: string; onClick: (event?: unknown) => void }
      | undefined
    if (!a || typeof a !== 'object' || !('label' in a) || !('onClick' in a)) {
      return undefined
    }
    return {
      label: a.label,
      // sonner passes a MouseEvent to onClick; Chakra's signature is `() => void`.
      // Most consumers don't need the event, so we drop it on the floor.
      onClick: () => a.onClick(),
    }
  })()
  return {
    id,
    title: message,
    description: opts?.description,
    duration: opts?.duration,
    type,
    action,
    onStatusChange: opts?.onDismiss
      ? ({ status }: { status: string }) => {
          if (status === 'unmounted' && opts.onDismiss) opts.onDismiss()
        }
      : undefined,
  }
}

type ToastCallable = ((message: React.ReactNode, opts?: SonnerOptions) => string) & {
  success: (message: React.ReactNode, opts?: SonnerOptions) => string
  error: (message: React.ReactNode, opts?: SonnerOptions) => string
  info: (message: React.ReactNode, opts?: SonnerOptions) => string
  warning: (message: React.ReactNode, opts?: SonnerOptions) => string
  loading: (message: React.ReactNode, opts?: SonnerOptions) => string
  message: (message: React.ReactNode, opts?: SonnerOptions) => string
  dismiss: (id?: string | number) => void
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    msgs: {
      loading: React.ReactNode
      success: React.ReactNode | ((data: T) => React.ReactNode)
      error: React.ReactNode | ((err: unknown) => React.ReactNode)
    },
  ) => Promise<T>
  custom: (message: React.ReactNode, opts?: SonnerOptions) => string
}

const makeToast = (): ToastCallable => {
  const fn = ((message: React.ReactNode, opts?: SonnerOptions) =>
    chakraToaster.create(normalizeMessage(message, opts))) as ToastCallable
  fn.success = (message, opts) =>
    chakraToaster.create(normalizeMessage(message, opts, 'success'))
  fn.error = (message, opts) =>
    chakraToaster.create(normalizeMessage(message, opts, 'error'))
  fn.info = (message, opts) =>
    chakraToaster.create(normalizeMessage(message, opts, 'info'))
  fn.warning = (message, opts) =>
    chakraToaster.create(normalizeMessage(message, opts, 'warning'))
  fn.loading = (message, opts) =>
    chakraToaster.create(normalizeMessage(message, opts, 'loading'))
  fn.message = (message, opts) =>
    chakraToaster.create(normalizeMessage(message, opts))
  fn.custom = (message, opts) =>
    chakraToaster.create(normalizeMessage(message, opts))
  fn.dismiss = (id) => {
    if (id == null) chakraToaster.dismiss()
    else chakraToaster.dismiss(String(id))
  }
  fn.promise = (promise, msgs) => {
    const p = typeof promise === 'function' ? promise() : promise
    chakraToaster.promise(p, {
      loading: { title: msgs.loading },
      success: (data) => ({
        title:
          typeof msgs.success === 'function'
            ? (msgs.success as (data: unknown) => React.ReactNode)(data)
            : msgs.success,
      }),
      error: (err) => ({
        title:
          typeof msgs.error === 'function'
            ? (msgs.error as (err: unknown) => React.ReactNode)(err)
            : msgs.error,
      }),
    })
    return p
  }
  return fn
}

const toast: ToastCallable = makeToast()

function Toaster() {
  return (
    <ChakraToaster toaster={chakraToaster} insetInline={{ mdDown: '4' }}>
      {(t) => (
        <Toast.Root
          width={{ md: 'sm' }}
          className={cn(
            'group rounded-lg border bg-popover text-popover-foreground shadow-elevation-lg',
          )}
        >
          {t.type === 'loading' ? (
            <Spinner size="sm" color="colorPalette.solid" />
          ) : (
            <Toast.Indicator />
          )}
          <Stack gap="1" flex="1" maxWidth="100%">
            {t.title && (
              <Toast.Title className="text-sm font-medium">
                {t.title}
              </Toast.Title>
            )}
            {t.description && (
              <Toast.Description className="text-muted-foreground text-sm">
                {t.description}
              </Toast.Description>
            )}
          </Stack>
          {t.action && (
            <Toast.ActionTrigger className="text-sm font-medium underline-offset-4 hover:underline">
              {t.action.label}
            </Toast.ActionTrigger>
          )}
          {t.closable && <Toast.CloseTrigger asChild><Box as="button" /></Toast.CloseTrigger>}
        </Toast.Root>
      )}
    </ChakraToaster>
  )
}

export { Toaster, toast, chakraToaster as toaster }
