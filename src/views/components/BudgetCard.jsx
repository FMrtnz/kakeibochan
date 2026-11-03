import { WEEK_DAYS } from '../../models/budgetModel.js'
import { formatEuro } from '../../utils/format.js'

// Budget card with two tabs. Monthly = whole month. Weekly = one week chosen in a dropdown.
export default function BudgetCard({ d, budget, setBudget }) {
  const w = d.pickedWeek

  return (
    <div className="card">
      <div className="card-head">
        <h2>Budget</h2>
        <div className="segmented small">
          <button className={d.budgetView === 'month' ? 'on' : ''} onClick={() => d.setBudgetView('month')}>Monthly</button>
          <button className={d.budgetView === 'week' ? 'on' : ''} onClick={() => d.setBudgetView('week')}>Weekly</button>
        </div>
      </div>

      <div className="budget-row">
        <input type="number" min="0" step="10" value={budget || ''} placeholder="Monthly budget (€)"
          aria-label="Monthly budget in euros" onChange={(e) => setBudget(parseFloat(e.target.value) || 0)} />
        {budget > 0 && <small className="muted">= {formatEuro(d.weekLimit)} per week</small>}
      </div>

      {/* Weekly tab: dropdown + a single "left" bar for the chosen week */}
      {d.budgetView === 'week' && (
        <select className="week-select" aria-label="Choose a week" value={d.weekPick}
          onChange={(e) => d.setWeekPick(Number(e.target.value))}>
          {WEEK_DAYS.map((days, i) => (
            <option key={days} value={i + 1}>Week {i + 1} (days {days})</option>
          ))}
        </select>
      )}

      {budget <= 0 && <small className="muted">Set a monthly budget to follow your spending.</small>}

      {budget > 0 && d.budgetView === 'month' && (
        <Bar over={d.over} percent={d.percent}
          left={budget - d.monthTotal} spent={d.monthTotal} limit={budget} />
      )}
      {budget > 0 && d.budgetView === 'week' && (
        <Bar over={w.over} percent={w.percent} left={w.remaining} spent={w.spent} limit={w.limit} />
      )}
    </div>
  )
}

// One progress bar with the amount left (or the overspend)
function Bar({ over, percent, left, spent, limit }) {
  return (
    <>
      <div className="week-head">
        <strong className={over ? 'neg' : 'pos'}>
          {over ? `Over by ${formatEuro(-left)}` : `${formatEuro(left)} left`}
        </strong>
        <small className="muted">{formatEuro(spent)} of {formatEuro(limit)}</small>
      </div>
      <div className="progress"><div className={over ? 'over' : ''} style={{ width: percent + '%' }} /></div>
    </>
  )
}
