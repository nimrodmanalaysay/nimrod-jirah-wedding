import React, { useState } from 'react'
import './Story.css'

/* ============================================================
   Our Story Page — slideshow with images per slide
   ✏️ Replace `image` URLs with your real prenup/couple photos.
      Images live in /public/photos/ — reference as /photos/name.jpg
   ============================================================ */

const slides = [
  {
    id: 1,
    chapter: 'Chapter 1',
    title: 'How We Met',
    date: '2020',
    icon: '✦',
    // ✏️ Replace with your real photo: '/photos/how-we-met.jpg'
    image: 'https://placehold.co/680x380/E1CA96/691B19?text=How+We+Met',
    imageAlt: 'How we met',
    body: `Every love story begins with a moment — and ours was no different. We crossed paths at a time neither of us expected, and in that ordinary moment, something extraordinary quietly began. It started simply: a glance, a smile, a conversation that stretched beyond any expected end.`,
  },
  {
    id: 2,
    chapter: 'Chapter 2',
    title: 'The First Date',
    date: '2021',
    icon: '♡',
    image: 'https://placehold.co/680x380/FFD9DA/691B19?text=The+First+Date',
    imageAlt: 'Our first date',
    body: `Nervous and excited in equal measure, we shared our first real evening together. Simple as it was — coffee, laughter, the kind of honest talk that feels rare — it was enough to make us both certain we wanted a second. Time moved differently that night.`,
  },
  {
    id: 3,
    chapter: 'Chapter 3',
    title: 'Growing Together',
    date: '2022 – 2024',
    icon: '❧',
    image: 'https://placehold.co/680x380/556251/E1CA96?text=Growing+Together',
    imageAlt: 'Growing together',
    body: `Seasons changed, and so did we — together. Through ordinary Tuesdays and milestone moments, through challenges that tested us and joys that defined us, we chose each other, again and again. Distance was just distance. Silence was never empty.`,
  },
  {
    id: 4,
    chapter: 'Chapter 4',
    title: 'The Proposal',
    date: '2025',
    icon: '◈',
    image: 'https://placehold.co/680x380/691B19/E1CA96?text=The+Proposal',
    imageAlt: 'The proposal',
    body: `Under a sky neither of us will ever forget, the words finally came — simple, honest, from the heart. There was no need for grand gestures. The moment was already perfect. She said yes before the question was even finished.`,
  },
  {
    id: 5,
    chapter: 'Chapter 5',
    title: 'Forever Begins',
    date: 'November 7, 2026',
    icon: '✿',
    image: 'https://placehold.co/680x380/BD6738/FFD9DA?text=Forever+Begins',
    imageAlt: 'Forever begins',
    body: `And now we stand at the beginning of forever. We invite our family and friends to witness us take this sacred step — to celebrate with us, to laugh and dance, and to remind us that love is always worth it. We cannot wait to see you there.`,
  },
]

export default function Story() {
  const [current, setCurrent] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  function goTo(i) {
    setCurrent(i)
    setAnimKey(k => k + 1) // re-trigger card animation
  }
  const prev = () => goTo(Math.max(0, current - 1))
  const next = () => goTo(Math.min(slides.length - 1, current + 1))

  const slide = slides[current]

  return (
    <div className="story">

      {/* Page header */}
      <div className="story__header">
        <h1 className="section-title">Our Story</h1>
        <span className="section-divider" />
        <p className="story__sub">The journey that brought us here</p>
      </div>

      {/* Slideshow */}
      <div className="story__stage">

        {/* Progress dots */}
        <div className="story__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`story__dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Slide card — key forces re-animation on change */}
        <div className="story__card" key={animKey}>

          {/* Photo */}
          <div className="story__img-wrap">
            <img
              src={slide.image}
              alt={slide.imageAlt}
              className="story__img"
              loading="lazy"
            />
          </div>

          {/* Text content */}
          <div className="story__card-body">
            <span className="story__chapter-icon">{slide.icon}</span>
            <p className="story__chapter">{slide.chapter}</p>
            <h2 className="story__title">{slide.title}</h2>
            <p className="story__date">{slide.date}</p>
            <p className="story__body">{slide.body}</p>
          </div>

        </div>

        {/* Navigation */}
        <div className="story__nav">
          <button className="story__nav-btn" onClick={prev} disabled={current === 0}>
            ← Prev
          </button>
          <span className="story__counter">{current + 1} / {slides.length}</span>
          <button className="story__nav-btn" onClick={next} disabled={current === slides.length - 1}>
            Next →
          </button>
        </div>

      </div>

      {/* Timeline strip */}
      <div className="story__timeline">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={`story__timeline-item ${i <= current ? 'passed' : ''}`}
            onClick={() => goTo(i)}
          >
            <div className="story__timeline-dot" />
            <p className="story__timeline-label">{s.title}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
