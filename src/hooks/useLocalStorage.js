import { useEffect, useState } from 'react'

// Works like useState, but the value is persisted in the browser's localStorage.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue // Corrupted data or storage unavailable
    }
  })

  // Save every change
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* Storage full or blocked: ignore silently */
    }
  }, [key, value])

  return [value, setValue]
}
