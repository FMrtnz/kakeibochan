import { useState } from 'react'
import useBudgetController from './controllers/useBudgetController.js'
import useToast from './controllers/useToast.js'
import Sidebar from './views/components/Sidebar.jsx'
import Modal from './views/components/Modal.jsx'
import AddTabs from './views/components/AddTabs.jsx'
import Dashboard from './views/pages/Dashboard.jsx'
import ManagePage from './views/pages/ManagePage.jsx'
import DataPage from './views/pages/DataPage.jsx'

const TITLES = { dashboard: 'Dashboard', manage: 'Manage', data: 'Import / Export' }

// Connects the controller (data + actions) to the views.
// Adding expenses and categories happens in the quick-add window, opened from any page.
export default function App() {
  const [page, setPage] = useState('dashboard')
  const [quickAdd, setQuickAdd] = useState(false)
  const [quickTab, setQuickTab] = useState('expense')
  const budget = useBudgetController()
  const { message, notify } = useToast()

  const openAdd = () => setQuickAdd(true)

  return (
    <div className="layout">
      <Sidebar page={page} onNavigate={setPage} />
      <main className="main">
        <header className="topbar">
          <h1>{TITLES[page]}</h1>
          {/* Always reachable on mobile: the top bar is fixed */}
          <button className="topbar-add" aria-label="Add an expense or a category" onClick={openAdd}>
            <span>+</span> Add
          </button>
        </header>
        <div className="content">
          {page === 'dashboard' && <Dashboard budget={budget} onAdd={openAdd} />}
          {page === 'manage' && <ManagePage budget={budget} />}
          {page === 'data' && <DataPage budget={budget} />}
        </div>
      </main>

      {/* Floating button on desktop (hidden on mobile, where the top bar button is used) */}
      <button className="fab" aria-label="Add an expense or a category" onClick={openAdd}>
        <span className="fab-plus">+</span>
        <span className="fab-label">Add</span>
      </button>

      {quickAdd && (
        <Modal title="Add" onClose={() => setQuickAdd(false)}>
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
