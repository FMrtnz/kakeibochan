// Category types (inspired by the Kakeibo method)
export const TYPES = [
  { id: 'survival', label: 'Survival', hint: 'Rent, food, transport...', color: '#F1416C' },
  { id: 'charges', label: 'Charges', hint: 'Subscriptions, bills, insurance...', color: '#7239EA' },
  { id: 'leisure', label: 'Leisure', hint: 'Hobbies, outings, treats...', color: '#17C653' }
]

export const getType = (id) => TYPES.find((t) => t.id === id) || TYPES[0]

// Colours used for the chart slices / bars (one per category)
export const PALETTE = ['#009EF7', '#7239EA', '#F1416C', '#17C653', '#FFC700', '#FF8A00', '#50CDCD', '#A1A5B7']
