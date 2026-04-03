// ============================================
// TOYTECH — Google Apps Script
// Скопируй этот код в Apps Script твоей таблицы
// Extensions → Apps Script → вставь → Deploy
// ============================================

const SHEET_NAME = 'ToyTech';

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange('A1:B1').setValues([['key', 'value']]);
    sheet.getRange('A1:B1').setFontWeight('bold');
  }
  return sheet;
}

// READ — возвращает все данные как JSON
function doGet(e) {
  try {
    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    const data = {};
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]) {
        try { data[rows[i][0]] = JSON.parse(rows[i][1]); }
        catch (_) { data[rows[i][0]] = rows[i][1]; }
      }
    }
    return response(data);
  } catch(e) {
    return response({ error: e.message });
  }
}

// WRITE — сохраняет данные по ключу
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const key = body.key;
    const value = JSON.stringify(body.value);
    const sheet = getSheet();
    const rows = sheet.getDataRange().getValues();
    let found = false;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        found = true;
        break;
      }
    }
    if (!found) sheet.appendRow([key, value]);
    return response({ success: true, key });
  } catch(e) {
    return response({ error: e.message });
  }
}

function response(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
