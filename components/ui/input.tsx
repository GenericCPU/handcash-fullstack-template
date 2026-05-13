'use client'

import * as React from 'react'
import { Input as ChakraInput } from '@chakra-ui/react'

import { cn } from '@/lib/utils'

/**
 * HandCash Template Input — Chakra v3 Input behind a shadcn-shaped boundary.
 * Keeps `type` prop and merges existing Tailwind classes; overrides Chakra's
 * default height back to `h-9` (36px) to match the rest of the form system.
 */
type InputProps = React.ComponentProps<typeof ChakraInput> & {
  type?: React.HTMLInputTypeAttribute
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type, ...props },
  ref,
) {
  return (
    <ChakraInput
      ref={ref}
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
})

export { Input }
