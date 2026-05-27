import React, { useState, useEffect } from 'react'
import './RSVP.css'
import {
  preValidate,
  findMatches,
  hasAmbiguousFirstName,
  findByFullName,
  findExistingRsvp,
  isPlusOneEligible,
  toTitleCase,
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
  cachePlusOneForm,
  cachePlusOneEligible,
  getCachedPlusOneEligible,
} from '../utils/rsvpCache'

/* ============================================================
   RSVP Page — Complete flow with Plus One support

   STEP FLOW:
     null        → restoring session (spinner)
     0           → name gate (invitee lookup)
     'existing'  → already RSVP'd in sheet
     1           → attendance choice
     2           → contact info
     3           → personal touch (notes + advice)
     'plusone'   → plus one question (only if eligible + attending)
     4           → success screen
     'done'      → submitted this session (refresh-safe)

   PLUS ONE LOGIC:
     The invitee sheet column C header = "Additional Invitee".
     Script A (doGet) now returns { names: [...], invitees: [...] }
     where invitees is an array of { name, additionalInvitee }.
     If the matched invitee's additionalInvitee value is truthy
     AND they are attending → show the plus one step.
     The plus one form has NO invite list validation.

   ─────────────────────────────────────────────────────────────
   GOOGLE SHEETS SETUP

   ── SCRIPT A: Invitee list (INVITEE_SCRIPT_URL) ──
   Updated to also return column C (Additional Invitee).

     function doGet(e) {
       var sheet    = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
       var lastRow  = sheet.getLastRow();
       if (lastRow < 2) {
         return ContentService
           .createTextOutput(JSON.stringify({ names: [], invitees: [] }))
           .setMimeType(ContentService.MimeType.JSON);
       }
       var data     = sheet.getRange(2, 2, lastRow - 1, 2).getValues(); // col B & C
       var names    = [];
       var invitees = [];
       data.forEach(function(row) {
         var name  = row[0];
         var extra = row[1];
         if (name) {
           names.push(name);
           invitees.push({ name: name, additionalInvitee: extra });
         }
       });
       return ContentService
         .createTextOutput(JSON.stringify({ names: names, invitees: invitees }))
         .setMimeType(ContentService.MimeType.JSON);
     }

   ── SCRIPT B: RSVP sheet (RSVP_SCRIPT_URL) ──
   Updated doPost to accept plusOne fields.

   Sheet column headers (row 1):
     ID | Timestamp | Invitee Name | Attendance |
     First Name | Last Name | Email | Notes | Advice |
     Plus One Name | Plus One Attendance

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
         data.advice,
         data.plusOneName     || '',
         data.plusOneAttendance || ''
       ]);
       return ContentService
         .createTextOutput(JSON.stringify({ result: 'success' }))
         .setMimeType(ContentService.MimeType.JSON);
     }
   ─────────────────────────────────────────────────────────────
   ============================================================ */

const INVITEE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4krEOAYvMChZ5m9Eak9bg5u7oInMJ15QuZTOlekmAtv6CEpk324tTwjY8tWPZRBgb/exec'
const RSVP_SCRIPT_URL    = 'https://script.google.com/macros/s/AKfycbwOdKcB_IIM-ftqoVO58cIC8djxcPoazDe2YdRNaN8ImhrUszPubT5tdA65y5RaDPiq/exec'

const INITIAL_FORM = {
  attendance: '',
  firstName:  '',
  lastName:   '',
  email:      '',
  notes:      '',
  advice:     '',
}

