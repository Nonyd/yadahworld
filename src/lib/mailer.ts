import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
})

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!process.env.BREVO_SMTP_PASS) return
  await transporter.sendMail({
    from: `"${process.env.BREVO_FROM_NAME ?? 'Yadah'}" <${process.env.BREVO_FROM_EMAIL ?? 'noreply@yadahworld.com'}>`,
    to,
    subject,
    html,
  })
}
