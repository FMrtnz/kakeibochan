import useLocalStorage from '../models/storage.js'
import { buildCategoryFields, createCategory } from '../models/categoryModel.js'
import { buildExpenseFields, createExpense } from '../models/expenseModel.js'

// Main controller: owns the data and exposes every action the views can trigger.
export default function useBudgetController() {
  const [categories, setCategories] = useLocalStorage('kakeibochan.categories', [])
  const [expenses, setExpenses] = useLocalStorage('kakeibochan.expenses', [])
  const [budget, setBudget] = useLocalStorage('kakeibochan.budget', 0)

  // ----- Categories -----
  const addCategory = (fields) => setCategories([...categories, createCategory(fields)])

  const updateCategory = (id, fields) =>
    setCategories(categories.map((c) => (c.id === id ? { ...c, ...buildCategoryFields(fields) } : c)))

  // Deleting a category also removes its expenses
  const deleteCategory = (id) => {
    setCategories(categories.filter((c) => c.id !== id))
    setExpenses(expenses.filter((e) => e.categoryId !== id))
  }

  // ----- Expenses -----
  const addExpense = (fields) => setExpenses([...expenses, createExpense(fields)])

  const updateExpense = (id, fields) =>
    setExpenses(expenses.map((e) => (e.id === id ? { ...e, ...buildExpenseFields(fields) } : e)))

  const deleteExpense = (id) => setExpenses(expenses.filter((e) => e.id !== id))

  // Replace everything at once (used by the CSV import)
  const replaceData = (newCategories, newExpenses) => {
    setCategories(newCategories)
    setExpenses(newExpenses)
  }

  return {
    replaceData,
    categories, expenses, budget, setBudget,
    addCategory, updateCategory, deleteCategory,
    addExpense, updateExpense, deleteExpense
  }
}
