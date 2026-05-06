import type { Order, OrderItem } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { renderEmailTemplate, sendMail } from '@/lib/mailer'
import { getNotifyEmail } from '@/lib/site-settings'
import { escapeHtml } from '@/lib/security'
import { formatNgnKobo } from '@/lib/shop-money'

type OrderWithItems = Order & { items: OrderItem[] }

function itemsTableHtml(order: OrderWithItems): string {
  const rows = order.items
    .map(
      (it) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${escapeHtml(it.name)}${it.variantLabel ? `<br/><span style="color:#64748b;font-size:12px;">${escapeHtml(it.variantLabel)}</span>` : ''}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${it.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatNgnKobo(it.price * it.quantity)}</td>
    </tr>`,
    )
    .join('')
  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      <thead><tr>
        <th align="left" style="padding:8px;border-bottom:2px solid #cbd5e1;">Item</th>
        <th align="center" style="padding:8px;border-bottom:2px solid #cbd5e1;">Qty</th>
        <th align="right" style="padding:8px;border-bottom:2px solid #cbd5e1;">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`
}

function shippingBlock(order: OrderWithItems): string {
  const addr = order.shippingAddress as Record<string, string> | null | undefined
  if (!addr?.street) {
    return `<p style="margin:12px 0 6px;"><strong>Delivery:</strong> Digital — download link will be provided</p>`
  }
  return `
    <p style="margin:12px 0 6px;font-weight:600;">Shipping Details</p>
    <p style="margin:0 0 4px;line-height:1.6;color:#334155;">
      Shipping to:<br/>
      ${escapeHtml(addr.name || order.customerName)}<br/>
      ${escapeHtml(addr.street)}<br/>
      ${escapeHtml(addr.city)}, ${escapeHtml(addr.state)}${addr.zip ? ` ${escapeHtml(addr.zip)}` : ''}<br/>
      ${escapeHtml(addr.country)}
    </p>
    <p style="margin:0;line-height:1.6;color:#334155;">
      Shipping fee: ${formatNgnKobo(order.shippingFee)}
    </p>`
}

export async function sendShopOrderEmails(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  })
  if (!order) return

  const itemsHtml = itemsTableHtml(order)
  const summary = `
    ${itemsHtml}
    <p style="margin:8px 0;"><strong>Subtotal:</strong> ${formatNgnKobo(order.subtotal)}</p>
    <p style="margin:8px 0;"><strong>Shipping:</strong> ${formatNgnKobo(order.shippingFee)}</p>
    <p style="margin:8px 0;font-size:18px;"><strong>Total:</strong> ${formatNgnKobo(order.total)}</p>
    ${shippingBlock(order)}
  `

  const customerHtml = renderEmailTemplate({
    previewText: `Order ${order.orderNumber} received`,
    title: `Your order #${order.orderNumber} has been received`,
    greeting: `Hi ${escapeHtml(order.customerName)},`,
    intro: 'Thank you for your purchase. Here is a summary of your order.',
    bodyHtml: summary,
    footerNote: "We'll notify you when your order ships.",
  })

  await sendMail({
    to: order.customerEmail,
    subject: `Your order #${order.orderNumber} has been received`,
    html: customerHtml,
  })

  const adminTo = await getNotifyEmail()
  const gw = order.paymentGateway ? escapeHtml(order.paymentGateway) : '—'
  const adminHtml = renderEmailTemplate({
    previewText: `New order ${order.orderNumber}`,
    title: `New order #${order.orderNumber} — ${formatNgnKobo(order.total)}`,
    intro: `Payment gateway: ${gw}`,
    bodyHtml: `
      <p><strong>Customer:</strong> ${escapeHtml(order.customerName)} &lt;${escapeHtml(order.customerEmail)}&gt;</p>
      ${order.customerPhone ? `<p><strong>Phone:</strong> ${escapeHtml(order.customerPhone)}</p>` : ''}
      ${summary}
    `,
  })

  await sendMail({
    to: adminTo,
    subject: `New order #${order.orderNumber} — ${formatNgnKobo(order.total)}`,
    html: adminHtml,
  })
}

export async function sendShopOrderStatusEmail(order: OrderWithItems, statusLabel: string) {
  const track =
    order.status === 'SHIPPED' && order.trackingNumber
      ? `<p><strong>Tracking:</strong> ${escapeHtml(order.trackingNumber)}</p>`
      : ''
  const html = renderEmailTemplate({
    previewText: `Order ${order.orderNumber} update`,
    title: `Your order #${order.orderNumber} has been ${statusLabel}`,
    greeting: `Hi ${escapeHtml(order.customerName)},`,
    intro: `Your order status is now: <strong>${escapeHtml(statusLabel)}</strong>.`,
    bodyHtml: `${track}<p style="color:#64748b;font-size:13px;">Estimated delivery depends on the carrier. Reply to this email if you have questions.</p>`,
  })
  await sendMail({
    to: order.customerEmail,
    subject: `Your order #${order.orderNumber} has been ${statusLabel}`,
    html,
  })
}
