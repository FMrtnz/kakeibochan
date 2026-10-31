import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { TYPES, PALETTE, getType } from '../models/constants.js'
import { expenseLabel, sumAmounts, totalsByType, totalsByCategory } from '../models/expenseModel.js'
import { weeklyBreakdown } from '../models/budgetModel.js'

// ---------- Small helpers ----------
// "EUR" is used instead of the euro sign: it is safe with the standard PDF fonts
const money = (n) =>
  new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0) + ' EUR'

// "#RRGGBB" -> [r, g, b]
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

const DARK = [30, 30, 45]
const MUTED = [120, 125, 150]

// Generates the monthly report (summary, weekly budget, charts, expense list) and downloads it.
export function generateMonthlyReport({ month, categories, expenses, budget }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentW = pageW - margin * 2
  const catById = Object.fromEntries(categories.map((c) => [c.id, c]))
  const monthLabel = new Date(month + '-01T00:00:00').toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  const total = sumAmounts(expenses)
  let y = 0

  // Start a new page if the next block does not fit
  const ensureSpace = (height) => {
    if (y + height > pageH - 18) {
      doc.addPage()
      y = 20
    }
  }

  const sectionTitle = (text) => {
    ensureSpace(14)
    doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...DARK)
    doc.text(text, margin, y)
    y += 6
  }

  // ---------- Header ----------
  doc.setFillColor(...DARK).rect(0, 0, pageW, 28, 'F')
  doc.setTextColor(255, 255, 255).setFont('helvetica', 'bold').setFontSize(18)
  doc.text('Kakeibochan', margin, 13)
  doc.setFont('helvetica', 'normal').setFontSize(10)
  doc.text(`Monthly report - ${monthLabel}`, margin, 21)
  doc.text(`Generated on ${new Date().toLocaleDateString('en-GB')}`, pageW - margin, 21, { align: 'right' })
  y = 38

  // ---------- Summary boxes ----------
  const boxes = [
    { label: 'Total spent', value: money(total), color: [0, 158, 247] },
    ...totalsByType(expenses, categories, TYPES).map((t) => ({ label: t.label, value: money(t.total), color: rgb(t.color) }))
  ]
  const gap = 4
  const boxW = (contentW - gap * 3) / 4
  boxes.forEach((b, i) => {
    const x = margin + i * (boxW + gap)
    doc.setFillColor(...b.color).roundedRect(x, y, 2, 16, 1, 1, 'F')
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...MUTED)
    doc.text(b.label, x + 5, y + 5)
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...DARK)
    doc.text(b.value, x + 5, y + 12)
  })
  y += 24

  // Monthly budget line
  doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...DARK)
  if (budget > 0) {
    const left = budget - total
    doc.text(
      `Monthly budget: ${money(budget)}   |   ${left >= 0 ? 'Remaining' : 'Over budget by'}: ${money(Math.abs(left))}`,
      margin, y
    )
  } else {
    doc.text('Monthly budget: not set', margin, y)
  }
  y += 10

  // ---------- Weekly budget table ----------
  sectionTitle('Weekly budget')
  const weeks = weeklyBreakdown(expenses, month, budget)
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Week', 'Days', 'Budget', 'Spent', 'Remaining']],
    body: weeks.map((w) => [
      `Week ${w.week}`, w.days,
      budget > 0 ? money(w.limit) : '-', money(w.spent), budget > 0 ? money(w.remaining) : '-'
    ]),
    headStyles: { fillColor: [0, 158, 247] },
    styles: { fontSize: 9 },
    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
    // Negative remaining amounts are shown in red
    didParseCell: (d) => {
      if (d.section === 'body' && d.column.index === 4 && String(d.cell.raw).startsWith('-') && d.cell.raw !== '-') {
        d.cell.styles.textColor = [241, 65, 108]
      }
    }
  })
  y = (doc.lastAutoTable?.finalY ?? y) + 12

  // ---------- Charts ----------
  const data = totalsByCategory(expenses, categories, PALETTE)
  sectionTitle('Spending by category')

  if (data.length === 0) {
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...MUTED)
    doc.text('No spending recorded for this month.', margin, y + 4)
    y += 14
  } else {
    // --- Pie (donut) chart with its legend ---
    const legendH = data.length * 6
    const pieH = Math.max(66, legendH + 4)
    ensureSpace(pieH + 4)
    const r = 30
    const cx = margin + r + 4
    const cy = y + pieH / 2
    const sum = data.reduce((s, d) => s + d.value, 0)
    let start = -Math.PI / 2

    data.forEach((d) => {
      const angle = (d.value / sum) * Math.PI * 2
      const steps = Math.max(2, Math.ceil(angle / (Math.PI / 90)))
      // Build the slice as a polygon: center -> arc points -> back to center
      const pts = [[cx, cy]]
      for (let i = 0; i <= steps; i++) {
        const a = start + (angle * i) / steps
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
      }
      const segments = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]])
      doc.setFillColor(...rgb(d.color)).lines(segments, pts[0][0], pts[0][1], [1, 1], 'F', true)
      start += angle
    })
    doc.setFillColor(255, 255, 255).circle(cx, cy, r * 0.55, 'F') // Donut hole

    // Legend: colour, name, amount and share
    const lx = margin + r * 2 + 18
    let ly = cy - legendH / 2 + 4
    data.forEach((d) => {
      doc.setFillColor(...rgb(d.color)).rect(lx, ly - 3, 4, 4, 'F')
      doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...DARK)
      doc.text(`${d.name}`, lx + 7, ly)
      doc.setTextColor(...MUTED)
      doc.text(`${money(d.value)}  (${Math.round((d.value / sum) * 100)}%)`, pageW - margin, ly, { align: 'right' })
      ly += 6
    })
    y += pieH + 8

    // --- Column chart ---
    const chartH = 58
    ensureSpace(chartH + 14)
    const max = Math.max(...data.map((d) => d.value))
    const base = y + chartH - 12 // Baseline (room below for the labels)
    const slot = contentW / data.length
    const barW = Math.min(22, slot * 0.6)

    doc.setDrawColor(210, 214, 225).line(margin, base, margin + contentW, base)
    data.forEach((d, i) => {
      const h = (d.value / max) * (chartH - 24)
      const x = margin + i * slot + (slot - barW) / 2
      doc.setFillColor(...rgb(d.color)).rect(x, base - h, barW, h, 'F')
      doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(...DARK)
      doc.text(money(d.value), x + barW / 2, base - h - 2, { align: 'center' })
      doc.setFont('helvetica', 'normal').setTextColor(...MUTED)
      const label = d.name.length > 12 ? d.name.slice(0, 11) + '.' : d.name
      doc.text(label, x + barW / 2, base + 5, { align: 'center' })
    })
    y += chartH + 8
  }

  // ---------- Expense list ----------
  sectionTitle('Expenses')
  if (expenses.length === 0) {
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor(...MUTED)
    doc.text('No expenses recorded for this month.', margin, y + 4)
  } else {
    const sorted = [...expenses].sort((a, b) => a.date.localeCompare(b.date))
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Date', 'Name', 'Category', 'Type', 'Amount']],
      body: sorted.map((e) => {
        const cat = catById[e.categoryId]
        return [
          new Date(e.date + 'T00:00:00').toLocaleDateString('en-GB'),
          expenseLabel(e, cat), cat?.name ?? '-', cat ? getType(cat.type).label : '-', money(e.amount)
        ]
      }),
      foot: [['', '', '', 'Total', money(total)]],
      headStyles: { fillColor: [0, 158, 247] },
      footStyles: { fillColor: [245, 248, 250], textColor: DARK },
      styles: { fontSize: 9 },
      columnStyles: { 4: { halign: 'right' } }
    })
  }

  // ---------- Page numbers ----------
  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...MUTED)
    doc.text(`Page ${i} / ${pages}`, pageW / 2, pageH - 8, { align: 'center' })
  }

  doc.save(`kakeibochan-report-${month}.pdf`)
}
