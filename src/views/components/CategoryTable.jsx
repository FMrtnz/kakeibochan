import { useState } from 'react'
import { getType } from '../../models/constants.js'
import CategoryForm from './CategoryForm.jsx'
import Modal from './Modal.jsx'

// Table of categories with Edit / Delete buttons
export default function CategoryTable({ categories, expenses, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null) // Category being edited, or null

  const remove = (c) => {
    const count = expenses.filter((e) => e.categoryId === c.id).length
    if (window.confirm(`Delete "${c.name}" and its ${count} expense(s)?`)) onDelete(c.id)
  }

  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Type</th><th className="right">Actions</th></tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr><td colSpan="3" className="muted center">No category yet.</td></tr>
            )}
            {categories.map((c) => {
              const type = getType(c.type)
              return (
                <tr key={c.id}>
                  <td data-label="Name">{c.name}</td>
                  <td data-label="Type"><span className="badge" style={{ '--c': type.color }}>{type.label}</span></td>
                  <td className="right actions">
                    <button className="btn-sm" onClick={() => setEditing(c)}>Edit</button>
                    <button className="btn-sm danger" onClick={() => remove(c)}>Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="Edit category" onClose={() => setEditing(null)}>
          <CategoryForm
            initial={editing}
            submitLabel="Save changes"
            onSubmit={(fields) => { onUpdate(editing.id, fields); setEditing(null) }}
          />
        </Modal>
      )}
    </>
  )
}
