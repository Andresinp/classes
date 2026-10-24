/**
 * Clases — Google Sheet sync
 *
 * Setup (once):
 * 1. Create a Google Sheet → Extensions → Apps Script → paste this file → Save.
 * 2. Deploy → New deployment → type "Web app"
 *      Execute as: Me    ·    Who has access: Anyone
 * 3. Copy the web app URL (ends in /exec) and paste it into the app under "Google Sheet".
 *
 * The app keeps its data in the hidden "_data" tab and writes two readable tabs:
 * "Classes" (one row per class) and "Summary" (one row per student).
 * Edit in the app, not in the sheet — the readable tabs are rewritten on every save.
 */

function doGet() {
  return json_(readState_() || {});
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const state = JSON.parse(e.postData.contents);
    writeState_(e.postData.contents);
    writeReadable_(state);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

/* ---- storage: JSON split into 40k-character chunks down column A of "_data" ---- */
function sheet_(name) {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function readState_() {
  const sh = sheet_('_data');
  const last = sh.getLastRow();
  if (!last) return null;
  const text = sh.getRange(1, 1, last, 1).getValues().map(r => r[0]).join('');
  return text ? JSON.parse(text) : null;
}

function writeState_(text) {
  const sh = sheet_('_data');
  sh.clear();
  const chunks = [];
  for (let i = 0; i < text.length; i += 40000) chunks.push([text.slice(i, i + 40000)]);
  sh.getRange(1, 1, chunks.length, 1).setNumberFormat('@').setValues(chunks);
  sh.hideSheet();
}

/* ---- readable tabs ---- */
function writeReadable_(state) {
  const rows = [['Student', 'Date', 'Paid']];
  const summary = [['Student', 'Classes', 'Unpaid', 'Prepaid left']];

  state.students.forEach(s => {
    const sorted = s.classes.slice().sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach(c => rows.push([s.name, c.date, c.paid ? (c.pre ? 'prepaid' : 'yes') : 'no']));
    summary.push([s.name, s.classes.length, s.classes.filter(c => !c.paid).length, s.credit || 0]);
  });

  [['Classes', rows], ['Summary', summary]].forEach(([name, data]) => {
    const sh = sheet_(name);
    sh.clear();
    sh.getRange(1, 1, data.length, data[0].length).setValues(data);
    sh.getRange(1, 1, 1, data[0].length).setFontWeight('bold');
    sh.setFrozenRows(1);
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
