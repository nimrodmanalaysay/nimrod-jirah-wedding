/**
 * ============================================================
 * RSVP SHEET — Google Apps Script  (Script B / RSVP_SCRIPT_URL)
 * ============================================================
 *
 * Keep this script bound to your RSVP responses sheet, in YOUR account.
 * Outgoing email is MASKED to look like it comes from the wedding name/inbox
 * instead of your personal address:
 *
 *     From:  Nimrod & Jirah Wedding <nimrodandjirahwedding@gmail.com>
 *
 * The script auto-picks the strongest mask available:
 *  • FULL mask (recommended): in YOUR Gmail → Settings ▸ Accounts and Import
 *    ▸ "Send mail as" ▸ add nimrodandjirahwedding@gmail.com and verify it
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
var FROM_ADDRESS = 'nimrodandjirahwedding@gmail.com'; // used only when added as a "Send mail as" alias
var REPLY_TO     = 'nimrodandjirahwedding@gmail.com'; // replies go here, not your personal inbox

// Footer appended to guest/plus-one emails
var NO_REPLY_NOTE = '\n\n———\nThis is an automated message — please do not reply to this email.';

// Sends an email masked as the wedding inbox. Uses the verified "Send mail as"
// alias when present (full mask); otherwise sends with the wedding display name.
function sendMail_(to, subject, body) {
  var opts = { name: FROM_NAME, replyTo: REPLY_TO };
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
  sendMail_(to, 'RSVP email test ✅',
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

function sendGuestEmail_(data) {
  var attending = String(data.attendance).toLowerCase() === 'attending';
  var subject = attending
    ? "We can't wait to celebrate with you! 🥂"
    : "Thank you for letting us know 💛";
  var body =
    'Hi ' + (data.firstName || data.inviteeName) + ',\n\n' +
    (attending
      ? "Thank you for your RSVP! We're so happy you'll be joining us on " +
        "November 7, 2026 at Grass Garden, Plaridel, Bulacan."
      : "Thank you for your RSVP. We're sad you can't make it, but we truly " +
        "appreciate you letting us know.") +
    '\n\nWith love,\nNimrod & Jirah' + NO_REPLY_NOTE;
  sendMail_(data.email, subject, body);
}

function sendPlusOneEmail_(data) {
  var subject = "You're invited — Nimrod & Jirah's Wedding 💌";
  var body =
    'Hi ' + (data.plusOneName || 'there') + ',\n\n' +
    'You have been invited as the guest of ' + data.inviteeName +
    ' to the wedding of Nimrod & Jirah on November 7, 2026 at Grass Garden, ' +
    'Purok 4, P. Reyes Street, Barangay Sipat, Plaridel, Bulacan.\n\n' +
    'We look forward to celebrating with you!\n\nWith love,\nNimrod & Jirah' + NO_REPLY_NOTE;
  sendMail_(data.plusOneEmail, subject, body);
}
