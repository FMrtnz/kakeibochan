import { TYPES } from './constants.js'
import { uid } from '../utils/format.js'

// Clean the fields coming from a form
export const buildCategoryFields = ({ name, type }) => ({ name: name.trim(), type })

// A new category = cleaned fields + a unique id
export const createCategory = (fields) => ({ id: uid(), ...buildCategoryFields(fields) })

export const isValidCategory = ({ name, type }) =>
  name.trim().length > 0 && TYPES.some((t) => t.id === type)
