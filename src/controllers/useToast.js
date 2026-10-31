import { useRef, useState } from 'react'

// Tiny hook to show a confirmation message for a few seconds
export default function useToast() {
  const [message, setMessage] = useState('')
  const timer = useRef(null)

  const notify = (text) => {
    setMessage(text)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(''), 2500)
  }

  return { message, notify }
}
