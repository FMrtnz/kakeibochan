// Receipt photos are stored in IndexedDB, not localStorage: images are large and
// IndexedDB has a much bigger quota, so the expense data itself stays small.

const DB_NAME = 'kakeibochan-receipts'
const STORE = 'receipts'
const MAX_SIDE = 1280 // Longest side in pixels: enough to read a receipt, small enough to store
const JPEG_QUALITY = 0.8

// Open the database once and reuse the connection
let dbPromise = null
const openDb = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1)
      request.onupgradeneeded = () => request.result.createObjectStore(STORE)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Photos cannot be stored in this browser.'))
    })
  }
  return dbPromise
}

// Run one request in a transaction and resolve with its result
const run = async (mode, action) => {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const request = action(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(request?.result)
    tx.onerror = () => reject(new Error('The photo could not be saved.'))
  })
}

// Photos are keyed by the expense id
export const saveReceipt = (id, blob) => run('readwrite', (store) => store.put(blob, id))
export const getReceipt = (id) => run('readonly', (store) => store.get(id))
export const deleteReceipt = (id) => run('readwrite', (store) => store.delete(id))
export const deleteReceipts = (ids) => run('readwrite', (store) => ids.forEach((id) => store.delete(id)))

// Resize and re-encode a photo as JPEG (phone photos can be 5 to 10 MB)
export async function compressImage(file) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('This file is not a readable image.'))
      image.src = url
    })
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.width * scale)
    canvas.height = Math.round(img.height * scale)
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    return await new Promise((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The image could not be compressed.'))), 'image/jpeg', JPEG_QUALITY)
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}
