import { useState } from 'react'
import useBudgetController from './controllers/useBudgetController.js'
import Sidebar from './views/components/Sidebar.jsx'
import Dashboard from './views/pages/Dashboard.jsx'
import AddPage from './views/pages/AddPage.jsx'
import ManagePage from './views/pages/ManagePage.jsx'

const TITLES = { dashboard: 'Dashboard', add: 'Add', manage: 'Manage' }

// Connects the controller (data + actions) to the views
export default function App() {
  const [page, setPage] = useState('dashboard') // Simple page switch, no router needed
  const budget = useBudgetController()

  return (
    <div className="layout">
      <Sidebar page={page} onNavigate={setPage} />
      <main className="main">
        <header className="topbar"><h1>{TITLES[page]}</h1></header>
        <div className="content">
          {page === 'dashboard' && <Dashboard budget={budget} onAdd={() => setPage('add')} />}
          {page === 'add' && <AddPage budget={budget} />}
          {page === 'manage' && <ManagePage budget={budget} />}
        </div>
      </main>
    </div>
  )
}
