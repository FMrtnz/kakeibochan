import { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { TYPES, PALETTE, formatEuro, expenseLabel, todayISO, monthOf, weekOfMonth, prettyDate } from '../utils.js'

export default function Dashboard({ categories, expenses, budget, setBudget, onAdd }) {
  const [month, setMonth] = useState(monthOf(todayISO())) // "YYYY-MM"
  const [week, setWeek] = useState('all') // "all" or 1-5
  const [chartType, setChartType] = useState('pie') // "pie" or "bar"

  const catById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories])

  // Expenses of the selected month, then narrowed by week if one is selected
  const monthExpenses = expenses.filter((e) => monthOf(e.date) === month)
  const visible = monthExpenses.filter((e) => week === 'all' || weekOfMonth(e.date) === week)

  const total = visible.reduce((sum, e) => sum + e.amount, 0)
  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0)

  // Total per type (Survival / Charges / Leisure)
  const totalsByType = TYPES.map((t) => ({
    ...t,
    total: visible.filter((e) => catById[e.categoryId]?.type === t.id).reduce((s, e) => s + e.amount, 0)
  }))

  // Chart data: one entry per category that has spending
  const chartData = categories
    .map((c, i) => ({
      name: c.name,
      value: Math.round(visible.filter((e) => e.categoryId === c.id).reduce((s, e) => s + e.amount, 0) * 100) / 100,
      color: PALETTE[i % PALETTE.length]
    }))
    .filter((d) => d.value > 0)

  // Budget progress is always based on the whole month
  const percent = budget > 0 ? Math.min(100, (monthTotal / budget) * 100) : 0
  const over = budget > 0 && monthTotal > budget

  const recent = [...visible].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <>
      {/* Filters */}
      <div className="card filters">
        <label className="field inline">
          <span>Month</span>
          <input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </label>
        <div className="chips">
          {['all', 1, 2, 3, 4, 5].map((w) => (
            <button key={w} className={'chip' + (week === w ? ' on' : '')} onClick={() => setWeek(w)}>
              {w === 'all' ? 'Whole month' : `Week ${w}`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="stats">
        <div className="card stat main-stat">
          <small>{week === 'all' ? 'Total spent this month' : `Total spent in week ${week}`}</small>
          <div className="big">{formatEuro(total)}</div>
        </div>
        {totalsByType.map((t) => (
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
            <input type="number" min="0" step="10" value={budget || ''} placeholder="Set budget (€)"
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)} />
          </label>
        </div>
        {budget > 0 ? (
          <>
            <div className="progress"><div className={over ? 'over' : ''} style={{ width: percent + '%' }} /></div>
            <small className="muted">
              {over
                ? `Over budget by ${formatEuro(monthTotal - budget)}`
                : `${formatEuro(budget - monthTotal)} left of ${formatEuro(budget)}`}
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
            <button className={chartType === 'pie' ? 'on' : ''} onClick={() => setChartType('pie')}>Pie</button>
            <button className={chartType === 'bar' ? 'on' : ''} onClick={() => setChartType('bar')}>Columns</button>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="empty">
            <p>No expenses for this period.</p>
            <button className="btn primary" onClick={onAdd}>Add one</button>
          </div>
        ) : (
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="50%" outerRadius="80%" paddingAngle={2}>
                    {chartData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatEuro(v)} />
                  <Legend />
                </PieChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => '€' + v} width={60} />
                  <Tooltip formatter={(v) => formatEuro(v)} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Latest expenses */}
      {recent.length > 0 && (
        <div className="card">
          <h2>Latest expenses</h2>
          {recent.map((e) => (
            <div key={e.id} className="row">
              <div>
                <div>{expenseLabel(e, catById[e.categoryId])}</div>
                <small className="muted">{catById[e.categoryId]?.name} · {prettyDate(e.date)}</small>
              </div>
              <strong>{formatEuro(e.amount)}</strong>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
