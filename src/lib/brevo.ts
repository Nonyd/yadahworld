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

  const { sendMail } = await import('@/lib/mailer')
  const first = name?.trim() ? escapeHtml(name.trim().split(/\s+/)[0]!) : ''
  const unsubUrl = `${siteBaseUrl()}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`

  await sendMail({
    to: email,
    subject: "Welcome to Yadah's Ministry Updates",
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px;
                  margin: 0 auto; padding: 40px 20px;
                  color: #2A2520; background: #F7F3EC;">
        <img
          src="https://res.cloudinary.com/dxliuat50/image/upload/v1777837569/Yadah_White_4x_cd09dg.png"
          alt="Yadah"
          style="height: 40px; width: auto;
                 filter: brightness(0); margin-bottom: 32px;"
        />
        <h1 style="font-size: 28px; font-weight: 400;
                   margin-bottom: 16px; color: #2A2520;">
          Welcome${first ? `, ${first}` : ''}.
        </h1>
        <p style="font-size: 16px; line-height: 1.8;
                  margin-bottom: 16px; color: #8A7F72;">
          Thank you for subscribing to ministry updates from Yadah.
        </p>
        <p style="font-size: 16px; line-height: 1.8;
                  margin-bottom: 16px; color: #8A7F72;">
          You will receive updates about new music releases,
          upcoming events, and moments from Yadah's ministry
          around the world.
        </p>
        <blockquote style="border-left: 2px solid #8B6914;
                           padding-left: 24px; margin: 32px 0;
                           font-style: italic; color: #2A2520;
                           font-size: 18px; line-height: 1.6;">
          "The Voice of Jesus Christ to Nations."
        </blockquote>
        <p style="font-size: 16px; line-height: 1.8;
                  color: #8A7F72; margin-bottom: 32px;">
          God bless you.
        </p>
        <a href="https://yadahworld.com"
           style="display: inline-block;
                  background: #6B2737; color: white;
                  padding: 12px 32px; text-decoration: none;
                  font-family: sans-serif; font-size: 11px;
                  letter-spacing: 0.2em; text-transform: uppercase;">
          Visit Yadahworld.com
        </a>
        <p style="font-size: 11px; color: #8A7F72;
                  margin-top: 40px; letter-spacing: 0.1em;">
          You are receiving this because you subscribed at
          yadahworld.com.
          <a href="${unsubUrl}"
             style="color: #8B6914;">
            Unsubscribe
          </a>
        </p>
      </div>
    `,
  })
}
