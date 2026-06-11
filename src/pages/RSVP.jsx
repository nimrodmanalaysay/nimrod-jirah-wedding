import React, { useState, useEffect } from 'react'
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

      await postRsvpRow({
        inviteeName: toTitleCase(inviteeName),
        attendance:  formData.attendance,
        firstName:   toTitleCase(formData.firstName),
        lastName:    toTitleCase(formData.lastName),
        email:       formData.email.trim().toLowerCase(),
        notes:       toTitleCase(formData.notes),
        advice:      toTitleCase(formData.advice),
        plusOneName: plusOneFullName,
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
