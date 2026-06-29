/* ============================================================
   emailTemplates.js
   Reference file — contains the complete Apps Script code
   to paste into your Google Apps Script editor.

   The email template and .ics content are defined here
   for version control. The actual sending happens in the
   Apps Script, not in the browser.
   ============================================================ */

export const WEDDING = {
  coupleName:   'Nimrod & Jirah',
  date:         'November 7, 2026',
  dateISO:      '20261107',
  timeStart:    'T063000Z',   // 2:30 PM PHT = 06:30 UTC
  timeEnd:      'T140000Z',   // 10:00 PM PHT = 14:00 UTC
  ceremonyTime: '2:30 PM',
  receptionTime:'4:00 PM',
  venue:        'Grass Garden',
  address:      '123 Garden Lane, City, Province 0000',
  coupleEmail:  'nimrodandjirah@email.com',
}

/*
  ══════════════════════════════════════════════════════════════
  COMPLETE APPS SCRIPT — PASTE THIS ENTIRE BLOCK INTO YOUR
  RSVP SPREADSHEET'S APPS SCRIPT EDITOR, REPLACING EVERYTHING.

  Steps:
  1. Open your RSVP spreadsheet
  2. Extensions → Apps Script
  3. Select all existing code and DELETE it
  4. Paste everything between the START and END markers below
  5. Click Save (floppy disk icon)
  6. Click Deploy → Manage Deployments → Edit (pencil icon)
     on your existing deployment → Version: New version → Deploy
  7. The URL stays the same — no change needed in RSVP.jsx

  ── SHEET COLUMN HEADERS (Row 1 must have exactly these) ──
  A: ID
  B: Timestamp
  C: Invitee Name
  D: Attendance
  E: First Name
  F: Last Name
  G: Email
  H: Notes
  I: Advice

  ── INVITEE SHEET (separate spreadsheet) ──
  Column B: Invitee Name
  Column C: Additional Invitee (TRUE/FALSE)

  ══════════════════════════════════════════════════════════════
  ── START OF APPS SCRIPT ──────────────────────────────────────

// ── CONFIGURATION — update these to match your details ────────
var CONFIG = {
  coupleName:    'Nimrod & Jirah',
  weddingDate:   'November 7, 2026',
  ceremonyTime:  '2:30 PM',
  receptionTime: '4:00 PM',
  venue:         'Grass Garden',
  address:       '123 Garden Lane, City, Province 0000',
  coupleEmail:   'nimrodandjirah@email.com',
  emailSender:   'Nimrod & Jirah Wedding',
  calStartUTC:   '20261107T063000Z',
  calEndUTC:     '20261107T140000Z',
};


// ── doGet — reads invitee list only, NEVER writes ─────────────
// Called by the RSVP gate to check if a name is on the guest list
// and whether they have a plus one (column C).
function doGet(e) {
  try {
    var sheet   = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      return respond({ names: [], invitees: [], records: [] });
    }

    // Read column B (name) and C (additional invitee) from row 2 down
    var invData  = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
    var names    = [];
    var invitees = [];

    invData.forEach(function(row) {
      var name  = String(row[0] || '').trim();
      var extra = row[1];
      if (name) {
        names.push(name);
        invitees.push({ name: name, additionalInvitee: extra });
      }
    });

    // Also read existing RSVP records for duplicate check
    // (reads columns C = Invitee Name from RSVP rows)
    var lastCol = sheet.getLastColumn();
    var records = [];
    if (lastRow >= 2) {
      var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      var rows    = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
      rows.forEach(function(row) {
        if (row[2]) {  // column C = Invitee Name
          var obj = {};
          headers.forEach(function(h, i) { obj[h] = row[i]; });
          records.push(obj);
        }
      });
    }

    return respond({ names: names, invitees: invitees, records: records });
  } catch(err) {
    return respond({ error: err.toString(), names: [], invitees: [], records: [] });
  }
}


// ── doPost — writes ONE RSVP row then sends ONE email ─────────
// Called once per guest (primary invitee or plus one).
// Email is only sent for the primary invitee (not plus one rows).
function doPost(e) {
  try {
    var data  = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // ── 1. Write the RSVP row ──────────────────────────────────
    var newId = sheet.getLastRow();  // row count becomes the ID
    sheet.appendRow([
      newId,
      new Date(),
      data.inviteeName  || '',
      data.attendance   || '',
      data.firstName    || '',
      data.lastName     || '',
      data.email        || '',
      data.notes        || '',
      data.advice       || ''
    ]);

    // ── 2. Send confirmation email ────────────────────────────
    // Only send for primary invitees — not for "Plus One of ..." rows
    var email       = String(data.email || '').trim();
    var isPlusOne   = String(data.inviteeName || '').indexOf('Plus One of') === 0;
    var shouldEmail = email && !isPlusOne;

    if (shouldEmail) {
      try {
        sendConfirmationEmail(data);
      } catch(emailErr) {
        // Email failure must NOT prevent RSVP from saving
        Logger.log('Email failed for ' + email + ': ' + emailErr.toString());
      }
    }

    return respond({ result: 'success' });

  } catch(err) {
    Logger.log('doPost error: ' + err.toString());
    return respond({ result: 'error', message: err.toString() });
  }
}


// ── sendConfirmationEmail ──────────────────────────────────────
// Builds and sends the wedding-themed HTML email with .ics attachment.
function sendConfirmationEmail(data) {
  var email        = String(data.email).trim().toLowerCase();
  var guestName    = data.inviteeName || ((data.firstName || '') + ' ' + (data.lastName || '')).trim();
  var firstName    = data.firstName   || guestName;
  var isAttending  = data.attendance  === 'attending';
  var plusOneName  = data.plusOneName || '';

  var subject = 'RSVP Confirmed - ' + CONFIG.coupleName + ' Wedding';

  // Build HTML body
  var htmlBody = buildEmailHTML({
    guestName:   guestName,
    firstName:   firstName,
    isAttending: isAttending,
    plusOneName: plusOneName,
  });

  // Build .ics calendar string
  var icsContent = buildICS();
  var icsBlob = Utilities.newBlob(icsContent, 'text/calendar', 'NimrodAndJirahWedding.ics');

  GmailApp.sendEmail(email, subject, '', {
    htmlBody:    htmlBody,
    attachments: isAttending ? [icsBlob] : [],
    replyTo:     CONFIG.coupleEmail,
    name:        CONFIG.emailSender,
  });
}


// ── buildEmailHTML ─────────────────────────────────────────────
function buildEmailHTML(opts) {
  var statusLabel = opts.isAttending ? 'Joyfully Attending 🥂' : 'Unable to Attend 💌';
  var statusColor = opts.isAttending ? '#556251' : '#BD6738';

  var plusOneRow = opts.plusOneName
    ? '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Plus One</td>'
      + '<td style="padding:6px 0;font-size:13px;color:#691B19;font-weight:600;">'
      + opts.plusOneName + '</td></tr>'
    : '';

  var attendingMsg = opts.isAttending
    ? '<p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 20px;">'
      + 'We are <strong style="color:#691B19;">so excited</strong> to celebrate with you! '
      + 'Please arrive by <strong>2:15 PM</strong> so you can be seated before the ceremony begins at '
      + CONFIG.ceremonyTime + '.</p>'
    : '<p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 20px;">'
      + 'We completely understand and will miss you dearly. '
      + 'Your kind thoughts and well wishes mean the world to us. 💛</p>';

  var calLink = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(CONFIG.coupleName + ' Wedding')
    + '&dates=' + CONFIG.calStartUTC + '/' + CONFIG.calEndUTC
    + '&details=' + encodeURIComponent('Wedding at ' + CONFIG.venue)
    + '&location=' + encodeURIComponent(CONFIG.address);

  var calendarBlock = opts.isAttending
    ? '<div style="text-align:center;margin:28px 0;">'
      + '<a href="' + calLink + '" style="display:inline-block;background:#691B19;color:#E1CA96;'
      + 'text-decoration:none;padding:12px 28px;border-radius:2px;font-size:13px;'
      + 'font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">+ Add to Google Calendar</a></div>'
    : '';

  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9f4ef;font-family:Georgia,serif;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f4ef;padding:40px 20px;"><tr><td align="center">'
    + '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:4px;overflow:hidden;">'

    // Header
    + '<tr><td style="background:#691B19;padding:40px 48px;text-align:center;">'
    + '<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(225,202,150,0.7);">The Wedding of</p>'
    + '<h1 style="margin:0;font-size:38px;font-weight:300;color:#E1CA96;letter-spacing:0.04em;">' + CONFIG.coupleName + '</h1>'
    + '<p style="margin:12px 0 0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.55);">' + CONFIG.weddingDate + '</p>'
    + '</td></tr>'
    + '<tr><td style="background:#E1CA96;height:3px;"></td></tr>'

    // Body
    + '<tr><td style="padding:40px 48px;">'
    + '<p style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#BD6738;margin:0 0 8px;">RSVP Confirmation</p>'
    + '<h2 style="font-size:26px;font-weight:400;color:#691B19;margin:0 0 24px;">Dear ' + opts.firstName + ',</h2>'
    + '<p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 20px;">Thank you for confirming your RSVP for our wedding celebration.</p>'
    + attendingMsg

    // Summary table
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f5;border:1px solid rgba(225,202,150,0.5);border-radius:3px;padding:20px 24px;margin:0 0 28px;">'
    + '<tr><td colspan="2" style="padding-bottom:12px;border-bottom:1px solid rgba(225,202,150,0.3);">'
    + '<span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#BD6738;">Your RSVP Details</span></td></tr>'
    + '<tr><td style="padding:10px 0 0;color:#888;font-size:13px;width:140px;">Guest Name</td><td style="padding:10px 0 0;font-size:13px;color:#691B19;font-weight:600;">' + opts.guestName + '</td></tr>'
    + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Attendance</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:' + statusColor + ';">' + statusLabel + '</td></tr>'
    + plusOneRow
    + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Date</td><td style="padding:6px 0;font-size:13px;color:#691B19;">' + CONFIG.weddingDate + '</td></tr>'
    + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Ceremony</td><td style="padding:6px 0;font-size:13px;color:#691B19;">' + CONFIG.ceremonyTime + ' · ' + CONFIG.venue + '</td></tr>'
    + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Reception</td><td style="padding:6px 0;font-size:13px;color:#691B19;">' + CONFIG.receptionTime + ' · ' + CONFIG.venue + '</td></tr>'
    + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Address</td><td style="padding:6px 0;font-size:13px;color:#691B19;">' + CONFIG.address + '</td></tr>'
    + '</table>'

    + calendarBlock

    + '<p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 8px;">Questions? Email us at '
    + '<a href="mailto:' + CONFIG.coupleEmail + '" style="color:#BD6738;text-decoration:none;">' + CONFIG.coupleEmail + '</a></p>'
    + '<p style="font-size:15px;line-height:1.8;color:#555;margin:0;">We look forward to celebrating with you!</p>'
    + '</td></tr>'

    // Footer
    + '<tr><td style="background:#fdf8f5;border-top:1px solid rgba(225,202,150,0.3);padding:24px 48px;text-align:center;">'
    + '<p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#691B19;">' + CONFIG.coupleName + '</p>'
    + '<p style="margin:0;font-size:11px;color:#bbb;letter-spacing:0.14em;text-transform:uppercase;">' + CONFIG.weddingDate + '</p>'
    + '</td></tr>'

    + '</table></td></tr></table></body></html>';
}


// ── buildICS ───────────────────────────────────────────────────
function buildICS() {
  return 'BEGIN:VCALENDAR\n'
    + 'VERSION:2.0\n'
    + 'PRODID:-//' + CONFIG.coupleName + '//EN\n'
    + 'CALSCALE:GREGORIAN\n'
    + 'METHOD:REQUEST\n'
    + 'BEGIN:VEVENT\n'
    + 'UID:nimrod-jirah-wedding-20261107@nimrodandjirah\n'
    + 'DTSTART:' + CONFIG.calStartUTC + '\n'
    + 'DTEND:'   + CONFIG.calEndUTC   + '\n'
    + 'SUMMARY:' + CONFIG.coupleName  + ' Wedding\n'
    + 'DESCRIPTION:You are invited to the wedding of ' + CONFIG.coupleName + '.\\nCeremony: ' + CONFIG.ceremonyTime + '\\nReception: ' + CONFIG.receptionTime + '\\nVenue: ' + CONFIG.venue + '\n'
    + 'LOCATION:' + CONFIG.venue + '\\, ' + CONFIG.address + '\n'
    + 'STATUS:CONFIRMED\n'
    + 'SEQUENCE:0\n'
    + 'BEGIN:VALARM\n'
    + 'TRIGGER:-PT1H\n'
    + 'ACTION:DISPLAY\n'
    + 'DESCRIPTION:Reminder: ' + CONFIG.coupleName + ' Wedding today!\n'
    + 'END:VALARM\n'
    + 'END:VEVENT\n'
    + 'END:VCALENDAR';
}


// ── respond helper ─────────────────────────────────────────────
function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

  ── END OF APPS SCRIPT ────────────────────────────────────────
  ══════════════════════════════════════════════════════════════
*/
