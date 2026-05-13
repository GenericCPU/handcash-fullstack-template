'use client'

import * as React from 'react'
import { Menu as ChakraMenu, Portal } from '@chakra-ui/react'
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * HandCash Template DropdownMenu — Chakra v3 Menu behind a Radix-shaped boundary.
 *
 * Positioning note: Chakra configures positioning on the Root machine, not
 * on Content. The wrapper defaults to `placement: 'bottom-start'` and
 * exposes a `placement`/`gutter` prop on `<DropdownMenu>`. Legacy `align`
 * / `sideOffset` props on `<DropdownMenuContent>` are accepted but no-ops.
 *
 * DropdownMenuLabel renders as a plain element rather than
 * Menu.ItemGroupLabel so consumers can place labels directly inside
 * Content without wrapping them in a group (matches Radix's API).
 */

type ChakraMenuRootProps = React.ComponentProps<typeof ChakraMenu.Root>

type RadixDropdownMenuProps = Omit<
  ChakraMenuRootProps,
  'open' | 'defaultOpen' | 'onOpenChange' | 'positioning'
> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Popper placement, default 'bottom-start' */
  placement?:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end'
    | 'right'
    | 'right-start'
    | 'right-end'
  /** Distance between trigger and content, default 4px */
  gutter?: number
}

/**
 * Pass-through wrapper. Trusts Ark's uncontrolled state machine — items
 * close themselves by transitioning to "closed" directly on ITEM_CLICK
 * and outside-click, no React state round-trip required.
 */
function DropdownMenu({
  onOpenChange,
  placement = 'bottom-start',
  gutter = 4,
  ...props
}: RadixDropdownMenuProps) {
  return (
    <ChakraMenu.Root
      onOpenChange={
        onOpenChange ? (details) => onOpenChange(details.open) : undefined
      }
      positioning={{ placement, gutter }}
      {...props}
    />
  )
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof ChakraMenu.Trigger>) {
  return <ChakraMenu.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuPortal({ children }: { children?: React.ReactNode }) {
  return <Portal>{children}</Portal>
}

type DropdownMenuContentLegacyProps = {
  /** @deprecated set `placement` on <DropdownMenu> instead */
  align?: 'start' | 'center' | 'end'
  /** @deprecated set `gutter` on <DropdownMenu> instead */
  sideOffset?: number
}

function DropdownMenuContent({
  className,
  align: _align,
  sideOffset: _sideOffset,
  ...props
}: React.ComponentProps<typeof ChakraMenu.Content> & DropdownMenuContentLegacyProps) {
  return (
    <Portal>
      <ChakraMenu.Positioner>
        <ChakraMenu.Content
          data-slot="dropdown-menu-content"
          className={cn(
            'bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-elevation-md outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
        />
      </ChakraMenu.Positioner>
    </Portal>
  )
}

function DropdownMenuGroup(props: React.ComponentProps<typeof ChakraMenu.ItemGroup>) {
  return <ChakraMenu.ItemGroup data-slot="dropdown-menu-group" {...props} />
}

type DropdownMenuItemExtraProps = {
  inset?: boolean
  variant?: 'default' | 'destructive'
  onSelect?: () => void
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  value,
  closeOnSelect = true,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof ChakraMenu.Item>, 'value' | 'onSelect'> &
  DropdownMenuItemExtraProps & {
    value?: string
  }) {
  const autoId = React.useId()
  return (
    <ChakraMenu.Item
      value={value ?? autoId}
      closeOnSelect={closeOnSelect}
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        'data-[variant=destructive]:text-danger data-[variant=destructive]:data-[highlighted]:bg-danger/10',
        'dark:data-[variant=destructive]:data-[highlighted]:bg-danger/20',
        'data-[variant=destructive]:data-[highlighted]:text-danger',
        'data-[variant=destructive]:*:[svg]:!text-danger',
        "[&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'data-[inset]:pl-8',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={onClick}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  closeOnSelect = true,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof ChakraMenu.CheckboxItem>, 'onCheckedChange'> & {
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <ChakraMenu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      checked={checked}
      closeOnSelect={closeOnSelect}
      onCheckedChange={onCheckedChange}
      className={cn(
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ChakraMenu.ItemIndicator>
          <CheckIcon className="size-4" />
        </ChakraMenu.ItemIndicator>
      </span>
      {children}
    </ChakraMenu.CheckboxItem>
  )
}

type DropdownMenuRadioGroupProps = Omit<
  React.ComponentProps<typeof ChakraMenu.RadioItemGroup>,
  'value' | 'onValueChange'
> & {
  /** Radix-style scalar value. */
  value?: string
  /** Radix-style scalar callback: `(value) => void`. */
  onValueChange?: (value: string) => void
}

function DropdownMenuRadioGroup({
  value,
  onValueChange,
  ...props
}: DropdownMenuRadioGroupProps) {
  // Translate the Radix-shaped scalar signature into Chakra's
  // `(details: { value: string }) => void` callback so existing consumers
  // (theme switchers, language pickers, etc.) keep working unchanged.
  return (
    <ChakraMenu.RadioItemGroup
      data-slot="dropdown-menu-radio-group"
      value={value}
      onValueChange={
        onValueChange ? (details) => onValueChange(details.value) : undefined
      }
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  closeOnSelect = true,
  onClick,
  ...props
}: React.ComponentProps<typeof ChakraMenu.RadioItem>) {
  return (
    <ChakraMenu.RadioItem
      data-slot="dropdown-menu-radio-item"
      closeOnSelect={closeOnSelect}
      className={cn(
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ChakraMenu.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ChakraMenu.ItemIndicator>
      </span>
      {children}
    </ChakraMenu.RadioItem>
  )
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<'div'> & { inset?: boolean }) {
  return (
    <div
      role="presentation"
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'px-2 py-1.5 text-sm font-medium data-[inset]:pl-8',
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ChakraMenu.Separator>) {
  return (
    <ChakraMenu.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-border -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'text-muted-foreground ml-auto text-xs tracking-widest',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Submenu support — Chakra exposes nested Menu.Root with `Menu.TriggerItem`
 * as the trigger inside the parent menu. We surface the legacy Radix
 * names for source-compat.
 */
function DropdownMenuSub({ ...props }: RadixDropdownMenuProps) {
  return <DropdownMenu placement="right-start" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ChakraMenu.TriggerItem> & {
  inset?: boolean
}) {
  return (
    <ChakraMenu.TriggerItem
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
        "[&_svg:not([class*='text-'])]:text-muted-foreground flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
        'data-[inset]:pl-8',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </ChakraMenu.TriggerItem>
  )
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ChakraMenu.Content>) {
  return (
    <Portal>
      <ChakraMenu.Positioner>
        <ChakraMenu.Content
          data-slot="dropdown-menu-sub-content"
          className={cn(
            'bg-popover text-popover-foreground z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-elevation-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
        />
      </ChakraMenu.Positioner>
    </Portal>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
