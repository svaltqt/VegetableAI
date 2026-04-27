import { differenceInCalendarDays, format, isValid, parse } from "date-fns"
import { es } from "date-fns/locale"

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})(?:T|$)/

/**
 * Parses an ISO date string as a local date. Avoids the UTC shift caused by
 * `new Date("YYYY-MM-DD")` being interpreted as UTC midnight in negative-offset
 * timezones (e.g. UTC-5 turns 2026-04-23 into 2026-04-22).
 *
 * @param {string} value
 * @returns {Date | null}
 */
function parseIsoDateAsLocal(value) {
  const match = ISO_DATE_RE.exec(value)
  if (!match) return null
  const local = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return isValid(local) ? local : null
}

function parseWithFormats(value) {
  const formats = ["dd/MM/yyyy", "d/M/yyyy", "yyyy-MM-dd", "MM/yyyy", "M/yyyy"]
  for (const fmt of formats) {
    const parsed = parse(value, fmt, new Date())
    if (isValid(parsed)) return parsed
  }
  return null
}

export function parseDateInput(value) {
  if (!value) return null
  if (value instanceof Date) return isValid(value) ? value : null

  if (typeof value === "string") {
    const local = parseIsoDateAsLocal(value)
    if (local) return local
  }

  const direct = new Date(value)
  if (isValid(direct)) return direct

  return parseWithFormats(value)
}

export function formatDateLocal(value, pattern = "dd/MM/yyyy") {
  const date = parseDateInput(value)
  if (!date) return ""
  return format(date, pattern, { locale: es })
}

export function formatDateISO(value) {
  const date = parseDateInput(value)
  if (!date) return ""
  return format(date, "yyyy-MM-dd")
}

export function daysUntil(value) {
  const date = parseDateInput(value)
  if (!date) return null
  return differenceInCalendarDays(date, new Date())
}

export function humanizeDays(days) {
  if (days === null || days === undefined || Number.isNaN(days)) return ""
  if (days < 0) {
    const abs = Math.abs(days)
    return abs === 1 ? "Venció ayer" : `Venció hace ${abs} días`
  }
  if (days === 0) return "Vence hoy"
  if (days === 1) return "Vence mañana"
  return `Vence en ${days} días`
}

const DATE_REGEXES = [
  /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/g,
  /\b(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})\b/g,
  /\b(\d{1,2})\s+(ENE|FEB|MAR|ABR|MAY|JUN|JUL|AGO|SEP|OCT|NOV|DIC|JAN|APR|AUG|DEC)\s+(\d{2,4})\b/gi,
]

const MONTH_MAP = {
  ENE: 1, JAN: 1, FEB: 2, MAR: 2, ABR: 4, APR: 4, MAY: 5, JUN: 6, JUL: 7,
  AGO: 8, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DIC: 12, DEC: 12,
}

export function extractDateFromText(text) {
  if (!text) return null
  for (const regex of DATE_REGEXES) {
    const matches = [...text.matchAll(regex)]
    for (const m of matches) {
      let year, month, day
      if (m[2] && MONTH_MAP[m[2].toUpperCase()]) {
        day = parseInt(m[1], 10)
        month = MONTH_MAP[m[2].toUpperCase()]
        year = parseInt(m[3], 10)
      } else if (m[1].length === 4) {
        year = parseInt(m[1], 10)
        month = parseInt(m[2], 10)
        day = parseInt(m[3], 10)
      } else {
        day = parseInt(m[1], 10)
        month = parseInt(m[2], 10)
        year = parseInt(m[3], 10)
      }
      if (year < 100) year += 2000
      if (month < 1 || month > 12 || day < 1 || day > 31) continue
      const candidate = new Date(year, month - 1, day)
      if (isValid(candidate)) return candidate
    }
  }
  return null
}
