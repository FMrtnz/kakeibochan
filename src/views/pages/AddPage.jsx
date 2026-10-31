import { useState } from 'react'
import AddTabs from '../components/AddTabs.jsx'
import CategoryTable from '../components/CategoryTable.jsx'
import ExpenseTable from '../components/ExpenseTable.jsx'

// Two separate forms (expense / category), each followed by its table
export default function AddPage({ budget, notify }) {
  const [tab, setTab] = useState('expense')
  const { categories, expenses } = budget

  return (
    <>
      <div className="card form-card">
        <AddTabs tab={tab} setTab={setTab} budget={budget} onAdded={notify} />
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
