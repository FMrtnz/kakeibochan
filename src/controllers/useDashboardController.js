import { useState } from 'react'
import { TYPES, PALETTE } from '../models/constants.js'
import { filterByPeriod, sumAmounts, totalsByType, totalsByCategory } from '../models/expenseModel.js'
import { weeklyBreakdown, weeklyLimit } from '../models/budgetModel.js'
import { monthOf, todayISO } from '../utils/format.js'

// Dashboard controller: filter state + figures computed from the model.
export default function useDashboardController(categories, expenses, budget) {
  const [month, setMonth] = useState(monthOf(todayISO())) // "YYYY-MM"
  const [week, setWeek] = useState('all') // "all" or 1-5
  const [chartType, setChartType] = useState('pie') // "pie" or "bar"
  const [budgetView, setBudgetView] = useState('month') // "month" or "week"
  const [downloading, setDownloading] = useState(false)

  const monthExpenses = filterByPeriod(expenses, month)
  const visible = filterByPeriod(expenses, month, week)
  const monthTotal = sumAmounts(monthExpenses)

  // Generate and download the PDF report of the selected month.
  // The PDF code is loaded on demand so it does not slow down the app start.
  const downloadReport = async () => {
    setDownloading(true)
    try {
      const { generateMonthlyReport } = await import('../services/pdfReport.js')
      generateMonthlyReport({ month, categories, expenses: monthExpenses, budget })
    } finally {
      setDownloading(false)
    }
  }

  return {
    month, setMonth, week, setWeek, chartType, setChartType, budgetView, setBudgetView,
    visible,
    total: sumAmounts(visible),
    typeTotals: totalsByType(visible, categories, TYPES),
    chartData: totalsByCategory(visible, categories, PALETTE),
    // Monthly budget progress (whole month)
    monthTotal,
    percent: budget > 0 ? Math.min(100, (monthTotal / budget) * 100) : 0,
    over: budget > 0 && monthTotal > budget,
    // Weekly budget progress (budget / 5 for each week)
    weekLimit: weeklyLimit(budget),
    weeks: weeklyBreakdown(expenses, month, budget),
    downloadReport, downloading
  }
}
