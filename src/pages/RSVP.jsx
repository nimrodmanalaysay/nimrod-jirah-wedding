import React, { useState } from 'react'
import './RSVP.css'

/* ============================================================
   RSVP Page — Google Sheets Integration

   HOW TO CONNECT TO GOOGLE SHEETS:
   ─────────────────────────────────
   1. Go to https://sheets.google.com and create a new sheet.
      Name the columns: Timestamp, First Name, Last Name, Email, Phone, Attendance

   2. Go to Extensions → Apps Script.

   3. Paste this code into the Apps Script editor:

      function doPost(e) {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        var data = JSON.parse(e.postData.contents);
        sheet.appendRow([
          new Date(),
          data.firstName,
          data.lastName,
          data.email,
          data.phone,
          data.attendance
        ]);
        return ContentService
          .createTextOutput(JSON.stringify({ result: 'success' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

   4. Click Deploy → New Deployment → Web App.
      - Execute as: Me
      - Who has access: Anyone

   5. Copy the Web App URL and paste it below as GOOGLE_SHEET_URL.
   ─────────────────────────────────
   ============================================================ */

// ✏️ Paste your Google Apps Script Web App URL here
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'

const INITIAL_FORM = {
  firstName:  '',
  lastName:   '',
  email:      '',
  phone:      '',
  attendance: 'attending',
}

export default function RSVP() {
  const [form,    setForm]    = useState(INITIAL_FORM)
  const [status,  setStatus]  = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  // Update form field on change
  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Submit form to Google Sheets
  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode:   'no-cors', // Required for Google Apps Script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      // no-cors means we can't read the response, so assume success
      setStatus('success')
      setMessage('Thank you! We have received your RSVP. See you on November 7! 🎉')
      setForm(INITIAL_FORM)
    } catch (err) {
      setStatus('error')
      setMessage('Something went wrong. Please try again or contact us directly.')
    }
  }

  return (
    <div className="rsvp">
      <div className="rsvp__header">
        <h1 className="section-title">RSVP</h1>
        <span className="section-divider" />
        <p className="rsvp__sub">Kindly reply by October 1, 2026</p>
      </div>

      <div className="rsvp__container">
        {/* Left decorative panel */}
        <div className="rsvp__left">
          <p className="rsvp__left-title">Join Us</p>
          <p className="rsvp__left-date">November 7, 2026</p>
          <div className="rsvp__left-details">
            <p>Ceremony · 3:00 PM</p>
            <p>Reception · 4:00 PM</p>
            <p>Grass Garden</p>
            {/* ✏️ Replace with real address */}
            <p>123 Garden Lane, City, Province</p>
          </div>
        </div>

        {/* RSVP Form */}
        <form className="rsvp__form" onSubmit={handleSubmit} noValidate>
          <div className="rsvp__row">
            <div className="rsvp__field">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                placeholder="Your first name"
                value={form.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="rsvp__field">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                placeholder="Your last name"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="rsvp__field">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="rsvp__field">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+63 9XX XXX XXXX"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          {/* Attendance select */}
          <div className="rsvp__field">
            <label htmlFor="attendance">Attendance</label>
            <select
              id="attendance"
              name="attendance"
              value={form.attendance}
              onChange={handleChange}
            >
              <option value="attending">Joyfully Attending</option>
              <option value="not-attending">Regretfully Unable to Attend</option>
            </select>
          </div>

          {/* Status message */}
          {message && (
            <p className={`rsvp__message rsvp__message--${status}`}>{message}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary rsvp__submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Sending…' : 'Send RSVP'}
          </button>
        </form>
      </div>
    </div>
  )
}
