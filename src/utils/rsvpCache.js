/* ============================================================
   rsvpCache.js — sessionStorage RSVP persistence

   Why sessionStorage?
   • Survives page refresh and SPA navigation within the tab
   • Cleared automatically when the tab is closed
   • Each tab is isolated — safe for shared devices at a venue

   Stored keys:
     rsvp_invitee   → verified invitee name (string)
     rsvp_step      → last active step number or string ('done'/'existing')
     rsvp_form      → serialized form field object
     rsvp_submitted → 'true' after a successful POST
     rsvp_existing  → serialized existing RSVP record from sheet (if any)
   ============================================================ */

const K = {
  invitee:  'rsvp_invitee',
  step:     'rsvp_step',
  form:     'rsvp_form',
  submitted:'rsvp_submitted',
  existing: 'rsvp_existing',
  plusOne:  'rsvp_plus_one',
  eligible: 'rsvp_eligible',
}

// ── Write helpers ─────────────────────────────────────────────
export function cacheInvitee(name)    { try { sessionStorage.setItem(K.invitee,  name)                    } catch {} }
export function cacheStep(step)       { try { sessionStorage.setItem(K.step,     String(step))             } catch {} }
export function cacheForm(data)       { try { sessionStorage.setItem(K.form,     JSON.stringify(data))     } catch {} }
export function markSubmitted()       { try { sessionStorage.setItem(K.submitted,'true')                   } catch {} }
export function cacheExistingRsvp(r)  { try { sessionStorage.setItem(K.existing, JSON.stringify(r))        } catch {} }

export function cachePlusOneForm(data)  { try { sessionStorage.setItem(K.plusOne,  JSON.stringify(data)) } catch {} }
export function cachePlusOneEligible(v){ try { sessionStorage.setItem(K.eligible, String(v))               } catch {} }

// ── Read helpers ──────────────────────────────────────────────
export function getCachedInvitee()    { try { return sessionStorage.getItem(K.invitee) || null             } catch { return null } }
export function isSubmitted()         { try { return sessionStorage.getItem(K.submitted) === 'true'        } catch { return false } }

export function getCachedStep() {
  try {
    const s = sessionStorage.getItem(K.step)
    if (s === null) return null
    const n = parseInt(s, 10)
    return isNaN(n) ? s : n   // preserve string steps like 'done' / 'existing'
  } catch { return null }
}

export function getCachedForm() {
  try { const r = sessionStorage.getItem(K.form); return r ? JSON.parse(r) : null } catch { return null }
}

export function getCachedExistingRsvp() {
  try { const r = sessionStorage.getItem(K.existing); return r ? JSON.parse(r) : null } catch { return null }
}

export function getCachedPlusOneForm() {
  try { const r = sessionStorage.getItem(K.plusOne); return r ? JSON.parse(r) : null } catch { return null }
}
export function getCachedPlusOneEligible() {
  try {
    const v = sessionStorage.getItem(K.eligible)
    return v === null ? null : v === 'true'
  } catch { return null }
}

// ── Clear everything ──────────────────────────────────────────
export function clearRsvpCache() {
  try { Object.values(K).forEach(k => sessionStorage.removeItem(k)) } catch {}
}

// ── Load full session snapshot ────────────────────────────────
// Returns null if no session exists, otherwise a complete state object
// that the RSVP component uses on mount to restore exactly where the
// guest left off.
export function loadSession() {
  const invitee = getCachedInvitee()
  if (!invitee) return null

  return {
    inviteeName:    invitee,
    step:           getCachedStep()           ?? 1,
    formData:       getCachedForm()           ?? null,
    submitted:      isSubmitted(),
    existingRsvp:   getCachedExistingRsvp()   ?? null,
    plusOneForm:    getCachedPlusOneForm()     ?? null,
    plusOneEligible:getCachedPlusOneEligible() ?? false,
  }
}
