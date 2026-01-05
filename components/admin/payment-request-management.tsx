"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Loader2, Plus, QrCode, Copy, ExternalLink, Receipt, CheckCircle2, XCircle, ChevronDown } from "lucide-react"

interface CreatedPaymentRequest {
  id: string
  paymentUrl: string
  qrCode?: string
  amount: number
  currency: string
  denominationCurrency?: string
  description?: string
  destination?: string
  imageUrl?: string
  createdAt: string
  status?: string
  isEnabled?: boolean
  expiresAt?: string
  expirationType?: string
  expirationInSeconds?: number
  remainingUnits?: number
  paidCount?: number
  redirectUrl?: string
  customData?: any
}

export function PaymentRequestManagement() {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createdRequest, setCreatedRequest] = useState<CreatedPaymentRequest | null>(null)
  const [recentRequests, setRecentRequests] = useState<CreatedPaymentRequest[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [description, setDescription] = useState("")
  const [destination, setDestination] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [redirectUrl, setRedirectUrl] = useState("")
  const [expiresInMinutes, setExpiresInMinutes] = useState("")
  const [instrumentCurrency, setInstrumentCurrency] = useState("BSV")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateRequestId, setUpdateRequestId] = useState<string | null>(null)
  const [showAllRequests, setShowAllRequests] = useState(false)
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentRequests()
  }, [])

  const fetchPaymentRequests = async () => {
    setIsFetching(true)
    try {
      const response = await fetch("/api/admin/payment-requests", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Fetched payment requests:", data)

        const requests = Array.isArray(data) ? data : data.items || data.paymentRequests || []

        const mappedRequests: CreatedPaymentRequest[] = requests.map((req: any) => ({
          id: req.id,
          paymentUrl: req.paymentRequestUrl || req.paymentUrl || req.url || "",
          qrCode: req.paymentRequestQrCodeUrl || req.qrCodeUrl || req.qrCode || "",
          amount: req.paymentAmount?.amount || req.receivers?.[0]?.sendAmount || req.receivers?.[0]?.amount || 0,
          currency: req.paymentAmount?.currencyCode || req.currencyCode || req.instrumentCurrencyCode || "BSV",
          denominationCurrency: req.denominationCurrencyCode || req.currency || "USD",
          description: req.product?.description || req.product?.name || "",
          destination: req.receivers?.[0]?.destination || "",
          imageUrl: req.product?.imageUrl || "",
          createdAt: req.createdAt || req.created || new Date().toISOString(),
          status: req.status,
          isEnabled: req.isEnabled !== undefined ? req.isEnabled : req.enabled,
          expiresAt: req.expiresAt || req.expirationDate,
          expirationType: req.expirationType,
          expirationInSeconds: req.expirationInSeconds,
          remainingUnits: req.remainingUnits || req.remainingPayments,
          paidCount: req.paidCount || req.paymentCount,
          redirectUrl: req.redirectUrl,
          customData: req.customData,
        }))

        setRecentRequests(mappedRequests)
      }
    } catch (err) {
      console.error("Failed to fetch payment requests:", err)
    } finally {
      setIsFetching(false)
    }
  }

  const handleCreatePaymentRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const isUpdate = !!updateRequestId
      const url = isUpdate ? `/api/admin/payment-requests/${updateRequestId}` : "/api/admin/payment-requests"
      const method = isUpdate ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          currency,
          description: description || undefined,
          destination: destination || undefined,
          imageUrl: imageUrl || undefined,
          redirectUrl: redirectUrl || undefined,
          expiresInMinutes: expiresInMinutes ? Number.parseInt(expiresInMinutes) : undefined,
          instrumentCurrency,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorDetails = responseData.details
        let errorMessage = responseData.error || `Failed to ${isUpdate ? "update" : "create"} payment request`

        if (errorDetails) {
          if (typeof errorDetails === "string") {
            errorMessage = `${errorMessage}: ${errorDetails}`
          } else if (errorDetails.message) {
            errorMessage = `${errorMessage}: ${errorDetails.message}`
          } else {
            errorMessage = `${errorMessage}: ${JSON.stringify(errorDetails)}`
          }
        }

        throw new Error(errorMessage)
      }

      console.log("Full API response:", JSON.stringify(responseData, null, 2))

      const newRequest: CreatedPaymentRequest = {
        id: responseData.id,
        paymentUrl: responseData.paymentRequestUrl || responseData.paymentUrl || responseData.url || "",
        qrCode: responseData.paymentRequestQrCodeUrl || responseData.qrCodeUrl || responseData.qrCode || "",
        amount: Number.parseFloat(amount),
        currency,
        denominationCurrency: currency,
        description: description || undefined,
        destination: destination || undefined,
        imageUrl: imageUrl || undefined,
        createdAt: responseData.createdAt || new Date().toISOString(),
      }

      console.log("Mapped payment request:", newRequest)

      setSuccess(`Payment request ${isUpdate ? "updated" : "created"} successfully!`)
      setCreatedRequest(newRequest)

      if (isUpdate) {
        setRecentRequests((prev) => prev.map((req) => (req.id === updateRequestId ? newRequest : req)))
      } else {
        setRecentRequests((prev) => [newRequest, ...prev].slice(0, 10))
      }

      resetForm()
      setCreateDialogOpen(false)
    } catch (err: any) {
      const errorMessage = typeof err.message === "string" ? err.message : "Failed to create payment request"
      setError(errorMessage)
      console.error("Payment request creation error:", err)
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setAmount("")
    setCurrency("USD")
    setDescription("")
    setDestination("")
    setImageUrl("")
    setRedirectUrl("")
    setExpiresInMinutes("")
    setInstrumentCurrency("BSV")
    setIsUpdating(false)
    setUpdateRequestId(null)
  }

  const handleCopyRequest = (request: CreatedPaymentRequest) => {
    setAmount(request.amount.toString())
    setCurrency(request.denominationCurrency || request.currency)
    setDescription(request.description || "")
    setDestination(request.destination || "")
    setImageUrl(request.imageUrl || "")
    setInstrumentCurrency("BSV")
    setIsUpdating(false)
    setUpdateRequestId(null)
    setCreateDialogOpen(true)
  }

  const handleUpdateRequest = (request: CreatedPaymentRequest) => {
    setAmount(request.amount.toString())
    setCurrency(request.denominationCurrency || request.currency)
    setDescription(request.description || "")
    setDestination(request.destination || "")
    setImageUrl(request.imageUrl || "")
    setInstrumentCurrency("BSV")
    setIsUpdating(true)
    setUpdateRequestId(request.id)
    setCreateDialogOpen(true)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setSuccess(`${label} copied to clipboard!`)
    setTimeout(() => setSuccess(null), 2000)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      // Use a consistent format that works the same on server and client
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch {
      return dateString
    }
  }

  const handleDeletePaymentRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment request?")) {
      return
    }

    setIsDeleting(id)
    try {
      const response = await fetch(`/api/admin/payment-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete payment request")
      }

      setSuccess("Payment request deleted successfully!")
      setRecentRequests((prev) => prev.filter((req) => req.id !== id))
      if (createdRequest?.id === id) {
        setCreatedRequest(null)
      }
      setTimeout(() => setSuccess(null), 2000)
    } catch (err: any) {
      setError(err.message || "Failed to delete payment request")
      setTimeout(() => setError(null), 3000)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <Card className="p-4 md:p-6 rounded-3xl border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <h3 className="text-base md:text-lg font-semibold">Payment Requests</h3>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 md:h-10">
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] md:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">
                  {isUpdating ? "Update Payment Request" : "Create Payment Request"}
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm">
                  {isUpdating ? "Modify the payment request details." : "Generate a QR code and payment link."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePaymentRequest} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="amount" className="text-xs md:text-sm">
                      Amount *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="h-9 md:h-10 text-base"
                    />
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="pr-currency" className="text-xs md:text-sm">
                      Currency
                    </Label>
                    <Input id="pr-currency" value="USD" readOnly disabled className="h-9 md:h-10 bg-muted" />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="instrument-currency" className="text-xs md:text-sm">
                    Blockchain Currency *
                  </Label>
                  <Select value={instrumentCurrency} onValueChange={setInstrumentCurrency}>
                    <SelectTrigger id="instrument-currency" className="h-9 md:h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BSV">BSV (Bitcoin SV)</SelectItem>
                      <SelectItem value="MNEE">MNEE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="pr-description" className="text-xs md:text-sm">
                    Description
                  </Label>
                  <Textarea
                    id="pr-description"
                    placeholder="Payment for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="text-base"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="destination" className="text-xs md:text-sm">
                    Destination (HandCash Handle) *
                  </Label>
                  <Input
                    id="destination"
                    type="text"
                    placeholder="$handle"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="h-9 md:h-10 text-base"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="image-url" className="text-xs md:text-sm">
                    Product Image URL
                  </Label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/product.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="h-9 md:h-10 text-base"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="expires" className="text-xs md:text-sm">
                    Expires In (minutes)
                  </Label>
                  <Input
                    id="expires"
                    type="number"
                    min="1"
                    placeholder="30 (optional)"
                    value={expiresInMinutes}
                    onChange={(e) => setExpiresInMinutes(e.target.value)}
                    className="h-9 md:h-10 text-base"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="redirect-url" className="text-xs md:text-sm">
                    Redirect URL (optional)
                  </Label>
                  <Input
                    id="redirect-url"
                    type="url"
                    placeholder="https://yoursite.com/success"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    className="h-9 md:h-10 text-base"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-xs md:text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full h-10 md:h-11" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isUpdating ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      {isUpdating ? "Update Payment Request" : "Create Payment Request"}
                    </>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-4">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-xs md:text-sm text-green-600 dark:text-green-400">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && !createDialogOpen && (
          <Alert variant="destructive" className="mb-4">
            <XCircle className="w-4 h-4" />
            <AlertDescription className="text-xs md:text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Created Payment Request Display */}
        {createdRequest ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 md:p-6 bg-muted rounded-lg">
              {createdRequest.imageUrl && (
                <img
                  src={createdRequest.imageUrl || "/placeholder.svg"}
                  alt="Product"
                  className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-lg shrink-0"
                />
              )}
              {createdRequest.qrCode ? (
                <img
                  src={createdRequest.qrCode || "/placeholder.svg"}
                  alt="Payment QR Code"
                  className="w-48 h-48 md:w-56 md:h-56 rounded-lg bg-white p-2 shrink-0"
                />
              ) : (
                <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center bg-background rounded-lg border shrink-0">
                  <QrCode className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-lg md:text-xl font-semibold">
                {formatCurrency(createdRequest.amount, createdRequest.denominationCurrency || createdRequest.currency)}
              </p>
              {createdRequest.description && (
                <p className="text-xs md:text-sm text-muted-foreground mt-1">{createdRequest.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs md:text-sm">Payment URL</Label>
              <div className="flex gap-2">
                <Input
                  value={createdRequest.paymentUrl}
                  readOnly
                  className="h-9 md:h-10 text-xs md:text-sm font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 md:h-10 md:w-10 shrink-0 bg-transparent"
                  onClick={() => copyToClipboard(createdRequest.paymentUrl, "Payment URL")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 md:h-10 md:w-10 shrink-0 bg-transparent"
                  onClick={() => window.open(createdRequest.paymentUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 h-10 bg-transparent"
                onClick={() => handleCopyRequest(createdRequest)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="default" className="flex-1 h-10" onClick={() => handleUpdateRequest(createdRequest)}>
                Update
              </Button>
              <Button
                variant="destructive"
                className="flex-1 h-10"
                onClick={() => handleDeletePaymentRequest(createdRequest.id)}
                disabled={isDeleting === createdRequest.id}
              >
                {isDeleting === createdRequest.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 md:py-12">
            <Receipt className="w-10 h-10 md:w-12 md:h-12 mx-auto text-muted-foreground mb-3 md:mb-4" />
            <p className="text-sm md:text-base text-muted-foreground mb-1">No payment request created yet</p>
            <p className="text-xs text-muted-foreground mb-4">Create a payment request to generate a QR code</p>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent h-9"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Payment Request
            </Button>
          </div>
        )}
      </Card>

      {/* Recent Requests */}
      {recentRequests.length > 0 && (
        <Card className="p-4 md:p-6 rounded-3xl border-border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm md:text-base font-medium">All Payment Requests</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPaymentRequests}
              disabled={isFetching}
              className="h-8 text-xs"
            >
              {isFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
            </Button>
          </div>
          <div className="space-y-2">
            {(showAllRequests ? recentRequests : recentRequests.slice(0, 5)).map((req) => (
              <div key={req.id} className="border rounded-lg overflow-hidden">
                <div 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedRequestId(expandedRequestId === req.id ? null : req.id)}
                >
                  <div className="flex items-center gap-3">
                    {req.imageUrl && (
                      <img
                        src={req.imageUrl || "/placeholder.svg"}
                        alt="Product"
                        className="w-12 h-12 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {formatCurrency(req.amount, req.denominationCurrency || req.currency)}
                        </p>
                        {req.status && (
                          <Badge variant={req.status === "active" ? "default" : "secondary"} className="text-xs h-4">
                            {req.status}
                          </Badge>
                        )}
                        {req.isEnabled !== undefined && !req.status && (
                          <Badge variant={req.isEnabled ? "default" : "outline"} className="text-xs h-4">
                            {req.isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{req.description || "No description"}</p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0 mr-2">{formatDate(req.createdAt)}</p>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedRequestId === req.id ? "rotate-180" : ""}`} />
                  </div>
                </div>
                {expandedRequestId === req.id && (
                  <div className="border-t p-4 space-y-4 bg-muted/30">
                      <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 bg-muted rounded-lg">
                        {req.imageUrl && (
                          <img
                            src={req.imageUrl || "/placeholder.svg"}
                            alt="Product"
                            className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-lg shrink-0"
                          />
                        )}
                        {req.qrCode ? (
                          <img
                            src={req.qrCode || "/placeholder.svg"}
                            alt="Payment QR Code"
                            className="w-48 h-48 md:w-56 md:h-56 rounded-lg bg-white p-2 shrink-0"
                          />
                        ) : (
                          <div className="w-48 h-48 md:w-56 md:h-56 flex items-center justify-center bg-background rounded-lg border shrink-0">
                            <QrCode className="w-16 h-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <p className="text-lg md:text-xl font-semibold">
                          {formatCurrency(req.amount, req.denominationCurrency || req.currency)}
                        </p>
                        {req.description && (
                          <p className="text-xs md:text-sm text-muted-foreground mt-1">{req.description}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(req.status || req.isEnabled !== undefined) && (
                          <div className="space-y-2">
                            <Label className="text-xs md:text-sm">Status</Label>
                            <div className="flex items-center gap-2">
                              {req.status && (
                                <Badge variant={req.status === "active" ? "default" : "secondary"} className="text-xs">
                                  {req.status}
                                </Badge>
                              )}
                              {req.isEnabled !== undefined && (
                                <Badge variant={req.isEnabled ? "default" : "outline"} className="text-xs">
                                  {req.isEnabled ? "Enabled" : "Disabled"}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {(req.expiresAt || req.expirationType) && (
                          <div className="space-y-2">
                            <Label className="text-xs md:text-sm">Expiration</Label>
                            <div className="text-xs md:text-sm text-muted-foreground">
                              {req.expiresAt && <p>Expires: {formatDate(req.expiresAt)}</p>}
                              {req.expirationType && <p>Type: {req.expirationType}</p>}
                              {req.expirationInSeconds && (
                                <p>Duration: {Math.floor(req.expirationInSeconds / 60)} minutes</p>
                              )}
                            </div>
                          </div>
                        )}

                        {(req.remainingUnits !== undefined || req.paidCount !== undefined) && (
                          <div className="space-y-2">
                            <Label className="text-xs md:text-sm">Usage</Label>
                            <div className="text-xs md:text-sm text-muted-foreground">
                              {req.remainingUnits !== undefined && <p>Remaining: {req.remainingUnits}</p>}
                              {req.paidCount !== undefined && <p>Paid: {req.paidCount} time(s)</p>}
                            </div>
                          </div>
                        )}

                        {req.destination && (
                          <div className="space-y-2">
                            <Label className="text-xs md:text-sm">Destination</Label>
                            <p className="text-xs md:text-sm text-muted-foreground font-mono">{req.destination}</p>
                          </div>
                        )}

                        {req.redirectUrl && (
                          <div className="space-y-2">
                            <Label className="text-xs md:text-sm">Redirect URL</Label>
                            <p className="text-xs md:text-sm text-muted-foreground break-all">{req.redirectUrl}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs md:text-sm">Payment URL</Label>
                        <div className="flex gap-2">
                          <Input value={req.paymentUrl} readOnly className="h-9 md:h-10 text-xs md:text-sm font-mono" />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 md:h-10 md:w-10 shrink-0 bg-transparent"
                            onClick={() => copyToClipboard(req.paymentUrl, "Payment URL")}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 md:h-10 md:w-10 shrink-0 bg-transparent"
                            onClick={() => window.open(req.paymentUrl, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 h-10 bg-transparent"
                          onClick={() => handleCopyRequest(req)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant="default" className="flex-1 h-10" onClick={() => handleUpdateRequest(req)}>
                          Update
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 h-10"
                          onClick={() => handleDeletePaymentRequest(req.id)}
                          disabled={isDeleting === req.id}
                        >
                          {isDeleting === req.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </Button>
                      </div>
                  </div>
                )}
              </div>
            ))}
            {recentRequests.length > 5 && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAllRequests(!showAllRequests)}
                  className="rounded-full"
                >
                  {showAllRequests ? (
                    <>
                      Show Less
                    </>
                  ) : (
                    <>
                      Show More ({recentRequests.length - 5} more)
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
