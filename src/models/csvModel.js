import { TYPES, getType } from './constants.js'
import { createCategory } from './categoryModel.js'
import { createExpense } from './expenseModel.js'

// Pure functions that convert app data <-> CSV text (no file handling here).
// One flat file: each row is an expense, with its category name and type.
// A category without any expense is a row with an empty date and amount.

export const CSV_HEADERS = ['Date', 'Name', 'Amount', 'Category', 'Type']

const pad = (n) => String(n).padStart(2, '0')

// ---------- App data -> CSV ----------
// With ";" amounts use a decimal comma (what Excel expects in France / Europe)
export const formatAmount = (n, separator) => {
  const s = Number(n).toFixed(2)
  return separator === ';' ? s.replace('.', ',') : s
}

// Stop spreadsheets from running a name like "=SUM(...)" as a formula
const safeText = (text) => (/^[=+\-@]/.test(text) ? "'" + text : text)

export function toRows(categories, expenses, separator) {
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]))
  const rows = [...expenses]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => {
      const c = catById[e.categoryId]
      return [e.date, safeText(e.name || ''), formatAmount(e.amount, separator), c?.name || '', c ? getType(c.type).label : '']
    })
  const used = new Set(expenses.map((e) => e.categoryId))
  categories.filter((c) => !used.has(c.id)).forEach((c) => rows.push(['', '', '', c.name, getType(c.type).label]))
  return rows
}

const escapeField = (value, separator) => {
  const s = String(value)
  return s.includes(separator) || /["\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const serializeCsv = (rows, separator) =>
  [CSV_HEADERS, ...rows].map((row) => row.map((v) => escapeField(v, separator)).join(separator)).join('\r\n')

// ---------- CSV -> rows of text ----------
// Detects the separator (",", ";" or tab) and handles quoted fields
export function parseCsv(text) {
  const src = text.replace(/^\uFEFF/, '')
  const firstLine = src.split(/\r?\n/, 1)[0]
  const count = (ch) => firstLine.split(ch).length - 1
  const sep = [',', ';', '\t'].reduce((best, ch) => (count(ch) > count(best) ? ch : best), ',')

  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch !== '"') field += ch
      else if (src[i + 1] === '"') { field += '"'; i++ } // Escaped quote
      else quoted = false
    } else if (ch === '"') quoted = true
    else if (ch === sep) { row.push(field); field = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(field); rows.push(row); row = []; field = ''
    } else field += ch
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  return rows
}

// ---------- Cell parsing ----------
// Accepts "2026-11-03", "03/11/2026" (day first) and similar
export const parseDate = (value) => {
  const s = String(value ?? '').trim()
  let y, m, d
  let match = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/)
  if (match) [, y, m, d] = match
  else if ((match = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/))) [, d, m, y] = match
  else return null
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  const valid = date.getMonth() === Number(m) - 1 && date.getDate() === Number(d)
  return valid ? `${y}-${pad(m)}-${pad(d)}` : null
}

// Accepts 12.5, "12,5", "€12.50", "1,234.50", "1.234,50"
export const parseAmount = (value) => {
  let s = String(value ?? '').replace(/[€\s]/g, '')
  if (s.includes(',') && s.includes('.')) {
    // The separator that comes last is the decimal one
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else s = s.replace(',', '.')
  const n = parseFloat(s)
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN
}

// "Survival" / "survival" -> "survival"
const parseType = (value) => {
  const s = String(value ?? '').trim().toLowerCase()
  return TYPES.find((t) => t.id === s || t.label.toLowerCase() === s)?.id ?? null
}

const isBlank = (cells) => cells.every((c) => String(c).trim() === '')
const expenseKey = (e) => `${e.date}|${(e.name || '').toLowerCase()}|${e.amount.toFixed(2)}|${e.categoryId}`

// ---------- Rows -> app data ----------
// mode "merge": add to existing data, skipping duplicates. mode "replace": start from scratch.
export function buildImport({ rows, existing, mode }) {
  const [header = [], ...body] = rows
  const col = (name) => header.findIndex((h) => String(h).trim().toLowerCase() === name)
  const idx = { date: col('date'), name: col('name'), amount: col('amount'), category: col('category'), type: col('type') }
  if (idx.category < 0) {
    throw new Error('Column "Category" not found in the first row. Download the example file to see the expected format.')
  }
  const cell = (cells, i) => (i >= 0 && cells[i] != null ? String(cells[i]).trim() : '')

  const categories = mode === 'replace' ? [] : [...existing.categories]
  const expenses = mode === 'replace' ? [] : [...existing.expenses]
  const seen = new Set(expenses.map(expenseKey))
  const report = { categoriesAdded: 0, expensesAdded: 0, duplicates: 0, errors: [] }

  body.forEach((cells, i) => {
    const row = i + 2 // Row number in the file (the header is row 1)
    if (isBlank(cells)) return

    // 1. The category (created if new)
    const catName = cell(cells, idx.category)
    if (!catName) { report.errors.push(`Row ${row}: category is missing`); return }
    let category = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase())
    if (!category) {
      const type = parseType(cell(cells, idx.type))
      if (!type) {
        report.errors.push(`Row ${row}: "${catName}" is a new category, so its Type is required (Survival, Charges or Leisure)`)
        return
      }
      category = createCategory({ name: catName, type })
      categories.push(category)
      report.categoriesAdded++
    }

    // 2. The expense (a row without date and amount only declares the category)
    const dateText = cell(cells, idx.date)
    const amountText = cell(cells, idx.amount)
    if (!dateText && !amountText) return
    const date = parseDate(dateText)
    const amount = parseAmount(amountText)
    if (!date || !(amount > 0)) { report.errors.push(`Row ${row}: invalid date or amount`); return }

    const name = cell(cells, idx.name).replace(/^'(?=[=+\-@])/, '') // Undo the export protection
    const expense = createExpense({ name, amount, date, categoryId: category.id })
    if (seen.has(expenseKey(expense))) { report.duplicates++; return }
    seen.add(expenseKey(expense))
    expenses.push(expense)
    report.expensesAdded++
  })

  return { categories, expenses, report }
}
