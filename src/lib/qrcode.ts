import QRCode from 'qrcode'

/** QR payload is the raw ticket code so door scanners work without URL parsing. */
export async function generateQRCodeDataUrl(ticketCode: string): Promise<string> {
  const dataUrl = await QRCode.toDataURL(ticketCode.trim(), {
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
  return QRCode.toBuffer(ticketCode.trim(), {
    width: 400,
    margin: 2,
    color: {
      dark: '#2A2520',
      light: '#F7F3EC',
    },
    errorCorrectionLevel: 'H',
  })
}
