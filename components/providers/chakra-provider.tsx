'use client'

/**
 * HandCash Template Chakra UI provider.
 *
 * `ChakraProvider` from Chakra v3 takes a `value` prop containing the
 * system we built in `lib/chakra/system.ts`. We keep this thin and
 * client-side so it sits under our next-themes ThemeProvider in layout.
 */
import { ChakraProvider } from '@chakra-ui/react'
import { system } from '@/lib/chakra/system'

export function ChakraUIProvider({ children }: { children: React.ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>
}
