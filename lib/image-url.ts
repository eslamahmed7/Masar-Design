const CDN = '/image/upload/'

export function optimizeImageUrl(
  src: string | null | undefined,
  width = 1000,
): string {
  if (!src) return ''
  if (!src.includes(CDN)) return src
  const idx = src.indexOf(CDN)
  const base = src.slice(0, idx + CDN.length)
  const rest = src.slice(idx + CDN.length)
  if (!/^v\d+\//.test(rest)) {
    const wMatch = rest.match(/w_\d+/)
    if (wMatch && wMatch.index !== undefined) {
      return base + rest.slice(0, wMatch.index) + `w_${width}` + rest.slice(wMatch.index + wMatch[0].length)
    }
    return src
  }
  return `${base}f_auto,q_auto,w_${width}/${rest}`
}