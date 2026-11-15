import { TYPES } from '../../models/constants.js'
import { SORT_OPTIONS } from '../../models/expenseModel.js'

// Category filter and sort order, shown above an expense list
export default function ExpenseListToolbar({ list, categories }) {
  return (
    <div className="list-toolbar">
      <select aria-label="Filter by category" value={list.filter} onChange={(e) => list.setFilter(e.target.value)}>
        <option value="all">All categories</option>
        {TYPES.map((t) => {
          const items = categories.filter((c) => c.type === t.id)
          return items.length > 0 && (
            <optgroup key={t.id} label={t.label}>
              <option value={'type:' + t.id}>All {t.label}</option>
              {items.map((c) => <option key={c.id} value={'cat:' + c.id}>{c.name}</option>)}
            </optgroup>
          )
        })}
      </select>

      <select aria-label="Sort expenses" value={list.sort} onChange={(e) => list.setSort(e.target.value)}>
        {SORT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  )
}
