'use client'

import * as React from 'react'
import { Tabs as ChakraTabs } from '@chakra-ui/react'

import { cn } from '@/lib/utils'

/**
 * HandCash Template Tabs — Chakra v3 Tabs behind a Radix-shaped boundary.
 *
 *   <Tabs value={x} onValueChange={setX}>
 *     <TabsList>
 *       <TabsTrigger value="a">A</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="a">...</TabsContent>
 *   </Tabs>
 */

type ChakraTabsRootProps = React.ComponentProps<typeof ChakraTabs.Root>

type RadixTabsProps = Omit<ChakraTabsRootProps, 'onValueChange' | 'value'> & {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

function Tabs({ className, value, defaultValue, onValueChange, ...props }: RadixTabsProps) {
  return (
    <ChakraTabs.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={
        onValueChange ? (details) => onValueChange(details.value) : undefined
      }
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: React.ComponentProps<typeof ChakraTabs.List>) {
  return (
    <ChakraTabs.List
      data-slot="tabs-list"
      className={cn(
        'bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof ChakraTabs.Trigger>) {
  return (
    <ChakraTabs.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[selected]:bg-background dark:data-[selected]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[selected]:border-input dark:data-[selected]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[selected]:shadow-elevation-xs [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof ChakraTabs.Content>) {
  return (
    <ChakraTabs.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
