/**
 * ============================================================
 * RSVP SHEET — Google Apps Script  (Script B / RSVP_SCRIPT_URL)
 * ============================================================
 *
 * Keep this script bound to your RSVP responses sheet, in YOUR account.
 * Outgoing email is MASKED to look like it comes from the wedding name/inbox
 * instead of your personal address:
 *
 *     From:  Nimrod & Jirah Wedding <nimrodjirahwedding@gmail.com>
 *
 * The script auto-picks the strongest mask available:
 *  • FULL mask (recommended): in YOUR Gmail → Settings ▸ Accounts and Import
 *    ▸ "Send mail as" ▸ add nimrodjirahwedding@gmail.com and verify it
 *    (a confirmation code is emailed to that inbox). Then guests see ONLY the
 *    wedding address — your personal address is hidden.
 *  • NAME mask (no setup): if that alias isn't added, emails still show the
 *    name "Nimrod & Jirah Wedding", but the address stays your personal Gmail.
 *
 * Deploy: Deploy ▸ Manage deployments ▸ Edit ▸ New version ▸ Deploy
 *   Execute as: Me   ·   Who has access: Anyone
 *
 * Sheet headers (row 1):
 *   ID | Timestamp | Invitee Name | Attendance | First Name | Last Name |
 *   Email | Notes | Advice | Plus One Name | Plus One Attendance
 * ============================================================ */

// ── Config ──────────────────────────────────────────────────
var FROM_NAME    = 'Nimrod & Jirah Wedding';
var FROM_ADDRESS = 'nimrodjirahwedding@gmail.com'; // used only when added as a "Send mail as" alias
var REPLY_TO     = 'nimrodjirahwedding@gmail.com'; // replies go here, not your personal inbox

// Footer appended to guest/plus-one emails (plain-text fallback)
var NO_REPLY_NOTE = '\n\n———\nThis is an automated message — please do not reply to this email.';

// Wedding details used in the email + calendar invite (.ics)
var WEDDING = {
  couple:        'Nimrod & Jirah',
  date:          'November 7, 2026',
  ceremonyTime:  '3:00 PM',
  receptionTime: '4:30 PM',
  venue:         'Grass Garden',
  address:       'Purok 4, P. Reyes Street, Barangay Sipat, Plaridel, Bulacan',
  mapLink:       'https://maps.app.goo.gl/XGPYFFmqYp1hdFQq6',
  calStartUTC:   '20261107T070000Z',   // 3:00 PM PHT (ceremony)
  calEndUTC:     '20261107T113000Z'    // 7:30 PM PHT (end of reception program)
};

// Sends an email masked as the wedding inbox. Uses the verified "Send mail as"
// alias when present (full mask); otherwise sends with the wedding display name.
function sendMail_(to, subject, body, extra) {
  var opts = { name: FROM_NAME, replyTo: REPLY_TO };
  if (extra) for (var k in extra) opts[k] = extra[k];   // htmlBody, attachments, …
  try {
    if (GmailApp.getAliases().indexOf(FROM_ADDRESS) !== -1) opts.from = FROM_ADDRESS;
  } catch (e) { /* getAliases needs the Gmail scope; ignore and use name mask */ }
  GmailApp.sendEmail(to, subject, body, opts);
}

