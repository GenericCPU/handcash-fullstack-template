import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-middleware"
import { rateLimit, RateLimitPresets } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  const rateLimitResponse = rateLimit(request, RateLimitPresets.admin)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const adminResult = await requireAdmin(request)

  if (!adminResult.success) {
    return adminResult.response
  }

  try {
    const hasBusinessAuthToken = !!process.env.BUSINESS_AUTH_TOKEN
    const websiteUrl = process.env.WEBSITE_URL
    const isWebsiteUrlConfigured = !!websiteUrl && websiteUrl.trim() !== ""

    return NextResponse.json({
      success: true,
      hasBusinessAuthToken,
      config: {
        websiteUrl: isWebsiteUrlConfigured ? websiteUrl : null,
        websiteUrlConfigured: isWebsiteUrlConfigured,
        webhookUrl: isWebsiteUrlConfigured ? `${websiteUrl}/api/webhooks/payment` : null,
      },
    })
  } catch (error: any) {
    console.error("[Config] Config check error:", error)
    return NextResponse.json(
      {
        error: "Failed to check configuration",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}
