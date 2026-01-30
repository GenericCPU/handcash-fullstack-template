import { NextResponse } from "next/server"
import { type NextRequest } from "next/server"
import { createCSRFToken } from "@/lib/csrf-utils"
import { generateAuthenticationKeyPair } from "@/lib/auth-utils"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"
import { logAuditEvent, AuditEventType } from "@/lib/audit-logger"
import { initializeAuditStorage } from "@/lib/audit-storage"

const HANDCASH_MARKET_URL = process.env.HANDCASH_MARKET_URL ?? "https://preprod-market.handcash.io"

export async function GET(request: NextRequest) {
  initializeAuditStorage().catch(() => {})

  const rateLimitResponse = rateLimit(request, RateLimitPresets.auth)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const appId = process.env.HANDCASH_APP_ID

    if (!appId) {
      return NextResponse.json(
        { error: "HandCash App ID not configured" },
        { status: 500 }
      )
    }

    const csrfToken = createCSRFToken(10)
    const { privateKey, publicKey } = generateAuthenticationKeyPair()

    const returnTo = `/connect?appId=${appId}&autoAuthorize=true&publicKey=${publicKey}&state=${csrfToken.value}`
    const params = new URLSearchParams({ appId, returnTo })
    const url = `${HANDCASH_MARKET_URL}/api/auth/google/app?${params.toString()}`

    const fetchResponse = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    const contentType = fetchResponse.headers.get("content-type") ?? ""
    const isJson = contentType.includes("application/json")

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text()
      if (!isJson || errorText.includes("<!DOCTYPE html>") || errorText.includes("<html")) {
        return NextResponse.json(
          {
            error: "Google OAuth endpoint not found on HandCash Market API",
            details: `Endpoint returned ${fetchResponse.status}. The Market API may not be deployed or path may be incorrect.`,
          },
          { status: 502 }
        )
      }
      return NextResponse.json(
        { error: "Failed to get Google OAuth URL", details: errorText },
        { status: fetchResponse.status }
      )
    }

    if (!isJson) {
      return NextResponse.json(
        {
          error: "Invalid response format from HandCash API",
          details: `Expected JSON, received ${contentType}`,
        },
        { status: 502 }
      )
    }

    const data = (await fetchResponse.json()) as { authUrl?: string; appId?: string }

    if (!data.authUrl) {
      return NextResponse.json(
        { error: "Invalid response from HandCash API", details: "Missing authUrl" },
        { status: 502 }
      )
    }

    const response = NextResponse.json({
      authUrl: data.authUrl,
      appId: data.appId,
    })

    response.cookies.set("handcash_temp_private_key", privateKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    })

    response.cookies.set("handcash_csrf_token", JSON.stringify(csrfToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    })

    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null
    const userAgent = request.headers.get("user-agent") ?? request.headers.get("x-forwarded-user-agent")

    logAuditEvent({
      type: AuditEventType.LOGIN_INITIATED,
      success: true,
      ipAddress,
      userAgent,
      details: { method: "google_oauth" },
    })

    return response
  } catch (error) {
    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : null
    const userAgent = request.headers.get("user-agent") ?? request.headers.get("x-forwarded-user-agent")

    logAuditEvent({
      type: AuditEventType.LOGIN_INITIATED,
      success: false,
      ipAddress,
      userAgent,
      details: { error: String(error), method: "google_oauth" },
    })

    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}
