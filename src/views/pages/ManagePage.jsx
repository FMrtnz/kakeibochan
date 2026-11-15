import useManageController from '../../controllers/useManageController.js'
import CategoryTable from '../components/CategoryTable.jsx'
import ExpenseListToolbar from '../components/ExpenseListToolbar.jsx'
import ExpenseTable from '../components/ExpenseTable.jsx'
import { formatEuro } from '../../utils/format.js'

// Full lists of categories and expenses, with filter, sort, edit and delete
export default function ManagePage({ budget }) {
  const m = useManageController(budget)
  const { categories, expenses } = budget

  return (
    <>
      <section className="card">
        <h2>Categories</h2>
        <CategoryTable categories={categories} expenses={expenses}
          onUpdate={budget.updateCategory} onDelete={budget.deleteCategory} />
      </section>

      <section className="card">
        <div className="card-head">
          <h2>Expenses</h2>
          <small className="muted">{m.list.count} · {formatEuro(m.list.total)}</small>
        </div>
        <ExpenseListToolbar list={m.list} categories={categories} />
        <ExpenseTable expenses={m.list.items} categories={categories}
          onUpdate={budget.updateExpense} onDelete={budget.deleteExpense} />
      </section>
    </>
  )
}
