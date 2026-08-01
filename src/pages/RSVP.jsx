import React, { useState, useEffect, useRef } from 'react'
import PageHero from '../components/PageHero'
import './RSVP.css'
import { RSVP_SCRIPT_URL, INITIAL_FORM, INITIAL_PLUS_ONE } from './rsvp/constants'
import { ProgressBar } from './rsvp/RsvpShared'
import {
  StepGate,
  StepExisting,
  StepDone,
  StepAttendance,
  StepContact,
  StepPersonal,
  StepPlusOne,
  StepSuccess,
} from './rsvp/RsvpSteps'
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
} from '../utils/rsvpCache'
import { toTitleCase } from '../utils/rsvpValidation'

// Keeps .rsvp-card's height pinned to whatever its content currently needs, so
// stepping between screens animates instead of snapping. Each step holds a
// different amount of content (the Personal step is ~120px taller than the
// success screen), and CSS cannot transition to or from `height: auto` in every
// browser — `interpolate-size` is still Chromium-only — so the height has to be
// measured. A ResizeObserver on the inner wrapper covers content that changes
// without a step change too, e.g. a validation message appearing.
// If anything here fails the card simply keeps its natural auto height.
function useAnimatedHeight(cardRef, bodyRef, deps) {
  useEffect(() => {
    const card = cardRef.current
    const body = bodyRef.current
    if (!card || !body || typeof ResizeObserver === 'undefined') return

    const apply = () => {
      const cs  = getComputedStyle(card)
      const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      card.style.height = `${body.offsetHeight + pad}px`
    }

    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(body)
    return () => ro.disconnect()
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

// Upper bound on a single RSVP POST. Generous, because the Apps Script also
// sends a themed email with an .ics attachment before it responds — but finite,
// so the sending overlay always resolves one way or the other.
const POST_TIMEOUT_MS = 30000

// Compute the starting state synchronously from any cached session, so the
// page renders its real first step on the very first paint (no spinner flash).
function initFromSession() {
  const session = loadSession()
  if (!session) {
    return {
      step: 0,
      inviteeName: '',
      formData: INITIAL_FORM,
      plusOneData: INITIAL_PLUS_ONE,
      plusOneElig: false,
      existingRec: null,
    }
  }

  let step
  let existingRec = null
  if (session.submitted) {
    step = 'done'
  } else if (session.existingRsvp) {
    step = 'existing'
    existingRec = session.existingRsvp
  } else {
    step = session.step
  }

  const formData = session.formData
    ? { ...INITIAL_FORM, ...session.formData }
    : INITIAL_FORM

  // A cached step can point past the Attendance question while `attendance` is
  // still empty — e.g. the tab was restored, or the cache was written before
  // the choice was made. Resuming there let the guest reach "Continue" on the
  // Personal step, which submits straight away, so they never got asked
  // attending-or-not and the sheet took a row with a blank Attendance.
  // Clamp back to the Attendance step whenever the answer is missing.
  if (typeof step === 'number' && step > 1 && !formData.attendance) step = 1
  if (step === 'plusone' && !formData.attendance)                   step = 1

  return {
    step,
    inviteeName: session.inviteeName,
    formData,
    plusOneData: session.plusOneForm ? { ...INITIAL_PLUS_ONE, ...session.plusOneForm } : INITIAL_PLUS_ONE,
    plusOneElig: session.plusOneEligible ?? false,
    existingRec,
  }
}

export default function RSVP() {
  const [init] = useState(initFromSession)
  const [step,          setStep]          = useState(init.step)
  const [inviteeName,   setInviteeName]   = useState(init.inviteeName)
  const [formData,      setFormData]      = useState(init.formData)
  const [plusOneData,   setPlusOneData]   = useState(init.plusOneData)
  const [plusOneElig,   setPlusOneElig]   = useState(init.plusOneElig)
  const [existingRec,   setExistingRec]   = useState(init.existingRec)
  const [submitting,    setSubmitting]    = useState(false)
  const [submitError,   setSubmitError]   = useState('')
  const [canceling,     setCanceling]     = useState(false)
  // Raised by StepGate while it queries the guest list, so the shared overlay
  // covers that wait too. `busy` is either wait.
  const [checking,      setChecking]      = useState(false)
  const busy = submitting || checking

  const cardRef = useRef(null)
  const bodyRef = useRef(null)
  // Re-measure on any change that alters the card's content height
  useAnimatedHeight(cardRef, bodyRef, [step, busy, submitError, plusOneData.bringing])

  useEffect(() => { cacheStep(step) }, [step])
  useEffect(() => {
    if (typeof step === 'number' && step > 0) cacheForm(formData)
  }, [formData]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    cachePlusOneForm(plusOneData)
  }, [plusOneData])

  function handleField(key, value) {
    setFormData(prev => ({ ...prev, [key]: value }))
    // Answering attendance clears the "please tell us" prompt straight away
    if (key === 'attendance' && value) setSubmitError('')
  }
  function handlePlusOneField(key, value) {
    setPlusOneData(prev => ({ ...prev, [key]: value }))
  }

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

  // Cancel the guest's existing RSVP on the sheet, then drop them back into
  // the flow (keeping their verified name + plus-one eligibility) to redo it.
  // The Apps Script removes the matching row(s) for `action: 'cancel'`.
  async function handleCancelRedo() {
    if (canceling) return
    setCanceling(true)
    try {
      await postRsvpRow({ action: 'cancel', inviteeName: toTitleCase(inviteeName) })
    } catch {
      // no-cors gives no readable response; resubmitting upserts anyway
    }
    clearRsvpCache()
    cacheInvitee(inviteeName)
    cachePlusOneEligible(plusOneElig)
    setExistingRec(null)
    setFormData(INITIAL_FORM)
    setPlusOneData(INITIAL_PLUS_ONE)
    setSubmitError('')
    setCanceling(false)
    setStep(1)
  }

  function handleAfterPersonal() {
    if (submitting) return
    // Never submit without an attendance answer. Reaching here with it empty
    // means the guest resumed past the Attendance step, so send them back to
    // answer rather than posting a blank Attendance to the sheet.
    if (!formData.attendance) {
      setSubmitError('Please let us know whether you can attend.')
      setStep(1)
      return
    }
    const isAttending = formData.attendance === 'attending'
    if (plusOneElig && isAttending) {
      setStep('plusone')
    } else {
      handleSubmit()
    }
  }

  // Bounded so a stalled request can't leave the sending overlay up forever.
  // Aborting is safe: the Apps Script upserts on Invitee Name, so the retry
  // this surfaces replaces the row rather than duplicating it.
  async function postRsvpRow(payload) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), POST_TIMEOUT_MS)
    try {
      await fetch(RSVP_SCRIPT_URL, {
        method:  'POST',
        mode:    'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        signal:  controller.signal,
      })
    } finally {
      clearTimeout(timer)
    }
  }

  // Primary invitee + optional plus one submitted as separate sheet rows.
  // Confirmation email is sent server-side via GmailApp in the Apps Script.
  async function handleSubmit() {
    if (submitting) return
    // Defence in depth — handleAfterPersonal already checks, but StepPlusOne
    // submits directly too, and a blank Attendance must never reach the sheet.
    if (!formData.attendance) {
      setSubmitError('Please let us know whether you can attend.')
      setStep(1)
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const plusOneBringing  = plusOneData.bringing === 'yes'
      const plusOneFullName  = plusOneBringing && plusOneData.fullName.trim()
        ? toTitleCase(plusOneData.fullName)
        : ''

      const plusOneEmail = plusOneBringing && plusOneData.email
        ? plusOneData.email.trim().toLowerCase()
        : ''

      await postRsvpRow({
        inviteeName: toTitleCase(inviteeName),
        attendance:  formData.attendance,
        firstName:   toTitleCase(formData.firstName),
        lastName:    toTitleCase(formData.lastName),
        email:       formData.email.trim().toLowerCase(),
        notes:       toTitleCase(formData.notes),
        advice:      toTitleCase(formData.advice),
        plusOneName: plusOneFullName,
        plusOneEmail,   // so the Apps Script can email the plus one an invite
      })

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
          plusOneName: '',
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

  const showPlusOneStep = plusOneElig && formData.attendance === 'attending'
  const TOTAL_STEPS     = showPlusOneStep ? 4 : 3
  const stepIndex       = step === 'plusone' ? 3 : (typeof step === 'number' ? step - 1 : 0)

  return (
    <div className="rsvp-page">
      <PageHero
        eyebrow="Nimrod & Jirah"
        title="RSVP"
        subtitle="Kindly reply by October 1, 2026"
      />

      <div className="rsvp-card" ref={cardRef}>
        {/* One overlay for every wait: the guest-list lookup on the name gate
            and the RSVP POST. Sits outside __body so it fills the card rather
            than the measured content. */}
        {busy && (
          <div className="rsvp-sending" role="status" aria-live="polite">
            <span className="rsvp-sending__spinner" aria-hidden="true" />
            <p className="rsvp-sending__text">
              {checking ? 'Checking your invitation' : 'Sending your RSVP'}
              <span className="dots" />
            </p>
            <p className="rsvp-sending__sub">
              {checking ? 'Looking for your name on our guest list' : 'Please keep this page open'}
            </p>
          </div>
        )}

        {/* Measured by useAnimatedHeight so the card can animate between steps */}
        <div className="rsvp-card__body" ref={bodyRef}>

        {(typeof step === 'number' && step >= 1 && step <= 3 || step === 'plusone') && (
          <ProgressBar step={stepIndex} total={TOTAL_STEPS} />
        )}

        {step === 0 && (
          <StepGate
            onVerified={handleVerified}
            onDuplicate={handleDuplicate}
            onChecking={setChecking}
          />
        )}
        {step === 'existing' && (
          <StepExisting
            inviteeName={inviteeName}
            record={existingRec || getCachedExistingRsvp() || {}}
            onReset={handleReset}
            onCancel={handleCancelRedo}
            canceling={canceling}
          />
        )}
        {step === 'done' && (
          <StepDone
            inviteeName={inviteeName}
            formData={formData}
            plusOneData={plusOneData}
            onReset={handleReset}
            onCancel={handleCancelRedo}
            canceling={canceling}
          />
        )}
        {step === 1 && (
          <>
            <StepAttendance
              inviteeName={inviteeName}
              data={formData}
              onChange={handleField}
              onNext={() => setStep(2)}
            />
            {/* Shown when a resumed session was clamped back here for an answer */}
            {submitError && (
              <p className="rsvp-error" role="alert">{submitError}</p>
            )}
          </>
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
              submitting={submitting}
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

        </div>{/* .rsvp-card__body */}
      </div>
    </div>
  )
}
