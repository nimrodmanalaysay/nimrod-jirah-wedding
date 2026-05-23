import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import './PageTransition.css'

/* ============================================================
   PageTransition
   Wraps every page with three layered effects:

   1. Progress bar  — thin gold line sweeping across the top
   2. Curtain wipe  — burgundy panel slides down then retracts
   3. Content fade  — page content fades + rises into place

   To adjust timing, edit the CSS variables inside
   PageTransition.css — everything is controlled there.
   ============================================================ */

export default function PageTransition({ children }) {
  const { pathname } = useLocation()
  // 'entering' → curtain drops + progress bar runs
  // 'visible'  → curtain retracts, content fades in
  const [phase, setPhase] = useState('visible')
  const isFirst = useRef(true)

  useEffect(() => {
    // Skip the very first render (page load already has hero animation)
    if (isFirst.current) {
      isFirst.current = false
      return
    }

    // Scroll to top instantly on navigation
    window.scrollTo({ top: 0, behavior: 'instant' })

    // Trigger curtain enter phase
    setPhase('entering')

    // After curtain covers screen, flip to exit phase (content fades in)
    const timer = setTimeout(() => setPhase('visible'), 600)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div className={`pt-wrapper pt-wrapper--${phase}`}>
      {/* Thin progress bar sweeping across the top */}
      <div className={`pt-progress ${phase === 'entering' ? 'pt-progress--run' : ''}`} />

      {/* Curtain overlay that slides in then out */}
      <div className={`pt-curtain pt-curtain--${phase}`} />

      {/* Page content */}
      <div className="pt-content">
        {children}
      </div>
    </div>
  )
}
