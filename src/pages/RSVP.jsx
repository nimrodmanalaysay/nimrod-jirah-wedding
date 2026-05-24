import React, { useState, useEffect } from 'react'
import './RSVP.css'
import {
  preValidate,
  findMatches,
  hasAmbiguousFirstName,
  findByFullName,
  normalizeName,
} from '../utils/rsvpValidation'
import {
  loadSession,
  cacheInvitee,
  cacheStep,
  cacheForm,
  markSubmitted,
  clearRsvpCache,
} from '../utils/rsvpCache'

/* ============================================================
   RSVP Page — Full flow with:
     • Session caching (survives refresh / navigation)
     • Duplicate-RSVP detection (skip gate if already submitted)
     • Ambiguous first-name disambiguation
     • Robust input validation (no gibberish, symbols, unknowns)

   GOOGLE SHEETS SETUP:
   ────────────────────
   SCRIPT A — Invitee Checker (GET, reads Column B)
   ────────────────────
   function doGet(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data  = sheet.getRange('B2:B').getValues();
     var names = data.flat().filter(function(n){ return n !== ''; });
     return ContentService
       .createTextOutput(JSON.stringify({ names: names }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   Deploy → Web App → Execute as: Me | Anyone

   SCRIPT B — RSVP Storage (POST, writes rows)
   ────────────────────
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data  = JSON.parse(e.postData.contents);
     var newId = sheet.getLastRow(); // header=row1, so lastRow = auto-id
     sheet.appendRow([
       newId, new Date(),
       data.inviteeName, data.attendance,
       data.firstName, data.lastName,
       data.email, data.phone,
       data.notes, data.advice
     ]);
     return ContentService
       .createTextOutput(JSON.stringify({ result: 'success' }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   Deploy → Web App → Execute as: Me | Anyone

   Sheet columns: A:ID | B:Timestamp | C:InviteeName | D:Attendance
                  E:FirstName | F:LastName | G:Email | H:Phone
                  I:Notes | J:Advice
   ============================================================ */

const INVITEE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxsQd3L8JnIagl9VY6sVizjrl2CpJI7Z9DX5sT3uK7v_68BJ4anQ3VlzCOH7ZBu3s9T/exec'
const RSVP_SCRIPT_URL    = 'https://script.google.com/macros/s/AKfycbzgBkS_Ej0GZpiw3wDm2Q6z7Gp7JM4wz1SXU5_--sRTSwXTl5UEjJolr0vMhwZ5ekQa/exec'

const INITIAL_FORM = {
  attendance: '',
  firstName:  '',
  lastName:   '',
  email:      '',
  phone:      '',
  notes:      '',
  advice:     '',
}

/* ─── Shared progress bar ─── */
function ProgressBar({ step, total }) {
  return (
    <div className="rsvp-progress" role="progressbar" aria-valuenow={step} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={[
            'rsvp-progress__dot',
            i < step  ? 'done'   : '',
            i === step ? 'active' : '',
          ].filter(Boolean).join(' ')}
        />
      ))}
    </div>
  )
}

