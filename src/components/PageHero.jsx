import React from 'react'
import './PageHero.css'

/* ============================================================
   PageHero — shared burgundy hero banner, matching the
   Wedding Service page hero. Used on every page except Home
   and Our Story.
   ============================================================ */
export default function PageHero({ eyebrow, title, subtitle }) {
  return (
    <header className="page-hero">
      {eyebrow && <p className="page-hero__eyebrow">{eyebrow}</p>}
      <h1 className="page-hero__title">{title}</h1>
      {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}
    </header>
  )
}
