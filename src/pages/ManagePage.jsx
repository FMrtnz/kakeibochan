import { TYPES, getType, formatEuro, expenseLabel, prettyDate } from '../utils.js'

// Lists all categories and expenses, with delete buttons
export default function ManagePage({ categories, expenses, deleteCategory, deleteExpense }) {
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]))
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date))

  const confirmDeleteCategory = (c) => {
    if (window.confirm(`Delete "${c.name}" and all of its expenses?`)) deleteCategory(c.id)
  }

  return (
    <div className="grid-2">
      <section className="card">
        <h2>Categories</h2>
        {categories.length === 0 && <p className="muted">No category yet.</p>}
        {TYPES.map((t) => {
          const list = categories.filter((c) => c.type === t.id)
          if (list.length === 0) return null
          return (
            <div key={t.id} className="group">
              <div className="group-title" style={{ color: t.color }}>{t.label}</div>
              {list.map((c) => (
                <div key={c.id} className="row">
                  <span>{c.name}</span>
                  <button className="icon-btn" aria-label={`Delete ${c.name}`} onClick={() => confirmDeleteCategory(c)}>🗑</button>
                </div>
              ))}
            </div>
          )
        })}
      </section>

      <section className="card">
        <h2>Expenses</h2>
        {sorted.length === 0 && <p className="muted">No expense yet.</p>}
        {sorted.map((e) => {
          const cat = catById[e.categoryId]
          return (
            <div key={e.id} className="row">
              <div>
                <div>{expenseLabel(e, cat)}</div>
                <small className="muted">{cat?.name} · {prettyDate(e.date)}</small>
              </div>
              <div className="row-end">
                <strong style={{ color: cat ? getType(cat.type).color : undefined }}>{formatEuro(e.amount)}</strong>
                <button className="icon-btn" aria-label="Delete expense" onClick={() => deleteExpense(e.id)}>🗑</button>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
