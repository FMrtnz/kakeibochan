// Small formatting and date helpers (no business logic here)

// Format a number as euros, e.g. 1234.5 -> "€1,234.50"
export const formatEuro = (n) =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(n || 0)

// Today's date as YYYY-MM-DD (local time, not UTC)
export const todayISO = () => {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// "2025-03-14" -> "2025-03"
export const monthOf = (isoDate) => isoDate.slice(0, 7)

// Week of the month: days 1-7 = week 1, 8-14 = week 2, ... 29+ = week 5
export const weekOfMonth = (isoDate) => Math.ceil(Number(isoDate.slice(8, 10)) / 7)

// "2025-03-14" -> "14 Mar 2025"
export const prettyDate = (isoDate) =>
  new Date(isoDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// Simple unique id
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
