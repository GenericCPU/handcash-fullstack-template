'use client'

import * as React from 'react'
import { NumberInput as ArkNumberInput } from '@ark-ui/react/number-input'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * NumberInput — raw Ark UI + Tailwind primitive.
 *
 * Chakra v3 does not ship a usable Number Input wrapper, so per
 * `.cursor/rules/ui-style-boundaries.mdc` Rule 8 we paste the Ark
 * primitive here and style it in Tailwind. Reference: Tark UI (tarkui.com).
 *
 * Shape mirrors our shadcn-style `components/ui/input.tsx` API:
 *   <NumberInput
 *     id="rake-pct"
 *     value={cashRakePercent}
 *     onValueChange={(d) => setCashRakePercent(d.value)}
 *     min={0}
 *     max={100}
 *     step={0.5}
 *   />
 *
 * Value type is `string` (matches Ark/Zag and the existing form state in
 * admin code). `valueAsNumber` is also exposed in the change details for
 * callers that prefer the parsed number.
 */

type ArkRootProps = React.ComponentProps<typeof ArkNumberInput.Root>

type NumberInputProps = Omit<
  ArkRootProps,
  'value' | 'defaultValue' | 'onValueChange' | 'asChild'
> & {
  value?: string
  defaultValue?: string
  onValueChange?: (details: { value: string; valueAsNumber: number }) => void
  placeholder?: string
  /** Forwarded to the inner <input> for label association. */
  id?: string
  /** Tailwind classes for the inner <input>. */
  inputClassName?: string
  /** Tailwind classes for the increment/decrement trigger column. */
  triggersClassName?: string
}

function NumberInput({
  value,
  defaultValue,
  onValueChange,
  placeholder,
  id,
  className,
  inputClassName,
  triggersClassName,
  min,
  max,
  step,
  disabled,
  readOnly,
  invalid,
  required,
  inputMode = 'decimal',
  formatOptions,
  allowMouseWheel,
  allowOverflow,
  clampValueOnBlur,
  spinOnPress,
  ...rest
}: NumberInputProps) {
  return (
    <ArkNumberInput.Root
      data-slot="number-input"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      readOnly={readOnly}
      invalid={invalid}
      required={required}
      inputMode={inputMode}
      formatOptions={formatOptions}
      allowMouseWheel={allowMouseWheel}
      allowOverflow={allowOverflow}
      clampValueOnBlur={clampValueOnBlur}
      spinOnPress={spinOnPress}
      className={cn('relative w-full', className)}
      {...rest}
    >
      <ArkNumberInput.Control
        data-slot="number-input-control"
        className={cn(
          'flex h-9 w-full items-center overflow-hidden rounded-md border border-input bg-transparent shadow-elevation-xs transition-[color,box-shadow]',
          'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
          'data-[invalid]:border-danger data-[invalid]:ring-danger/20',
          'data-[disabled]:pointer-events-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        )}
      >
        <ArkNumberInput.Input
          data-slot="number-input-input"
          id={id}
          placeholder={placeholder}
          className={cn(
            'min-w-0 flex-1 bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground md:text-sm',
            inputClassName,
          )}
        />
        <div
          data-slot="number-input-triggers"
          className={cn(
            'flex h-full flex-col border-l border-input',
            triggersClassName,
          )}
        >
          <ArkNumberInput.IncrementTrigger
            data-slot="number-input-increment"
            aria-label="Increment value"
            className={cn(
              'flex h-1/2 w-7 items-center justify-center text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
              'disabled:pointer-events-none disabled:opacity-30',
            )}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </ArkNumberInput.IncrementTrigger>
          <ArkNumberInput.DecrementTrigger
            data-slot="number-input-decrement"
            aria-label="Decrement value"
            className={cn(
              'flex h-1/2 w-7 items-center justify-center border-t border-input text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
              'disabled:pointer-events-none disabled:opacity-30',
            )}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </ArkNumberInput.DecrementTrigger>
        </div>
      </ArkNumberInput.Control>
    </ArkNumberInput.Root>
  )
}

NumberInput.displayName = 'NumberInput'

export { NumberInput }
export type { NumberInputProps }
