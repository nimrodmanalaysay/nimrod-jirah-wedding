import React, { useState, useEffect } from 'react'
import './Countdown.css'

/* ============================================================
   Countdown Timer
   - Counts down to the wedding date
   - Change WEDDING_DATE below if the date changes
   ============================================================ */

// ✏️ Edit this date to match the wedding day
const WEDDING_DATE = new Date('2026-11-07T15:00:00')

function pad(n) {
  return String(n).padStart(2, '0')
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft())

  function getTimeLeft() {
    const diff = WEDDING_DATE - Date.now()
    if (diff <= 0) return null
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)
    return { days, hours, minutes, seconds }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  if (!timeLeft) {
    return <p className="countdown__message">Today is the day! 🎉</p>
  }

  const units = [
    { label: 'Days',    value: timeLeft.days },
    { label: 'Hours',   value: pad(timeLeft.hours) },
    { label: 'Minutes', value: pad(timeLeft.minutes) },
    { label: 'Seconds', value: pad(timeLeft.seconds) },
  ]

  return (
    <div className="countdown">
      {units.map(({ label, value }) => (
        <div key={label} className="countdown__unit">
          <span className="countdown__number">{value}</span>
          <span className="countdown__label">{label}</span>
        </div>
      ))}
    </div>
  )
}
