import { useState } from 'react'
import { TYPES, PALETTE } from '../models/constants.js'
import { filterByPeriod, sumAmounts, totalsByType, totalsByCategory } from '../models/expenseModel.js'
import { monthOf, todayISO } from '../utils/format.js'

// Dashboard controller: filter state + figures computed from the model.
export default function useDashboardController(categories, expenses, budget) {
  const [month, setMonth] = useState(monthOf(todayISO())) // "YYYY-MM"
  const [week, setWeek] = useState('all') // "all" or 1-5
  const [chartType, setChartType] = useState('pie') // "pie" or "bar"

  const monthExpenses = filterByPeriod(expenses, month)
  const visible = filterByPeriod(expenses, month, week)

  const monthTotal = sumAmounts(monthExpenses)

  return {
    month, setMonth, week, setWeek, chartType, setChartType,
    visible,
    total: sumAmounts(visible),
    typeTotals: totalsByType(visible, categories, TYPES),
    chartData: totalsByCategory(visible, categories, PALETTE),
    // Budget progress always uses the whole month
    monthTotal,
    percent: budget > 0 ? Math.min(100, (monthTotal / budget) * 100) : 0,
    over: budget > 0 && monthTotal > budget
  }
}
