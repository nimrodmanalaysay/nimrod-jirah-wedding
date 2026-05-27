/* ============================================================
   emailTemplates.js
   Generates the HTML email body and .ics calendar content
   used by the Google Apps Script doPost to send confirmations.

   These functions run IN the Apps Script, not in the browser.
   Copy the exported strings into your Apps Script doPost.

   Why here?
   • Keeps the template source-of-truth in the repo
   • Easy to edit and copy-paste into Apps Script
   • Version-controlled alongside the rest of the site
   ============================================================ */

// ── Wedding constants — update these to match real details ──
export const WEDDING = {
  coupleName:   'Nimrod & Jirah',
  date:         'November 7, 2026',
  dateISO:      '20261107',           // YYYYMMDD for .ics
  timeStart:    'T070000Z',           // 3:00 PM PHT = 07:00 UTC
  timeEnd:      'T140000Z',           // 10:00 PM PHT = 14:00 UTC
  ceremonyTime: '3:00 PM',
  receptionTime:'4:00 PM',
  venue:        'Grass Garden',
  address:      '123 Garden Lane, City, Province 0000',
  coupleEmail:  'nimrodandjirah@email.com', // reply-to
}

/* ── HTML Email Template ──────────────────────────────────────
   Pure function — takes guest data, returns HTML string.
   Inline styles required for email client compatibility.
   ----------------------------------------------------------- */