/* ─── STEP 0: Name Gate ───────────────────────────────────────
   Handles:
   • Pre-validation (gibberish, symbols, empty)
   • API fetch with caching of the name list
   • Ambiguous first-name → shows last-name sub-step
   • Not-found → clear error message
*/
function StepGate({ onVerified }) {
  const [nameInput,    setNameInput]    = useState('')
  const [lastInput,    setLastInput]    = useState('')
  const [phase,        setPhase]        = useState('name')   // name | lastname | checking | error
  const [errorMsg,     setErrorMsg]     = useState('')
  const [candidates,   setCandidates]   = useState([])       // ambiguous matches

  function resetError() { setErrorMsg('') }

  async function handleNameSubmit() {
    // 1. Pre-validate input before hitting the API
    const validErr = preValidate(nameInput)
    if (validErr) { setErrorMsg(validErr); return }

    setPhase('checking')
    setErrorMsg('')

    try {
      const res   = await fetch(INVITEE_SCRIPT_URL)
      const data  = await res.json()
      const names = Array.isArray(data.names) ? data.names : []

      const matches = findMatches(nameInput, names)

      if (matches.length === 0) {
        // No match at all
        setPhase('error')
        setErrorMsg("We couldn't find your invitation. Please double-check your name or contact us.")
        return
      }

      if (matches.length === 1) {
        // Perfect single match → proceed
        onVerified(matches[0])
        return
      }

      // Multiple matches — check if it's a first-name collision
      if (hasAmbiguousFirstName(matches)) {
        // Same first name across multiple records → ask for last name
        setCandidates(matches)
        setPhase('lastname')
      } else {
        // Different names but all loosely match (e.g. "Ana" matches "Ana" and "Analisa")
        // Pick the closest one (exact or shortest)
        const exact = matches.find(
          m => normalizeName(m) === normalizeName(nameInput)
        )
        onVerified(exact || matches[0])
      }

    } catch {
      setPhase('error')
      setErrorMsg('Something went wrong. Please try again.')
    }
  }

  function handleLastNameSubmit() {
    const validErr = preValidate(lastInput)
    if (validErr) { setErrorMsg('Please enter your last name.'); return }

    const firstName = nameInput.trim()
    // Try to find the candidate whose last name matches
    const match = findByFullName(firstName, lastInput, candidates)

    if (!match) {
      setErrorMsg("We couldn't match that name. Please check your spelling.")
      return
    }

    onVerified(match)
  }

  function handleKey(e, fn) {
    if (e.key === 'Enter') fn()
  }

  const isChecking = phase === 'checking'

  return (
    <div className="rsvp-gate fade-up">
      <div className="rsvp-gate__icon">✉</div>
      <h2 className="rsvp-gate__title">You're Invited</h2>

      {/* ── Phase: name input ── */}
      {(phase === 'name' || phase === 'checking' || phase === 'error') && (
        <>
          <p className="rsvp-gate__sub">
            Enter your name as it appears on your invitation.
          </p>
          <div className="rsvp-gate__field">
            <input
              type="text"
              placeholder="Your full name"
              value={nameInput}
              onChange={e => { setNameInput(e.target.value); resetError(); setPhase('name') }}
              onKeyDown={e => handleKey(e, handleNameSubmit)}
              disabled={isChecking}
              autoFocus
              autoComplete="name"
            />
          </div>

          {errorMsg && (
            <p className="rsvp-gate__msg rsvp-gate__msg--error" role="alert">
              {errorMsg}
            </p>
          )}

          <button
            className="btn btn-primary rsvp-gate__btn"
            onClick={handleNameSubmit}
            disabled={isChecking || !nameInput.trim()}
          >
            {isChecking ? (
              <span className="rsvp-gate__spinner">Checking<span className="dots" /></span>
            ) : 'Check My Invitation'}
          </button>
        </>
      )}

      {/* ── Phase: last name disambiguation ── */}
      {phase === 'lastname' && (
        <>
          <p className="rsvp-gate__sub rsvp-gate__sub--disambig">
            We found multiple guests named <strong>{nameInput.trim()}</strong>.
            <br />Please enter your last name to continue.
          </p>
          <div className="rsvp-gate__field">
            <input
              type="text"
              placeholder="Your last name"
              value={lastInput}
              onChange={e => { setLastInput(e.target.value); resetError() }}
              onKeyDown={e => handleKey(e, handleLastNameSubmit)}
              autoFocus
              autoComplete="family-name"
            />
          </div>

          {errorMsg && (
            <p className="rsvp-gate__msg rsvp-gate__msg--error" role="alert">
              {errorMsg}
            </p>
          )}

          <div className="rsvp-gate__actions">
            <button
              className="btn btn-outline"
              onClick={() => { setPhase('name'); setLastInput(''); resetError() }}
            >
              ← Back
            </button>
            <button
              className="btn btn-primary"
              onClick={handleLastNameSubmit}
              disabled={!lastInput.trim()}
            >
              Confirm
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ─── STEP: Already Submitted ────────────────────────────────
   Shown when session cache says this guest already RSVPd.
   Skips the whole form — just shows their saved info.
*/
function StepAlreadyDone({ inviteeName, formData, onReset }) {
  const attending = formData?.attendance === 'attending'
  return (
    <div className="rsvp-done fade-up">
      <div className="rsvp-done__icon">{attending ? '🥂' : '💌'}</div>
      <h2 className="rsvp-done__title">You're all set, {inviteeName}!</h2>
      <p className="rsvp-done__msg">
        Your RSVP has already been submitted this session.
      </p>

      <div className="rsvp-done__summary">
        <div className="rsvp-done__row">
          <span>Attendance</span>
          <strong>{attending ? 'Joyfully Attending ✓' : 'Unable to Attend'}</strong>
        </div>
        {formData?.firstName && (
          <div className="rsvp-done__row">
            <span>Name on record</span>
            <strong>{formData.firstName} {formData.lastName}</strong>
          </div>
        )}
        {formData?.email && (
          <div className="rsvp-done__row">
            <span>Email</span>
            <strong>{formData.email}</strong>
          </div>
        )}
      </div>

      <p className="rsvp-done__note">
        Need to change something? Contact us directly.
      </p>

      <button className="btn btn-outline rsvp-done__reset" onClick={onReset}>
        Submit a different RSVP
      </button>
    </div>
  )
}

/* ─── STEP 1: Attendance ──────────────────────────────────── */
function StepAttendance({ inviteeName, data, onChange, onNext }) {
  return (
    <div className="rsvp-step fade-up">
      <p className="rsvp-step__greeting">Welcome, <strong>{inviteeName}</strong> 🎉</p>
      <h2 className="rsvp-step__title">Will you be joining us?</h2>
      <p className="rsvp-step__sub">November 7, 2026 · Grass Garden</p>

      <div className="rsvp-attend__options">
        {[
          { value: 'attending',     icon: '🥂', label: 'Joyfully Attending' },
          { value: 'not-attending', icon: '💌', label: 'Regretfully Unable' },
        ].map(opt => (
          <button
            key={opt.value}
            className={`rsvp-attend__card ${data.attendance === opt.value ? 'selected' : ''}`}
            onClick={() => onChange('attendance', opt.value)}
          >
            <span className="rsvp-attend__icon">{opt.icon}</span>
            <span className="rsvp-attend__label">{opt.label}</span>
          </button>
        ))}
      </div>

      <button
        className="btn btn-primary rsvp-step__next"
        onClick={onNext}
        disabled={!data.attendance}
      >
        Continue →
      </button>
    </div>
  )
}

/* ─── STEP 2: Contact Info ───────────────────────────────── */
function StepContact({ data, onChange, onNext, onBack }) {
  const valid = data.firstName.trim() && data.lastName.trim() && data.email.trim()

  return (
    <div className="rsvp-step fade-up">
      <h2 className="rsvp-step__title">Your Details</h2>
      <p className="rsvp-step__sub">So we know how to reach you</p>

      <div className="rsvp-fields">
        <div className="rsvp-row">
          <div className="rsvp-field">
            <label htmlFor="fn">First Name *</label>
            <input id="fn" type="text" placeholder="First name"
              value={data.firstName} onChange={e => onChange('firstName', e.target.value)} />
          </div>
          <div className="rsvp-field">
            <label htmlFor="ln">Last Name *</label>
            <input id="ln" type="text" placeholder="Last name"
              value={data.lastName} onChange={e => onChange('lastName', e.target.value)} />
          </div>
        </div>
        <div className="rsvp-field">
          <label htmlFor="em">Email Address *</label>
          <input id="em" type="email" placeholder="you@example.com"
            value={data.email} onChange={e => onChange('email', e.target.value)} />
        </div>
        <div className="rsvp-field">
          <label htmlFor="ph">Phone Number</label>
          <input id="ph" type="tel" placeholder="+63 9XX XXX XXXX"
            value={data.phone} onChange={e => onChange('phone', e.target.value)} />
        </div>
      </div>

      <div className="rsvp-step__actions">
        <button className="btn btn-outline rsvp-step__back" onClick={onBack}>← Back</button>
        <button className="btn btn-primary rsvp-step__next" onClick={onNext} disabled={!valid}>
          Continue →
        </button>
      </div>
    </div>
  )
}

/* ─── STEP 3: Personal Touch ─────────────────────────────── */
function StepPersonal({ data, onChange, onSubmit, onBack, submitting }) {
  return (
    <div className="rsvp-step fade-up">
      <h2 className="rsvp-step__title">A Little Extra</h2>
      <p className="rsvp-step__sub">Share something special with us</p>

      <div className="rsvp-fields">
        <div className="rsvp-field">
          <label htmlFor="notes">Notes / Dietary Requirements</label>
          <textarea id="notes" rows={3}
            placeholder="Dietary needs, song requests, anything you'd like us to know…"
            value={data.notes} onChange={e => onChange('notes', e.target.value)} />
        </div>
        <div className="rsvp-field">
          <label htmlFor="advice">Best Advice for the Couple ✨</label>
          <textarea id="advice" rows={4}
            placeholder="Share your best marriage advice or a heartfelt message…"
            value={data.advice} onChange={e => onChange('advice', e.target.value)} />
        </div>
      </div>

      <div className="rsvp-step__actions">
        <button className="btn btn-outline rsvp-step__back" onClick={onBack}>← Back</button>
        <button className="btn btn-primary rsvp-step__next" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Sending…' : 'Send RSVP 💌'}
        </button>
      </div>
    </div>
  )
}

/* ─── STEP 4: Success ────────────────────────────────────── */
function StepSuccess({ inviteeName, attendance }) {
  return (
    <div className="rsvp-success fade-up">
      <div className="rsvp-success__icon">
        {attendance === 'attending' ? '🥂' : '💌'}
      </div>
      <h2 className="rsvp-success__title">
        {attendance === 'attending' ? 'See you there!' : "We'll miss you!"}
      </h2>
      <p className="rsvp-success__msg">
        {attendance === 'attending'
          ? `Thank you, ${inviteeName}! We can't wait to celebrate with you on November 7. 🎉`
          : `Thank you, ${inviteeName}. We're sad you can't make it, but we appreciate you letting us know. 💛`
        }
      </p>
    </div>
  )
}

/* ─── MAIN RSVP COMPONENT ────────────────────────────────── */
export default function RSVP() {
  const [step,        setStep]        = useState(null)    // null = loading from cache
  const [inviteeName, setInviteeName] = useState('')
  const [formData,    setFormData]    = useState(INITIAL_FORM)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Restore session on mount ──
  useEffect(() => {
    const session = loadSession()

    if (session) {
      setInviteeName(session.inviteeName)
      if (session.formData) setFormData(prev => ({ ...prev, ...session.formData }))

      if (session.submitted) {
        // Already submitted this session — show the "already done" screen
        setStep('done')
      } else {
        // Restore to whichever step they were on
        setStep(session.step)
      }
    } else {
      // Fresh start
      setStep(0)
    }
  }, [])

  // ── Sync step to cache whenever it changes ──
  useEffect(() => {
    if (step !== null && step !== 'done') cacheStep(step)
  }, [step])

  // ── Sync form to cache whenever it changes ──
  useEffect(() => {
    if (step > 0) cacheForm(formData)
  }, [formData]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleField(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  function handleVerified(name) {
    setInviteeName(name)
    cacheInvitee(name)
    setStep(1)
  }

  function handleReset() {
    clearRsvpCache()
    setStep(0)
    setInviteeName('')
    setFormData(INITIAL_FORM)
    setSubmitError('')
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')

    try {
      await fetch(RSVP_SCRIPT_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteeName,
          attendance: formData.attendance,
          firstName:  formData.firstName,
          lastName:   formData.lastName,
          email:      formData.email,
          phone:      formData.phone,
          notes:      formData.notes,
          advice:     formData.advice,
        }),
      })
      // Mark as submitted so refresh → "already done" screen
      markSubmitted()
      cacheForm(formData)
      setStep(4)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const TOTAL_STEPS = 3

  // Show nothing while restoring session (prevents flash)
  if (step === null) {
    return (
      <div className="rsvp-page">
        <div className="rsvp-card rsvp-card--loading">
          <div className="rsvp-spinner" aria-label="Loading…" />
        </div>
      </div>
    )
  }

  return (
    <div className="rsvp-page">
      <div className="rsvp-page__header">
        <h1 className="section-title">RSVP</h1>
        <span className="section-divider" />
        <p className="rsvp-page__sub">Kindly reply by October 1, 2026</p>
      </div>

      <div className="rsvp-card">
        {/* Progress bar for steps 1–3 */}
        {typeof step === 'number' && step >= 1 && step <= 3 && (
          <ProgressBar step={step - 1} total={TOTAL_STEPS} />
        )}

        {/* ── Step router ── */}
        {step === 0      && <StepGate onVerified={handleVerified} />}

        {step === 'done' && (
          <StepAlreadyDone
            inviteeName={inviteeName}
            formData={formData}
            onReset={handleReset}
          />
        )}

        {step === 1 && (
          <StepAttendance
            inviteeName={inviteeName}
            data={formData}
            onChange={handleField}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepContact
            data={formData}
            onChange={handleField}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <>
            <StepPersonal
              data={formData}
              onChange={handleField}
              onSubmit={handleSubmit}
              onBack={() => setStep(2)}
              submitting={submitting}
            />
            {submitError && (
              <p className="rsvp-error" role="alert">{submitError}</p>
            )}
          </>
        )}

        {step === 4 && (
          <StepSuccess
            inviteeName={inviteeName}
            attendance={formData.attendance}
          />
        )}
      </div>
    </div>
  )
}
