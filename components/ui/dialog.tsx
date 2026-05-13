'use client'

import * as React from 'react'
import { Dialog as ChakraDialog, Portal, useDialogContext } from '@chakra-ui/react'
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

type RadixDialogProps = Omit<ChakraDialogRootProps, 'onOpenChange'> & {
  onOpenChange?: (open: boolean) => void
}

/**
 * Pass-through wrapper. Trusts Ark/Chakra's own state machine; consumer
 * setState → re-render → Ark watch effect → CONTROLLED.CLOSE → state
 * "closed". Any race that breaks dismissal lives in the consumer's
 * parent state, not here.
 */
function Dialog({ onOpenChange, ...props }: RadixDialogProps) {
  return (
    <ChakraDialog.Root
      onOpenChange={
        onOpenChange ? (details) => onOpenChange(details.open) : undefined
      }
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
        'fixed inset-0 z-50 bg-black/40',
        'data-[state=open]:animate-in data-[state=open]:fade-in-0',
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
  // Conditionally render based on the live dialog state. Same rationale
  // as DropdownMenuContent: presence + exit animation has repeatedly
  // failed to dismiss when re-renders / state-machine races interrupt
  // the close transition. Gating on `dialog.open` makes the close
  // synchronous and unconditional.
  const dialog = useDialogContext()
  if (!dialog.open) return null
  return (
    <Portal>
      <DialogOverlay />
      <ChakraDialog.Positioner className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ChakraDialog.Content
          data-slot="dialog-content"
          className={cn(
            'bg-background relative w-full max-w-[calc(100%-2rem)] overflow-hidden rounded-2xl border border-border p-5 shadow-lg sm:max-w-lg sm:p-6',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <ChakraDialog.CloseTrigger
              data-slot="dialog-close"
              className="absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4"
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
