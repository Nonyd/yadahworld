import { prisma } from '@/lib/prisma'
import { fulfillShopCheckoutFromReference } from '@/lib/shop-checkout'
import { paystackSecret, flutterwaveSecret, payazaSecret } from '@/lib/shop-payments'
import { sendShopOrderEmails } from '@/lib/shop-emails'

async function getSettings() {
  return prisma.siteSettings.findUnique({ where: { id: 1 } })
}

export async function verifyAndFulfillPaystack(reference: string): Promise<
  { ok: true; orderNumber: string } | { ok: false; error: string; status: number }
> {
  const settings = await getSettings()
  const secret = paystackSecret(settings)
  if (!secret) return { ok: false, error: 'Paystack is not configured.', status: 503 }

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  const json = (await res.json()) as {
    status?: boolean
    message?: string
    data?: { status?: string; amount?: number; id?: number }
  }
  if (!json.status || json.data?.status !== 'success' || json.data.amount == null || json.data.id == null) {
    return { ok: false, error: json.message || 'Payment verification failed.', status: 400 }
  }

  const paymentRef = `paystack_${json.data.id}`
  const dup = await prisma.order.findFirst({ where: { paymentRef } })
  if (dup) return { ok: true, orderNumber: dup.orderNumber }

  const paid = json.data.amount
  const out = await fulfillShopCheckoutFromReference({
    reference,
    paidAmountKobo: paid,
    paymentRef,
    gateway: 'paystack',
  })
  if (!out.ok) return { ok: false, error: out.error, status: out.status ?? 400 }

  try {
    await sendShopOrderEmails(out.orderNumber)
  } catch (e) {
    console.error('sendShopOrderEmails', e)
  }
  return { ok: true, orderNumber: out.orderNumber }
}

export async function verifyAndFulfillFlutterwave(txRef: string): Promise<
  { ok: true; orderNumber: string } | { ok: false; error: string; status: number }
> {
  const settings = await getSettings()
  const secret = flutterwaveSecret(settings)
  if (!secret) return { ok: false, error: 'Flutterwave is not configured.', status: 503 }

  const res = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  })
  const json = (await res.json()) as {
    status?: string
    message?: string
    data?: { status?: string; amount?: number; id?: number; currency?: string }
  }
  if (json.status !== 'success' || !json.data || json.data.status !== 'successful') {
    return { ok: false, error: json.message || 'Flutterwave verification failed.', status: 400 }
  }

  const amount = json.data.amount
  const txId = json.data.id
  if (amount == null || txId == null) {
    return { ok: false, error: 'Flutterwave response missing amount or id.', status: 400 }
  }

  const paidKobo = Math.round(amount * 100)
  const paymentRef = `flutterwave_${txId}`

  const dup = await prisma.order.findFirst({ where: { paymentRef } })
  if (dup) return { ok: true, orderNumber: dup.orderNumber }

  const out = await fulfillShopCheckoutFromReference({
    reference: txRef,
    paidAmountKobo: paidKobo,
    paymentRef,
    gateway: 'flutterwave',
  })
  if (!out.ok) return { ok: false, error: out.error, status: out.status ?? 400 }

  try {
    await sendShopOrderEmails(out.orderNumber)
  } catch (e) {
    console.error('sendShopOrderEmails', e)
  }
  return { ok: true, orderNumber: out.orderNumber }
}

/** Payaza: wire the status/verify endpoint from your Payaza merchant docs into this function. */
export async function verifyAndFulfillPayaza(reference: string): Promise<
  { ok: true; orderNumber: string } | { ok: false; error: string; status: number }
> {
  void reference
  const secret = payazaSecret()
  if (!secret) return { ok: false, error: 'Payaza is not configured.', status: 503 }
  return {
    ok: false,
    error:
      'Payaza server verification is not wired yet. After Payaza confirms the transaction on their dashboard, implement verify in src/lib/shop-gateway-verify.ts (see PAYAZA_SECRET_KEY / api.payaza.africa).',
    status: 501,
  }
}
