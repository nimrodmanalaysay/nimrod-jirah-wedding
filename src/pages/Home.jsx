import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Countdown from '../components/Countdown'
import './Home.css'

// Real photos (src/pages/photos) — one per page section.
// ✏️ Swap any of these for a more fitting image anytime.
import storyImg     from './photos/couple_portrait.png'
import entourageImg from './photos/couple.png'
import ceremonyImg  from './photos/ceremony.png'
import galleryImg   from './photos/gallery.png'
import rsvpImg      from './photos/venue.png'
import faqsImg      from './photos/reception.png'
import giftsImg     from './photos/hero.png'

/* ============================================================
   Home Page
   Sections: Hero, Countdown, Wedding Details, then a full-width
   showcase section for every page of the site.
   ============================================================ */

const pageSections = [
  {
    label: 'Our Story', path: '/story', img: storyImg, cta: 'Read our story',
    desc: 'From a chance first hello to the moment we said forever — follow the chapters of how two hearts became one.',
  },
  {
    label: 'Entourage', path: '/entourage', img: entourageImg, cta: 'Meet the team',
    desc: 'The family and dearest friends who have walked with us through it all, and who will stand beside us as we say “I do.”',
  },
  {
    label: 'Ceremony', path: '/ceremony', img: ceremonyImg, cta: 'See the details',
    desc: 'Everything about the day itself — the order of our Christ-centered service, the reception to follow, and what to wear.',
  },
  {
    label: 'Gallery', path: '/gallery', img: galleryImg, cta: 'View the gallery',
    desc: 'Candid laughs, quiet glances, and milestones along the way — a growing collection of our favorite moments.',
  },
  {
    label: 'RSVP', path: '/rsvp', img: rsvpImg, cta: 'RSVP now',
    desc: 'We would love to celebrate with you. Let us know if you can make it — kindly reply by October 1, 2026.',
  },
  {
    label: 'FAQs', path: '/faqs', img: faqsImg, cta: 'Read the FAQs',
    desc: 'Wondering about timing, parking, or attire? We have gathered answers to the questions guests ask most.',
  },
  {
    label: 'Gifts', path: '/gifts', img: giftsImg, cta: 'View gift guide',
    desc: 'Your presence is the greatest gift of all. But if you wish to bless us further, you will find everything here.',
  },
]

export default function Home() {
  const sectionRefs = useRef([])

  // Reveal each page section as it scrolls into view.
  // Safe by default: without JS (or with reduced-motion) sections stay visible.
  useEffect(() => {
    const els = sectionRefs.current.filter(Boolean)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    els.forEach(el => el.classList.add('reveal-ready'))
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="home">

      {/* ---- HERO ---- */}
      <section className="hero">
        {/* Decorative botanical overlay — edit in Home.css */}
        <div className="hero__overlay" />

        <div className="hero__content fade-up">
          {/* Pre-title */}
          <p className="hero__pre">The Wedding of</p>

          {/* Couple names — change here to update */}
          <h1 className="hero__names">
            Nimrod<br />
            <span className="hero__amp">&amp;</span><br />
            Jirah
          </h1>

          {/* Wedding date */}
          <p className="hero__date">November 7, 2026</p>

          {/* CTA buttons */}
          <div className="hero__cta">
            <Link to="/rsvp"    className="btn btn-primary">RSVP Now</Link>
            <Link to="/story"   className="btn btn-outline">Our Story</Link>
          </div>
        </div>

        {/* Scroll indicator arrow */}
        <div className="hero__scroll-hint">
          <span />
        </div>
      </section>

      {/* ---- COUNTDOWN ---- */}
      <section className="home__countdown">
        <p className="home__countdown-label">Counting down to forever</p>
        <Countdown />
      </section>

      {/* ---- WEDDING DETAILS ---- */}
      <section className="home__details">
        <h2 className="section-title">Wedding Details</h2>
        <span className="section-divider" />

        <div className="details__grid">
          {/* Ceremony card */}
          <div className="details__card">
            <div className="details__icon">✦</div>
            <h3>Ceremony</h3>
            <p className="details__time">November 7, 2026</p>
            <p className="details__time">3:00 PM</p>
            <p className="details__place">Grass Garden</p>
            {/* ✏️ Replace with actual address */}
            <p className="details__address">123 Garden Lane, City, Province 0000</p>
          </div>

          {/* Divider ornament */}
          <div className="details__ornament">❧</div>

          {/* Reception card */}
          <div className="details__card">
            <div className="details__icon">✦</div>
            <h3>Reception</h3>
            <p className="details__time">November 7, 2026</p>
            <p className="details__time">4:00 PM</p>
            <p className="details__place">Grass Garden</p>
            {/* ✏️ Replace with actual address */}
            <p className="details__address">123 Garden Lane, City, Province 0000</p>
          </div>
        </div>
      </section>

      {/* ---- PAGE SHOWCASE SECTIONS ---- */}
      <div className="home__pages">
        <div className="home__pages-intro">
          <h2 className="section-title">Explore</h2>
          <span className="section-divider" />
          <p className="home__pages-sub">A look at everything that awaits you</p>
        </div>

        {pageSections.map((s, i) => (
          <section
            key={s.path}
            className={`page-section ${i % 2 === 1 ? 'reverse' : ''}`}
            ref={el => (sectionRefs.current[i] = el)}
          >
            <div className="page-section__media">
              <img src={s.img} alt={s.label} loading="lazy" />
            </div>
            <div className="page-section__body">
              <span className="page-section__num">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="page-section__title">{s.label}</h2>
              <p className="page-section__desc">{s.desc}</p>
              <Link to={s.path} className="btn btn-primary page-section__cta">
                {s.cta} →
              </Link>
            </div>
          </section>
        ))}
      </div>

    </div>
  )
}