export function buildConfirmationEmail({
  guestName,
  firstName,
  attendance,
  plusOneName = '',
}) {
  const isAttending  = attendance === 'attending'
  const statusLabel  = isAttending ? 'Joyfully Attending 🥂' : 'Unable to Attend 💌'
  const statusColor  = isAttending ? '#556251' : '#BD6738'

  const plusOneBlock = plusOneName
    ? `<tr>
        <td style="padding:6px 0;color:#888;font-size:13px;">Plus One</td>
        <td style="padding:6px 0;font-size:13px;color:#691B19;font-weight:600;">${plusOneName}</td>
       </tr>`
    : ''

  const attendingMessage = isAttending
    ? `<p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 20px;">
         We are <strong style="color:#691B19;">so excited</strong> to celebrate with you!
         Please arrive by <strong>2:45 PM</strong> so you can be seated before
         the ceremony begins at ${WEDDING.ceremonyTime}.
       </p>`
    : `<p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 20px;">
         We completely understand and will miss you dearly.
         Your kind thoughts and well wishes mean the world to us. 💛
       </p>`

  const calendarBlock = isAttending
    ? `<div style="text-align:center;margin:28px 0;">
         <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Nimrod+%26+Jirah+Wedding&dates=${WEDDING.dateISO}${WEDDING.timeStart}/${WEDDING.dateISO}${WEDDING.timeEnd}&details=Wedding+Ceremony+at+${encodeURIComponent(WEDDING.venue)}&location=${encodeURIComponent(WEDDING.address)}"
            style="display:inline-block;background:#691B19;color:#E1CA96;text-decoration:none;
                   padding:12px 28px;border-radius:2px;font-size:13px;font-weight:600;
                   letter-spacing:0.1em;text-transform:uppercase;">
           + Add to Google Calendar
         </a>
       </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>RSVP Confirmation — ${WEDDING.coupleName}</title>
</head>
<body style="margin:0;padding:0;background:#f9f4ef;font-family:'Georgia',serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f4ef;padding:40px 20px;">
    <tr><td align="center">

      <!-- Card -->
      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;background:#ffffff;border-radius:4px;
                    box-shadow:0 4px 24px rgba(105,27,25,0.08);overflow:hidden;">

        <!-- Header banner -->
        <tr>
          <td style="background:#691B19;padding:40px 48px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.3em;
                      text-transform:uppercase;color:rgba(225,202,150,0.7);">
              The Wedding of
            </p>
            <h1 style="margin:0;font-size:38px;font-weight:300;color:#E1CA96;
                       letter-spacing:0.04em;line-height:1.2;">
              ${WEDDING.coupleName}
            </h1>
            <p style="margin:12px 0 0;font-size:12px;letter-spacing:0.22em;
                      text-transform:uppercase;color:rgba(255,255,255,0.55);">
              ${WEDDING.date}
            </p>
          </td>
        </tr>

        <!-- Gold divider line -->
        <tr>
          <td style="background:#E1CA96;height:3px;"></td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 48px;">

            <!-- Greeting -->
            <p style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;
                      color:#BD6738;margin:0 0 8px;">
              RSVP Confirmation
            </p>
            <h2 style="font-size:26px;font-weight:400;color:#691B19;margin:0 0 24px;
                       line-height:1.3;">
              Dear ${firstName || guestName},
            </h2>

            <p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 20px;">
              Thank you for confirming your attendance for our wedding celebration.
              We are thrilled to share this special day with you.
            </p>

            ${attendingMessage}

            <!-- RSVP Summary box -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#fdf8f5;border:1px solid rgba(225,202,150,0.5);
                          border-radius:3px;padding:20px 24px;margin:0 0 28px;">
              <tr>
                <td colspan="2" style="padding-bottom:12px;border-bottom:1px solid rgba(225,202,150,0.3);
                                        margin-bottom:12px;">
                  <span style="font-size:11px;font-weight:700;letter-spacing:0.2em;
                               text-transform:uppercase;color:#BD6738;">
                    Your RSVP Details
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0 0;color:#888;font-size:13px;width:140px;">Guest Name</td>
                <td style="padding:10px 0 0;font-size:13px;color:#691B19;font-weight:600;">${guestName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#888;font-size:13px;">Attendance</td>
                <td style="padding:6px 0;font-size:13px;font-weight:600;color:${statusColor};">${statusLabel}</td>
              </tr>
              ${plusOneBlock}
              <tr>
                <td style="padding:6px 0;color:#888;font-size:13px;">Date</td>
                <td style="padding:6px 0;font-size:13px;color:#691B19;">${WEDDING.date}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#888;font-size:13px;">Ceremony</td>
                <td style="padding:6px 0;font-size:13px;color:#691B19;">${WEDDING.ceremonyTime} · ${WEDDING.venue}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#888;font-size:13px;">Reception</td>
                <td style="padding:6px 0;font-size:13px;color:#691B19;">${WEDDING.receptionTime} · ${WEDDING.venue}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#888;font-size:13px;">Address</td>
                <td style="padding:6px 0;font-size:13px;color:#691B19;">${WEDDING.address}</td>
              </tr>
            </table>

            <!-- Calendar CTA (attending only) -->
            ${calendarBlock}

            <!-- Closing message -->
            <p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 8px;">
              If you have any questions, feel free to reach out to us at
              <a href="mailto:${WEDDING.coupleEmail}"
                 style="color:#BD6738;text-decoration:none;">${WEDDING.coupleEmail}</a>.
            </p>
            <p style="font-size:15px;line-height:1.8;color:#555;margin:0;">
              We look forward to celebrating with you!
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fdf8f5;border-top:1px solid rgba(225,202,150,0.3);
                     padding:24px 48px;text-align:center;">
            <p style="margin:0 0 4px;font-family:'Georgia',serif;font-size:22px;
                      font-weight:300;color:#E1CA96;letter-spacing:0.06em;">
              <!-- Intentionally same color as bg for elegant fade -->
              <span style="color:#691B19;">${WEDDING.coupleName}</span>
            </p>
            <p style="margin:0;font-size:11px;color:#bbb;letter-spacing:0.14em;
                      text-transform:uppercase;">
              ${WEDDING.date}
            </p>
          </td>
        </tr>

      </table>
      <!-- /Card -->

    </td></tr>
  </table>

</body>
</html>`
}

/* ── .ics Calendar Attachment ────────────────────────────────
   Generates an iCalendar string guests can save to any calendar.
   ----------------------------------------------------------- */