const INITIAL_PLUS_ONE = {
  bringing:   '',      // 'yes' | 'no' | ''
  fullName:   '',
  attendance: '',
  email:      '',
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

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

function SummaryRow({ label, value }) {
  return (
    <div className="rsvp-done__row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 0 — NAME GATE
   Now also reads "Additional Invitee" (col C) to determine
   plus one eligibility for the verified guest.
   ═══════════════════════════════════════════════════════════ */
function StepGate({ onVerified, onDuplicate }) {
  const [nameInput,  setNameInput]  = useState('')
  const [lastInput,  setLastInput]  = useState('')
  const [phase,      setPhase]      = useState('name')
  const [errorMsg,   setErrorMsg]   = useState('')
  const [candidates, setCandidates] = useState([])

  const clearError = () => setErrorMsg('')
  const isChecking = phase === 'checking'

  async function handleNameSubmit() {
    const localErr = preValidate(nameInput)
    if (localErr) { setErrorMsg(localErr); return }

    setPhase('checking')
    clearError()

    try {
      const res  = await fetch(INVITEE_SCRIPT_URL)
      const json = await res.json()

      // Support both old format { names } and new format { names, invitees }
      const names    = Array.isArray(json.names)    ? json.names    : []
      const invitees = Array.isArray(json.invitees) ? json.invitees : []

      const matches = findMatches(nameInput, names)

      if (matches.length === 0) {
        setPhase('error')
        setErrorMsg("We couldn't find your invitation. Please double-check your name or contact us.")
        return
      }

      if (matches.length === 1) {
        const eligible = getEligibility(matches[0], invitees)
        await checkDuplicateAndProceed(matches[0], eligible)
        return
      }

      if (hasAmbiguousFirstName(matches)) {
        setCandidates(matches)
        // Stash invitees so we can resolve eligibility after disambiguation
        setCandidates(matches)
        setPhase('lastname')
        // Pass invitees via closure — store on component
        handleNameSubmit._invitees = invitees
        return
      }

      const exact = matches.find(
        m => m.trim().toLowerCase() === nameInput.trim().toLowerCase()
      )
      const chosen = exact || matches[0]
      const eligible = getEligibility(chosen, invitees)
      await checkDuplicateAndProceed(chosen, eligible)

    } catch {
      setPhase('error')
      setErrorMsg('Something went wrong connecting to the guest list. Please try again.')
    }
  }

  // Read the Additional Invitee column for the matched name
  function getEligibility(matchedName, invitees) {
    if (!invitees.length) return false
    const record = invitees.find(
      inv => inv.name?.trim().toLowerCase() === matchedName.trim().toLowerCase()
    )
    return record ? isPlusOneEligible(record.additionalInvitee) : false
  }

  async function handleLastNameSubmit() {
    const localErr = preValidate(lastInput)
    if (localErr) { setErrorMsg('Please enter a valid last name.'); return }

    const match = findByFullName(nameInput.trim(), lastInput.trim(), candidates)
    if (!match) {
      setErrorMsg("We couldn't find that name. Please check your spelling.")
      return
    }

    setPhase('checking')
    // Re-fetch to get invitees for eligibility check
    try {
      const res      = await fetch(INVITEE_SCRIPT_URL)
      const json     = await res.json()
      const invitees = Array.isArray(json.invitees) ? json.invitees : []
      const eligible = getEligibility(match, invitees)
      await checkDuplicateAndProceed(match, eligible)
    } catch {
      await checkDuplicateAndProceed(match, false)
    }
  }

  async function checkDuplicateAndProceed(verifiedName, eligible) {
    try {
      const res     = await fetch(RSVP_SCRIPT_URL)
      const json    = await res.json()
      const records = Array.isArray(json.records) ? json.records : []
      const existing = findExistingRsvp(verifiedName, records)

      if (existing) {
        onDuplicate(verifiedName, existing)
      } else {
        onVerified(verifiedName, eligible)
      }
    } catch {
      onVerified(verifiedName, false)
    }
  }

  return (
    <div className="rsvp-gate fade-up">
      <div className="rsvp-gate__icon">✉</div>
      <h2 className="rsvp-gate__title">You're Invited</h2>

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
            <p className="rsvp-gate__msg rsvp-gate__msg--error" role="alert">{errorMsg}</p>
          )}
          <button
            className="btn btn-primary rsvp-gate__btn"
            onClick={handleNameSubmit}
            disabled={isChecking || !nameInput.trim()}
          >
            {isChecking ? <span>Checking<span className="dots" /></span> : 'Check My Invitation'}
          </button>
        </>
      )}

      {phase === 'lastname' && (
        <>
          <div className="rsvp-gate__disambig">
            <span className="rsvp-gate__disambig-icon">👥</span>
            <p>
              We found multiple guests named <strong>{nameInput.trim()}</strong>.
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
            <p className="rsvp-gate__msg rsvp-gate__msg--error" role="alert">{errorMsg}</p>
          )}
          <div className="rsvp-gate__actions">
            <button className="btn btn-outline"
              onClick={() => { setPhase('name'); setLastInput(''); clearError() }}>
              ← Back
            </button>
            <button className="btn btn-primary"
              onClick={handleLastNameSubmit}
              disabled={!lastInput.trim()}>
              Confirm
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 'existing'
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
        <SummaryRow label="Attendance" value={attending ? 'Joyfully Attending ✓' : 'Unable to Attend'} />
        {(record['First Name'] || record['Last Name']) && (
          <SummaryRow label="Name on file"
            value={[record['First Name'], record['Last Name']].filter(Boolean).join(' ')} />
        )}
        {record['Email'] && <SummaryRow label="Email" value={record['Email']} />}
        {submittedDate && <SummaryRow label="Submitted" value={submittedDate} />}
      </div>
      <p className="rsvp-done__note">Need to make a change? Please contact us directly.</p>
      <button className="btn btn-outline rsvp-done__reset" onClick={onReset}>
        Submit a different RSVP
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 'done'
   ═══════════════════════════════════════════════════════════ */
function StepDone({ inviteeName, formData, plusOneData, onReset }) {
  const attending    = formData?.attendance === 'attending'
  const plusOneCame  = plusOneData?.bringing === 'yes' && plusOneData?.fullName

  return (
    <div className="rsvp-done fade-up">
      <div className="rsvp-done__icon">{attending ? '🥂' : '💌'}</div>
      <h2 className="rsvp-done__title">You're all set, {inviteeName}!</h2>
      <p className="rsvp-done__msg">Your RSVP has been submitted successfully.</p>
      <div className="rsvp-done__summary">
        <SummaryRow label="Attendance" value={attending ? 'Joyfully Attending ✓' : 'Unable to Attend'} />
        {formData?.firstName && (
          <SummaryRow label="Name on record" value={`${formData.firstName} ${formData.lastName}`.trim()} />
        )}
        {formData?.email && <SummaryRow label="Email" value={formData.email} />}
        {plusOneCame && (
          <SummaryRow label="Plus One" value={plusOneData.fullName} />
        )}
      </div>
      <p className="rsvp-done__note">Need to change something? Contact us directly.</p>
      <button className="btn btn-outline rsvp-done__reset" onClick={onReset}>
        Submit a different RSVP
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 1 — Attendance
   ═══════════════════════════════════════════════════════════ */
function StepAttendance({ inviteeName, data, onChange, onNext }) {
  return (
    <div className="rsvp-step fade-up">
      <p className="rsvp-step__greeting">Welcome, <strong>{inviteeName}</strong> 🎉</p>
      <h2 className="rsvp-step__title">Will you be joining us?</h2>
      <p className="rsvp-step__sub">November 7, 2026 · Grass Garden</p>
      <div className="rsvp-attend__options">
        {[
          { value: 'attending',     icon: '🥂', label: 'Joyfully Attending' },
          { value: 'not-attending', icon: '💌', label: 'Regretfully Unable'  },
        ].map(opt => (
          <button key={opt.value}
            className={`rsvp-attend__card ${data.attendance === opt.value ? 'selected' : ''}`}
            onClick={() => onChange('attendance', opt.value)}>
            <span className="rsvp-attend__icon">{opt.icon}</span>
            <span className="rsvp-attend__label">{opt.label}</span>
          </button>
        ))}
      </div>
      <button className="btn btn-primary rsvp-step__next" onClick={onNext} disabled={!data.attendance}>
        Continue →
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 2 — Contact info
   ═══════════════════════════════════════════════════════════ */
function StepContact({ data, onChange, onNext, onBack }) {
  const valid = data.firstName.trim() && data.lastName.trim() && data.email.trim()
  return (
    <div className="rsvp-step fade-up">
      <h2 className="rsvp-step__title">Your Details</h2>
      <p className="rsvp-step__sub">So we know how to reach you</p>
      <div className="rsvp-fields">
        <div className="rsvp-row">
          <div className="rsvp-field">
            <label htmlFor="rsvp-fn">First Name *</label>
            <input id="rsvp-fn" type="text" placeholder="First name"
              value={data.firstName} onChange={e => onChange('firstName', e.target.value)}
              autoComplete="given-name" />
          </div>
          <div className="rsvp-field">
            <label htmlFor="rsvp-ln">Last Name *</label>
            <input id="rsvp-ln" type="text" placeholder="Last name"
              value={data.lastName} onChange={e => onChange('lastName', e.target.value)}
              autoComplete="family-name" />
          </div>
        </div>
        <div className="rsvp-field">
          <label htmlFor="rsvp-em">Email Address *</label>
          <input id="rsvp-em" type="email" placeholder="you@example.com"
            value={data.email} onChange={e => onChange('email', e.target.value)}
            autoComplete="email" />
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

/* ═══════════════════════════════════════════════════════════
   STEP 3 — Personal touch
   ═══════════════════════════════════════════════════════════ */
function StepPersonal({ data, onChange, onNext, onBack }) {
  return (
    <div className="rsvp-step fade-up">
      <h2 className="rsvp-step__title">A Little Extra</h2>
      <p className="rsvp-step__sub">Share something special with us</p>
      <div className="rsvp-fields">
        <div className="rsvp-field">
          <label htmlFor="rsvp-notes">Notes / Dietary Requirements</label>
          <textarea id="rsvp-notes" rows={3}
            placeholder="Dietary needs, song requests, anything you'd like us to know…"
            value={data.notes} onChange={e => onChange('notes', e.target.value)} />
        </div>
        <div className="rsvp-field">
          <label htmlFor="rsvp-advice">Best Advice for the Couple ✨</label>
          <textarea id="rsvp-advice" rows={4}
            placeholder="Share your best marriage advice or a heartfelt message…"
            value={data.advice} onChange={e => onChange('advice', e.target.value)} />
        </div>
      </div>
      <div className="rsvp-step__actions">
        <button className="btn btn-outline rsvp-step__back" onClick={onBack}>← Back</button>
        <button className="btn btn-primary rsvp-step__next" onClick={onNext}>
          Continue →
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 'plusone' — Plus One question
   Only shown when: eligible === true AND attending === 'attending'
   No invite list validation for the plus one.
   ═══════════════════════════════════════════════════════════ */
function StepPlusOne({ inviteeName, data, onChange, onSubmit, onBack, submitting }) {
  const bringingYes   = data.bringing === 'yes'
  const canSubmit     = data.bringing === 'no' ||
    (bringingYes && data.fullName.trim() && data.attendance)
  // email is optional for plus one

  return (
    <div className="rsvp-step fade-up">
      {/* Eligibility badge */}
      <div className="rsvp-plusone__badge">
        <span>✦</span> You're eligible to bring a Plus One
      </div>

      <h2 className="rsvp-step__title">Will you bring a guest?</h2>
      <p className="rsvp-step__sub">Entirely optional — let us know so we can prepare!</p>

      {/* Yes / No choice */}
      <div className="rsvp-attend__options rsvp-attend__options--sm">
        {[
          { value: 'yes', icon: '👫', label: 'Yes, bringing a guest' },
          { value: 'no',  icon: '🙋', label: 'No, just me'           },
        ].map(opt => (
          <button key={opt.value}
            className={`rsvp-attend__card ${data.bringing === opt.value ? 'selected' : ''}`}
            onClick={() => onChange('bringing', opt.value)}>
            <span className="rsvp-attend__icon">{opt.icon}</span>
            <span className="rsvp-attend__label">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Plus one details — revealed only when "yes" selected */}
      {bringingYes && (
        <div className="rsvp-plusone__form fade-up">
          <div className="rsvp-plusone__divider">
            <span>Guest Details</span>
          </div>

          <div className="rsvp-fields">
            <div className="rsvp-field">
              <label htmlFor="po-name">Guest Full Name *</label>
              <input
                id="po-name"
                type="text"
                placeholder="Full name of your guest"
                value={data.fullName}
                onChange={e => onChange('fullName', e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>

            <div className="rsvp-field">
              <label htmlFor="po-email">Guest Email <span style={{ fontWeight: 300, opacity: 0.6 }}>(optional)</span></label>
              <input
                id="po-email"
                type="email"
                placeholder="guest@example.com"
                value={data.email}
                onChange={e => onChange('email', e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="rsvp-field">
              <label>Guest Attendance *</label>
              <div className="rsvp-attend__options rsvp-attend__options--sm">
                {[
                  { value: 'attending',     label: 'Attending'       },
                  { value: 'not-attending', label: 'Unable to Attend' },
                ].map(opt => (
                  <button key={opt.value}
                    className={`rsvp-attend__card rsvp-attend__card--mini ${data.attendance === opt.value ? 'selected' : ''}`}
                    onClick={() => onChange('attendance', opt.value)}>
                    <span className="rsvp-attend__label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rsvp-step__actions">
        <button className="btn btn-outline rsvp-step__back" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary rsvp-step__next"
          onClick={onSubmit}
          disabled={submitting || !canSubmit}
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
function StepSuccess({ inviteeName, attendance, plusOneData, email }) {
  const plusOneCame   = plusOneData?.bringing === 'yes' && plusOneData?.fullName
  const isAttending   = attendance === 'attending'
  const hasEmail      = !!email

  return (
    <div className="rsvp-success fade-up">
      <div className="rsvp-success__icon">
        {isAttending ? '🥂' : '💌'}
      </div>
      <h2 className="rsvp-success__title">
        {isAttending ? 'See you there!' : "We'll miss you!"}
      </h2>
      <p className="rsvp-success__msg">
        {isAttending
          ? `Thank you, ${inviteeName}! We can't wait to celebrate with you on November 7. 🎉`
          : `Thank you, ${inviteeName}. We're sad you can't make it, but we appreciate you letting us know. 💛`
        }
      </p>

      {plusOneCame && (
        <p className="rsvp-success__plus-one">
          We're also looking forward to seeing <strong>{plusOneData.fullName}</strong>! 🎊
        </p>
      )}

      {/* Email confirmation notice */}
      {hasEmail && (
        <div className="rsvp-success__email-note">
          <span className="rsvp-success__email-icon">✉</span>
          <p>
            A confirmation email{isAttending ? ' with a calendar invite' : ''} has been
            sent to <strong>{email}</strong>.
          </p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN RSVP COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function RSVP() {
  const [step,          setStep]          = useState(null)
  const [inviteeName,   setInviteeName]   = useState('')
  const [formData,      setFormData]      = useState(INITIAL_FORM)
  const [plusOneData,   setPlusOneData]   = useState(INITIAL_PLUS_ONE)
  const [plusOneElig,   setPlusOneElig]   = useState(false)
  const [existingRec,   setExistingRec]   = useState(null)
  const [submitting,    setSubmitting]    = useState(false)
  const [submitError,   setSubmitError]   = useState('')

  // ── Restore session on mount ──
  useEffect(() => {
    const session = loadSession()
    if (!session) { setStep(0); return }

    setInviteeName(session.inviteeName)
    if (session.formData)    setFormData(prev => ({ ...prev, ...session.formData }))
    if (session.plusOneForm) setPlusOneData(prev => ({ ...prev, ...session.plusOneForm }))
    if (session.plusOneEligible !== null) setPlusOneElig(session.plusOneEligible)

    if (session.submitted) {
      setStep('done')
    } else if (session.existingRsvp) {
      setExistingRec(session.existingRsvp)
      setStep('existing')
    } else {
      setStep(session.step)
    }
  }, [])

  useEffect(() => { if (step !== null) cacheStep(step) }, [step])
  useEffect(() => {
    if (typeof step === 'number' && step > 0) cacheForm(formData)
  }, [formData]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    cachePlusOneForm(plusOneData)
  }, [plusOneData])

  function handleField(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
  }
  function handlePlusOneField(key, value) {
    setPlusOneData(prev => ({ ...prev, [key]: value }))
  }

  // Gate verified — also receives plus one eligibility
  function handleVerified(name, eligible) {
    setInviteeName(name)
    setPlusOneElig(eligible)
    cacheInvitee(name)
    cachePlusOneEligible(eligible)
    setStep(1)
  }

  function handleDuplicate(name, record) {
    setInviteeName(name)
    setExistingRec(record)
    cacheInvitee(name)
    cacheExistingRsvp(record)
    setStep('existing')
  }

  function handleReset() {
    clearRsvpCache()
    setStep(0)
    setInviteeName('')
    setFormData(INITIAL_FORM)
    setPlusOneData(INITIAL_PLUS_ONE)
    setPlusOneElig(false)
    setExistingRec(null)
    setSubmitError('')
  }

  // After step 3 — decide whether to show plus one step
  function handleAfterPersonal() {
    const isAttending = formData.attendance === 'attending'
    if (plusOneElig && isAttending) {
      setStep('plusone')
    } else {
      handleSubmit()
    }
  }

  // Helper — sends one RSVP row to the sheet (same format every time)
  async function postRsvpRow(payload) {
    await fetch(RSVP_SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  // Final submission — primary invitee + optional plus one as separate rows.
  // Both rows use the exact same column format so the sheet stays uniform.
  // The Apps Script doPost handles sending the confirmation email server-side
  // using GmailApp — no credentials ever touch the browser.
  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      const plusOneBringing  = plusOneData.bringing === 'yes'
      const plusOneFullName  = plusOneBringing && plusOneData.fullName.trim()
        ? toTitleCase(plusOneData.fullName)
        : ''

      // ── Row 1: Primary invitee ──
      // plusOneName is passed so the email template can reference it
      await postRsvpRow({
        inviteeName: toTitleCase(inviteeName),
        attendance:  formData.attendance,
        firstName:   toTitleCase(formData.firstName),
        lastName:    toTitleCase(formData.lastName),
        email:       formData.email.trim().toLowerCase(),
        notes:       toTitleCase(formData.notes),
        advice:      toTitleCase(formData.advice),
        plusOneName: plusOneFullName,   // used by Apps Script for email only
      })

      // ── Row 2: Plus one row (same columns, separate row) ──
      if (plusOneFullName) {
        const [poFirst, ...poRest] = plusOneFullName.split(' ')
        const poLast = poRest.join(' ')
        await postRsvpRow({
          inviteeName: `Plus One of ${toTitleCase(inviteeName)}`,
          attendance:  plusOneData.attendance,
          firstName:   poFirst,
          lastName:    poLast,
          email:       plusOneData.email ? plusOneData.email.trim().toLowerCase() : '',
          notes:       '',
          advice:      '',
          plusOneName: '',   // no nested plus one
        })
      }

      markSubmitted()
      cacheForm(formData)
      setStep(4)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Progress bar: steps 1–3 = 3 dots; plusone = 4th dot (if eligible + attending)
  const showPlusOneStep = plusOneElig && formData.attendance === 'attending'
  const TOTAL_STEPS     = showPlusOneStep ? 4 : 3
  const stepIndex       = step === 'plusone' ? 3 : (typeof step === 'number' ? step - 1 : 0)

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
        {(typeof step === 'number' && step >= 1 && step <= 3 || step === 'plusone') && (
          <ProgressBar step={stepIndex} total={TOTAL_STEPS} />
        )}

        {step === 0 && (
          <StepGate onVerified={handleVerified} onDuplicate={handleDuplicate} />
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
            plusOneData={plusOneData}
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
              onNext={handleAfterPersonal}
              onBack={() => setStep(2)}
            />
            {submitError && (
              <p className="rsvp-error" role="alert">{submitError}</p>
            )}
          </>
        )}
        {step === 'plusone' && (
          <>
            <StepPlusOne
              inviteeName={inviteeName}
              data={plusOneData}
              onChange={handlePlusOneField}
              onSubmit={handleSubmit}
              onBack={() => setStep(3)}
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
            plusOneData={plusOneData}
            email={formData.email}
          />
        )}
      </div>
    </div>
  )
}
