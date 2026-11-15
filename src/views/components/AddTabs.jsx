import CategoryForm from './CategoryForm.jsx'
import ExpenseForm from './ExpenseForm.jsx'

// Tabs with the two forms (expense / category), used in the quick-add window
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
          onSubmit={async (fields, photo) => {
            await budget.addExpense(fields, photo)
            onAdded('Expense added')
          }}
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
