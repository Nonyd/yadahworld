const BREVO_API_BASE = 'https://api.brevo.com/v3'

function siteBaseUrl() {
  const u = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (u) return u.replace(/\/$/, '')
  return 'https://yadahworld.com'
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function addBrevoContact({
  email,
  name,
  listId,
}: {
  email: string
  name?: string
  listId: number
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return { success: false, error: 'BREVO_API_KEY not set' }

  try {
    const res = await fetch(`${BREVO_API_BASE}/contacts`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        attributes: name
          ? {
              FIRSTNAME: name.split(' ')[0],
              LASTNAME: name.split(' ').slice(1).join(' '),
            }
          : {},
        listIds: [listId],
        updateEnabled: true,
      }),
    })

    if (res.ok || res.status === 204) return { success: true }

    let data: { code?: string; message?: string } = {}
    try {
      data = (await res.json()) as { code?: string; message?: string }
    } catch {
      /* non-JSON body */
    }
    if (data.code === 'duplicate_parameter') return { success: true }
    return { success: false, error: data.message ?? `Brevo error (${res.status})` }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export async function sendBrevoTransactional({
  to,
  templateId,
  params,
}: {
  to: string
  templateId: number
  params?: Record<string, string>
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) return

  await fetch(`${BREVO_API_BASE}/smtp/email`, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: [{ email: to }],
      templateId,
      params: params ?? {},
    }),
  })
}

export async function sendBrevoWelcomeEmail({ email, name }: { email: string; name?: string }): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY?.trim()
  const templateIdRaw = process.env.BREVO_WELCOME_TEMPLATE_ID?.trim()
  const templateId = templateIdRaw ? parseInt(templateIdRaw, 10) : NaN

  if (apiKey && Number.isFinite(templateId) && templateId > 0) {
    await sendBrevoTransactional({
      to: email,
      templateId,
      params: { FIRSTNAME: name?.trim() ? name.trim().split(/\s+/)[0]! : 'Friend' },
    })
    return
  }

  const { renderEmailTemplate, sendMail } = await import('@/lib/mailer')
  const first = name?.trim() ? escapeHtml(name.trim().split(/\s+/)[0]!) : ''
  const unsubUrl = `${siteBaseUrl()}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`

  await sendMail({
    to: email,
    subject: "Welcome to Yadah's Ministry Updates",
    html: renderEmailTemplate({
      eyebrow: 'Yadah Newsletter',
      title: `Welcome${first ? `, ${first}` : ''}`,
      previewText: 'Thanks for subscribing to ministry updates.',
      intro:
        "Thank you for subscribing to ministry updates from Yadah. You will receive updates about new music releases, upcoming events, and moments from Yadah's ministry around the world.",
      bodyHtml: `<p style="margin: 14px 0; line-height: 1.7; color: #334155;">You are receiving this because you subscribed at yadahworld.com. <a href="${unsubUrl}" style="color:#6d28d9;">Unsubscribe</a></p>`,
      action: { label: 'Visit Yadahworld.com', href: siteBaseUrl() },
      signedBy: 'Yadah Media Team',
    }),
  })
}
