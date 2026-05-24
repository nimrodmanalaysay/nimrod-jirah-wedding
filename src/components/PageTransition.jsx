import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import './PageTransition.css'

/* ============================================================
   PageTransition — polished loading experience
   
   On first load:  curtain starts visible, then lifts after a
                   short delay so content never flashes in raw.
   On navigation: curtain drops to cover old page, new page
                   mounts hidden, then curtain lifts to reveal.
   
   Phases:
     'init'     → curtain fully covering (first load)
     'entering' → curtain dropping (navigation start)
     'visible'  → curtain lifted, content faded in
   ============================================================ */

export default function PageTransition({ children }) {
  const { pathname } = useLocation()
  const isFirst      = useRef(true)

  // Start in 'init' so the curtain covers the very first paint
  const [phase, setPhase] = useState('init')

  // ── First load: lift curtain after brief delay ──
  useEffect(() => {
    if (!isFirst.current) return
    isFirst.current = false

    // Small delay lets the DOM fully paint before revealing
    const t = setTimeout(() => setPhase('visible'), 350)
    return () => clearTimeout(t)
  }, [])

  // ── Route change: drop then lift ──
  useEffect(() => {
    if (isFirst.current) return   // handled above

    window.scrollTo({ top: 0, behavior: 'instant' })

    // 1. Drop curtain
    setPhase('entering')

    // 2. Lift curtain after it's fully down
    const t = setTimeout(() => setPhase('visible'), 650)
    return () => clearTimeout(t)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`pt-wrapper pt-wrapper--${phase}`}>
      {/* Progress bar */}
      <div className={`pt-progress ${phase === 'entering' ? 'pt-progress--run' : ''}`} />

      {/* Curtain overlay */}
      <div className={`pt-curtain pt-curtain--${phase}`}>
        <span className="pt-curtain__monogram">N &amp; J</span>
      </div>

      {/* Page content */}
      <div className="pt-content">
        {children}
      </div>
    </div>
  )
}
