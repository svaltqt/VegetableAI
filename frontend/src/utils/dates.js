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

const MONTH_MAP = {
  ENE: 1, JAN: 1, FEB: 2, MAR: 3, ABR: 4, APR: 4, MAY: 5, JUN: 6, JUL: 7,
  AGO: 8, AUG: 8, SEP: 9, SET: 9, OCT: 10, NOV: 11, DIC: 12, DEC: 12,
}

const ALPHA_MONTH = Object.keys(MONTH_MAP).join("|")

const DATE_REGEXES = [
  // Numéricas con separador y espacios opcionales: 28-11-2026, 22 - 08 - 2025, 12/04/26
  /\b(\d{1,2})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{2,4})\b/g,
  /\b(\d{4})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{1,2})\b/g,
  // Alfanuméricas: 15 ABR 2026, 15-MAR-2027
  new RegExp(`\\b(\\d{1,2})\\s*[-/. ]?\\s*(${ALPHA_MONTH})[A-Z]*\\.?\\s*[-/. ]?\\s*(\\d{2,4})\\b`, "gi"),
  // Compactas sin separador: 28012018, 280118
  /\b(\d{8}|\d{6})\b/g,
]

/** Construye una fecha local válida o null, normalizando años de 2 dígitos. */
function buildDate(day, month, year) {
  if (year < 100) year += 2000
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const candidate = new Date(year, month - 1, day)
  if (!isValid(candidate) || candidate.getDate() !== day) return null
  return candidate
}

/** Interpreta una secuencia compacta de 6 u 8 dígitos como fecha. */
function parseCompactDigits(digits) {
  if (digits.length === 8) {
    return (
      buildDate(+digits.slice(0, 2), +digits.slice(2, 4), +digits.slice(4, 8)) ||
      buildDate(+digits.slice(6, 8), +digits.slice(4, 6), +digits.slice(0, 4)) ||
      buildDate(+digits.slice(2, 4), +digits.slice(0, 2), +digits.slice(4, 8))
    )
  }
  if (digits.length === 6) {
    return (
      buildDate(+digits.slice(0, 2), +digits.slice(2, 4), +digits.slice(4, 6)) ||
      buildDate(+digits.slice(4, 6), +digits.slice(2, 4), +digits.slice(0, 2))
    )
  }
  return null
}

export function extractDateFromText(text) {
  if (!text) return null
  for (const regex of DATE_REGEXES) {
    const matches = [...text.matchAll(regex)]
    for (const m of matches) {
      let candidate = null
      if (m[2] && MONTH_MAP[m[2].toUpperCase()]) {
        candidate = buildDate(parseInt(m[1], 10), MONTH_MAP[m[2].toUpperCase()], parseInt(m[3], 10))
      } else if (m[3]) {
        candidate = m[1].length === 4
          ? buildDate(parseInt(m[3], 10), parseInt(m[2], 10), parseInt(m[1], 10))
          : buildDate(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10))
      } else {
        candidate = parseCompactDigits(m[1])
      }
      if (candidate) return candidate
    }
  }
  return null
}

// Palabras clave para distinguir vencimiento de producción/lote en una etiqueta.
const EXP_KEYWORDS = /(VEN|CAD|EXP|CONS|BEST\s*BEF|USE\s*BY|\bBB\b|ANTES)/
const PROD_KEYWORDS = /(PROD|FAB|ELAB|MFG|MFD|ENVAS|LOTE)/

/** Clasifica un candidato según la etiqueta que lo precede (ventana de 20 chars). */
function classifyDate(text, index) {
  const window = text.slice(Math.max(0, index - 20), index)
  if (EXP_KEYWORDS.test(window)) return "exp"
  if (PROD_KEYWORDS.test(window)) return "prod"
  return "neutral"
}

/**
 * Extrae la FECHA DE VENCIMIENTO de un texto OCR, anclando en palabras clave
 * (EXP/VENCE/CAD) y descartando producción/lote (PROD/FAB/LOTE). Soporta
 * fechas con separador, alfanuméricas y compactas. Devuelve { iso, raw } o null.
 */
export function extractExpirationFromText(text) {
  if (!text) return null
  const upper = text.toUpperCase()
  const candidates = []

  for (const regex of DATE_REGEXES) {
    for (const m of upper.matchAll(regex)) {
      let date = null
      if (m[2] && MONTH_MAP[m[2].toUpperCase()]) {
        date = buildDate(parseInt(m[1], 10), MONTH_MAP[m[2].toUpperCase()], parseInt(m[3], 10))
      } else if (m[3]) {
        date = m[1].length === 4
          ? buildDate(parseInt(m[3], 10), parseInt(m[2], 10), parseInt(m[1], 10))
          : buildDate(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10))
      } else {
        date = parseCompactDigits(m[1])
      }
      if (date) {
        candidates.push({ iso: format(date, "yyyy-MM-dd"), raw: m[0], label: classifyDate(upper, m.index) })
      }
    }
  }

  if (!candidates.length) return null
  const pickLatest = (arr) => arr.reduce((a, b) => (b.iso > a.iso ? b : a))
  const exp = candidates.filter((c) => c.label === "exp")
  if (exp.length) return pickLatest(exp)
  const neutral = candidates.filter((c) => c.label === "neutral")
  if (neutral.length) return pickLatest(neutral)
  return pickLatest(candidates)
}
