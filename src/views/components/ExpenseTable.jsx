import { useState } from 'react'
import { getType } from '../../models/constants.js'
import { expenseLabel } from '../../models/expenseModel.js'
import { formatEuro, prettyDate } from '../../utils/format.js'
import ExpenseForm from './ExpenseForm.jsx'
import ReceiptViewer from './ReceiptViewer.jsx'
import Modal from './Modal.jsx'

// Table of expenses (already sorted and filtered by the controller).
// Each row can show its receipt, be edited or deleted.
export default function ExpenseTable({ expenses, categories, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(null) // Expense being edited
  const [viewing, setViewing] = useState(null) // Expense whose receipt is shown
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]))

  const remove = (e) => {
    if (window.confirm(`Delete "${expenseLabel(e, catById[e.categoryId])}"?`)) onDelete(e.id)
  }

  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Date</th><th>Name</th><th>Category</th><th className="right">Amount</th><th className="right">Actions</th></tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr><td colSpan="5" className="muted center">No expense yet.</td></tr>
            )}
            {expenses.map((e) => {
              const cat = catById[e.categoryId]
              return (
                <tr key={e.id}>
                  <td data-label="Date">{prettyDate(e.date)}</td>
                  <td data-label="Name">{expenseLabel(e, cat)}</td>
                  <td data-label="Category">
                    {cat && <span className="badge" style={{ '--c': getType(cat.type).color }}>{cat.name}</span>}
                  </td>
                  <td className="right" data-label="Amount"><strong>{formatEuro(e.amount)}</strong></td>
                  <td className="right actions">
                    {e.hasReceipt && (
                      <button className="btn-sm" aria-label="View receipt" onClick={() => setViewing(e)}>🧾</button>
                    )}
                    <button className="btn-sm" onClick={() => setEditing(e)}>Edit</button>
                    <button className="btn-sm danger" onClick={() => remove(e)}>Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="Edit expense" onClose={() => setEditing(null)}>
          <ExpenseForm
            categories={categories}
            initial={editing}
            submitLabel="Save changes"
            onSubmit={async (fields, photo) => {
              await onUpdate(editing.id, fields, photo) // Errors are shown by the form
              setEditing(null)
            }}
          />
        </Modal>
      )}

      {viewing && <ReceiptViewer expense={viewing} onClose={() => setViewing(null)} />}
    </>
  )
}
