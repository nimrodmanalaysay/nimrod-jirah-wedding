import React, { useState, useEffect } from 'react'
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

  return {
    step,
    inviteeName: session.inviteeName,
    formData:    session.formData    ? { ...INITIAL_FORM,     ...session.formData }    : INITIAL_FORM,
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

  useEffect(() => { cacheStep(step) }, [step])
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
    const isAttending = formData.attendance === 'attending'
    if (plusOneElig && isAttending) {
      setStep('plusone')
    } else {
      handleSubmit()
    }
  }

  async function postRsvpRow(payload) {
    await fetch(RSVP_SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  // Primary invitee + optional plus one submitted as separate sheet rows.
  // Confirmation email is sent server-side via GmailApp in the Apps Script.
  async function handleSubmit() {
    if (submitting) return
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
