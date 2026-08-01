import React from 'react'
import './PageHero.css'

/* ============================================================
   PageHero — shared compact page title (no background band).
   Used on every page except Home and Our Story, which have their
   own bespoke heroes.
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
