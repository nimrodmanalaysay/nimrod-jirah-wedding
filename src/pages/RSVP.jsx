import React, { useState } from 'react'
import './RSVP.css'

/* ============================================================
   RSVP Page
   Flow:
     Step 0 — Invitee Gate   : user types their name → checked against invitee sheet
     Step 1 — Attendance      : Are you attending?
     Step 2 — Contact Info    : First name, Last name, Email, Phone
     Step 3 — Personal Touch  : Notes + best advice for the couple
     Step 4 — Success screen

   GOOGLE SHEETS SETUP — READ THIS BEFORE DEPLOYING:
   ─────────────────────────────────────────────────
   You need TWO Google Apps Scripts, one per spreadsheet.

   ── SCRIPT A: Invitee Checker (read from invitee sheet, Column B) ──
   Open the invitee spreadsheet → Extensions → Apps Script → paste:

     function doGet(e) {
       var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       var data  = sheet.getRange('B2:B').getValues();
       var names = data.flat().filter(function(n){ return n !== ''; });
       return ContentService
         .createTextOutput(JSON.stringify({ names: names }))
         .setMimeType(ContentService.MimeType.JSON);
     }

   Deploy → New Deployment → Web App
     Execute as: Me | Who has access: Anyone
   Paste the URL as INVITEE_SCRIPT_URL below.

   ── SCRIPT B: RSVP Storage (write to RSVP sheet) ──
   Open the RSVP spreadsheet → Extensions → Apps Script → paste:

     function doPost(e) {
       var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       var data  = JSON.parse(e.postData.contents);
       var lastRow = sheet.getLastRow();
       var newId   = lastRow; // row 1 = header, so lastRow = last id, lastRow+1 = new id
       sheet.appendRow([
         newId,
         new Date(),
         data.inviteeName,
         data.attendance,
         data.firstName,
         data.lastName,
         data.email,
         data.phone,
         data.notes,
         data.advice
       ]);
       return ContentService
         .createTextOutput(JSON.stringify({ result: 'success' }))
         .setMimeType(ContentService.MimeType.JSON);
     }

   Deploy → New Deployment → Web App
     Execute as: Me | Who has access: Anyone
   Paste the URL as RSVP_SCRIPT_URL below.

   RSVP Sheet columns should be:
   A: ID | B: Timestamp | C: Invitee Name | D: Attendance
   E: First Name | F: Last Name | G: Email | H: Phone
   I: Notes | J: Advice
   ─────────────────────────────────────────────────
   ============================================================ */

// ✏️ Paste your Apps Script URLs here
const INVITEE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxsQd3L8JnIagl9VY6sVizjrl2CpJI7Z9DX5sT3uK7v_68BJ4anQ3VlzCOH7ZBu3s9T/exec'
const RSVP_SCRIPT_URL    = 'https://script.google.com/macros/s/AKfycbxrAJVuCQFL3kBa0PF5eCjngpEDycCvHWRZPnwEXX83uFXWhKyTMffybkRJgIa3an08/exec'

// ── Helpers ──────────────────────────────────────────────────

// Normalize a name: lowercase, strip accents, remove non-alpha except spaces
function normalizeName(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accent marks
    .replace(/[^a-z\s]/g, '')        // strip special chars
    .replace(/\s+/g, ' ')
    .trim()
}

// Check if typed name loosely matches any invitee name
function matchesInvitee(typed, nameList) {
  const t = normalizeName(typed)
  return nameList.some(name => {
    const n = normalizeName(name)
    // Full match OR typed name is contained in invitee name OR vice versa
    return n === t || n.includes(t) || t.includes(n)
  })
}

function findMatchedName(typed, nameList) {
  const t = normalizeName(typed)
  return nameList.find(name => {
    const n = normalizeName(name)
    return n === t || n.includes(t) || t.includes(n)
  })
}

// ── Step components ───────────────────────────────────────────

