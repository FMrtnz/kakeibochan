import { useState } from 'react'
import { TYPES } from '../../models/constants.js'
import { isValidExpense } from '../../models/expenseModel.js'
import { todayISO } from '../../utils/format.js'

// Form used both to create an expense and to edit one (when "initial" is given)
export default function ExpenseForm({ categories, initial, onSubmit, submitLabel, onNeedCategory }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')

  // An expense needs a category, so guide the user if none exists yet
  if (categories.length === 0) {
    return (
      <div className="empty">
        <p>You need at least one category before adding an expense.</p>
        {onNeedCategory && <button className="btn primary" onClick={onNeedCategory}>Create a category</button>}
      </div>
    )
  }

  const submit = (e) => {
    e.preventDefault()
    if (!isValidExpense({ amount, date, categoryId })) return
    onSubmit({ name, amount, date, categoryId })
    if (!initial) { setName(''); setAmount('') } // Reset only when creating
  }

  return (
    <form onSubmit={submit}>
      <label className="field">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly groceries" maxLength={60} />
      </label>

      <label className="field">
        <span>Amount (€)</span>
        <input type="number" inputMode="decimal" step="0.01" min="0.01" value={amount}
          onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
      </label>

      <label className="field">
        <span>Date</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>

      <label className="field">
        <span>Category</span>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Select a category...</option>
          {TYPES.map((t) => {
            const list = categories.filter((c) => c.type === t.id)
            return list.length > 0 && (
              <optgroup key={t.id} label={t.label}>
                {list.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            )
          })}
        </select>
      </label>

      <button className="btn primary" type="submit">{submitLabel}</button>
    </form>
  )
}
