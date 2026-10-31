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

      {/* Budget: monthly or weekly view */}
      <div className="card">
        <div className="card-head">
          <h2>Budget</h2>
          <div className="segmented small">
            <button className={d.budgetView === 'month' ? 'on' : ''} onClick={() => d.setBudgetView('month')}>Monthly</button>
            <button className={d.budgetView === 'week' ? 'on' : ''} onClick={() => d.setBudgetView('week')}>Weekly</button>
          </div>
        </div>

        <div className="budget-row">
          <input type="number" min="0" step="10" value={b.budget || ''} placeholder="Monthly budget (€)"
            aria-label="Monthly budget in euros" onChange={(e) => b.setBudget(parseFloat(e.target.value) || 0)} />
          {b.budget > 0 && <small className="muted">= {formatEuro(d.weekLimit)} per week</small>}
        </div>

        {b.budget <= 0 && <small className="muted">Set a monthly budget to follow your spending.</small>}

        {b.budget > 0 && d.budgetView === 'month' && (
          <>
            <div className="progress"><div className={d.over ? 'over' : ''} style={{ width: d.percent + '%' }} /></div>
            <small className="muted">
              {d.over
                ? `Over budget by ${formatEuro(d.monthTotal - b.budget)}`
                : `${formatEuro(b.budget - d.monthTotal)} left of ${formatEuro(b.budget)}`}
            </small>
          </>
        )}

        {b.budget > 0 && d.budgetView === 'week' && (
          <div className="weeks">
            {d.weeks.map((w) => (
              <button key={w.week} className={'week-row' + (d.week === w.week ? ' selected' : '')}
                onClick={() => d.setWeek(w.week)}>
                <div className="week-head">
                  <span><strong>Week {w.week}</strong> <small className="muted">days {w.days}</small></span>
                  <strong className={w.over ? 'neg' : 'pos'}>
                    {w.over ? `Over by ${formatEuro(-w.remaining)}` : `${formatEuro(w.remaining)} left`}
                  </strong>
                </div>
                <div className="progress"><div className={w.over ? 'over' : ''} style={{ width: w.percent + '%' }} /></div>
                <small className="muted">{formatEuro(w.spent)} of {formatEuro(w.limit)}</small>
              </button>
            ))}
            <small className="muted">Tap a week to filter the dashboard.</small>
          </div>
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
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }}
                    tickFormatter={(n) => (n.length > 9 ? n.slice(0, 8) + '…' : n)} />
                  <YAxis tickFormatter={(v) => '€' + v} width={55} tick={{ fontSize: 11 }} />
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
