import CategoryTable from '../components/CategoryTable.jsx'
import ExpenseTable from '../components/ExpenseTable.jsx'

// Full lists of categories and expenses, with edit and delete
export default function ManagePage({ budget }) {
  const { categories, expenses } = budget
  return (
    <>
      <section className="card">
        <h2>Categories</h2>
        <CategoryTable categories={categories} expenses={expenses}
          onUpdate={budget.updateCategory} onDelete={budget.deleteCategory} />
      </section>

      <section className="card">
        <h2>Expenses</h2>
        <ExpenseTable expenses={expenses} categories={categories}
          onUpdate={budget.updateExpense} onDelete={budget.deleteExpense} />
      </section>
    </>
  )
}
