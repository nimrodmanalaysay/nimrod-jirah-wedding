import React, { useState, useEffect } from 'react'
import './RSVP.css'
import {
  preValidate,
  findMatches,
  hasAmbiguousFirstName,
  findByFullName,
  findExistingRsvp,
} from '../utils/rsvpValidation'
import {
  loadSession,
  cacheInvitee,
  cacheStep,
  cacheForm,
  markSubmitted,
  clearRsvpCache,
  cacheExistingRsvp,
  getCachedExistingRsvp,
} from '../utils/rsvpCache'

/* ============================================================
   RSVP Page — Complete flow

   STEP FLOW:
     null       → restoring session (spinner)
     0          → name gate (invitee lookup)
     'existing' → guest already in RSVP sheet → show their record
     1          → attendance choice
     2          → contact info (first name, last name, email)
     3          → personal touch (notes, advice)
     4          → success screen
     'done'     → submitted this session tab (refresh-safe)

   DUPLICATE PREVENTION:
     After verifying the invitee name against INVITEE_SCRIPT_URL,
     we call RSVP_SCRIPT_URL (doGet) to check for an existing record
     in the "Invitee Name" column. If found → 'existing' step.
     No duplicate row is written.

   ─────────────────────────────────────────────────────────────
   GOOGLE SHEETS — TWO SCRIPTS REQUIRED

   ── SCRIPT A: Invitee list (INVITEE_SCRIPT_URL) ──
   Reads column B of the invitee spreadsheet.

     function doGet(e) {
       var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       var data  = sheet.getRange('B2:B').getValues();
       var names = data.flat().filter(function(n){ return n !== ''; });
       return ContentService
         .createTextOutput(JSON.stringify({ names: names }))
         .setMimeType(ContentService.MimeType.JSON);
     }

   Deploy → Web App → Execute as: Me | Anyone

   ── SCRIPT B: RSVP sheet (RSVP_SCRIPT_URL) ──
   Supports BOTH doGet (read records for duplicate check)
   AND doPost (write new RSVP row).

   IMPORTANT — Sheet column headers (row 1) must be exactly:
     ID | Timestamp | Invitee Name | Attendance |
     First Name | Last Name | Email | Notes | Advice

     function doGet(e) {
       var sheet   = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       var lastCol = sheet.getLastColumn();
       var lastRow = sheet.getLastRow();
       var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
       if (lastRow < 2) {
         return ContentService
           .createTextOutput(JSON.stringify({ records: [] }))
           .setMimeType(ContentService.MimeType.JSON);
       }
       var rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
       var records = rows
         .filter(function(r) { return r[2]; })
         .map(function(r) {
           var obj = {};
           headers.forEach(function(h, i) { obj[h] = r[i]; });
           return obj;
         });
       return ContentService
         .createTextOutput(JSON.stringify({ records: records }))
         .setMimeType(ContentService.MimeType.JSON);
     }

     function doPost(e) {
       var sheet  = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       var data   = JSON.parse(e.postData.contents);
       var newId  = sheet.getLastRow();
       sheet.appendRow([
         newId,
         new Date(),
         data.inviteeName,
         data.attendance,
         data.firstName,
         data.lastName,
         data.email,
         data.notes,
         data.advice
       ]);
       return ContentService
         .createTextOutput(JSON.stringify({ result: 'success' }))
         .setMimeType(ContentService.MimeType.JSON);
     }

   Deploy → Web App → Execute as: Me | Anyone
   ─────────────────────────────────────────────────────────────
   ============================================================ */

// ✏️ Your Apps Script Web App URLs
const INVITEE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxsQd3L8JnIagl9VY6sVizjrl2CpJI7Z9DX5sT3uK7v_68BJ4anQ3VlzCOH7ZBu3s9T/exec'
const RSVP_SCRIPT_URL    = 'https://script.google.com/macros/s/AKfycbw6X_tfEbyjNxIVTBr3WBZQwFKuFqJGmgqXQHWZR5FKH5ECBOzd3Pwuw-LeZWcOKZiQ/exec'

