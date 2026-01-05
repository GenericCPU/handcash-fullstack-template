import { getInstance } from "@handcash/sdk"

// Get SDK instance for the TARGET APP (the app being managed)
export function getTargetAppSDK() {
  const appId = process.env.TARGET_APP_ID
  const appSecret = process.env.TARGET_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error("Target App credentials not configured (TARGET_APP_ID, TARGET_APP_SECRET required)")
  }

  return getInstance({
    appId,
    appSecret,
  })
}

// Get SDK instance for the AUTH APP (used for admin authentication)
export function getAuthAppSDK() {
  const appId = process.env.AUTH_APP_ID
  const appSecret = process.env.AUTH_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error("Auth App credentials not configured (AUTH_APP_ID, AUTH_APP_SECRET required)")
  }

  return getInstance({
    appId,
    appSecret,
  })
}

// Get business client for target app operations
export function getBusinessClient() {
  const businessAuthToken = process.env.BUSINESS_AUTH_TOKEN

  if (!businessAuthToken) {
    throw new Error("BUSINESS_AUTH_TOKEN not configured")
  }

  const sdk = getTargetAppSDK()
  return sdk.getAccountClient(businessAuthToken)
}

export function getAdminHandle(): string {
  const adminHandle = process.env.ADMIN_HANDLE
  if (!adminHandle) {
    throw new Error("ADMIN_HANDLE not configured")
  }
  return adminHandle.replace("@", "").toLowerCase()
}

// Helper to get auth app ID for login redirect
export function getAuthAppId(): string {
  const appId = process.env.AUTH_APP_ID
  if (!appId) {
    throw new Error("AUTH_APP_ID not configured")
  }
  return appId
}

// Helper to get auth app secret for JWT signing
export function getAuthAppSecret(): string {
  const appSecret = process.env.AUTH_APP_SECRET
  if (!appSecret) {
    throw new Error("AUTH_APP_SECRET not configured")
  }
  return appSecret
}
