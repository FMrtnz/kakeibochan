// Browser file helpers: save a text file, read an uploaded text file

// Download a CSV file. The BOM makes Excel read accents (é, è...) correctly.
export function saveTextFile(text, filename) {
  const blob = new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Read an uploaded file as text. Tries UTF-8 first, then the Windows encoding
// that older Excel versions use when saving a CSV.
export async function readTextFile(file) {
  const buffer = await file.arrayBuffer()
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer)
  } catch {
    return new TextDecoder('windows-1252').decode(buffer)
  }
}
