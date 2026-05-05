/** All shop amounts are stored in Nigerian kobo (smallest NGN unit). */

export function formatNgnKobo(kobo: number): string {
  const n = Math.round(kobo) / 100
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}
