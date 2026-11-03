import useDashboardController from '../../controllers/useDashboardController.js'
import MonthPicker from '../components/MonthPicker.jsx'
import BudgetCard from '../components/BudgetCard.jsx'
import SpendingChart from '../components/SpendingChart.jsx'
import CategoryFilter from '../components/CategoryFilter.jsx'
import ExpenseTable from '../components/ExpenseTable.jsx'
import { formatEuro } from '../../utils/format.js'

// The view only displays what the dashboard controller computes
export default function Dashboard({ budget: b, onAdd }) {
  const d = useDashboardController(b.categories, b.expenses, b.budget)

  return (
    <>
      <div className="card filters">
        <MonthPicker month={d.month} onChange={d.setMonth} />
        <button className="btn light" onClick={d.downloadReport} disabled={d.downloading}>
          {d.downloading ? 'Preparing...' : '⬇ Download report (PDF)'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="stats">
        <div className="card stat main-stat">
          <small>{d.week === 'all' ? 'Total spent this month' : `Total spent in week ${d.week}`}</small>
          <div className="big">{formatEuro(d.total)}</div>
        </div>
        {d.typeTotals.map((t) => (
          <div key={t.id} className="card stat" style={{ '--c': t.color }}>
            <small>{t.label}</small>
            <div className="big small-big">{formatEuro(t.total)}</div>
          </div>
        ))}
      </div>

      <BudgetCard d={d} budget={b.budget} setBudget={b.setBudget} />
      <SpendingChart d={d} onAdd={onAdd} />

      {/* Expense list with its category filter */}
      <div className="card">
        <div className="card-head">
          <h2>Expenses</h2>
          <small className="muted">{d.listExpenses.length} · {formatEuro(d.listTotal)}</small>
        </div>
        <CategoryFilter categories={b.categories} value={d.categoryFilter} onChange={d.setCategoryFilter} />
        <ExpenseTable expenses={d.listExpenses} categories={b.categories}
          onUpdate={b.updateExpense} onDelete={b.deleteExpense} />
      </div>
    </>
  )
}
