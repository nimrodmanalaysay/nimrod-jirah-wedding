/* ============================================================
   rsvpValidation.js
   All name validation, normalization, and matching logic.
   Import these wherever RSVP gate logic is needed.
   ============================================================ */

// ── Normalize ─────────────────────────────────────────────────
// Lowercase, strip accents, remove non-alpha (keeps spaces)
export function normalizeName(str = '') {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip accents: é → e
    .replace(/[^a-z\s]/g, '')          // strip digits, symbols
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Pre-validation ─────────────────────────────────────────────
// Returns an error string or null if input is acceptable to query
export function preValidate(input) {
  const trimmed = input.trim()

  if (!trimmed)
    return 'Please enter your name.'

  // Must have at least 2 real letters
  const letters = trimmed.replace(/[^a-zA-Z]/g, '')
  if (letters.length < 2)
    return 'Please enter a valid guest name.'

  // Reject symbol-only or digit-heavy inputs (e.g. "123456", "!!??")
  const alphaRatio = letters.length / trimmed.length
  if (alphaRatio < 0.5)
    return 'Please enter a valid guest name.'

  // Reject obvious gibberish: no vowels at all in a long string
  const hasVowel = /[aeiouAEIOU]/.test(trimmed)
  if (!hasVowel && letters.length > 3)
    return "We couldn't find your invitation. Please check your name."

  return null
}

// ── Find all matches ───────────────────────────────────────────
// Returns array of matching invitee name strings (could be >1)
export function findMatches(typed, nameList) {
  const t = normalizeName(typed)
  if (!t) return []

  return nameList.filter(name => {
    const n = normalizeName(name)
    return n === t || n.includes(t) || t.includes(n)
  })
}

// ── First-name-only disambiguation ────────────────────────────
// Returns true if ALL matches share the same first word (first name)
// This detects the "multiple Johns" situation
export function hasAmbiguousFirstName(matches) {
  if (matches.length <= 1) return false
  const firstNames = matches.map(n => normalizeName(n).split(' ')[0])
  const unique = new Set(firstNames)
  // Ambiguous = multiple people with the same first name token
  return unique.size === 1
}

// ── Disambiguate by last name ─────────────────────────────────
// Given a first name + last name, find the exact match
export function findByFullName(firstName, lastName, nameList) {
  const f = normalizeName(firstName)
  const l = normalizeName(lastName)
  return nameList.find(name => {
    const parts = normalizeName(name).split(' ')
    // Match if last name token appears in the name
    return parts[0].includes(f) && parts.slice(1).join(' ').includes(l)
  }) || null
}
