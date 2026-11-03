import { useState } from 'react'
import { TYPES, PALETTE } from '../models/constants.js'
import {
  filterByPeriod, filterByCategory, sumAmounts, totalsByType, totalsByCategory
} from '../models/expenseModel.js'
import { weeklyBreakdown, weeklyLimit, WEEKS_PER_MONTH } from '../models/budgetModel.js'
import { monthOf, todayISO, weekOfMonth } from '../utils/format.js'

// Dashboard controller: filter state + figures computed from the model.
export default function useDashboardController(categories, expenses, budget) {
  const [month, setMonth] = useState(monthOf(todayISO())) // "YYYY-MM"
  const [chartType, setChartType] = useState('pie') // "pie" or "bar"
  const [budgetView, setBudgetView] = useState('month') // "month" or "week"
  const [weekPick, setWeekPick] = useState(Math.min(WEEKS_PER_MONTH, weekOfMonth(todayISO())))
  const [categoryFilter, setCategoryFilter] = useState('all') // "all", "type:x" or "cat:id"
  const [downloading, setDownloading] = useState(false)

  // Monthly tab = whole month, Weekly tab = the week picked in the dropdown
  const week = budgetView === 'week' ? weekPick : 'all'

  const monthExpenses = filterByPeriod(expenses, month)
  const visible = filterByPeriod(expenses, month, week)
  const monthTotal = sumAmounts(monthExpenses)

  // The category filter only applies to the expense list (and ignores deleted categories)
  const filterExists = !categoryFilter.startsWith('cat:') || categories.some((c) => 'cat:' + c.id === categoryFilter)
  const activeFilter = filterExists ? categoryFilter : 'all'
  const listExpenses = filterByCategory(visible, categories, activeFilter)

  // Generate and download the PDF report of the selected month (code loaded on demand)
  const downloadReport = async () => {
    setDownloading(true)
    try {
      const { generateMonthlyReport } = await import('../services/pdfReport.js')
      generateMonthlyReport({ month, categories, expenses: monthExpenses, budget })
    } finally {
      setDownloading(false)
    }
  }

  const weeks = weeklyBreakdown(expenses, month, budget)

  return {
    month, setMonth, week, weekPick, setWeekPick, chartType, setChartType, budgetView, setBudgetView,
    categoryFilter: activeFilter, setCategoryFilter,
    visible, listExpenses, listTotal: sumAmounts(listExpenses),
    total: sumAmounts(visible),
    typeTotals: totalsByType(visible, categories, TYPES),
    chartData: totalsByCategory(visible, categories, PALETTE),
    // Monthly budget progress (whole month)
    monthTotal,
    percent: budget > 0 ? Math.min(100, (monthTotal / budget) * 100) : 0,
    over: budget > 0 && monthTotal > budget,
    // Weekly budget progress (budget / 5)
    weekLimit: weeklyLimit(budget),
    pickedWeek: weeks[weekPick - 1],
    downloadReport, downloading
  }
}
