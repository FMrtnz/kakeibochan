import useLocalStorage from '../models/storage.js'
import { buildCategoryFields, createCategory } from '../models/categoryModel.js'
import { buildExpenseFields, createExpense } from '../models/expenseModel.js'
import { saveReceipt, deleteReceipt, deleteReceipts } from '../services/receiptService.js'

// Main controller: owns the data and exposes every action the views can trigger.
// Receipt photos live in IndexedDB; an expense only records whether it has one (hasReceipt).
export default function useBudgetController() {
  const [categories, setCategories] = useLocalStorage('kakeibochan.categories', [])
  const [expenses, setExpenses] = useLocalStorage('kakeibochan.expenses', [])
  const [budget, setBudget] = useLocalStorage('kakeibochan.budget', 0)

  // ----- Categories -----
  const addCategory = (fields) => setCategories((list) => [...list, createCategory(fields)])

  const updateCategory = (id, fields) =>
    setCategories((list) => list.map((c) => (c.id === id ? { ...c, ...buildCategoryFields(fields) } : c)))

  // Deleting a category also removes its expenses and their photos
  const deleteCategory = async (id) => {
    const removedIds = expenses.filter((e) => e.categoryId === id).map((e) => e.id)
    setCategories((list) => list.filter((c) => c.id !== id))
    setExpenses((list) => list.filter((e) => e.categoryId !== id))
    if (removedIds.length) await deleteReceipts(removedIds)
  }

  // ----- Expenses -----
  // photo: optional Blob. It is saved first, so if that fails the expense is not added.
  const addExpense = async (fields, photo = null) => {
    const expense = { ...createExpense(fields), hasReceipt: Boolean(photo) }
    if (photo) await saveReceipt(expense.id, photo)
    setExpenses((list) => [...list, expense])
  }

  // photo: undefined = keep the current photo, null = remove it, Blob = replace it
  const updateExpense = async (id, fields, photo) => {
    if (photo === null) await deleteReceipt(id)
    else if (photo) await saveReceipt(id, photo)
    setExpenses((list) =>
      list.map((e) =>
        e.id !== id ? e : {
          ...e,
          ...buildExpenseFields(fields),
          ...(photo === undefined ? {} : { hasReceipt: Boolean(photo) })
        }
      )
    )
  }

  const deleteExpense = async (id) => {
    setExpenses((list) => list.filter((e) => e.id !== id))
    await deleteReceipt(id)
  }

  // Replace everything at once (CSV import). Photos of removed expenses are deleted too.
  const replaceData = async (newCategories, newExpenses) => {
    const keep = new Set(newExpenses.map((e) => e.id))
    const orphanIds = expenses.filter((e) => !keep.has(e.id)).map((e) => e.id)
    setCategories(newCategories)
    setExpenses(newExpenses)
    if (orphanIds.length) await deleteReceipts(orphanIds)
  }

  return {
    replaceData,
    categories, expenses, budget, setBudget,
    addCategory, updateCategory, deleteCategory,
    addExpense, updateExpense, deleteExpense
  }
}
