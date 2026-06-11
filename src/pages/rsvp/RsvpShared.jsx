import React from 'react'

export function ProgressBar({ step, total }) {
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

export function SummaryRow({ label, value }) {
  return (
    <div className="rsvp-done__row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
