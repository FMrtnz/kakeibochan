import { useState } from 'react'
import CategoryForm from '../components/CategoryForm.jsx'
import ExpenseForm from '../components/ExpenseForm.jsx'
import CategoryTable from '../components/CategoryTable.jsx'
import ExpenseTable from '../components/ExpenseTable.jsx'

// Two separate forms (expense / category), each followed by its table
export default function AddPage({ budget }) {
  const [tab, setTab] = useState('expense')
  const [message, setMessage] = useState('')
  const { categories, expenses } = budget

  // Show a short confirmation message
  const flash = (text) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 2500)
  }

  return (
    <>
      <div className="card form-card">
        <div className="segmented">
          <button className={tab === 'expense' ? 'on' : ''} onClick={() => setTab('expense')}>New expense</button>
          <button className={tab === 'category' ? 'on' : ''} onClick={() => setTab('category')}>New category</button>
        </div>

        {message && <div className="toast">✓ {message}</div>}

        {tab === 'expense' ? (
          <ExpenseForm
            categories={categories}
            submitLabel="Add expense"
            onNeedCategory={() => setTab('category')}
            onSubmit={(fields) => { budget.addExpense(fields); flash('Expense added') }}
          />
        ) : (
          <CategoryForm
            submitLabel="Add category"
            onSubmit={(fields) => { budget.addCategory(fields); flash('Category added') }}
          />
        )}
      </div>

      <div className="card">
        <h2>{tab === 'expense' ? 'Your expenses' : 'Your categories'}</h2>
        {tab === 'expense' ? (
          <ExpenseTable expenses={expenses} categories={categories}
            onUpdate={budget.updateExpense} onDelete={budget.deleteExpense} />
        ) : (
          <CategoryTable categories={categories} expenses={expenses}
            onUpdate={budget.updateCategory} onDelete={budget.deleteCategory} />
        )}
      </div>
    </>
  )
}
