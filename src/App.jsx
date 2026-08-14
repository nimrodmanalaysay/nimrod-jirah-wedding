import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home           from './pages/Home'
import Story          from './pages/Story'
import Entourage      from './pages/Entourage'
import RSVP           from './pages/RSVP'
import Gallery        from './pages/Gallery'
import WeddingCeremony from './pages/WeddingCeremony'
import Reception      from './pages/Reception'
import DressCode      from './pages/DressCode'
import FAQs           from './pages/FAQs'
import Gifts          from './pages/Gifts'

export default function App() {
  const location = useLocation()

  // Reset scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <>
      <Navbar />
      <main>
        <Routes location={location} key={location.pathname}>
          <Route path="/"                    element={<Home />} />
          <Route path="/story"               element={<Story />} />
          <Route path="/entourage"           element={<Entourage />} />
          <Route path="/rsvp"                element={<RSVP />} />
          <Route path="/gallery"             element={<Gallery />} />
          {/* Program sub-pages. The hub that used to live at /ceremony is gone;
              the path redirects to the first sub-page so links already shared
              with guests, and any bookmarks, still land somewhere. */}
          <Route path="/ceremony"            element={<Navigate to="/ceremony/wedding" replace />} />
          <Route path="/ceremony/wedding"    element={<WeddingCeremony />} />
          <Route path="/ceremony/reception"  element={<Reception />} />
          <Route path="/ceremony/dresscode"  element={<DressCode />} />
          {/* New tabs */}
          <Route path="/faqs"                element={<FAQs />} />
          <Route path="/gifts"               element={<Gifts />} />
        </Routes>
      </main>
      <Footer />
      <Analytics />
    </>
  )
}
