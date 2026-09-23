export function sanitizeImageUrl(url?: string | null): string {
  if (!url) return "/placeholder.png"
  return url
    .replace(/http:\/\/localhost:9000/g, "https://api.nearsy.store")
    .replace(/http:\/\/127\.0\.0\.1:9000/g, "https://api.nearsy.store")
}
