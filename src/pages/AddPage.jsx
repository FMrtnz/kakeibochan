import { useState } from 'react'
import { TYPES, todayISO } from '../utils.js'

// Page with two separate forms: one for categories, one for expenses
export default function AddPage({ categories, addCategory, addExpense }) {
  const [tab, setTab] = useState('expense')
  const [message, setMessage] = useState('')

  // Show a short confirmation message
  const flash = (text) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 2500)
  }

  return (
    <div className="card form-card">
      <div className="segmented">
        <button className={tab === 'expense' ? 'on' : ''} onClick={() => setTab('expense')}>
          New expense
        </button>
        <button className={tab === 'category' ? 'on' : ''} onClick={() => setTab('category')}>
          New category
        </button>
      </div>

      {message && <div className="toast">✓ {message}</div>}

      {tab === 'expense' ? (
        <ExpenseForm categories={categories} addExpense={addExpense} flash={flash} goToCategory={() => setTab('category')} />
      ) : (
        <CategoryForm addCategory={addCategory} flash={flash} />
      )}
    </div>
  )
}

// ---------- Category form: name + type ----------
function CategoryForm({ addCategory, flash }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('survival')

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    addCategory(name.trim(), type)
    setName('')
    flash('Category added')
  }

  return (
    <form onSubmit={submit}>
      <label className="field">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groceries" maxLength={40} required />
      </label>

      <div className="field">
        <span>Type</span>
        <div className="type-grid">
          {TYPES.map((t) => (
            <button
              type="button"
              key={t.id}
              className={'type-option' + (type === t.id ? ' on' : '')}
              style={{ '--c': t.color }}
              onClick={() => setType(t.id)}
            >
              <strong>{t.label}</strong>
              <small>{t.hint}</small>
            </button>
          ))}
        </div>
      </div>

      <button className="btn primary" type="submit">Add category</button>
    </form>
  )
}

// ---------- Expense form: amount + date + category ----------
function ExpenseForm({ categories, addExpense, flash, goToCategory }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [categoryId, setCategoryId] = useState('')

  // An expense needs a category, so guide the user if none exists yet
  if (categories.length === 0) {
    return (
      <div className="empty">
        <p>You need at least one category before adding an expense.</p>
        <button className="btn primary" onClick={goToCategory}>Create a category</button>
      </div>
    )
  }

  const submit = (e) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!value || value <= 0 || !categoryId) return
    addExpense(name.trim(), value, date, categoryId)
    setName('')
    setAmount('')
    flash('Expense added')
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

      <button className="btn primary" type="submit">Add expense</button>
    </form>
  )
}
