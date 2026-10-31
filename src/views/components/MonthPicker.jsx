import { monthLabel, shiftMonth } from '../../utils/format.js'

// Month selector with previous / next arrows
export default function MonthPicker({ month, onChange }) {
  return (
    <div className="month-picker">
      <button type="button" className="icon-btn" aria-label="Previous month" onClick={() => onChange(shiftMonth(month, -1))}>‹</button>
      <strong>{monthLabel(month)}</strong>
      <button type="button" className="icon-btn" aria-label="Next month" onClick={() => onChange(shiftMonth(month, 1))}>›</button>
    </div>
  )
}
