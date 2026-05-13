'use client'

import * as React from 'react'
import {
  Select as ChakraSelect,
  Portal,
  createListCollection,
  useSelectContext,
} from '@chakra-ui/react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * HandCash Template Select — Chakra v3 Select behind a Radix-shaped boundary.
 *
 * Radix-style children composition is preserved:
 *
 *   <Select value={x} onValueChange={setX}>
 *     <SelectTrigger>
 *       <SelectValue placeholder="..." />
 *     </SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="a">A</SelectItem>
 *       <SelectItem value="b">B</SelectItem>
 *     </SelectContent>
 *   </Select>
 *
 * Internally we walk children to build Chakra's required `collection` and
 * lift `value: string` <-> Chakra's `value: string[]` on the boundary.
 */

type HCSelectItem = { value: string; label: React.ReactNode; disabled?: boolean }

const SelectCollectionContext = React.createContext<
  ReturnType<typeof createListCollection<HCSelectItem>> | null
>(null)

const HC_TEMPLATE_SELECT_ITEM_FLAG = Symbol.for('HCSelectItem')

function collectItems(
  children: React.ReactNode,
  out: HCSelectItem[] = [],
): HCSelectItem[] {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    const elementType = child.type as { __hcTemplate?: symbol } | undefined
    if (elementType && elementType.__hcTemplate === HC_TEMPLATE_SELECT_ITEM_FLAG) {
      const itemProps = child.props as {
        value: string
        children?: React.ReactNode
        disabled?: boolean
      }
      out.push({
        value: itemProps.value,
        label: itemProps.children,
        disabled: itemProps.disabled,
      })
      return
    }
    const inner = (child.props as { children?: React.ReactNode })?.children
    if (inner != null) collectItems(inner, out)
  })
  return out
}

type ChakraSelectRootProps = React.ComponentProps<typeof ChakraSelect.Root>

type RadixSelectProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  required?: boolean
  name?: string
  children?: React.ReactNode
}

function Select({
  value,
  defaultValue,
  onValueChange,
  disabled,
  required,
  name,
  children,
  ...rest
}: RadixSelectProps &
  Omit<
    ChakraSelectRootProps,
    keyof RadixSelectProps | 'collection' | 'value' | 'defaultValue' | 'onValueChange'
  >) {
  const items = React.useMemo(() => collectItems(children), [children])
  const collection = React.useMemo(
    () =>
      createListCollection<HCSelectItem>({
        items,
        // `itemToString` powers the default ValueText / aria fallback. Items
        // can carry React node labels (icon + text), so we coerce gracefully:
        // strings pass through, anything else falls back to the `value` slug
        // — never the `[object Object]` stringification.
        itemToString: (item) =>
          typeof item.label === 'string' ? item.label : item.value,
        itemToValue: (item) => item.value,
      }),
    [items],
  )
  return (
    <SelectCollectionContext.Provider value={collection}>
      <ChakraSelect.Root
        collection={collection}
        value={value != null ? [value] : undefined}
        defaultValue={defaultValue != null ? [defaultValue] : undefined}
        onValueChange={
          onValueChange
            ? (details) => onValueChange(details.value[0] ?? '')
            : undefined
        }
        disabled={disabled}
        required={required}
        name={name}
        data-slot="select"
        positioning={{ sameWidth: true, gutter: 4 }}
        {...rest}
      >
        {children}
      </ChakraSelect.Root>
    </SelectCollectionContext.Provider>
  )
}

function SelectGroup(props: React.ComponentProps<typeof ChakraSelect.ItemGroup>) {
  return <ChakraSelect.ItemGroup data-slot="select-group" {...props} />
}

type RadixSelectValueProps = {
  placeholder?: string
  className?: string
}

/**
 * Pulls selected items from the surrounding Select context and renders each
 * item's React `label` (which may itself be JSX: icon + text, badges, etc.).
 *
 * Why this exists: `Select.ValueText`'s default behavior is to render
 * `children || valueAsString || placeholder`. With object-shaped items and no
 * custom children, Chakra falls back to `String(item)` for the value text,
 * which produces `[object Object],[object Object]`. We side-step that by
 * always providing custom children that read from the live select context.
 */
function SelectValueRenderer({ placeholder }: { placeholder?: string }) {
  const select = useSelectContext()
  const items = (select.selectedItems ?? []) as HCSelectItem[]
  if (items.length === 0) {
    return <span>{placeholder ?? ''}</span>
  }
  return (
    <>
      {items.map((item, idx) => (
        <React.Fragment key={String(item.value)}>
          {idx > 0 ? ', ' : null}
          {item.label}
        </React.Fragment>
      ))}
    </>
  )
}

function SelectValue({ placeholder, className }: RadixSelectValueProps) {
  return (
    <ChakraSelect.ValueText
      data-slot="select-value"
      className={cn('line-clamp-1', className)}
    >
      <SelectValueRenderer placeholder={placeholder} />
    </ChakraSelect.ValueText>
  )
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: React.ComponentProps<typeof ChakraSelect.Trigger> & {
  size?: 'sm' | 'default'
}) {
  return (
    <ChakraSelect.Control>
      <ChakraSelect.Trigger
        data-slot="select-trigger"
        data-size={size}
        className={cn(
          "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-elevation-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      >
        {children}
        <ChakraSelect.Indicator>
          <ChevronDownIcon className="size-4 opacity-50" />
        </ChakraSelect.Indicator>
      </ChakraSelect.Trigger>
    </ChakraSelect.Control>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ChakraSelect.Content>) {
  return (
    <Portal>
      <ChakraSelect.Positioner>
        <ChakraSelect.Content
          data-slot="select-content"
          className={cn(
            'bg-popover text-popover-foreground relative z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-elevation-md',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className,
          )}
          {...props}
        >
          <div className="p-1">{children}</div>
        </ChakraSelect.Content>
      </ChakraSelect.Positioner>
    </Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<'div'>) {
  // Plain element so the label can sit directly inside SelectContent without
  // requiring a SelectGroup wrapper. Mirrors Radix's Select.Label shape.
  return (
    <div
      role="presentation"
      data-slot="select-label"
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      {...props}
    />
  )
}

interface SelectItemProps extends Omit<React.ComponentProps<typeof ChakraSelect.Item>, 'item'> {
  value: string
  disabled?: boolean
}

function SelectItem({
  value,
  disabled,
  className,
  children,
  ...props
}: SelectItemProps) {
  const collection = React.useContext(SelectCollectionContext)
  const item: HCSelectItem = React.useMemo(() => {
    const fromCollection = collection?.items.find((i) => i.value === value)
    return fromCollection ?? { value, label: children, disabled }
  }, [collection, value, children, disabled])

  return (
    <ChakraSelect.Item
      item={item}
      data-slot="select-item"
      className={cn(
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        "[&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none",
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <ChakraSelect.ItemText>{children}</ChakraSelect.ItemText>
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <ChakraSelect.ItemIndicator>
          <CheckIcon className="size-4" />
        </ChakraSelect.ItemIndicator>
      </span>
    </ChakraSelect.Item>
  )
}
;(SelectItem as unknown as { __hcTemplate: symbol }).__hcTemplate = HC_TEMPLATE_SELECT_ITEM_FLAG

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      role="separator"
      data-slot="select-separator"
      className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

// Chakra Select scrolls natively; these are kept for source-compat only.
function SelectScrollUpButton(_: React.ComponentProps<'div'>) {
  return null
}

function SelectScrollDownButton(_: React.ComponentProps<'div'>) {
  return null
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
