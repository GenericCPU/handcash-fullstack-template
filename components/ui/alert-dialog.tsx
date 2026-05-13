'use client'

import * as React from 'react'
import { Dialog as ChakraDialog, Portal, useDialogContext } from '@chakra-ui/react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

/**
 * HandCash Template AlertDialog — Chakra v3 Dialog in `role="alertdialog"` mode.
 *
 * AlertDialogs differ from Dialogs by:
 *   - Using `role="alertdialog"` for assistive tech
 *   - Disabling close-on-outside-click and (by default) close-on-escape
 *   - Requiring an explicit Action/Cancel rather than a close button X
 *
 * Consumer API preserved from the previous Radix wrapper.
 */

type ChakraDialogRootProps = React.ComponentProps<typeof ChakraDialog.Root>

type RadixAlertDialogProps = Omit<ChakraDialogRootProps, 'onOpenChange' | 'role'> & {
  onOpenChange?: (open: boolean) => void
}

function AlertDialog({ onOpenChange, ...props }: RadixAlertDialogProps) {
  return (
    <ChakraDialog.Root
      role="alertdialog"
      closeOnInteractOutside={false}
      onOpenChange={onOpenChange ? (details) => onOpenChange(details.open) : undefined}
      {...props}
    />
  )
}

function AlertDialogTrigger(props: React.ComponentProps<typeof ChakraDialog.Trigger>) {
  return <ChakraDialog.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal({ children }: { children?: React.ReactNode }) {
  return <Portal>{children}</Portal>
}

function AlertDialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof ChakraDialog.Backdrop>) {
  return (
    <ChakraDialog.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/40',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ChakraDialog.Content>) {
  const dialog = useDialogContext()
  if (!dialog.open) return null
  return (
    <Portal>
      <AlertDialogOverlay />
      <ChakraDialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ChakraDialog.Content
          data-slot="alert-dialog-content"
          className={cn(
            'bg-background grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-2xl border border-border p-5 shadow-lg sm:max-w-lg sm:p-6',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            className,
          )}
          {...props}
        >
          {children}
        </ChakraDialog.Content>
      </ChakraDialog.Positioner>
    </Portal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof ChakraDialog.Title>) {
  return (
    <ChakraDialog.Title
      data-slot="alert-dialog-title"
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof ChakraDialog.Description>) {
  return (
    <ChakraDialog.Description
      data-slot="alert-dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof ChakraDialog.CloseTrigger>) {
  return (
    <ChakraDialog.CloseTrigger
      data-slot="alert-dialog-action"
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<typeof ChakraDialog.CloseTrigger>) {
  return (
    <ChakraDialog.CloseTrigger
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
