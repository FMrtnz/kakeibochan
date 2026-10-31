import { useState } from 'react'
import { TYPES } from '../../models/constants.js'
import { isValidCategory } from '../../models/categoryModel.js'

// Form used both to create a category and to edit one (when "initial" is given)
export default function CategoryForm({ initial, onSubmit, submitLabel }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState(initial?.type ?? 'survival')

  const submit = (e) => {
    e.preventDefault()
    if (!isValidCategory({ name, type })) return
    onSubmit({ name, type })
    if (!initial) setName('') // Reset only when creating
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

      <button className="btn primary" type="submit">{submitLabel}</button>
    </form>
  )
}