function doGet() {
  var sheet  = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var values = sheet.getDataRange().getValues();
  var records = [];
  if (values.length > 1) {
    var headers = values[0];
    for (var r = 1; r < values.length; r++) {
      var obj = {};
      for (var c = 0; c < headers.length; c++) obj[headers[c]] = values[r][c];
      records.push(obj);
    }
  }
  return json_({ records: records });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);              // serialize so the primary + plus-one
  try {                             // POSTs never race each other
    var sheet   = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data    = JSON.parse(e.postData.contents);
    var nameCol = findColumn_(sheet, 'Invitee Name');

    // ── Cancel: remove this guest (and their plus one) and stop ──
    if (data.action === 'cancel') {
      deleteRowsByInvitee_(sheet, nameCol, data.inviteeName, true);
      return json_({ result: 'cancelled' });
    }

    // ── Submission = upsert: drop only the same-named row, then append ──
    deleteRowsByInvitee_(sheet, nameCol, data.inviteeName, false);

    sheet.appendRow([
      sheet.getLastRow(),            // ID
      new Date(),                    // Timestamp
      data.inviteeName,
      data.attendance,
      data.firstName,
      data.lastName,
      data.email,
      data.notes,
      data.advice,
      data.plusOneName       || '',
      data.plusOneAttendance || ''
    ]);

    // ── Emails ── (wrapped so a mail failure never blocks the RSVP save) ──
    var isPlusOneRow = /^plus one of /i.test(String(data.inviteeName || ''));
    try {
      if (!isPlusOneRow && data.email) sendGuestEmail_(data);   // confirm primary
      if (data.plusOneEmail)           sendPlusOneEmail_(data); // invite plus one
    } catch (mailErr) {
      // Most common cause: the script hasn't been authorized to send mail yet.
      // Run the testEmail() function once in the editor to grant permission.
      console.error('Email failed: ' + mailErr);
    }

    return json_({ result: 'success' });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Run this ONCE from the Apps Script editor (select testEmail ▸ Run) to:
 *   1. trigger the authorization prompt for sending email, and
 *   2. confirm delivery works.
 * ✏️ Put your own address below, run it, then check your inbox/spam.
 */
function testEmail() {
  var to = 'YOUR_EMAIL@example.com';   // ✏️ change to a REAL address (ideally a non-Gmail one to rule out self-filtering)
  sendMail_(to, 'RSVP email test',
    'If you are reading this, the wedding site can send RSVP emails.');
  var masked = GmailApp.getAliases().indexOf(FROM_ADDRESS) !== -1;
  Logger.log('Test email sent to ' + to +
    (masked ? ' — FULL mask active (from ' + FROM_ADDRESS + ').'
            : ' — NAME mask only (alias not added yet).') +
    ' Remaining quota today: ' + MailApp.getRemainingDailyQuota());
}

/* ── helpers ─────────────────────────────────────────────── */

function findColumn_(sheet, header) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if (String(headers[i]).trim() === header) return i + 1;
  }
  return 3; // fallback to column C
}

// includePlusOne=true also removes the "Plus One of <name>" row (used by cancel)
function deleteRowsByInvitee_(sheet, nameCol, inviteeName, includePlusOne) {
  if (!inviteeName) return;
  var target  = norm_(inviteeName);
  var plusKey = includePlusOne ? norm_('Plus One of ' + inviteeName) : null;
  for (var row = sheet.getLastRow(); row >= 2; row--) {   // bottom-up
    var val = norm_(sheet.getRange(row, nameCol).getValue());
    if (val === target || (plusKey && val === plusKey)) sheet.deleteRow(row);
  }
}

function norm_(s) { return String(s == null ? '' : s).trim().toLowerCase(); }

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Confirmation to the primary guest — HTML email + .ics calendar (if attending)
function sendGuestEmail_(data) {
  var attending = String(data.attendance).toLowerCase() === 'attending';
  var subject = attending
    ? "We can't wait to celebrate with you!"
    : "Thank you for letting us know";

  var html = buildEmailHTML_({
    heading:     'RSVP Confirmation',
    firstName:   data.firstName || data.inviteeName,
    guestName:   data.inviteeName || ((data.firstName || '') + ' ' + (data.lastName || '')).trim(),
    isAttending: attending,
    plusOneName: data.plusOneName || ''
  });

  var plain =
    'Hi ' + (data.firstName || data.inviteeName) + ',\n\n' +
    (attending
      ? 'Thank you for your RSVP! We\'re so happy you\'ll be joining us on ' +
        WEDDING.date + ' at ' + WEDDING.venue + ', ' + WEDDING.address + '.'
      : 'Thank you for your RSVP. We\'re sad you can\'t make it, but we truly ' +
        'appreciate you letting us know.') +
    '\n\nWith love,\nNimrod & Jirah' + NO_REPLY_NOTE;

  var extra = { htmlBody: html };
  if (attending) extra.attachments = [icsBlob_()];   // calendar invite
  sendMail_(data.email, subject, plain, extra);
}

