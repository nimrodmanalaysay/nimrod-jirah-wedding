import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'

// Pages
import Home           from './pages/Home'
import Story          from './pages/Story'
import Entourage      from './pages/Entourage'
import RSVP           from './pages/RSVP'
import Gallery        from './pages/Gallery'
import Ceremony       from './pages/Ceremony'
import WeddingCeremony from './pages/WeddingCeremony'
import Reception      from './pages/Reception'
import DressCode      from './pages/DressCode'
import FAQs           from './pages/FAQs'
import Gifts          from './pages/Gifts'

export default function App() {
  const location = useLocation()

  return (
    <>
      <Navbar />
      <PageTransition>
        <main>
          <Routes location={location} key={location.pathname}>
            <Route path="/"                    element={<Home />} />
            <Route path="/story"               element={<Story />} />
            <Route path="/entourage"           element={<Entourage />} />
            <Route path="/rsvp"                element={<RSVP />} />
            <Route path="/gallery"             element={<Gallery />} />
            {/* Ceremony hub + sub-pages */}
            <Route path="/ceremony"            element={<Ceremony />} />
            <Route path="/ceremony/wedding"    element={<WeddingCeremony />} />
            <Route path="/ceremony/reception"  element={<Reception />} />
            <Route path="/ceremony/dresscode"  element={<DressCode />} />
            {/* New tabs */}
            <Route path="/faqs"                element={<FAQs />} />
            <Route path="/gifts"               element={<Gifts />} />
          </Routes>
        </main>
      </PageTransition>
      <Footer />
    </>
  )
}
