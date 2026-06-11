import React, { useEffect, useRef, useState } from 'react'
import './Story.css'

/* ============================================================
   Our Story Page — scroll-driven chapters

   Each chapter is a full-height section. As the reader scrolls,
   sections snap into place and reveal with a soft fade/slide.
   No buttons — the story unfolds with the scroll until the end.

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
  const scrollRef   = useRef(null)
  const sectionRefs = useRef([])
  const [active, setActive] = useState(0)

  // As each section snaps into view, reveal its content and mark it active.
  // Observer root is the snap container so it tracks the in-page scroll.
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            const idx = Number(entry.target.dataset.index)
            if (!Number.isNaN(idx)) setActive(idx)
          }
        })
      },
      { root: scrollRef.current, threshold: 0.4 }
    )

    sectionRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="story" ref={scrollRef}>

      {/* Intro section */}
      <section
        className="story__section story__section--intro in-view"
        data-index="0"
        ref={el => (sectionRefs.current[0] = el)}
      >
        <div className="story__intro-inner">
          <h1 className="section-title">Our Story</h1>
          <span className="section-divider" />
          <p className="story__sub">The journey that brought us here</p>
          <div className="story__scroll-cue">
            <span>Scroll to begin</span>
            <span className="story__scroll-arrow">↓</span>
          </div>
        </div>
      </section>

      {/* Chapter sections */}
      {slides.map((slide, i) => (
        <section
          key={slide.id}
          className={`story__section story__section--chapter ${i % 2 === 1 ? 'reverse' : ''}`}
          data-index={i + 1}
          ref={el => (sectionRefs.current[i + 1] = el)}
        >
          <div className="story__chapter-inner">
            <div className="story__img-wrap">
              <img
                src={slide.image}
                alt={slide.imageAlt}
                className="story__img"
                loading="lazy"
              />
            </div>

            <div className="story__card-body">
              <span className="story__chapter-icon">{slide.icon}</span>
              <p className="story__chapter">{slide.chapter}</p>
              <h2 className="story__title">{slide.title}</h2>
              <p className="story__date">{slide.date}</p>
              <p className="story__body">{slide.body}</p>
            </div>
          </div>
        </section>
      ))}

      {/* Scroll progress indicator (non-interactive) */}
      <div className="story__progress" aria-hidden="true">
        {[{ id: 'intro' }, ...slides].map((_, i) => (
          <span
            key={i}
            className={`story__progress-dot ${i === active ? 'active' : ''} ${i < active ? 'passed' : ''}`}
          />
        ))}
      </div>

    </div>
  )
}
