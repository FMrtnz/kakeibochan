import { useState } from 'react'
import { TYPES, PALETTE } from '../models/constants.js'
import { filterByPeriod, sumAmounts, totalsByType, totalsByCategory } from '../models/expenseModel.js'
import { weeklyBreakdown, weeklyLimit, WEEKS_PER_MONTH } from '../models/budgetModel.js'
import { monthOf, todayISO, weekOfMonth } from '../utils/format.js'
import useExpenseListController from './useExpenseListController.js'

// Dashboard controller: period filters, figures computed from the model, and the expense list.
export default function useDashboardController(categories, expenses, budget) {
  const [month, setMonth] = useState(monthOf(todayISO())) // "YYYY-MM"
  const [chartType, setChartType] = useState('pie') // "pie" or "bar"
  const [budgetView, setBudgetView] = useState('month') // "month" or "week"
  const [weekPick, setWeekPick] = useState(Math.min(WEEKS_PER_MONTH, weekOfMonth(todayISO())))
  const [downloading, setDownloading] = useState(false)

  // Monthly tab = whole month, Weekly tab = the week picked in the dropdown
  const week = budgetView === 'week' ? weekPick : 'all'

  const monthExpenses = filterByPeriod(expenses, month)
  const visible = filterByPeriod(expenses, month, week)
  const monthTotal = sumAmounts(monthExpenses)

  // The list shows the visible period, then applies its own filter and sort
  const list = useExpenseListController(visible, categories)

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
    list,
    total: sumAmounts(visible),
    typeTotals: totalsByType(visible, categories, TYPES),
    chartData: totalsByCategory(visible, categories, PALETTE),
    monthTotal,
    percent: budget > 0 ? Math.min(100, (monthTotal / budget) * 100) : 0,
    over: budget > 0 && monthTotal > budget,
    weekLimit: weeklyLimit(budget),
    pickedWeek: weeks[weekPick - 1],
    downloadReport, downloading
  }
}
