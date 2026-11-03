import useDataController from '../../controllers/useDataController.js'
import { CSV_HEADERS } from '../../models/csvModel.js'

// Export / import the data as a CSV file
export default function DataPage({ budget }) {
  const d = useDataController(budget)

  const onPick = (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // Allows choosing the same file again
    if (!file) return
    if (d.mode === 'replace' && !window.confirm('Replace ALL your current categories and expenses with the content of this file?')) return
    d.importFile(file)
  }

  return (
    <>
      {d.error && <div className="alert">{d.error}</div>}

      <section className="card form-card">
        <h2>Export</h2>
        <p className="muted">Download all your categories and expenses as a CSV file. Handy as a backup.</p>
        <div className="segmented">
          <button className={d.separator === ',' ? 'on' : ''} onClick={() => d.setSeparator(',')}>Comma ( , )</button>
          <button className={d.separator === ';' ? 'on' : ''} onClick={() => d.setSeparator(';')}>Semicolon ( ; )</button>
        </div>
        <p className="muted"><small>Choose semicolon if you open the file with Excel set to French or another European language.</small></p>
        <button className="btn primary" onClick={d.exportData} disabled={d.busy}>⬇ Export to CSV</button>
      </section>

      <section className="card form-card">
        <h2>Import</h2>
        <div className="segmented">
          <button className={d.mode === 'merge' ? 'on' : ''} onClick={() => d.setMode('merge')}>Add to my data</button>
          <button className={d.mode === 'replace' ? 'on' : ''} onClick={() => d.setMode('replace')}>Replace all</button>
        </div>
        <p className="muted">
          {d.mode === 'merge'
            ? 'New categories and expenses are added. Duplicates are skipped.'
            : 'Everything currently in the app is deleted and replaced by the file content.'}
        </p>
        <label className="btn primary file-btn">
          {d.busy ? 'Working...' : '⬆ Choose a CSV file'}
          <input type="file" accept=".csv,text/csv" onChange={onPick} disabled={d.busy} />
        </label>

        {d.report && (
          <ul className="report">
            <li>✓ {d.report.categoriesAdded} categories added</li>
            <li>✓ {d.report.expensesAdded} expenses added</li>
            {d.report.duplicates > 0 && <li>• {d.report.duplicates} duplicates skipped</li>}
            {d.report.errors.slice(0, 8).map((msg) => <li key={msg} className="neg">✕ {msg}</li>)}
            {d.report.errors.length > 8 && <li className="neg">… and {d.report.errors.length - 8} more problems</li>}
          </ul>
        )}
      </section>

      <section className="card form-card">
        <h2>File format</h2>
        <p className="muted">A <strong>.csv</strong> file. The first row is the header, then one row per expense:</p>
        <p><strong>{CSV_HEADERS.join(' · ')}</strong></p>
        <p><small className="muted">
          Date as 2026-11-03 or 03/11/2026. Type is Survival, Charges or Leisure: it is only needed
          the first time a category appears. A row with only a Category (and Type) creates an empty category.
          The separator (comma or semicolon) is detected automatically.
        </small></p>
        <button className="btn light" onClick={d.downloadExample} disabled={d.busy}>Download an example file</button>
      </section>
    </>
  )
}
