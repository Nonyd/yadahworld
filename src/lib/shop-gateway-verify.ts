import { prisma } from '@/lib/prisma'
import { fulfillShopCheckoutFromReference } from '@/lib/shop-checkout'
import { sendShopOrderEmails } from '@/lib/shop-emails'
import { getFlutterwaveConfig, getPayazaConfig, getPaystackConfig } from '@/lib/site-settings'

export async function verifyAndFulfillPaystack(reference: string): Promise<
  { ok: true; orderNumber: string } | { ok: false; error: string; status: number }
> {
  const { secretKey: secret } = await getPaystackConfig()
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
  const { secretKey: secret } = await getFlutterwaveConfig()
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

function payazaTxnSuccessPayload(json: unknown): { ok: boolean; amountKobo?: number; txnId?: string } {
  if (!json || typeof json !== 'object') return { ok: false }
  const root = json as Record<string, unknown>
  const data =
    root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : root

  const statusRaw = String(
    data.transaction_status ?? data.transactionStatus ?? root.transaction_status ?? '',
  ).toUpperCase()
  if (statusRaw && /FAIL|REJECT|CANCEL|ERROR|REVERSAL/.test(statusRaw)) return { ok: false }

  const code = String(data.response_code ?? root.response_code ?? '')
  const paidByStatus =
    /NIP_SUCCESS|SUCCESS|COMPLETED|TRANSACTION_SUCCESSFUL|successful|paid/i.test(statusRaw) || statusRaw === 'OK'
  const pendingish = /INITIATED|PENDING|QUEUE|PROCESSING/i.test(statusRaw)
  const paidByCode = (code === '00' || code === '0') && !pendingish
  const ok = paidByStatus || paidByCode

  let amountKobo: number | undefined
  const amt =
    data.requested_amount ?? data.amount ?? data.transaction_amount ?? root.requested_amount ?? root.amount
  if (typeof amt === 'number' && Number.isFinite(amt)) {
    amountKobo = amt >= 1000 ? Math.round(amt) : Math.round(amt * 100)
  } else if (typeof amt === 'string' && amt.trim()) {
    const n = parseFloat(amt.replace(/,/g, ''))
    if (Number.isFinite(n)) amountKobo = n >= 1000 ? Math.round(n) : Math.round(n * 100)
  }

  const idRaw = data.transaction_id ?? data.id ?? root.transaction_id
  const txnId = typeof idRaw === 'number' ? String(idRaw) : typeof idRaw === 'string' ? idRaw : undefined

  return { ok, amountKobo, txnId }
}

export async function verifyAndFulfillPayaza(reference: string): Promise<
  { ok: true; orderNumber: string } | { ok: false; error: string; status: number }
> {
  const config = await getPayazaConfig()
  if (!config.secretKey) return { ok: false, error: 'Payaza is not configured.', status: 503 }

  const baseUrl =
    config.mode === 'live' ? 'https://api.payaza.africa' : 'https://sandbox.payaza.africa'

  const res = await fetch(
    `${baseUrl}/send-request/checkout/transaction-status/${encodeURIComponent(reference)}`,
    {
      headers: {
        'Payaza-Auth': `Bearer ${config.secretKey}`,
      },
    },
  )

  let json: unknown
  try {
    json = await res.json()
  } catch {
    return { ok: false, error: 'Invalid response from Payaza.', status: 502 }
  }

  const parsed = payazaTxnSuccessPayload(json)
  if (!parsed.ok) {
    const msg =
      typeof json === 'object' && json !== null && 'message' in json && typeof (json as { message?: unknown }).message === 'string'
        ? (json as { message: string }).message
        : 'Payaza verification failed.'
    return { ok: false, error: msg, status: 400 }
  }

  const session = await prisma.shopCheckoutSession.findUnique({
    where: { reference },
    select: { total: true },
  })
  const paidKobo = parsed.amountKobo ?? session?.total
  if (paidKobo == null) {
    return { ok: false, error: 'Payaza response missing amount; cannot verify order total.', status: 400 }
  }

  const paymentRef = `payaza_${parsed.txnId ?? reference}`

  const dup = await prisma.order.findFirst({ where: { paymentRef } })
  if (dup) return { ok: true, orderNumber: dup.orderNumber }

  const out = await fulfillShopCheckoutFromReference({
    reference,
    paidAmountKobo: paidKobo,
    paymentRef,
    gateway: 'payaza',
  })
  if (!out.ok) return { ok: false, error: out.error, status: out.status ?? 400 }

  try {
    await sendShopOrderEmails(out.orderNumber)
  } catch (e) {
    console.error('sendShopOrderEmails', e)
  }
  return { ok: true, orderNumber: out.orderNumber }
}
