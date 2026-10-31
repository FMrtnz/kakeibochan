import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import useDashboardController from '../../controllers/useDashboardController.js'
import ExpenseTable from '../components/ExpenseTable.jsx'
import { formatEuro } from '../../utils/format.js'

// The view only displays what the dashboard controller computes
export default function Dashboard({ budget: b, onAdd }) {
  const d = useDashboardController(b.categories, b.expenses, b.budget)

  return (
    <>
      {/* Filters */}
      <div className="card filters">
        <label className="field inline">
          <span>Month</span>
          <input type="month" value={d.month} onChange={(e) => e.target.value && d.setMonth(e.target.value)} />
        </label>
        <div className="chips">
          {['all', 1, 2, 3, 4, 5].map((w) => (
            <button key={w} className={'chip' + (d.week === w ? ' on' : '')} onClick={() => d.setWeek(w)}>
              {w === 'all' ? 'Whole month' : `Week ${w}`}
            </button>
          ))}
        </div>
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

      {/* Monthly budget */}
      <div className="card">
        <div className="card-head">
          <h2>Monthly budget</h2>
          <label className="budget-input">
            <input type="number" min="0" step="10" value={b.budget || ''} placeholder="Set budget (€)"
              onChange={(e) => b.setBudget(parseFloat(e.target.value) || 0)} />
          </label>
        </div>
        {b.budget > 0 ? (
          <>
            <div className="progress"><div className={d.over ? 'over' : ''} style={{ width: d.percent + '%' }} /></div>
            <small className="muted">
              {d.over
                ? `Over budget by ${formatEuro(d.monthTotal - b.budget)}`
                : `${formatEuro(b.budget - d.monthTotal)} left of ${formatEuro(b.budget)}`}
            </small>
          </>
        ) : (
          <small className="muted">Set a budget to follow your month.</small>
        )}
      </div>

      {/* Chart */}
      <div className="card">
        <div className="card-head">
          <h2>Spending by category</h2>
          <div className="segmented small">
            <button className={d.chartType === 'pie' ? 'on' : ''} onClick={() => d.setChartType('pie')}>Pie</button>
            <button className={d.chartType === 'bar' ? 'on' : ''} onClick={() => d.setChartType('bar')}>Columns</button>
          </div>
        </div>

        {d.chartData.length === 0 ? (
          <div className="empty">
            <p>No expenses for this period.</p>
            <button className="btn primary" onClick={onAdd}>Add one</button>
          </div>
        ) : (
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              {d.chartType === 'pie' ? (
                <PieChart>
                  <Pie data={d.chartData} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" paddingAngle={2}>
                    {d.chartData.map((x) => <Cell key={x.name} fill={x.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatEuro(v)} />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={d.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => '€' + v} width={60} />
                  <Tooltip formatter={(v) => formatEuro(v)} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {d.chartData.map((x) => <Cell key={x.name} fill={x.color} />)}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Expenses of the selected period */}
      <div className="card">
        <h2>Expenses of the period</h2>
        <ExpenseTable expenses={d.visible} categories={b.categories}
          onUpdate={b.updateExpense} onDelete={b.deleteExpense} />
      </div>
    </>
  )
}
