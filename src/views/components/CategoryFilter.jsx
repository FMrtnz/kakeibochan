import { TYPES } from '../../models/constants.js'

// Dropdown to filter a list by a whole type or by a single category
export default function CategoryFilter({ categories, value, onChange }) {
  return (
    <select className="category-filter" aria-label="Filter by category" value={value}
      onChange={(e) => onChange(e.target.value)}>
      <option value="all">All categories</option>
      {TYPES.map((t) => {
        const list = categories.filter((c) => c.type === t.id)
        return list.length > 0 && (
          <optgroup key={t.id} label={t.label}>
            <option value={'type:' + t.id}>All {t.label}</option>
            {list.map((c) => <option key={c.id} value={'cat:' + c.id}>{c.name}</option>)}
          </optgroup>
        )
      })}
    </select>
  )
}
