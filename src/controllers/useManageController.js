import useExpenseListController from './useExpenseListController.js'

// Controller of the Manage page
export default function useManageController(budget) {
  const list = useExpenseListController(budget.expenses, budget.categories)
  return { list }
}
