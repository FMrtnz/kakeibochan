// Dark sidebar on desktop, bottom navigation bar on mobile (see styles.css)
const ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'add', label: 'Add', icon: '➕' },
  { id: 'manage', label: 'Manage', icon: '🗂️' }
]

export default function Sidebar({ page, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="icon.svg" alt="" width="32" height="32" />
        <span>Kaikebochan</span>
      </div>
      <nav>
        {ITEMS.map((item) => (
          <button
            key={item.id}
            className={'nav-item' + (page === item.id ? ' active' : '')}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <p className="sidebar-note">Data is stored only on this device.</p>
    </aside>
  )
}
