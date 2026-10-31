import { useState } from 'react'
import useBudgetController from './controllers/useBudgetController.js'
import useToast from './controllers/useToast.js'
import Sidebar from './views/components/Sidebar.jsx'
import Modal from './views/components/Modal.jsx'
import AddTabs from './views/components/AddTabs.jsx'
import Dashboard from './views/pages/Dashboard.jsx'
import AddPage from './views/pages/AddPage.jsx'
import ManagePage from './views/pages/ManagePage.jsx'

const TITLES = { dashboard: 'Dashboard', add: 'Add', manage: 'Manage' }

// Connects the controller (data + actions) to the views
export default function App() {
  const [page, setPage] = useState('dashboard') // Simple page switch, no router needed
  const [quickAdd, setQuickAdd] = useState(false) // Quick-add window (floating button)
  const [quickTab, setQuickTab] = useState('expense')
  const budget = useBudgetController()
  const { message, notify } = useToast()

  return (
    <div className="layout">
      <Sidebar page={page} onNavigate={setPage} />
      <main className="main">
        <header className="topbar">
          <h1>{TITLES[page]}</h1>
          {/* Top-right shortcut (mobile): always visible because the bar is sticky */}
          {page !== 'add' && (
            <button className="topbar-add" aria-label="Add an expense" onClick={() => setQuickAdd(true)}>
              <span>+</span> Add
            </button>
          )}
        </header>
        <div className="content">
          {page === 'dashboard' && <Dashboard budget={budget} onAdd={() => setQuickAdd(true)} />}
          {page === 'add' && <AddPage budget={budget} notify={notify} />}
          {page === 'manage' && <ManagePage budget={budget} />}
        </div>
      </main>

      {/* Floating button: add an expense from any page (hidden on the Add page itself) */}
      {page !== 'add' && (
        <button className="fab" aria-label="Add an expense" onClick={() => setQuickAdd(true)}>
          <span className="fab-plus">+</span>
          <span className="fab-label">Add expense</span>
        </button>
      )}

      {quickAdd && (
        <Modal title="Quick add" onClose={() => setQuickAdd(false)}>
          <AddTabs
            tab={quickTab}
            setTab={setQuickTab}
            budget={budget}
            onAdded={(text) => { notify(text); setQuickAdd(false) }}
          />
        </Modal>
      )}

      {message && <div className="toast">✓ {message}</div>}
    </div>
  )
}
