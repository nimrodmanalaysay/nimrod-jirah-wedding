import React, { useState, useEffect, useCallback, useRef } from 'react'
import PageHero from '../components/PageHero'
import './Gallery.css'

/* ============================================================
   Gallery Page — masonry + lightbox

   ✏️ To change the photos: drop files into
      /public/photos/PrenupPictures/ and edit the array below.

   `w` and `h` are each file's real pixel dimensions. The grid is
   square so they no longer drive the layout, but they stay as the
   img's intrinsic-size hint and as a record of what is actually
   served — `npm run optimize:photos` prints this array with the
   correct values after it resizes anything.
   ============================================================ */
const photos = [
  { id:  1, src: '/photos/PrenupPictures/1.jpg', w: 1067, h: 1600 },
  { id:  2, src: '/photos/PrenupPictures/2.jpg', w: 1067, h: 1600 },
  { id:  3, src: '/photos/PrenupPictures/3.jpg', w: 1600, h: 1067 },
  { id:  4, src: '/photos/PrenupPictures/4.jpg', w: 1600, h: 1067 },
  { id:  5, src: '/photos/PrenupPictures/5.jpg', w: 789, h: 1184 },
  { id:  6, src: '/photos/PrenupPictures/6.jpg', w: 789, h: 1184 },
  { id:  7, src: '/photos/PrenupPictures/7.jpg', w: 1444, h: 963 },
  { id:  8, src: '/photos/PrenupPictures/8.jpg', w: 1600, h: 1067 },
  { id:  9, src: '/photos/PrenupPictures/9.jpg', w: 1600, h: 1067 },
  { id: 10, src: '/photos/PrenupPictures/10.jpg', w: 665, h: 997 },
  { id: 11, src: '/photos/PrenupPictures/11.jpg', w: 1600, h: 1067 },
  { id: 12, src: '/photos/PrenupPictures/12.jpg', w: 1600, h: 1067 },
  { id: 13, src: '/photos/PrenupPictures/13.jpg', w: 1600, h: 1067 },
  { id: 14, src: '/photos/PrenupPictures/14.jpg', w: 1600, h: 1066 },
  { id: 15, src: '/photos/PrenupPictures/15.jpg', w: 1600, h: 1067 },
  { id: 16, src: '/photos/PrenupPictures/16.jpg', w: 1600, h: 900 },
  { id: 17, src: '/photos/PrenupPictures/17.jpg', w: 1600, h: 900 },
  { id: 18, src: '/photos/PrenupPictures/18.jpg', w: 1600, h: 900 },
  { id: 19, src: '/photos/PrenupPictures/19.jpg', w: 1600, h: 900 },
  { id: 20, src: '/photos/PrenupPictures/20.jpg', w: 900, h: 1600 },
  { id: 21, src: '/photos/PrenupPictures/21.jpg', w: 900, h: 1600 },
  { id: 22, src: '/photos/PrenupPictures/22.jpg', w: 1152, h: 780 },
  { id: 23, src: '/photos/PrenupPictures/23.jpg', w: 1600, h: 900 },
  { id: 24, src: '/photos/PrenupPictures/24.jpg', w: 1600, h: 900 },
  { id: 25, src: '/photos/PrenupPictures/25.jpg', w: 900, h: 1600 },
  { id: 26, src: '/photos/PrenupPictures/26.jpg', w: 1600, h: 900 },
  { id: 27, src: '/photos/PrenupPictures/27.jpg', w: 1600, h: 900 },
  { id: 28, src: '/photos/PrenupPictures/28.jpg', w: 900, h: 1600 },
]

const altFor = i => `Nimrod and Jirah prenuptial photo ${i + 1} of ${photos.length}`

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null)   // null = closed, else index
  const touchStartX = useRef(null)

  const isOpen = lightbox !== null

  const close = useCallback(() => setLightbox(null), [])
  const prev  = useCallback(() => setLightbox(i => (i - 1 + photos.length) % photos.length), [])
  const next  = useCallback(() => setLightbox(i => (i + 1) % photos.length), [])

  // Keyboard control while the lightbox is open
  useEffect(() => {
    if (!isOpen) return
    function onKey(e) {
      if (e.key === 'Escape')     close()
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close, prev, next])

  // Stop the page behind the lightbox from scrolling. Padding compensates for
  // the removed scrollbar so the layout doesn't jump sideways as it opens.
  useEffect(() => {
    if (!isOpen) return
    const { body } = document
    const gap = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = body.style.overflow
    const prevPadding  = body.style.paddingRight
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`
    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPadding
    }
  }, [isOpen])

  // Warm the neighbouring photos so arrowing through doesn't flash empty
  useEffect(() => {
    if (!isOpen) return
    for (const i of [(lightbox + 1) % photos.length,
                     (lightbox - 1 + photos.length) % photos.length]) {
      const img = new Image()
      img.src = photos[i].src
    }
  }, [isOpen, lightbox])

  function onTouchStart(e) { touchStartX.current = e.changedTouches[0].clientX }
  function onTouchEnd(e) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) (dx > 0 ? prev : next)()
    touchStartX.current = null
  }

  return (
    <div className="gallery">
      <PageHero
        eyebrow="Nimrod &amp; Jirah"
        title="Gallery"
        subtitle="A glimpse of our prenuptial story"
      />

      {/* Uniform square grid. Every tile is the same size and every row lines
          up, which a masonry of 19 landscape and 9 portrait photos can't do.
          The cost is that thumbnails are centre-cropped — the lightbox shows
          each photo whole and uncropped, so nothing is actually lost. */}
      <div className="gallery__grid">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className="gallery__item"
            onClick={() => setLightbox(index)}
            aria-label={`Open ${altFor(index)}`}
          >
            <img
              src={photo.src}
              alt={altFor(index)}
              width={photo.w}
              height={photo.h}
              loading="lazy"
              decoding="async"
            />
            <span className="gallery__item-overlay" aria-hidden="true">
              <span className="gallery__item-icon">⤢</span>
            </span>
          </button>
        ))}
      </div>

      {isOpen && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={altFor(lightbox)}
          onClick={e => { if (e.target === e.currentTarget) close() }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button className="lightbox__close" onClick={close} aria-label="Close">✕</button>

          <button
            className="lightbox__nav lightbox__prev"
            onClick={prev}
            aria-label="Previous photo"
          >‹</button>

          <figure className="lightbox__figure">
            <img
              key={photos[lightbox].id}      /* remount so the fade replays */
              src={photos[lightbox].src}
              alt={altFor(lightbox)}
            />
          </figure>

          <button
            className="lightbox__nav lightbox__next"
            onClick={next}
            aria-label="Next photo"
          >›</button>

          <p className="lightbox__counter">
            {lightbox + 1} <span>/</span> {photos.length}
          </p>
        </div>
      )}
    </div>
  )
}
