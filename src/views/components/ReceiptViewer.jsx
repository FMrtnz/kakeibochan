import { useEffect, useState } from 'react'
import Modal from './Modal.jsx'
import { getReceipt } from '../../services/receiptService.js'

// Shows the receipt photo of one expense in a modal
export default function ReceiptViewer({ expense, onClose }) {
  const [url, setUrl] = useState(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    let objectUrl = null
    getReceipt(expense.id)
      .then((blob) => {
        if (blob) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl) }
        else setMissing(true)
      })
      .catch(() => setMissing(true))
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [expense.id])

  return (
    <Modal title={expense.name || 'Receipt'} onClose={onClose}>
      {url && <img className="receipt-img" src={url} alt="Receipt" />}
      {!url && <p className="muted">{missing ? 'This photo is not available on this device.' : 'Loading...'}</p>}
    </Modal>
  )
}