export function buildICSCalendar() {
  // Generate a stable UID based on couple name + date
  const uid = `nimrod-jirah-wedding-${WEDDING.dateISO}@nimrodandjirah`

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nimrod & Jirah Wedding//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTART:${WEDDING.dateISO}${WEDDING.timeStart}
DTEND:${WEDDING.dateISO}${WEDDING.timeEnd}
SUMMARY:${WEDDING.coupleName} Wedding
DESCRIPTION:You are cordially invited to the wedding of ${WEDDING.coupleName}.\\nCeremony: ${WEDDING.ceremonyTime}\\nReception: ${WEDDING.receptionTime}\\nVenue: ${WEDDING.venue}\\nAddress: ${WEDDING.address}
LOCATION:${WEDDING.venue}\\, ${WEDDING.address}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${WEDDING.coupleName} Wedding today!
END:VALARM
END:VEVENT
END:VCALENDAR`
}

/* ── Apps Script doPost — COPY THIS INTO YOUR APPS SCRIPT ────
   This replaces your existing doPost function entirely.
   It saves the RSVP row AND sends the confirmation email.

   SETUP STEPS:
   1. Open your RSVP spreadsheet
   2. Extensions → Apps Script
   3. Replace your existing doPost with the code below
   4. Save and redeploy as a new version of the Web App

   ⚠️  The GmailApp.sendEmail() call uses the Google account
       that owns the Apps Script — no extra OAuth needed.
       Make sure that account can send Gmail.

   ─────────────────────────────────────────────────────────
   PASTE INTO APPS SCRIPT:

function doGet(e) {
  var sheet    = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow  = sheet.getLastRow();
  if (lastRow < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({ names: [], invitees: [], records: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  var invData  = sheet.getRange(2, 2, lastRow - 1, 2).getValues();
  var names    = [], invitees = [];
  invData.forEach(function(row) {
    var name = row[0], extra = row[1];
    if (name) { names.push(name); invitees.push({ name: name, additionalInvitee: extra }); }
  });
  return ContentService
    .createTextOutput(JSON.stringify({ names: names, invitees: invitees }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet  = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data   = JSON.parse(e.postData.contents);
  var newId  = sheet.getLastRow();

  // ── Save RSVP row ──
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

  // ── Send confirmation email (primary invitee only, not plus one rows) ──
  var email = data.email || '';
  var isPlusOneRow = (data.inviteeName || '').indexOf('Plus One of') === 0;

  if (email && !isPlusOneRow) {
    try {
      var guestName  = data.inviteeName || (data.firstName + ' ' + data.lastName);
      var firstName  = data.firstName   || guestName;
      var isAttending = data.attendance === 'attending';
      var plusOneName = data.plusOneName || '';

      var subject = 'RSVP Confirmed — Nimrod & Jirah Wedding 💌';

      // ── HTML body (mirrors buildConfirmationEmail in emailTemplates.js) ──
      var statusLabel = isAttending ? 'Joyfully Attending 🥂' : 'Unable to Attend 💌';
      var statusColor = isAttending ? '#556251' : '#BD6738';
      var plusOneBlock = plusOneName
        ? '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Plus One</td><td style="padding:6px 0;font-size:13px;color:#691B19;font-weight:600;">' + plusOneName + '</td></tr>'
        : '';
      var attendingMsg = isAttending
        ? '<p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 20px;">We are <strong style="color:#691B19;">so excited</strong> to celebrate with you! Please arrive by <strong>2:45 PM</strong> so you can be seated before the ceremony begins at 3:00 PM.</p>'
        : '<p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 20px;">We completely understand and will miss you dearly. Your kind thoughts mean the world to us. 💛</p>';
      var calendarLink = isAttending
        ? '<div style="text-align:center;margin:28px 0;"><a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Nimrod+%26+Jirah+Wedding&dates=20261107T070000Z/20261107T140000Z&details=Wedding+at+Grass+Garden&location=123+Garden+Lane" style="display:inline-block;background:#691B19;color:#E1CA96;text-decoration:none;padding:12px 28px;border-radius:2px;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">+ Add to Google Calendar</a></div>'
        : '';

      var htmlBody = '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9f4ef;font-family:Georgia,serif;">'
        + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f4ef;padding:40px 20px;"><tr><td align="center">'
        + '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:4px;box-shadow:0 4px 24px rgba(105,27,25,0.08);overflow:hidden;">'
        + '<tr><td style="background:#691B19;padding:40px 48px;text-align:center;">'
        + '<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(225,202,150,0.7);">The Wedding of</p>'
        + '<h1 style="margin:0;font-size:38px;font-weight:300;color:#E1CA96;letter-spacing:0.04em;">Nimrod &amp; Jirah</h1>'
        + '<p style="margin:12px 0 0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.55);">November 7, 2026</p>'
        + '</td></tr>'
        + '<tr><td style="background:#E1CA96;height:3px;"></td></tr>'
        + '<tr><td style="padding:40px 48px;">'
        + '<p style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#BD6738;margin:0 0 8px;">RSVP Confirmation</p>'
        + '<h2 style="font-size:26px;font-weight:400;color:#691B19;margin:0 0 24px;">Dear ' + firstName + ',</h2>'
        + '<p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 20px;">Thank you for confirming your RSVP for our wedding celebration.</p>'
        + attendingMsg
        + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f5;border:1px solid rgba(225,202,150,0.5);border-radius:3px;padding:20px 24px;margin:0 0 28px;">'
        + '<tr><td colspan="2" style="padding-bottom:12px;border-bottom:1px solid rgba(225,202,150,0.3);"><span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#BD6738;">Your RSVP Details</span></td></tr>'
        + '<tr><td style="padding:10px 0 0;color:#888;font-size:13px;width:140px;">Guest Name</td><td style="padding:10px 0 0;font-size:13px;color:#691B19;font-weight:600;">' + guestName + '</td></tr>'
        + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Attendance</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:' + statusColor + ';">' + statusLabel + '</td></tr>'
        + plusOneBlock
        + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Date</td><td style="padding:6px 0;font-size:13px;color:#691B19;">November 7, 2026</td></tr>'
        + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Ceremony</td><td style="padding:6px 0;font-size:13px;color:#691B19;">3:00 PM · Grass Garden</td></tr>'
        + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Reception</td><td style="padding:6px 0;font-size:13px;color:#691B19;">4:00 PM · Grass Garden</td></tr>'
        + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Address</td><td style="padding:6px 0;font-size:13px;color:#691B19;">123 Garden Lane, City, Province 0000</td></tr>'
        + '</table>'
        + calendarLink
        + '<p style="font-size:15px;line-height:1.8;color:#555;margin:0;">We look forward to celebrating with you!</p>'
        + '</td></tr>'
        + '<tr><td style="background:#fdf8f5;border-top:1px solid rgba(225,202,150,0.3);padding:24px 48px;text-align:center;">'
        + '<p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#691B19;">Nimrod &amp; Jirah</p>'
        + '<p style="margin:0;font-size:11px;color:#bbb;letter-spacing:0.14em;text-transform:uppercase;">November 7, 2026</p>'
        + '</td></tr>'
        + '</table></td></tr></table></body></html>';

      // ── .ics calendar attachment ──
      var icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Nimrod & Jirah Wedding//EN\nCALSCALE:GREGORIAN\nMETHOD:REQUEST\nBEGIN:VEVENT\nUID:nimrod-jirah-wedding-20261107@nimrodandjirah\nDTSTART:20261107T070000Z\nDTEND:20261107T140000Z\nSUMMARY:Nimrod & Jirah Wedding\nDESCRIPTION:You are invited to the wedding of Nimrod & Jirah.\\nCeremony: 3:00 PM\\nReception: 4:00 PM\\nVenue: Grass Garden\nLOCATION:Grass Garden\\, 123 Garden Lane\\, City\\, Province 0000\nSTATUS:CONFIRMED\nSEQUENCE:0\nBEGIN:VALARM\nTRIGGER:-PT1H\nACTION:DISPLAY\nDESCRIPTION:Reminder: Nimrod & Jirah Wedding today!\nEND:VALARM\nEND:VEVENT\nEND:VCALENDAR";

      var blob = Utilities.newBlob(icsContent, 'text/calendar', 'NimrodAndJirahWedding.ics');

      GmailApp.sendEmail(email, subject, '', {
        htmlBody:    htmlBody,
        attachments: [blob],
        replyTo:     'nimrodandjirah@email.com',
        name:        'Nimrod & Jirah Wedding'
      });

    } catch(err) {
      // Email failed — RSVP row is already saved, so we log and continue
      Logger.log('Email send failed for ' + email + ': ' + err.toString());
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

   ─────────────────────────────────────────────────────────
   ============================================================ */
