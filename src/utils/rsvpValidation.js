/* ============================================================
   rsvpValidation.js
   Single source of truth for all RSVP name matching logic.

   Design principles:
   ─────────────────
   • normalizeName()   — canonical form used in ALL comparisons
   • preValidate()     — fast local check, never touches the API
   • findMatches()     — strict word-boundary matching (no false positives)
   • hasAmbiguousFirstName() — detects "multiple Johns" situation
   • findByFullName()  — resolves ambiguity with last name
   • findExistingRsvp()— checks RSVP records by "Invitee Name" column
   ============================================================ */

// ── Normalize ─────────────────────────────────────────────────
// Returns a canonical lowercase string with:
//   • accents removed  (é→e, ñ→n)
//   • symbols/digits removed
//   • multiple spaces collapsed
//   • leading/trailing whitespace removed
export function normalizeName(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // strip combining accent marks
    .replace(/[^a-z\s]/g, '')          // strip everything except letters + spaces
    .replace(/\s+/g, ' ')              // collapse runs of whitespace
    .trim()
}

// ── Pre-validation ─────────────────────────────────────────────
// Runs entirely in the browser — no API call needed.
// Returns a user-visible error string, or null if input is worth querying.
export function preValidate(input) {
  const trimmed = String(input || '').trim()

  if (!trimmed)
    return 'Please enter your name.'

  const letters = trimmed.replace(/[^a-zA-Z]/g, '')

  // Must have at least 2 real letters
  if (letters.length < 2)
    return 'Please enter a valid guest name.'

  // Majority of characters must be letters — rejects "123", "!@#$", "1ab"
  if (letters.length / trimmed.length < 0.5)
    return 'Please enter a valid guest name.'

  // A long string with zero vowels is almost certainly gibberish
  // (e.g. "sdfghjkl", "qwrtpzxcv") — real names always have vowels
  if (letters.length > 3 && !/[aeiou]/.test(letters.toLowerCase()))
    return "We couldn't find your invitation. Please check your name."

  return null
}

// ── Internal: strict word-boundary match ──────────────────────
// Each word the user typed must appear as a complete word in the invitee name.
// This prevents "Ana" matching "Analisa", or "Mar" matching "Maria".
function wordsMatch(typedNorm, inviteeNorm) {
  const typedWords   = typedNorm.split(' ').filter(Boolean)
  const inviteeWords = inviteeNorm.split(' ').filter(Boolean)

  if (typedWords.length === 1) {
    // Single token: must be an exact word in the invitee name
    return inviteeWords.includes(typedWords[0])
  }

  // Multi-word: every typed word must appear somewhere in the name
  return typedWords.every(tw => inviteeWords.includes(tw))
}

// ── Find all invitee matches ───────────────────────────────────
// Returns every name from nameList that matches the typed input.
// Uses strict word-boundary logic (see wordsMatch above).
export function findMatches(typed, nameList) {
  const t = normalizeName(typed)
  if (!t) return []
  return nameList.filter(name => wordsMatch(t, normalizeName(name)))
}

// ── Detect first-name ambiguity ────────────────────────────────
// Returns true when all matches share the same first-name token,
// meaning the user typed only a first name shared by multiple guests.
// Example: ["John Santos", "John Reyes"] → true
export function hasAmbiguousFirstName(matches) {
  if (matches.length <= 1) return false
  const firstTokens = matches.map(n => normalizeName(n).split(' ')[0])
  return new Set(firstTokens).size === 1
}

// ── Disambiguate with last name ────────────────────────────────
// Given candidates from hasAmbiguousFirstName + a last name string,
// return the single matching invitee name or null.
export function findByFullName(firstName, lastName, candidates) {
  const f = normalizeName(firstName)
  const l = normalizeName(lastName)
  if (!f || !l) return null

  return candidates.find(name => {
    const words = normalizeName(name).split(' ').filter(Boolean)
    const first = words[0]
    const rest  = words.slice(1).join(' ')
    // First token must match AND last name must appear in the remainder
    return first === f && rest.includes(l)
  }) || null
}

// ── Duplicate RSVP detection ───────────────────────────────────
// Checks an array of RSVP sheet records for a matching "Invitee Name".
// This is the authoritative field per the RSVP sheet schema:
//   Column C header = "Invitee Name"
//
// Matching is done through normalizeName() so:
//   "John Doe", " john doe ", "JOHN DOE" all resolve to the same record.
//
// rsvpRecords — array of plain objects keyed by column header names,
//               as returned by the RSVP Apps Script doGet endpoint.
export function findExistingRsvp(inviteeName, rsvpRecords) {
  if (!Array.isArray(rsvpRecords) || !inviteeName) return null
  const target = normalizeName(inviteeName)
  return rsvpRecords.find(record => {
    const recorded = normalizeName(record['Invitee Name'] || '')
    return recorded !== '' && recorded === target
  }) || null
}

// ── Plus One eligibility check ─────────────────────────────────
// Reads the "Additional Invitee" value (column C of invitee sheet).
// Truthy values: TRUE, true, yes, YES, 1, y, Y
// Everything else (FALSE, empty, undefined) → not eligible.
export function isPlusOneEligible(value) {
  if (value === null || value === undefined) return false
  const v = String(value).trim().toLowerCase()
  return v === 'true' || v === 'yes' || v === '1' || v === 'y'
}
