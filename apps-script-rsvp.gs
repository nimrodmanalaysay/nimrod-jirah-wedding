/**
 * ============================================================
 * RSVP SHEET — Google Apps Script  (Script B / RSVP_SCRIPT_URL)
 * ============================================================
 *
 * Paste this into the Apps Script bound to your RSVP RESPONSES sheet
 * (the one whose /exec URL is RSVP_SCRIPT_URL in src/pages/rsvp/constants.js),
 * then: Deploy ▸ Manage deployments ▸ Edit ▸ New version ▸ Deploy.
 *  - Execute as: Me
 *  - Who has access: Anyone
 *
 * Sheet headers (row 1), in this exact order:
 *   ID | Timestamp | Invitee Name | Attendance | First Name | Last Name |
 *   Email | Notes | Advice | Plus One Name | Plus One Attendance
 *
 * What it does:
 *  • doGet()                          → { records: [...] }  (duplicate check)
 *  • doPost(submission)               → UPSERT the row (replaces any existing
 *                                       row with the same Invitee Name),
 *                                       emails the guest, and emails the plus
 *                                       one an invitation when plusOneEmail is set
 *  • doPost({ action:'cancel', ... }) → deletes the guest's row + their
 *                                       "Plus One of <name>" row
 * ============================================================ */

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

    // ── Emails ──
    var isPlusOneRow = /^plus one of /i.test(String(data.inviteeName || ''));
    if (!isPlusOneRow && data.email) sendGuestEmail_(data);   // confirm primary
    if (data.plusOneEmail)           sendPlusOneEmail_(data); // invite plus one

    return json_({ result: 'success' });
  } finally {
    lock.releaseLock();
  }
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
    '\n\nWith love,\nNimrod & Jirah';
  MailApp.sendEmail(data.email, subject, body);
}

function sendPlusOneEmail_(data) {
  var subject = "You're invited — Nimrod & Jirah's Wedding 💌";
  var body =
    'Hi ' + (data.plusOneName || 'there') + ',\n\n' +
    'You have been invited as the guest of ' + data.inviteeName +
    ' to the wedding of Nimrod & Jirah on November 7, 2026 at Grass Garden, ' +
    'Purok 4, P. Reyes Street, Barangay Sipat, Plaridel, Bulacan.\n\n' +
    'We look forward to celebrating with you!\n\nWith love,\nNimrod & Jirah';
  MailApp.sendEmail(data.plusOneEmail, subject, body);
}
