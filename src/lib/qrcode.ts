import QRCode from 'qrcode'

type QrOpts = { width?: number }

/** QR payload is the raw ticket code so door scanners work without URL parsing. */
export async function generateQRCodeDataUrl(ticketCode: string, opts?: QrOpts): Promise<string> {
  const width = opts?.width ?? 400
  const dataUrl = await QRCode.toDataURL(ticketCode.trim(), {
    width,
    margin: 2,
    color: {
      dark: '#2A2520',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  })

  return dataUrl
}

export async function generateQRCodeBuffer(ticketCode: string, opts?: QrOpts): Promise<Buffer> {
  const width = opts?.width ?? 400
  return QRCode.toBuffer(ticketCode.trim(), {
    width,
    margin: 2,
    color: {
      dark: '#2A2520',
      light: '#F7F3EC',
    },
    errorCorrectionLevel: 'H',
  })
}
