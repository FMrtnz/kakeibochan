import { useState } from 'react'
import { buildImport, parseCsv, serializeCsv, toRows } from '../models/csvModel.js'
import { saveTextFile, readTextFile } from '../services/fileService.js'
import { todayISO } from '../utils/format.js'

// Sample data used for the example file
const EXAMPLE = {
  categories: [
    { id: 'c1', name: 'Groceries', type: 'survival' },
    { id: 'c2', name: 'Netflix', type: 'charges' },
    { id: 'c3', name: 'Cinema', type: 'leisure' }
  ],
  expenses: [{ id: 'e1', name: 'Weekly groceries', amount: 54.2, date: todayISO(), categoryId: 'c1' }]
}

// Controller of the Data page: CSV export / import
export default function useDataController(budget) {
  const [mode, setMode] = useState('merge') // Import: "merge" or "replace"
  const [separator, setSeparator] = useState(',') // Export: "," or ";"
  const [busy, setBusy] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  // Run an action with the loading / error handling
  const run = async (action) => {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const exportData = () =>
    run(async () => {
      const rows = toRows(budget.categories, budget.expenses, separator)
      saveTextFile(serializeCsv(rows, separator), `kakeibochan-data-${todayISO()}.csv`)
    })

  const downloadExample = () =>
    run(async () => {
      const rows = toRows(EXAMPLE.categories, EXAMPLE.expenses, separator)
      saveTextFile(serializeCsv(rows, separator), 'kakeibochan-example.csv')
    })

  const importFile = (file) =>
    run(async () => {
      setReport(null)
      const rows = parseCsv(await readTextFile(file))
      const result = buildImport({
        rows, mode,
        existing: { categories: budget.categories, expenses: budget.expenses }
      })
      budget.replaceData(result.categories, result.expenses)
      setReport(result.report)
    })

  return {
    mode, setMode, separator, setSeparator, busy, report, error,
    exportData, downloadExample, importFile
  }
}
