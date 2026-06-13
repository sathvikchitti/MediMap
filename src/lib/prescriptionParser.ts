export interface ParsedMedicine {
  medicine_name: string
  strength: string
  frequency: string
  notes: string
}

const STRENGTH_REGEX = /(\d+(?:\.\d+)?\s*(?:mg|g|ml|mcg|iu|%|units?))/i
const FREQUENCY_REGEX =
  /(once\s+daily|twice\s+daily|thrice\s+daily|1-0-1|0-1-0|1-1-1|1-0-0|0-0-1|every\s+\d+\s+hours?|at\s+bedtime|before\s+meals|after\s+meals|\b(?:od|bd|tds|qid)\b)/i
const PREFIX_REGEX = /^(?:tab\.?|cap\.?|syr\.?|inj\.?|susp\.?)\s*/i
const SKIP_LINE_REGEX = /^(rx|dr\.?|patient|date|age|diagnosis|name|address|signature|reg\.?\s*no)/i

function normalizeFrequency(value: string) {
  const map: Record<string, string> = {
    od: 'Once daily',
    bd: 'Twice daily',
    tds: 'Thrice daily',
    qid: 'Four times daily',
  }
  const key = value.toLowerCase()
  return map[key] || value
}

function parseLine(line: string): ParsedMedicine | null {
  const normalized = line.replace(/\s+/g, ' ').trim()
  if (!normalized || normalized.length < 3 || SKIP_LINE_REGEX.test(normalized)) return null

  const strengthMatch = normalized.match(STRENGTH_REGEX)
  const frequencyMatch = normalized.match(FREQUENCY_REGEX)

  if (!strengthMatch && !frequencyMatch) {
    if (/^[A-Za-z][A-Za-z\s.-]{2,}$/.test(normalized)) {
      return {
        medicine_name: normalized.replace(PREFIX_REGEX, '').trim(),
        strength: '',
        frequency: '',
        notes: '',
      }
    }
    return null
  }

  let medicineName = normalized
  let strength = ''
  let frequency = ''
  let notes = ''

  if (strengthMatch && strengthMatch.index !== undefined) {
    strength = strengthMatch[1]
    medicineName = normalized.slice(0, strengthMatch.index).replace(PREFIX_REGEX, '').trim()
    medicineName = medicineName.replace(/[-–,:]+$/, '').trim()
  } else {
    medicineName = normalized.replace(PREFIX_REGEX, '').trim()
  }

  if (frequencyMatch && frequencyMatch.index !== undefined) {
    frequency = normalizeFrequency(frequencyMatch[1])
    const remainder = normalized
      .slice(frequencyMatch.index + frequencyMatch[0].length)
      .replace(/^[-–,:\s]+/, '')
      .trim()
    if (remainder && !STRENGTH_REGEX.test(remainder)) {
      notes = remainder
    }
  }

  if (!medicineName) return null

  return {
    medicine_name: medicineName,
    strength,
    frequency,
    notes,
  }
}

export function extractMedicinesFromText(text: string): ParsedMedicine[] {
  const lines = text
    .split(/\n|;/)
    .map(line => line.trim())
    .filter(Boolean)

  const seen = new Set<string>()
  const medicines: ParsedMedicine[] = []

  for (const line of lines) {
    const parsed = parseLine(line)
    if (!parsed) continue

    const key = parsed.medicine_name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    medicines.push(parsed)
  }

  return medicines
}
