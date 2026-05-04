import QRCode from 'qrcode'

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export async function generateQRCodeDataUrl(ticketCode: string): Promise<string> {
  const url = `${siteUrl()}/tickets/${ticketCode}`

  const dataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: '#2A2520',
      light: '#F7F3EC',
    },
    errorCorrectionLevel: 'H',
  })

  return dataUrl
}

export async function generateQRCodeBuffer(ticketCode: string): Promise<Buffer> {
  const url = `${siteUrl()}/tickets/${ticketCode}`

  return QRCode.toBuffer(url, {
    width: 400,
    margin: 2,
    color: {
      dark: '#2A2520',
      light: '#F7F3EC',
    },
    errorCorrectionLevel: 'H',
  })
}