// Invitation to the plus one — HTML email + .ics calendar
function sendPlusOneEmail_(data) {
  var subject = "We can't wait to celebrate with you!";

  var html = buildEmailHTML_({
    heading:     'You\'re Invited',
    firstName:   data.plusOneName || 'there',
    guestName:   data.plusOneName || 'Our Guest',
    isAttending: true,                 // an invitation always shows the calendar
    plusOneName: '',
    invitedBy:   data.inviteeName
  });

  var plain =
    'Hi ' + (data.plusOneName || 'there') + ',\n\n' +
    'You have been invited as the guest of ' + data.inviteeName +
    ' to the wedding of Nimrod & Jirah on ' + WEDDING.date + ' at ' +
    WEDDING.venue + ', ' + WEDDING.address + '.\n\n' +
    'We look forward to celebrating with you!\n\nWith love,\nNimrod & Jirah' + NO_REPLY_NOTE;

  sendMail_(data.plusOneEmail, subject, plain, { htmlBody: html, attachments: [icsBlob_()] });
}

/* ── Calendar invite (.ics) ─────────────────────────────────── */
function icsBlob_() {
  return Utilities.newBlob(buildICS_(), 'text/calendar', 'NimrodAndJirahWedding.ics');
}

function buildICS_() {
  return 'BEGIN:VCALENDAR\n'
    + 'VERSION:2.0\n'
    + 'PRODID:-//' + WEDDING.couple + '//EN\n'
    + 'CALSCALE:GREGORIAN\n'
    + 'METHOD:PUBLISH\n'
    + 'BEGIN:VEVENT\n'
    + 'UID:nimrod-jirah-wedding-20261107@nimrodandjirah\n'
    + 'DTSTART:' + WEDDING.calStartUTC + '\n'
    + 'DTEND:'   + WEDDING.calEndUTC   + '\n'
    + 'SUMMARY:' + WEDDING.couple + ' Wedding\n'
    + 'DESCRIPTION:You are invited to the wedding of ' + WEDDING.couple +
      '.\\nCeremony: ' + WEDDING.ceremonyTime + '\\nReception: ' + WEDDING.receptionTime + '\n'
    + 'LOCATION:' + WEDDING.venue + '\\, ' + WEDDING.address + '\n'
    + 'STATUS:CONFIRMED\n'
    + 'SEQUENCE:0\n'
    + 'BEGIN:VALARM\nTRIGGER:-P1D\nACTION:DISPLAY\nDESCRIPTION:'
      + WEDDING.couple + ' Wedding tomorrow!\nEND:VALARM\n'
    + 'END:VEVENT\n'
    + 'END:VCALENDAR';
}

function googleCalLink_() {
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(WEDDING.couple + ' Wedding')
    + '&dates=' + WEDDING.calStartUTC + '/' + WEDDING.calEndUTC
    + '&details=' + encodeURIComponent('Wedding at ' + WEDDING.venue)
    + '&location=' + encodeURIComponent(WEDDING.venue + ', ' + WEDDING.address);
}

