'use client'

import * as React from 'react'
import { Accordion as ChakraAccordion } from '@chakra-ui/react'
import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * HandCash Template Accordion — Chakra v3 Accordion behind a Radix-shaped boundary.
 *
 *   <Accordion type="single" collapsible defaultValue="a">
 *     <AccordionItem value="a">
 *       <AccordionTrigger>Title</AccordionTrigger>
 *       <AccordionContent>Body</AccordionContent>
 *     </AccordionItem>
 *   </Accordion>
 *
 * Chakra (like Ark) stores value as `string[]` regardless of multi-select;
 * we lift the scalar shape so consumers keep the previous Radix API.
 */

type ChakraAccordionRootProps = React.ComponentProps<typeof ChakraAccordion.Root>

type RadixAccordionType = 'single' | 'multiple'

type RadixAccordionProps = Omit<
  ChakraAccordionRootProps,
  'value' | 'defaultValue' | 'onValueChange' | 'multiple'
> & {
  type?: RadixAccordionType
  /** Preserved for API parity with Radix; Chakra always supports collapsing single. */
  collapsible?: boolean
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

function toArray(v: string | string[] | undefined): string[] | undefined {
  if (v == null) return undefined
  return Array.isArray(v) ? v : [v]
}

function Accordion({
  type = 'single',
  collapsible: _collapsible,
  value,
  defaultValue,
  onValueChange,
  ...props
}: RadixAccordionProps) {
  const multiple = type === 'multiple'
  return (
    <ChakraAccordion.Root
      data-slot="accordion"
      multiple={multiple}
      value={toArray(value)}
      defaultValue={toArray(defaultValue)}
      onValueChange={
        onValueChange
          ? (details) =>
              onValueChange(multiple ? details.value : details.value[0] ?? '')
          : undefined
      }
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof ChakraAccordion.Item>) {
  return (
    <ChakraAccordion.Item
      data-slot="accordion-item"
      className={cn('border-b last:border-b-0', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ChakraAccordion.ItemTrigger>) {
  return (
    <ChakraAccordion.ItemTrigger
      data-slot="accordion-trigger"
      className={cn(
        'focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
    </ChakraAccordion.ItemTrigger>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ChakraAccordion.ItemContent>) {
  return (
    <ChakraAccordion.ItemContent
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn('pt-0 pb-4', className)}>{children}</div>
    </ChakraAccordion.ItemContent>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
