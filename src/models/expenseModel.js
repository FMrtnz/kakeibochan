import { uid, monthOf, weekOfMonth } from '../utils/format.js'

// Clean the fields coming from a form
export const buildExpenseFields = ({ name, amount, date, categoryId }) => ({
  name: name.trim(),
  amount: Number(amount),
  date,
  categoryId
})

// A new expense = cleaned fields + a unique id
export const createExpense = (fields) => ({ id: uid(), ...buildExpenseFields(fields) })

export const isValidExpense = ({ amount, date, categoryId }) =>
  Number(amount) > 0 && Boolean(date) && Boolean(categoryId)

// Display name of an expense: its own name, or the category name if it has none
export const expenseLabel = (expense, category) => expense.name || category?.name || 'Unknown'

// Sort options shown in the expense lists
export const SORT_OPTIONS = [
  { id: 'date-desc', label: 'Newest first' },
  { id: 'date-asc', label: 'Oldest first' },
  { id: 'amount-desc', label: 'Highest price first' },
  { id: 'amount-asc', label: 'Lowest price first' }
]

// Return a sorted copy. Ties on price are ordered by date (newest first).
export const sortExpenses = (expenses, sort) => {
  const list = [...expenses]
  switch (sort) {
    case 'date-asc': return list.sort((a, b) => a.date.localeCompare(b.date))
    case 'amount-desc': return list.sort((a, b) => b.amount - a.amount || b.date.localeCompare(a.date))
    case 'amount-asc': return list.sort((a, b) => a.amount - b.amount || b.date.localeCompare(a.date))
    default: return list.sort((a, b) => b.date.localeCompare(a.date))
  }
}

// Keep the expenses of a month ("YYYY-MM"), optionally of a single week (1-5 or "all")
export const filterByPeriod = (expenses, month, week = 'all') =>
  expenses.filter((e) => monthOf(e.date) === month && (week === 'all' || weekOfMonth(e.date) === week))

// Keep the expenses matching a filter: "all", "type:<typeId>" or "cat:<categoryId>"
export const filterByCategory = (expenses, categories, filter) => {
  if (filter.startsWith('type:')) {
    const ids = new Set(categories.filter((c) => c.type === filter.slice(5)).map((c) => c.id))
    return expenses.filter((e) => ids.has(e.categoryId))
  }
  if (filter.startsWith('cat:')) return expenses.filter((e) => e.categoryId === filter.slice(4))
  return expenses
}

export const sumAmounts = (expenses) => expenses.reduce((sum, e) => sum + e.amount, 0)

// Total spent per category type: [{ ...type, total }]
export const totalsByType = (expenses, categories, types) =>
  types.map((t) => ({
    ...t,
    total: sumAmounts(expenses.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === t.id))
  }))

// Total spent per category (only those with spending), ready for charts
export const totalsByCategory = (expenses, categories, palette) =>
  categories
    .map((c, i) => ({
      name: c.name,
      value: Math.round(sumAmounts(expenses.filter((e) => e.categoryId === c.id)) * 100) / 100,
      color: palette[i % palette.length]
    }))
    .filter((d) => d.value > 0)
