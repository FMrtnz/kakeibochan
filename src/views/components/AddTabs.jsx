import CategoryForm from './CategoryForm.jsx'
import ExpenseForm from './ExpenseForm.jsx'

// Tabs with the two forms (expense / category). Used on the Add page and in the quick-add window.
// "tab" is controlled by the parent so it can show the matching table.
export default function AddTabs({ tab, setTab, budget, onAdded }) {
  return (
    <>
      <div className="segmented">
        <button className={tab === 'expense' ? 'on' : ''} onClick={() => setTab('expense')}>New expense</button>
        <button className={tab === 'category' ? 'on' : ''} onClick={() => setTab('category')}>New category</button>
      </div>

      {tab === 'expense' ? (
        <ExpenseForm
          categories={budget.categories}
          submitLabel="Add expense"
          onNeedCategory={() => setTab('category')}
          onSubmit={(fields) => { budget.addExpense(fields); onAdded('Expense added') }}
        />
      ) : (
        <CategoryForm
          submitLabel="Add category"
          onSubmit={(fields) => { budget.addCategory(fields); onAdded('Category added') }}
        />
      )}
    </>
  )
}
