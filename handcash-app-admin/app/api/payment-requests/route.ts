import { type NextRequest, NextResponse } from "next/server"

const HANDCASH_API_URL = "https://cloud.handcash.io/v3"

// POST - Create a new payment request
export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("handcash_auth_token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const {
      amount,
      currency,
      description,
      destination,
      imageUrl,
      redirectUrl,
      expiresInMinutes,
      customData,
      instrumentCurrency,
    } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }

    const receiverDestination = destination || process.env.ADMIN_HANDLE || "admin"
    const productImage = imageUrl || "https://www.handcash.io/images/handcash-logo.png"

    const paymentRequestData: any = {
      product: {
        name: description || "Payment Request",
        description: description || "Payment Request",
        imageUrl: productImage,
      },
      receivers: [
        {
          destination: receiverDestination,
          sendAmount: Number.parseFloat(amount.toString()),
        },
      ],
      instrumentCurrencyCode: instrumentCurrency || "BSV",
      denominationCurrencyCode: currency || "USD",
      expirationType: "never", // Required field: 'never', 'limit', or 'onPaymentCompleted'
    }

    if (redirectUrl) paymentRequestData.redirectUrl = redirectUrl
    if (customData) paymentRequestData.customData = customData

    if (expiresInMinutes && expiresInMinutes > 0) {
      paymentRequestData.expirationInSeconds = expiresInMinutes * 60
      paymentRequestData.expirationType = "limit" // Corrected to use 'limit' when expiration is set
    }

    const targetAppId = process.env.TARGET_APP_ID
    const targetAppSecret = process.env.TARGET_APP_SECRET

    if (!targetAppId || !targetAppSecret) {
      console.error("[v0] Missing TARGET credentials:", {
        hasAppId: !!targetAppId,
        hasSecret: !!targetAppSecret,
      })
      return NextResponse.json({ error: "Missing TARGET app credentials" }, { status: 500 })
    }

    const response = await fetch(`${HANDCASH_API_URL}/paymentRequests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "app-id": targetAppId,
        "app-secret": targetAppSecret,
      },
      body: JSON.stringify(paymentRequestData),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("[v0] HandCash API error:", response.status, result)
      return NextResponse.json(
        {
          error: "Failed to create payment request",
          details: result,
        },
        { status: response.status },
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Create payment request error:", error)
    return NextResponse.json(
      { error: "Failed to create payment request", details: error?.message || "Unknown error" },
      { status: 500 },
    )
  }
}

// GET - List payment requests
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("handcash_auth_token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    const targetAppId = process.env.TARGET_APP_ID
    const targetAppSecret = process.env.TARGET_APP_SECRET

    if (!targetAppId || !targetAppSecret) {
      return NextResponse.json({ error: "Missing TARGET app credentials" }, { status: 500 })
    }

    const url = new URL(`${HANDCASH_API_URL}/paymentRequests`)
    if (status) url.searchParams.set("status", status)

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "app-id": targetAppId,
        "app-secret": targetAppSecret,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("HandCash API error:", response.status, errorData)
      return NextResponse.json(
        { error: "Failed to fetch payment requests", details: errorData },
        { status: response.status },
      )
    }

    const result = await response.json()

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Fetch payment requests error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment requests", details: error?.message || "Unknown error" },
      { status: 500 },
    )
  }
}
