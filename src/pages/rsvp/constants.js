// ✏️ Both are Apps Script web-app URLs. A "New deployment" mints a NEW id and
//    these must be updated; "Manage deployments ▸ Edit ▸ New version" keeps the
//    id, so the URL stays valid. Always keep the trailing /exec.
export const INVITEE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4krEOAYvMChZ5m9Eak9bg5u7oInMJ15QuZTOlekmAtv6CEpk324tTwjY8tWPZRBgb/exec'
export const RSVP_SCRIPT_URL    = 'https://script.google.com/macros/s/AKfycbyccOZzGz0laWubj3eHIhuKnMtBcxWwDGIRJy_nVa-YmdPPrscKUmtHnenXZrG0LVvp/exec'

export const INITIAL_FORM = {
  attendance: '',
  firstName:  '',
  lastName:   '',
  email:      '',
  notes:      '',
  advice:     '',
}

export const INITIAL_PLUS_ONE = {
  bringing:   '',      // 'yes' | 'no' | ''
  fullName:   '',
  attendance: '',
  email:      '',
}
