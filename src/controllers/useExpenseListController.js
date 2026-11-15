import { useState } from 'react'
import { filterByCategory, sortExpenses, sumAmounts } from '../models/expenseModel.js'

// Controller of any expense list: category filter + sort order
export default function useExpenseListController(expenses, categories) {
  const [filter, setFilter] = useState('all') // "all", "type:<id>" or "cat:<id>"
  const [sort, setSort] = useState('date-desc')

  // Ignore a filter that points to a category that has been deleted
  const exists = !filter.startsWith('cat:') || categories.some((c) => 'cat:' + c.id === filter)
  const activeFilter = exists ? filter : 'all'

  const items = sortExpenses(filterByCategory(expenses, categories, activeFilter), sort)

  return {
    filter: activeFilter, setFilter,
    sort, setSort,
    items,
    count: items.length,
    total: sumAmounts(items)
  }
}
