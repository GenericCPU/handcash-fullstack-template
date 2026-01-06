import { getInstance, Connect } from "@handcash/sdk"
import { HandCashMinter, HandCashConnect } from "@handcash/handcash-connect"

let sdkInstance: ReturnType<typeof getInstance> | null = null
let minterInstance: HandCashMinter | null = null
let connectInstance: HandCashConnect | null = null

export function getHandCashSDK() {
  if (sdkInstance) {
    return sdkInstance
  }

  const appId = process.env.HANDCASH_APP_ID
  const appSecret = process.env.HANDCASH_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error("HandCash App credentials not configured (HANDCASH_APP_ID, HANDCASH_APP_SECRET required)")
  }

  sdkInstance = getInstance({
    appId,
    appSecret,
  })

  return sdkInstance
}

export function getMinter() {
  if (minterInstance) {
    return minterInstance
  }

  const appId = process.env.HANDCASH_APP_ID
  const appSecret = process.env.HANDCASH_APP_SECRET
  const authToken = process.env.BUSINESS_AUTH_TOKEN

  if (!appId || !appSecret || !authToken) {
    throw new Error(
      "HandCash App minter credentials not configured (HANDCASH_APP_ID, HANDCASH_APP_SECRET, BUSINESS_AUTH_TOKEN required)",
    )
  }

  minterInstance = HandCashMinter.fromAppCredentials({
    appId,
    appSecret,
    authToken,
  })

  return minterInstance
}

export function getConnect() {
  if (connectInstance) {
    return connectInstance
  }

  const appId = process.env.HANDCASH_APP_ID
  const appSecret = process.env.HANDCASH_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error("HandCash App credentials not configured (HANDCASH_APP_ID, HANDCASH_APP_SECRET required)")
  }

  connectInstance = new HandCashConnect({
    appId,
    appSecret,
  })

  return connectInstance
}

/**
 * Resolve handles and user IDs to user IDs
 * Accepts both handles and user IDs - IDs are passed through, handles are resolved
 * Returns a map from original input (lowercased) to user ID
 */
export async function resolveHandlesToUserIds(inputs: string[], authToken: string): Promise<Record<string, string>> {
  const connect = getConnect()
  const account = connect.getAccountFromAuthToken(authToken)

  // Separate IDs and handles
  const userIds: string[] = []
  const handles: string[] = []
  const inputToLower: Record<string, string> = {} // Map lowercase input to original for lookup

  inputs.forEach((input) => {
    const trimmed = input.trim()
    const lower = trimmed.toLowerCase()
    inputToLower[lower] = trimmed

    // Check if it's a user ID (hex string, 24+ chars)
    if (/^[a-f0-9]{24,}$/i.test(trimmed)) {
      userIds.push(trimmed)
    } else {
      // Clean handle (remove $/@ prefix)
      const cleaned = trimmed.replace(/^[@$]/, "")
      handles.push(cleaned)
    }
  })

  // Start with IDs (map to themselves)
  const result: Record<string, string> = {}
  userIds.forEach((id) => {
    result[id.toLowerCase()] = id
  })

  // Resolve handles to IDs (API supports up to 10 at a time)
  for (let i = 0; i < handles.length; i += 10) {
    const batch = handles.slice(i, i + 10)
    try {
      const profiles = await account.profile.getPublicProfilesByHandle(batch)
      profiles.forEach((profile: { handle: string; id: string }) => {
        const handleLower = profile.handle.toLowerCase()
        result[handleLower] = profile.id
      })
    } catch (error) {
      console.error(`[ItemsClient] Error resolving batch of handles:`, error)
      // Continue with next batch - handles that don't exist just won't be in the map
    }
  }

  return result
}

export const getMinterClient = getMinter

export function getAccountClient(authToken: string) {
  const sdk = getHandCashSDK()
  return sdk.getAccountClient(authToken)
}

export function getBusinessClient() {
  const businessAuthToken = process.env.BUSINESS_AUTH_TOKEN

  if (!businessAuthToken) {
    throw new Error("BUSINESS_AUTH_TOKEN not configured")
  }

  const sdk = getHandCashSDK()
  return sdk.getAccountClient(businessAuthToken)
}

export { Connect }

export function clearClients() {
  sdkInstance = null
  minterInstance = null
  connectInstance = null
}
