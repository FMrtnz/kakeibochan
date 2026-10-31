import { filterByPeriod, sumAmounts } from './expenseModel.js'

// The monthly budget is split in 5 equal weekly budgets (e.g. 1000 -> 200 per week)
export const WEEKS_PER_MONTH = 5
export const WEEK_DAYS = ['1-7', '8-14', '15-21', '22-28', '29-end']

export const weeklyLimit = (budget) => budget / WEEKS_PER_MONTH

// For each week of a month: limit, spent, remaining and progress
export const weeklyBreakdown = (expenses, month, budget) =>
  WEEK_DAYS.map((days, i) => {
    const week = i + 1
    const limit = weeklyLimit(budget)
    const spent = sumAmounts(filterByPeriod(expenses, month, week))
    return {
      week,
      days,
      limit,
      spent,
      remaining: limit - spent,
      percent: limit > 0 ? Math.min(100, (spent / limit) * 100) : 0,
      over: limit > 0 && spent > limit
    }
  })
