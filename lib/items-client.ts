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

export async function resolveHandlesToUserIds(handles: string[], authToken: string): Promise<Record<string, string>> {
  const connect = getConnect()
  const account = connect.getAccountFromAuthToken(authToken)

  // Clean handles (remove $ prefix if present)
  const cleanHandles = handles.map((h) => h.replace(/^\$/, ""))

  // Batch resolve (API supports up to 10 at a time)
  const handleToUserId: Record<string, string> = {}

  for (let i = 0; i < cleanHandles.length; i += 10) {
    const batch = cleanHandles.slice(i, i + 10)
    const profiles = await account.profile.getPublicProfilesByHandle(batch)

    profiles.forEach((profile: { handle: string; id: string }) => {
      handleToUserId[profile.handle.toLowerCase()] = profile.id
    })
  }

  return handleToUserId
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
