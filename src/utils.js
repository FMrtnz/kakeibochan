// Category types (inspired by the Kakeibo method)
export const TYPES = [
  { id: 'survival', label: 'Survival', hint: 'Rent, food, transport...', color: '#F1416C' },
  { id: 'charges', label: 'Charges', hint: 'Subscriptions, bills, insurance...', color: '#7239EA' },
  { id: 'leisure', label: 'Leisure', hint: 'Hobbies, outings, treats...', color: '#17C653' }
]

export const getType = (id) => TYPES.find((t) => t.id === id) || TYPES[0]

// Colours used for the chart slices / bars (one per category)
export const PALETTE = ['#009EF7', '#7239EA', '#F1416C', '#17C653', '#FFC700', '#FF8A00', '#50CDCD', '#A1A5B7']

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

// Simple unique id
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

// "2025-03-14" -> "14 Mar 2025"
export const prettyDate = (isoDate) =>
  new Date(isoDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// Display name of an expense: its own name, or the category name if it has none
export const expenseLabel = (expense, category) => expense.name || category?.name || 'Unknown'