// Form state — phone removed entirely
const INITIAL_FORM = {
  attendance: '',
  firstName:  '',
  lastName:   '',
  email:      '',
  notes:      '',
  advice:     '',
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

/* Progress dots for steps 1–3 */
function ProgressBar({ step, total }) {
  return (
    <div className="rsvp-progress" role="progressbar" aria-valuenow={step} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={[
          'rsvp-progress__dot',
          i < step   ? 'done'   : '',
          i === step ? 'active' : '',
        ].filter(Boolean).join(' ')} />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 0 — NAME GATE
   Lookup flow:
     1. preValidate locally (no API for obvious junk)
     2. Fetch INVITEE_SCRIPT_URL → find matches
     3. If ambiguous first name → ask for last name
     4. Fetch RSVP_SCRIPT_URL (doGet) → check "Invitee Name" column
     5a. Record found → onDuplicate (skip form entirely)
     5b. No record   → onVerified  (proceed to step 1)
   ═══════════════════════════════════════════════════════════ */
function StepGate({ onVerified, onDuplicate }) {
  const [nameInput,  setNameInput]  = useState('')
  const [lastInput,  setLastInput]  = useState('')
  const [phase,      setPhase]      = useState('name') // name|lastname|checking|error
  const [errorMsg,   setErrorMsg]   = useState('')
  const [candidates, setCandidates] = useState([])

  const clearError = () => setErrorMsg('')
  const isChecking = phase === 'checking'

  // ── A: match against invitee list ──
  async function handleNameSubmit() {
    const localErr = preValidate(nameInput)
    if (localErr) { setErrorMsg(localErr); return }

    setPhase('checking')
    clearError()

    try {
      const res    = await fetch(INVITEE_SCRIPT_URL)
      const json   = await res.json()
      const names  = Array.isArray(json.names) ? json.names : []
      const matches = findMatches(nameInput, names)

      if (matches.length === 0) {
        setPhase('error')
        setErrorMsg("We couldn't find your invitation. Please double-check your name or contact us.")
        return
      }

      if (matches.length === 1) {
        await checkDuplicateAndProceed(matches[0])
        return
      }

      // Multiple matches — need disambiguation?
      if (hasAmbiguousFirstName(matches)) {
        setCandidates(matches)
        setPhase('lastname')
        return
      }

      // Different names that all loosely match — pick exact or first
      const exact = matches.find(
        m => m.trim().toLowerCase() === nameInput.trim().toLowerCase()
      )
      await checkDuplicateAndProceed(exact || matches[0])

    } catch {
      setPhase('error')
      setErrorMsg('Something went wrong connecting to the guest list. Please try again.')
    }
  }

  // ── B: resolve last-name disambiguation ──
  async function handleLastNameSubmit() {
    const localErr = preValidate(lastInput)
    if (localErr) { setErrorMsg('Please enter a valid last name.'); return }

    const match = findByFullName(nameInput.trim(), lastInput.trim(), candidates)
    if (!match) {
      setErrorMsg("We couldn't find that name. Please check your spelling.")
      return
    }

    setPhase('checking')
    await checkDuplicateAndProceed(match)
  }

  // ── C: check RSVP sheet for existing record ──
  // Uses RSVP_SCRIPT_URL doGet which returns rows keyed by column headers.
  // "Invitee Name" (column C) is the authoritative match field.
  async function checkDuplicateAndProceed(verifiedName) {
    try {
      const res     = await fetch(RSVP_SCRIPT_URL)
      const json    = await res.json()
      const records = Array.isArray(json.records) ? json.records : []
      const existing = findExistingRsvp(verifiedName, records)

      if (existing) {
        onDuplicate(verifiedName, existing)
      } else {
        onVerified(verifiedName)
      }
    } catch {
      // Network hiccup on RSVP sheet — don't block the guest.
      // They'll proceed and a duplicate-prevention re-check can
      // be added server-side in the Apps Script doPost if needed.
      onVerified(verifiedName)
    }
  }

  return (
    <div className="rsvp-gate fade-up">
      <div className="rsvp-gate__icon">✉</div>
      <h2 className="rsvp-gate__title">You're Invited</h2>

      {/* ── Name input ── */}
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
              onChange={e => { setNameInput(e.target.value); clearError(); setPhase('name') }}
              onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
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
            {isChecking
              ? <span>Checking<span className="dots" /></span>
              : 'Check My Invitation'
            }
          </button>
        </>
      )}

      {/* ── Last-name disambiguation ── */}
      {phase === 'lastname' && (
        <>
          <div className="rsvp-gate__disambig">
            <span className="rsvp-gate__disambig-icon">👥</span>
            <p>
              We found multiple guests named{' '}
              <strong>{nameInput.trim()}</strong>.
              <br />Please enter your last name to continue.
            </p>
          </div>

          <div className="rsvp-gate__field">
            <input
              type="text"
              placeholder="Your last name"
              value={lastInput}
              onChange={e => { setLastInput(e.target.value); clearError() }}
              onKeyDown={e => e.key === 'Enter' && handleLastNameSubmit()}
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
              onClick={() => { setPhase('name'); setLastInput(''); clearError() }}
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

/* ═══════════════════════════════════════════════════════════
   STEP 'existing' — Already RSVP'd in sheet
   Reads directly from the record returned by RSVP_SCRIPT_URL doGet.
   "Invitee Name" column is the authoritative identifier.
   ═══════════════════════════════════════════════════════════ */
function StepExisting({ inviteeName, record, onReset }) {
  const attending = String(record['Attendance'] || '').toLowerCase() === 'attending'
  const submittedDate = record['Timestamp']
    ? new Date(record['Timestamp']).toLocaleDateString('en-PH', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <div className="rsvp-done fade-up">
      <div className="rsvp-done__icon">{attending ? '🥂' : '💌'}</div>
      <h2 className="rsvp-done__title">Already received!</h2>
      <p className="rsvp-done__msg">
        We already have your RSVP on file,{' '}
        <strong className="rsvp-done__name">{inviteeName}</strong>.
        <br />No further action needed.
      </p>

      <div className="rsvp-done__summary">
        <SummaryRow label="Attendance"
          value={attending ? 'Joyfully Attending ✓' : 'Unable to Attend'} />
        {(record['First Name'] || record['Last Name']) && (
          <SummaryRow label="Name on file"
            value={[record['First Name'], record['Last Name']].filter(Boolean).join(' ')} />
        )}
        {record['Email'] && (
          <SummaryRow label="Email" value={record['Email']} />
        )}
        {submittedDate && (
          <SummaryRow label="Submitted" value={submittedDate} />
        )}
      </div>

      <p className="rsvp-done__note">
        Need to make a change? Please contact us directly.
      </p>
      <button className="btn btn-outline rsvp-done__reset" onClick={onReset}>
        Submit a different RSVP
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 'done' — Submitted in this browser session
   ═══════════════════════════════════════════════════════════ */
function StepDone({ inviteeName, formData, onReset }) {
  const attending = formData?.attendance === 'attending'
  return (
    <div className="rsvp-done fade-up">
      <div className="rsvp-done__icon">{attending ? '🥂' : '💌'}</div>
      <h2 className="rsvp-done__title">You're all set, {inviteeName}!</h2>
      <p className="rsvp-done__msg">Your RSVP has been submitted successfully.</p>

      <div className="rsvp-done__summary">
        <SummaryRow label="Attendance"
          value={attending ? 'Joyfully Attending ✓' : 'Unable to Attend'} />
        {formData?.firstName && (
          <SummaryRow label="Name on record"
            value={`${formData.firstName} ${formData.lastName}`.trim()} />
        )}
        {formData?.email && (
          <SummaryRow label="Email" value={formData.email} />
        )}
      </div>

      <p className="rsvp-done__note">Need to change something? Contact us directly.</p>
      <button className="btn btn-outline rsvp-done__reset" onClick={onReset}>
        Submit a different RSVP
      </button>
    </div>
  )
}

/* Tiny shared helper for summary rows */
function SummaryRow({ label, value }) {
  return (
    <div className="rsvp-done__row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 1 — Attendance choice
   ═══════════════════════════════════════════════════════════ */
function StepAttendance({ inviteeName, data, onChange, onNext }) {
  return (
    <div className="rsvp-step fade-up">
      <p className="rsvp-step__greeting">
        Welcome, <strong>{inviteeName}</strong> 🎉
      </p>
      <h2 className="rsvp-step__title">Will you be joining us?</h2>
      <p className="rsvp-step__sub">November 7, 2026 · Grass Garden</p>

      <div className="rsvp-attend__options">
        {[
          { value: 'attending',     icon: '🥂', label: 'Joyfully Attending'  },
          { value: 'not-attending', icon: '💌', label: 'Regretfully Unable'  },
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

/* ═══════════════════════════════════════════════════════════
   STEP 2 — Contact info
   Phone field removed entirely.
   Required: First name, Last name, Email.
   ═══════════════════════════════════════════════════════════ */
function StepContact({ data, onChange, onNext, onBack }) {
  const valid = data.firstName.trim() && data.lastName.trim() && data.email.trim()

  return (
    <div className="rsvp-step fade-up">
      <h2 className="rsvp-step__title">Your Details</h2>
      <p className="rsvp-step__sub">So we know how to reach you</p>

      <div className="rsvp-fields">
        {/* First + Last name side by side */}
        <div className="rsvp-row">
          <div className="rsvp-field">
            <label htmlFor="rsvp-fn">First Name *</label>
            <input
              id="rsvp-fn"
              type="text"
              placeholder="First name"
              value={data.firstName}
              onChange={e => onChange('firstName', e.target.value)}
              autoComplete="given-name"
            />
          </div>
          <div className="rsvp-field">
            <label htmlFor="rsvp-ln">Last Name *</label>
            <input
              id="rsvp-ln"
              type="text"
              placeholder="Last name"
              value={data.lastName}
              onChange={e => onChange('lastName', e.target.value)}
              autoComplete="family-name"
            />
          </div>
        </div>

        {/* Email — full width */}
        <div className="rsvp-field">
          <label htmlFor="rsvp-em">Email Address *</label>
          <input
            id="rsvp-em"
            type="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
            autoComplete="email"
          />
        </div>
        {/* Phone field intentionally removed */}
      </div>

      <div className="rsvp-step__actions">
        <button className="btn btn-outline rsvp-step__back" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary rsvp-step__next"
          onClick={onNext}
          disabled={!valid}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 3 — Personal touch (notes + advice)
   ═══════════════════════════════════════════════════════════ */
function StepPersonal({ data, onChange, onSubmit, onBack, submitting }) {
  return (
    <div className="rsvp-step fade-up">
      <h2 className="rsvp-step__title">A Little Extra</h2>
      <p className="rsvp-step__sub">Share something special with us</p>

      <div className="rsvp-fields">
        <div className="rsvp-field">
          <label htmlFor="rsvp-notes">Notes / Dietary Requirements</label>
          <textarea
            id="rsvp-notes"
            rows={3}
            placeholder="Dietary needs, song requests, anything you'd like us to know…"
            value={data.notes}
            onChange={e => onChange('notes', e.target.value)}
          />
        </div>
        <div className="rsvp-field">
          <label htmlFor="rsvp-advice">Best Advice for the Couple ✨</label>
          <textarea
            id="rsvp-advice"
            rows={4}
            placeholder="Share your best marriage advice or a heartfelt message…"
            value={data.advice}
            onChange={e => onChange('advice', e.target.value)}
          />
        </div>
      </div>

      <div className="rsvp-step__actions">
        <button className="btn btn-outline rsvp-step__back" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary rsvp-step__next"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? 'Sending…' : 'Send RSVP 💌'}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 4 — Success
   ═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   MAIN RSVP COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function RSVP() {
  const [step,        setStep]        = useState(null)  // null while restoring session
  const [inviteeName, setInviteeName] = useState('')
  const [formData,    setFormData]    = useState(INITIAL_FORM)
  const [existingRec, setExistingRec] = useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Restore session on mount ──────────────────────────────
  useEffect(() => {
    const session = loadSession()
    if (!session) { setStep(0); return }

    setInviteeName(session.inviteeName)
    if (session.formData) setFormData(prev => ({ ...prev, ...session.formData }))

    if (session.submitted) {
      setStep('done')
    } else if (session.existingRsvp) {
      setExistingRec(session.existingRsvp)
      setStep('existing')
    } else {
      setStep(session.step)
    }
  }, [])

  // ── Persist step to cache ─────────────────────────────────
  useEffect(() => {
    if (step !== null) cacheStep(step)
  }, [step])

  // ── Persist form to cache ─────────────────────────────────
  useEffect(() => {
    if (typeof step === 'number' && step > 0) cacheForm(formData)
  }, [formData]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleField(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // Fresh invitee — no existing record found
  function handleVerified(name) {
    setInviteeName(name)
    cacheInvitee(name)
    setStep(1)
  }

  // Duplicate detected — surface their existing RSVP record
  function handleDuplicate(name, record) {
    setInviteeName(name)
    setExistingRec(record)
    cacheInvitee(name)
    cacheExistingRsvp(record)
    setStep('existing')
  }

  // Full reset — clear cache + start over from gate
  function handleReset() {
    clearRsvpCache()
    setStep(0)
    setInviteeName('')
    setFormData(INITIAL_FORM)
    setExistingRec(null)
    setSubmitError('')
  }

  // Final form submission — POST to RSVP sheet
  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      await fetch(RSVP_SCRIPT_URL, {
        method:  'POST',
        mode:    'no-cors',   // required for Apps Script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteeName,                    // → "Invitee Name" column (col C)
          attendance: formData.attendance,
          firstName:  formData.firstName,
          lastName:   formData.lastName,
          email:      formData.email,
          notes:      formData.notes,
          advice:     formData.advice,
          // phone: removed — not collected
        }),
      })
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

  // ── Loading spinner while session restores ────────────────
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
        {/* Progress dots — steps 1–3 only */}
        {typeof step === 'number' && step >= 1 && step <= 3 && (
          <ProgressBar step={step - 1} total={TOTAL_STEPS} />
        )}

        {step === 0 && (
          <StepGate
            onVerified={handleVerified}
            onDuplicate={handleDuplicate}
          />
        )}

        {step === 'existing' && (
          <StepExisting
            inviteeName={inviteeName}
            record={existingRec || getCachedExistingRsvp() || {}}
            onReset={handleReset}
          />
        )}

        {step === 'done' && (
          <StepDone
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
