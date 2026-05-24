/* ============================================================
   rsvpCache.js
   Handles sessionStorage persistence of RSVP state.

   Why sessionStorage?
     - Persists through page refresh and SPA navigation
     - Cleared automatically when the browser tab closes
     - No server needed, no cookies, no login
     - Private per-tab — multiple guests on shared devices
       each get a fresh session when they open a new tab

   Keys stored:
     rsvp_invitee   → verified invitee name (string)
     rsvp_step      → last completed step (number)
     rsvp_form      → form field values (JSON)
     rsvp_submitted → whether final submit succeeded (bool)
   ============================================================ */

const KEYS = {
  invitee:   'rsvp_invitee',
  step:      'rsvp_step',
  form:      'rsvp_form',
  submitted: 'rsvp_submitted',
}

// ── Write ─────────────────────────────────────────────────────

export function cacheInvitee(name) {
  try { sessionStorage.setItem(KEYS.invitee, name) } catch {}
}

export function cacheStep(step) {
  try { sessionStorage.setItem(KEYS.step, String(step)) } catch {}
}

export function cacheForm(formData) {
  try { sessionStorage.setItem(KEYS.form, JSON.stringify(formData)) } catch {}
}

export function markSubmitted() {
  try { sessionStorage.setItem(KEYS.submitted, 'true') } catch {}
}

// ── Read ──────────────────────────────────────────────────────

export function getCachedInvitee() {
  try { return sessionStorage.getItem(KEYS.invitee) || null } catch { return null }
}

export function getCachedStep() {
  try {
    const s = sessionStorage.getItem(KEYS.step)
    return s !== null ? parseInt(s, 10) : null
  } catch { return null }
}

export function getCachedForm() {
  try {
    const raw = sessionStorage.getItem(KEYS.form)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function isSubmitted() {
  try { return sessionStorage.getItem(KEYS.submitted) === 'true' } catch { return false }
}

// ── Clear ─────────────────────────────────────────────────────

export function clearRsvpCache() {
  try {
    Object.values(KEYS).forEach(k => sessionStorage.removeItem(k))
  } catch {}
}

// ── Load full session state ───────────────────────────────────
// Returns null if no session found, or a state snapshot object
export function loadSession() {
  const invitee = getCachedInvitee()
  if (!invitee) return null   // no session at all

  return {
    inviteeName: invitee,
    step:        getCachedStep()      ?? 1,
    formData:    getCachedForm()      ?? null,
    submitted:   isSubmitted(),
  }
}