/* ── Themed HTML email body ─────────────────────────────────── */
function buildEmailHTML_(o) {
  var statusLabel = o.isAttending ? 'Joyfully Attending' : 'Unable to Attend';
  var statusColor = o.isAttending ? '#556251' : '#BD6738';

  var intro = o.invitedBy
    ? 'You have been invited as the guest of <strong style="color:#691B19;">' + o.invitedBy +
      '</strong> to celebrate the wedding of ' + WEDDING.couple + '.'
    : (o.isAttending
        ? 'We are <strong style="color:#691B19;">so excited</strong> to celebrate with you! ' +
          'Please arrive by <strong>2:30 PM</strong> to be seated before the ceremony at ' + WEDDING.ceremonyTime + '.'
        : 'We completely understand and will miss you dearly. Your kind thoughts mean the world to us.');

  var plusOneRow = o.plusOneName
    ? '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Plus One</td>' +
      '<td style="padding:6px 0;font-size:13px;color:#691B19;font-weight:600;">' + o.plusOneName + '</td></tr>'
    : '';

  var calendarBlock = o.isAttending
    ? '<div style="text-align:center;margin:28px 0;">' +
      '<a href="' + googleCalLink_() + '" style="display:inline-block;background:#691B19;color:#E1CA96;' +
      'text-decoration:none;padding:12px 28px;border-radius:2px;font-size:13px;font-weight:600;' +
      'letter-spacing:0.1em;text-transform:uppercase;">+ Add to Google Calendar</a>' +
      '<div style="font-size:11px;color:#aaa;margin-top:8px;">A calendar invite (.ics) is attached to this email.</div></div>'
    : '';

  return '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9f4ef;font-family:Georgia,serif;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f4ef;padding:40px 20px;"><tr><td align="center">'
    + '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:4px;overflow:hidden;">'
    // Header
    + '<tr><td style="background:#691B19;padding:40px 48px;text-align:center;">'
    + '<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(225,202,150,0.7);">The Wedding of</p>'
    + '<h1 style="margin:0;font-size:38px;font-weight:300;color:#E1CA96;letter-spacing:0.04em;">' + WEDDING.couple + '</h1>'
    + '<p style="margin:12px 0 0;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.55);">' + WEDDING.date + '</p>'
    + '</td></tr><tr><td style="background:#E1CA96;height:3px;"></td></tr>'
    // Body
    + '<tr><td style="padding:40px 48px;">'
    + '<p style="font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#BD6738;margin:0 0 8px;">' + o.heading + '</p>'
    + '<h2 style="font-size:26px;font-weight:400;color:#691B19;margin:0 0 24px;">Dear ' + o.firstName + ',</h2>'
    + '<p style="font-size:15px;line-height:1.8;color:#555;margin:0 0 20px;">' + intro + '</p>'
    // Summary
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f5;border:1px solid rgba(225,202,150,0.5);border-radius:3px;padding:20px 24px;margin:0 0 8px;">'
    + '<tr><td colspan="2" style="padding-bottom:12px;border-bottom:1px solid rgba(225,202,150,0.3);"><span style="font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#BD6738;">Details</span></td></tr>'
    + '<tr><td style="padding:10px 0 0;color:#888;font-size:13px;width:140px;">Guest</td><td style="padding:10px 0 0;font-size:13px;color:#691B19;font-weight:600;">' + o.guestName + '</td></tr>'
    + (o.invitedBy ? '' : '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Attendance</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:' + statusColor + ';">' + statusLabel + '</td></tr>')
    + plusOneRow
    + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Date</td><td style="padding:6px 0;font-size:13px;color:#691B19;">' + WEDDING.date + '</td></tr>'
    + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Ceremony</td><td style="padding:6px 0;font-size:13px;color:#691B19;">' + WEDDING.ceremonyTime + ' · ' + WEDDING.venue + '</td></tr>'
    + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Reception</td><td style="padding:6px 0;font-size:13px;color:#691B19;">' + WEDDING.receptionTime + ' · ' + WEDDING.venue + '</td></tr>'
    + '<tr><td style="padding:6px 0;color:#888;font-size:13px;">Address</td><td style="padding:6px 0;font-size:13px;color:#691B19;">' + WEDDING.address + ' (<a href="' + WEDDING.mapLink + '" style="color:#BD6738;">map</a>)</td></tr>'
    + '</table>'
    + calendarBlock
    + '<p style="font-size:15px;line-height:1.8;color:#555;margin:18px 0 0;">We look forward to celebrating with you!</p>'
    + '</td></tr>'
    // Footer
    + '<tr><td style="background:#fdf8f5;border-top:1px solid rgba(225,202,150,0.3);padding:24px 48px;text-align:center;">'
    + '<p style="margin:0 0 4px;font-size:22px;font-weight:300;color:#691B19;">' + WEDDING.couple + '</p>'
    + '<p style="margin:0 0 10px;font-size:11px;color:#bbb;letter-spacing:0.14em;text-transform:uppercase;">' + WEDDING.date + '</p>'
    + '<p style="margin:0;font-size:11px;color:#c4b08a;">This is an automated message — please do not reply to this email.</p>'
    + '</td></tr>'
    + '</table></td></tr></table></body></html>';
}