/* STEP 0 — Name gate */
function StepGate({ onVerified }) {
  const [nameInput, setNameInput] = useState('')
  const [status,    setStatus]    = useState('idle') // idle | checking | not-found | error

  async function handleCheck() {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setStatus('checking')

    try {
      // Fetch invitee list from Apps Script
      const res   = await fetch(INVITEE_SCRIPT_URL)
      const data  = await res.json()
      const names = data.names || []

      if (matchesInvitee(trimmed, names)) {
        const matched = findMatchedName(trimmed, names)
        onVerified(matched || trimmed)
      } else {
        setStatus('not-found')
      }
    } catch {
      setStatus('error')
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleCheck()
  }

  return (
    <div className="rsvp-gate fade-up">
      <div className="rsvp-gate__icon">✉</div>
      <h2 className="rsvp-gate__title">You're Invited</h2>
      <p className="rsvp-gate__sub">
        Please enter your name as it appears on your invitation to continue.
      </p>

      <div className="rsvp-gate__field">
        <input
          type="text"
          placeholder="Your full name"
          value={nameInput}
          onChange={e => { setNameInput(e.target.value); setStatus('idle') }}
          onKeyDown={handleKey}
          disabled={status === 'checking'}
          autoFocus
        />
      </div>

      {status === 'not-found' && (
        <p className="rsvp-gate__msg rsvp-gate__msg--error">
          We couldn't find your name on the guest list. Please double-check your name
          or contact us directly.
        </p>
      )}
      {status === 'error' && (
        <p className="rsvp-gate__msg rsvp-gate__msg--error">
          Something went wrong. Please try again.
        </p>
      )}

      <button
        className="btn btn-primary rsvp-gate__btn"
        onClick={handleCheck}
        disabled={status === 'checking' || !nameInput.trim()}
      >
        {status === 'checking' ? 'Checking…' : 'Check My Invitation'}
      </button>
    </div>
  )
}

/* STEP 1 — Attendance */
function StepAttendance({ inviteeName, data, onChange, onNext }) {
  return (
    <div className="rsvp-step fade-up">
      <p className="rsvp-step__greeting">Welcome, <strong>{inviteeName}</strong> 🎉</p>
      <h2 className="rsvp-step__title">Will you be joining us?</h2>
      <p className="rsvp-step__sub">November 7, 2026 · Grass Garden</p>

      <div className="rsvp-attend__options">
        <button
          className={`rsvp-attend__card ${data.attendance === 'attending' ? 'selected' : ''}`}
          onClick={() => { onChange('attendance', 'attending'); }}
        >
          <span className="rsvp-attend__icon">🥂</span>
          <span className="rsvp-attend__label">Joyfully Attending</span>
        </button>
        <button
          className={`rsvp-attend__card ${data.attendance === 'not-attending' ? 'selected' : ''}`}
          onClick={() => { onChange('attendance', 'not-attending'); }}
        >
          <span className="rsvp-attend__icon">💌</span>
          <span className="rsvp-attend__label">Regretfully Unable</span>
        </button>
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

/* STEP 2 — Contact Info */
function StepContact({ data, onChange, onNext, onBack }) {
  const valid = data.firstName.trim() && data.lastName.trim() && data.email.trim()

  return (
    <div className="rsvp-step fade-up">
      <h2 className="rsvp-step__title">Your Details</h2>
      <p className="rsvp-step__sub">So we know how to reach you</p>

      <div className="rsvp-fields">
        <div className="rsvp-row">
          <div className="rsvp-field">
            <label>First Name *</label>
            <input
              type="text"
              placeholder="First name"
              value={data.firstName}
              onChange={e => onChange('firstName', e.target.value)}
            />
          </div>
          <div className="rsvp-field">
            <label>Last Name *</label>
            <input
              type="text"
              placeholder="Last name"
              value={data.lastName}
              onChange={e => onChange('lastName', e.target.value)}
            />
          </div>
        </div>

        <div className="rsvp-field">
          <label>Email Address *</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={e => onChange('email', e.target.value)}
          />
        </div>

        <div className="rsvp-field">
          <label>Phone Number</label>
          <input
            type="tel"
            placeholder="+63 9XX XXX XXXX"
            value={data.phone}
            onChange={e => onChange('phone', e.target.value)}
          />
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

/* STEP 3 — Personal Touch */
function StepPersonal({ data, onChange, onSubmit, onBack, submitting }) {
  return (
    <div className="rsvp-step fade-up">
      <h2 className="rsvp-step__title">A Little Extra</h2>
      <p className="rsvp-step__sub">Share something special with us</p>

      <div className="rsvp-fields">
        <div className="rsvp-field">
          <label>Notes / Dietary Requirements</label>
          <textarea
            placeholder="Any notes you'd like us to know? (dietary needs, song requests…)"
            value={data.notes}
            onChange={e => onChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="rsvp-field">
          <label>Best Advice for the Couple ✨</label>
          <textarea
            placeholder="Share your best marriage advice or a heartfelt message…"
            value={data.advice}
            onChange={e => onChange('advice', e.target.value)}
            rows={4}
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

/* STEP 4 — Success */
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

// ── Progress Bar ──────────────────────────────────────────────
function ProgressBar({ step, total }) {
  return (
    <div className="rsvp-progress">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rsvp-progress__dot ${i < step ? 'done' : ''} ${i === step ? 'active' : ''}`}
        />
      ))}
    </div>
  )
}

// ── Main RSVP Component ───────────────────────────────────────
const INITIAL_DATA = {
  attendance: '',
  firstName:  '',
  lastName:   '',
  email:      '',
  phone:      '',
  notes:      '',
  advice:     '',
}

export default function RSVP() {
  const [step,         setStep]         = useState(0)   // 0=gate 1=attend 2=contact 3=personal 4=success
  const [inviteeName,  setInviteeName]  = useState('')
  const [formData,     setFormData]     = useState(INITIAL_DATA)
  const [submitting,   setSubmitting]   = useState(false)
  const [submitError,  setSubmitError]  = useState('')

  function handleField(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  function handleVerified(name) {
    setInviteeName(name)
    setStep(1)
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
      setStep(4)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Steps 1–3 shown in the progress bar (gate and success excluded)
  const TOTAL_STEPS = 3

  return (
    <div className="rsvp-page">
      <div className="rsvp-page__header">
        <h1 className="section-title">RSVP</h1>
        <span className="section-divider" />
        <p className="rsvp-page__sub">Kindly reply by October 1, 2026</p>
      </div>

      <div className="rsvp-card">
        {/* Progress indicator (only shown during steps 1–3) */}
        {step >= 1 && step <= 3 && (
          <ProgressBar step={step - 1} total={TOTAL_STEPS} />
        )}

        {/* Step router */}
        {step === 0 && <StepGate onVerified={handleVerified} />}

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
              <p className="rsvp-error">{submitError}</p>
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
