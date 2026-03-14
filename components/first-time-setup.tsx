"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

const REDIRECT_URL_DISPLAY = "http://localhost:3000/auth/callback"
const REDIRECT_PATH_COPY = "http://localhost:3000/auth/callback"
const HANDCASH_DASHBOARD_URL = "https://dashboard.handcash.io"

const STEPS = [
  {
    title: "HandCash app credentials",
    optional: false,
    items: [
      "Add HANDCASH_APP_ID and HANDCASH_APP_SECRET to your environment (e.g. Vercel or local .env).",
      "Get them from the HandCash Developer Dashboard.",
    ],
  },
  {
    title: "Redirect URL",
    optional: false,
    items: [
      "Before you can connect with Handcash, configure your Handcash app with the following redirect URL:",
    ],
    copyableUrl: true,
    dashboardLine: "Add this URL to your Handcash app settings in the Handcash Dashboard.",
  },
  {
    title: "Set permissions",
    optional: true,
    items: [
      "In your HandCash app settings, configure which permissions your app requests (e.g. profile, pay, friends, inventory).",
    ],
  },
  {
    title: "Admin handle",
    optional: true,
    items: [
      "Set ADMIN_HANDLE to the HandCash handle of the user who can access the Admin Dashboard (no @ prefix, e.g. YourHandle).",
    ],
  },
  {
    title: "Business wallet token",
    optional: true,
    items: [
      "Set BUSINESS_AUTH_TOKEN to your HandCash business wallet auth token so the app can manage the business wallet (payments, inventory, minting, payment requests).",
    ],
  },
]

export function FirstTimeSetup() {
  const [copied, setCopied] = useState(false)

  const copyRedirectUrl = async () => {
    try {
      await navigator.clipboard.writeText(REDIRECT_PATH_COPY)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card className="rounded-3xl border-border bg-muted/30 p-6">
      <h2 className="text-lg font-semibold mb-4">First Time Setup</h2>
      <ol className="space-y-4 list-none">
        {STEPS.map((step, index) => (
          <li key={index} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-semibold">
              {index + 1}
            </span>
            <div className="min-w-0">
              <div className="font-medium text-sm mb-1">
                {step.title}
                {step.optional && (
                  <span className="ml-1.5 text-muted-foreground font-normal">(optional)</span>
                )}
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                {step.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              {"copyableUrl" in step && step.copyableUrl && (
                <>
                  <div className="mt-2 flex items-center gap-2 rounded-md p-3 border border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-900">
                    <code className="flex-1 break-all text-sm font-mono text-gray-900 dark:text-gray-100">
                      {REDIRECT_URL_DISPLAY}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={copyRedirectUrl}
                      aria-label="Copy redirect URL path"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    For local development. Use your deployment URL (e.g. https://yourapp.com/auth/callback) when not running locally.
                  </p>
                </>
              )}
              {"dashboardLine" in step && step.dashboardLine && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Add this URL to your Handcash app settings in the{" "}
                  <Link
                    href={HANDCASH_DASHBOARD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Handcash Dashboard
                  </Link>
                  .
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
