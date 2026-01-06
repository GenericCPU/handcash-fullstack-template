import { promises as fs } from "fs"
import path from "path"

const PAYMENTS_FILE_PATH = path.join(process.cwd(), "data", "payments.json")

export interface Payment {
  id: string
  paymentRequestId: string
  transactionId: string
  amount: number
  currency: string
  paidBy?: string
  paidAt: string
  status: "completed" | "failed" | "cancelled"
  metadata?: Record<string, any>
}

async function ensureDataDirectory() {
  const dataDir = path.dirname(PAYMENTS_FILE_PATH)
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // Directory might already exist, ignore
  }
}

async function readPaymentsFile(): Promise<Payment[]> {
  try {
    await ensureDataDirectory()
    const fileContent = await fs.readFile(PAYMENTS_FILE_PATH, "utf-8")
    return JSON.parse(fileContent)
  } catch (error) {
    // File doesn't exist yet, return empty array
    return []
  }
}

async function writePaymentsFile(payments: Payment[]): Promise<void> {
  await ensureDataDirectory()
  await fs.writeFile(PAYMENTS_FILE_PATH, JSON.stringify(payments, null, 2), "utf-8")
}

export async function savePayment(payment: Payment): Promise<void> {
  const payments = await readPaymentsFile()
  
  // Check if payment with this ID already exists
  const existingIndex = payments.findIndex((p) => p.id === payment.id || p.transactionId === payment.transactionId)
  
  if (existingIndex >= 0) {
    // Update existing payment
    payments[existingIndex] = {
      ...payments[existingIndex],
      ...payment,
    }
  } else {
    // Add new payment
    payments.push({
      ...payment,
      paidAt: payment.paidAt || new Date().toISOString(),
    })
  }
  
  await writePaymentsFile(payments)
}

export async function getPaymentsByPaymentRequestId(paymentRequestId: string): Promise<Payment[]> {
  const payments = await readPaymentsFile()
  return payments.filter((p) => p.paymentRequestId === paymentRequestId).sort((a, b) => 
    new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
  )
}

export async function getAllPayments(): Promise<Payment[]> {
  const payments = await readPaymentsFile()
  return payments.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
}

export async function getPaymentById(paymentId: string): Promise<Payment | null> {
  const payments = await readPaymentsFile()
  return payments.find((p) => p.id === paymentId || p.transactionId === paymentId) || null
}

