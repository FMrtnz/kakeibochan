import { useEffect } from 'react'

// Simple modal dialog. Clicking the dark background closes it.
export default function Modal({ title, onClose, children }) {
  // Lock the page scroll while the modal is open
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-head">
          <h2>{title}</h2>
          <button className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
