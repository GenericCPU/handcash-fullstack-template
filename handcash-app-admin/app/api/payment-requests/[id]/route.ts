import { type NextRequest, NextResponse } from "next/server"

const HANDCASH_API_URL = "https://cloud.handcash.io/v3"

// GET - Get a single payment request by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authToken = request.cookies.get("handcash_auth_token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params

    const targetAppId = process.env.TARGET_APP_ID
    const targetAppSecret = process.env.TARGET_APP_SECRET

    if (!targetAppId || !targetAppSecret) {
      return NextResponse.json({ error: "Missing TARGET app credentials" }, { status: 500 })
    }

    const response = await fetch(`${HANDCASH_API_URL}/paymentRequests/${id}`, {
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
        { error: "Failed to fetch payment request", details: errorData },
        { status: response.status },
      )
    }

    const result = await response.json()

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Fetch payment request error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment request", details: error?.message || "Unknown error" },
      { status: 500 },
    )
  }
}

// PUT - Update a payment request by ID
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authToken = request.cookies.get("handcash_auth_token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const targetAppId = process.env.TARGET_APP_ID
    const targetAppSecret = process.env.TARGET_APP_SECRET

    if (!targetAppId || !targetAppSecret) {
      return NextResponse.json({ error: "Missing TARGET app credentials" }, { status: 500 })
    }

    // Map the request body to HandCash API format
    const updateData: any = {}

    if (body.description || body.imageUrl) {
      updateData.product = {}
      if (body.description) {
        updateData.product.name = body.description
        updateData.product.description = body.description
      }
      if (body.imageUrl) {
        updateData.product.imageUrl = body.imageUrl
      }
    }

    if (body.redirectUrl) {
      updateData.redirectUrl = body.redirectUrl
    }

    if (body.expiresInMinutes) {
      updateData.expirationInSeconds = body.expiresInMinutes * 60
    }

    const response = await fetch(`${HANDCASH_API_URL}/paymentRequests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "app-id": targetAppId,
        "app-secret": targetAppSecret,
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("HandCash API error:", response.status, errorData)
      return NextResponse.json(
        { error: "Failed to update payment request", details: errorData },
        { status: response.status },
      )
    }

    const result = await response.json()

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Update payment request error:", error)
    return NextResponse.json(
      { error: "Failed to update payment request", details: error?.message || "Unknown error" },
      { status: 500 },
    )
  }
}

// DELETE - Cancel a payment request
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authToken = request.cookies.get("handcash_auth_token")?.value
    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { id } = await params

    const targetAppId = process.env.TARGET_APP_ID
    const targetAppSecret = process.env.TARGET_APP_SECRET

    if (!targetAppId || !targetAppSecret) {
      return NextResponse.json({ error: "Missing TARGET app credentials" }, { status: 500 })
    }

    const response = await fetch(`${HANDCASH_API_URL}/paymentRequests/${id}`, {
      method: "DELETE",
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
        { error: "Failed to cancel payment request", details: errorData },
        { status: response.status },
      )
    }

    const text = await response.text()
    const result = text ? JSON.parse(text) : { message: "Payment request cancelled successfully" }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Cancel payment request error:", error)
    return NextResponse.json(
      { error: "Failed to cancel payment request", details: error?.message || "Unknown error" },
      { status: 500 },
    )
  }
}
