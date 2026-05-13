'use client'

import * as React from 'react'
import { Dialog as ChakraDialog, Portal } from '@chakra-ui/react'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * HandCash Template Dialog — Chakra v3 Dialog behind a Radix-shaped boundary.
 *
 * Consumer-facing props mirror the previous Radix/Ark wrapper:
 *   <Dialog open={open} onOpenChange={setOpen}>
 *     <DialogTrigger>...</DialogTrigger>
 *     <DialogContent>
 *       <DialogHeader>...</DialogHeader>
 *       <DialogTitle>...</DialogTitle>
 *       <DialogDescription>...</DialogDescription>
 *     </DialogContent>
 *   </Dialog>
 *
 * `onOpenChange` is translated to Chakra's `(details: { open: boolean })`
 * shape; `DialogContent` auto-mounts Portal + Backdrop + Positioner.
 */

type ChakraDialogRootProps = React.ComponentProps<typeof ChakraDialog.Root>

type RadixDialogProps = Omit<
  ChakraDialogRootProps,
  'open' | 'defaultOpen' | 'onOpenChange'
> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Always-controlled wrapper around Chakra v3 Dialog. Holds the truth of
 * `open` locally and forwards it to Chakra/Ark. Every close path — close
 * button, programmatic close, Escape, outside click — routes through
 * `handleOpenChange`, which flips the prop synchronously so the dialog
 * cannot be re-asserted open by a parent re-render race.
 *
 * Consumers passing `open`/`onOpenChange` keep working — we mirror their
 * value and notify on every change.
 */
function Dialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  ...props
}: RadixDialogProps) {
  const isControlled = controlledOpen !== undefined
  const [internalOpen, setInternalOpen] = React.useState<boolean>(
    controlledOpen ?? defaultOpen,
  )

  React.useEffect(() => {
    if (isControlled) setInternalOpen(controlledOpen)
  }, [isControlled, controlledOpen])

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  return (
    <ChakraDialog.Root
      open={isControlled ? controlledOpen : internalOpen}
      onOpenChange={(details) => handleOpenChange(details.open)}
      {...props}
    />
  )
}

function DialogTrigger(props: React.ComponentProps<typeof ChakraDialog.Trigger>) {
  return <ChakraDialog.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <Portal>{children}</Portal>
}

function DialogClose(props: React.ComponentProps<typeof ChakraDialog.CloseTrigger>) {
  return <ChakraDialog.CloseTrigger data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof ChakraDialog.Backdrop>) {
  return (
    <ChakraDialog.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

type DialogContentExtraProps = {
  showCloseButton?: boolean
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof ChakraDialog.Content> & DialogContentExtraProps) {
  return (
    <Portal>
      <DialogOverlay />
      <ChakraDialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ChakraDialog.Content
          data-slot="dialog-content"
          className={cn(
            'bg-background relative w-full max-w-[calc(100%-2rem)] rounded-lg border p-6 shadow-elevation-lg sm:max-w-lg overflow-hidden',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'duration-200',
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <ChakraDialog.CloseTrigger
              data-slot="dialog-close"
              className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </ChakraDialog.CloseTrigger>
          )}
        </ChakraDialog.Content>
      </ChakraDialog.Positioner>
    </Portal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof ChakraDialog.Title>) {
  return (
    <ChakraDialog.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold break-words', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof ChakraDialog.Description>) {
  return (
    <ChakraDialog.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm break-words', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
