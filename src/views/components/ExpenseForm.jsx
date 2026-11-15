import { useEffect, useState } from 'react'
import { TYPES } from '../../models/constants.js'
import { isValidExpense } from '../../models/expenseModel.js'
import { todayISO } from '../../utils/format.js'
import { compressImage, getReceipt } from '../../services/receiptService.js'

// Form used to create an expense and to edit one (when "initial" is given).
// The optional photo is passed to onSubmit as:
//   undefined -> unchanged (edit only), null -> removed, Blob -> new photo
export default function ExpenseForm({ categories, initial, onSubmit, submitLabel, onNeedCategory }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [date, setDate] = useState(initial?.date ?? todayISO())
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [photo, setPhoto] = useState(undefined)
  const [photoUrl, setPhotoUrl] = useState(null) // Preview of the newly chosen photo
  const [savedUrl, setSavedUrl] = useState(null) // Photo already stored with this expense
  const [photoBusy, setPhotoBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Edit mode: load the photo already attached to this expense
  useEffect(() => {
    if (!initial?.hasReceipt) return
    let objectUrl = null
    let cancelled = false
    getReceipt(initial.id)
      .then((blob) => {
        if (blob && !cancelled) { objectUrl = URL.createObjectURL(blob); setSavedUrl(objectUrl) }
      })
      .catch(() => {})
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [initial?.id, initial?.hasReceipt])

  // Preview of the new photo
  useEffect(() => {
    if (!(photo instanceof Blob)) { setPhotoUrl(null); return }
    const objectUrl = URL.createObjectURL(photo)
    setPhotoUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [photo])

  // An expense needs a category, so guide the user if none exists yet.
  // (Hooks above must run before this early return.)
  if (categories.length === 0) {
    return (
      <div className="empty">
        <p>You need at least one category before adding an expense.</p>
        {onNeedCategory && <button className="btn primary" onClick={onNeedCategory}>Create a category</button>}
      </div>
    )
  }

  const shownUrl = photo instanceof Blob ? photoUrl : photo === null ? null : savedUrl

  const reset = () => {
    setName('')
    setAmount('')
    setPhoto(undefined)
  }

  // Compress the chosen image before keeping it
  const choosePhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // Allows choosing the same file again
    if (!file) return
    setPhotoBusy(true)
    setError('')
    try {
      setPhoto(await compressImage(file))
    } catch (err) {
      setError(err.message)
    } finally {
      setPhotoBusy(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!isValidExpense({ amount, date, categoryId })) return
    setSaving(true)
    setError('')
    try {
      await onSubmit({ name, amount, date, categoryId }, photo)
      if (!initial) reset()
    } catch (err) {
      setError(`Not saved: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <label className="field">
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly groceries" maxLength={60} />
      </label>

      <label className="field">
        <span>Amount (€)</span>
        <input type="number" inputMode="decimal" step="0.01" min="0.01" value={amount}
          onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
      </label>

      <label className="field">
        <span>Date</span>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>

      <label className="field">
        <span>Category</span>
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
          <option value="">Select a category...</option>
          {TYPES.map((t) => {
            const list = categories.filter((c) => c.type === t.id)
            return list.length > 0 && (
              <optgroup key={t.id} label={t.label}>
                {list.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </optgroup>
            )
          })}
        </select>
      </label>

      <div className="field">
        <span>Receipt photo <small className="muted">(optional)</small></span>
        {shownUrl && <img className="photo-preview" src={shownUrl} alt="Receipt preview" />}
        {photoBusy && <small className="muted">Preparing photo...</small>}
        <div className="photo-actions">
          <label className="btn-sm file-pick">
            {shownUrl ? 'Change photo' : '📷 Add photo'}
            <input type="file" accept="image/*" onChange={choosePhoto} disabled={photoBusy} />
          </label>
          {shownUrl && (
            <button type="button" className="btn-sm danger" onClick={() => setPhoto(null)}>Remove photo</button>
          )}
        </div>
      </div>

      {error && <p className="alert">{error}</p>}

      <button className="btn primary" type="submit" disabled={saving || photoBusy}>
        {saving ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
