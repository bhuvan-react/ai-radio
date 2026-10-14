/**
 * SV Radio — the access list, kept in a Google Sheet.
 *
 * Paste this into the sheet's Extensions > Apps Script, then deploy it as a
 * Web app. It answers one question: may this person in?
 *
 * The sheet is the whole admin interface. A row appears the first time someone
 * signs in, and they stay pending until a human types Yes in the approved
 * column. Nothing else grants access.
 *
 * Only the site's own server calls this, never a browser, so the URL stays out
 * of the page and the shared secret stays out of everyone's reach. That also
 * means CORS never comes into it.
 *
 * Expected columns, with these headers in row 1:
 *
 *   timestamp | email | name | approved | notes
 */

/** Anything in this list counts as a yes, so the column is forgiving to type. */
var APPROVED_VALUES = ['yes', 'y', 'true', 'approved', '1'];

function readSecret_() {
  return PropertiesService.getScriptProperties().getProperty('SHARED_SECRET') || '';
}

/** The tab holding the list. Named rather than positional, so adding another
 *  tab later cannot quietly redirect writes into the wrong one. */
var SHEET_NAME = 'userinfo';

/**
 * Open the spreadsheet by id, not by "active".
 *
 * A web app has no active spreadsheet of its own: getActiveSpreadsheet()
 * returns null inside doPost and every call on it then fails. Opening by id
 * works whether the script is bound to the sheet or standalone.
 *
 * The id is the long string in the sheet's own URL, between /d/ and /edit.
 */
/**
 * The id, from a property that may hold either the id or the whole URL.
 *
 * Copying the address bar is the obvious thing to do, and openById rejects a
 * URL with "Illegal spreadsheet id or key". Pulling the id out of whatever was
 * pasted is one line and saves the next person the same hour.
 */
function sheetId_() {
  var raw = String(PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '').trim();
  if (!raw) return '';
  var inUrl = raw.match(/\/d\/([A-Za-z0-9_-]+)/);
  return inUrl ? inUrl[1] : raw;
}

function book_() {
  var id = sheetId_();
  if (id) return SpreadsheetApp.openById(id);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) throw new Error('Set a SHEET_ID script property');
  return active;
}

function sheet_() {
  var book = book_();
  return book.getSheetByName(SHEET_NAME) || book.getSheets()[0];
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Find the row for an email, or null. Row numbers are 1-based, header is 1. */
function findRow_(sheet, email) {
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][1] || '').trim().toLowerCase() === email) {
      return { row: i + 1, approved: String(values[i][3] || '').trim().toLowerCase() };
    }
  }
  return null;
}

function doPost(e) {
  var secret = readSecret_();
  if (!secret) {
    return json_({ status: 'error', reason: 'SHARED_SECRET not configured' });
  }

  var body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ status: 'error', reason: 'bad request' });
  }

  if (body.secret !== secret) {
    return json_({ status: 'error', reason: 'forbidden' });
  }

  var email = String(body.email || '').trim().toLowerCase();
  if (!email) {
    return json_({ status: 'error', reason: 'no email' });
  }

  // One writer at a time. Two people signing in at the same moment would
  // otherwise read the same last row and both append over each other.
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var sheet = sheet_();
    var existing = findRow_(sheet, email);

    if (existing) {
      var ok = APPROVED_VALUES.indexOf(existing.approved) !== -1;
      return json_({ status: ok ? 'approved' : 'pending' });
    }

    sheet.appendRow([new Date(), email, String(body.name || ''), '', '']);
    return json_({ status: 'pending', created: true });
  } finally {
    lock.releaseLock();
  }
}

/** A plain GET is only ever a human checking the deployment is alive. */
function doGet() {
  return json_({ status: 'ok', note: 'SV Radio access list. POST only.' });
}
