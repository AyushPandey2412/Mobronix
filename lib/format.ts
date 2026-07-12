export function inr(n: number): string {
  return '₹' + (n ?? 0).toLocaleString('en-IN')
}
export function storageRange(storages: Record<string, unknown>): string {
  const keys = Object.keys(storages)
  if (!keys.length) return ''
  return keys.length === 1 ? keys[0] : `${keys[0]} – ${keys[keys.length - 1]}`
}
