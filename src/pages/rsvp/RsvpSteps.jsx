import React, { useState, useEffect } from 'react'
import {
  preValidate,
  findMatches,
  hasAmbiguousFirstName,
  findByFullName,
  findExistingRsvp,
  isPlusOneEligible,
  isValidEmail,
  toTitleCase,
} from '../../utils/rsvpValidation'
import { INVITEE_SCRIPT_URL, RSVP_SCRIPT_URL } from './constants'
import { useEnterKey } from './useRsvpKeys'
import { SummaryRow } from './RsvpShared'

/* ═══════════════════════════════════════════════════════════
   STEP 0 — NAME GATE
   ═══════════════════════════════════════════════════════════ */
export function StepGate({ onVerified, onDuplicate, onChecking }) {
  const [nameInput,  setNameInput]  = useState('')
  const [lastInput,  setLastInput]  = useState('')
  const [phase,      setPhase]      = useState('name')
  const [errorMsg,   setErrorMsg]   = useState('')
  const [candidates, setCandidates] = useState([])

  const clearError = () => setErrorMsg('')
  const isChecking = phase === 'checking'

  // Let the page put its shared overlay up while we hit the guest list. The
  // lookup is two sequential Apps Script GETs — the invitee list, then the
  // duplicate check — so it is often slower than submitting the RSVP itself.
  // The cleanup matters: a successful lookup calls onVerified, which advances
  // the step and unmounts this component while isChecking is still true. Without
  // resetting on unmount the overlay would stay up over the next step forever.
  useEffect(() => {
    onChecking?.(isChecking)
    return () => onChecking?.(false)
  }, [isChecking]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <p className="rsvp-gate__note">
            This RSVP is exclusive to invited guests. If you've been granted a plus one,
            you'll get the option to add them after confirming your attendance.
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
   Cancel / redo control — shared by the two "already submitted"
   screens. Two-stage confirm so it can't be triggered by accident.
   ═══════════════════════════════════════════════════════════ */
function CancelRedo({ onCancel, canceling }) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button className="btn btn-primary rsvp-done__redo" onClick={() => setConfirming(true)}>
        Cancel or Edit My RSVP
      </button>
    )
  }

  return (
    <div className="rsvp-cancel">
      <p className="rsvp-cancel__warn">
        This removes your current RSVP so you can fill it out again — handy if
        your plans changed or you made a mistake. Continue?
      </p>
      <div className="rsvp-cancel__actions">
        <button className="btn btn-outline" onClick={() => setConfirming(false)} disabled={canceling}>
          Keep it
        </button>
        <button className="btn btn-primary" onClick={onCancel} disabled={canceling}>
          {canceling ? 'Cancelling…' : 'Yes, cancel & redo'}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 'existing'
   ═══════════════════════════════════════════════════════════ */
export function StepExisting({ inviteeName, record, onReset, onCancel, canceling }) {
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
      <p className="rsvp-done__note">Plans changed or made a mistake? You can cancel and redo it.</p>
      <CancelRedo onCancel={onCancel} canceling={canceling} />
      <button className="btn btn-outline rsvp-done__reset" onClick={onReset}>
        Submit a different RSVP
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 'done'
   ═══════════════════════════════════════════════════════════ */
export function StepDone({ inviteeName, formData, plusOneData, onReset, onCancel, canceling }) {
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
      <p className="rsvp-done__note">Made a mistake or can't make it anymore? You can cancel and redo it.</p>
      <CancelRedo onCancel={onCancel} canceling={canceling} />
      <button className="btn btn-outline rsvp-done__reset" onClick={onReset}>
        Submit a different RSVP
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 1 — Attendance
   ═══════════════════════════════════════════════════════════ */
export function StepAttendance({ inviteeName, data, onChange, onNext }) {
  useEnterKey(() => { if (data.attendance) onNext() })
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
export function StepContact({ data, onChange, onNext, onBack }) {
  const emailOk = isValidEmail(data.email)
  const valid   = data.firstName.trim() && data.lastName.trim() && emailOk
  // Only complain once there is enough typed to be a real attempt, so the error
  // doesn't flash on the first keystroke
  const showEmailError = data.email.trim().length > 3 && !emailOk
  useEnterKey(() => { if (valid) onNext() }, [valid])
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
            autoComplete="email"
            aria-invalid={showEmailError || undefined}
            aria-describedby={showEmailError ? 'rsvp-em-error' : undefined} />
          {showEmailError && (
            <p className="rsvp-field__error" id="rsvp-em-error" role="alert">
              Please check your email address — we’ll send your confirmation there.
            </p>
          )}
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
   Enter key on either textarea advances to the next step.
   Shift+Enter still inserts a newline for multi-line input.
   ═══════════════════════════════════════════════════════════ */
export function StepPersonal({ data, onChange, onNext, onBack, submitting }) {
  function handleTextareaKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (submitting) return        // Enter must not re-fire an in-flight submit
      onNext()
    }
  }

  return (
    <div className="rsvp-step fade-up">
      <h2 className="rsvp-step__title">A Little Extra</h2>
      <p className="rsvp-step__sub">Share something special with us · Press Enter to continue</p>
      <div className="rsvp-fields">
        <div className="rsvp-field">
          <label htmlFor="rsvp-notes">Notes / Dietary Requirements</label>
          <textarea id="rsvp-notes" rows={3}
            placeholder="Dietary needs, song requests, anything you'd like us to know…"
            value={data.notes}
            onChange={e => onChange('notes', e.target.value)}
            onKeyDown={handleTextareaKey} />
        </div>
        <div className="rsvp-field">
          <label htmlFor="rsvp-advice">Best Advice for the Couple ✨</label>
          <textarea id="rsvp-advice" rows={4}
            placeholder="Share your best marriage advice or a heartfelt message…"
            value={data.advice}
            onChange={e => onChange('advice', e.target.value)}
            onKeyDown={handleTextareaKey} />
        </div>
      </div>
      <div className="rsvp-step__actions">
        <button className="btn btn-outline rsvp-step__back" onClick={onBack} disabled={submitting}>
          ← Back
        </button>
        {/* For guests with no Plus One step this button IS the submit, so it
            has to show the sending state rather than a plain "Continue". */}
        <button
          className="btn btn-primary rsvp-step__next"
          onClick={onNext}
          disabled={submitting}
        >
          {submitting ? <span>Sending<span className="dots" /></span> : 'Continue →'}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   STEP 'plusone'
   ═══════════════════════════════════════════════════════════ */
export function StepPlusOne({ inviteeName, data, onChange, onSubmit, onBack, submitting }) {
  const bringingYes = data.bringing === 'yes'
  // Optional field, so blank is fine — but if it is filled in it has to be
  // deliverable, otherwise the guest's invite silently goes nowhere
  const poEmailOk        = !data.email.trim() || isValidEmail(data.email)
  const showPoEmailError = data.email.trim().length > 3 && !poEmailOk
  const canSubmit   = data.bringing === 'no' ||
    (bringingYes && data.fullName.trim() && data.attendance && poEmailOk)

  return (
    <div className="rsvp-step fade-up">
      <div className="rsvp-plusone__badge">
        <span>✦</span> You're eligible to bring a Plus One
      </div>

      <h2 className="rsvp-step__title">Will you bring a guest?</h2>
      <p className="rsvp-step__sub">Entirely optional — let us know so we can prepare!</p>

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
                aria-invalid={showPoEmailError || undefined}
                aria-describedby={showPoEmailError ? 'po-email-error' : undefined}
              />
              {showPoEmailError && (
                <p className="rsvp-field__error" id="po-email-error" role="alert">
                  Please check this email address, or leave it blank.
                </p>
              )}
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
        <button className="btn btn-outline rsvp-step__back" onClick={onBack} disabled={submitting}>
          ← Back
        </button>
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
export function StepSuccess({ inviteeName, attendance, plusOneData, email }) {
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
