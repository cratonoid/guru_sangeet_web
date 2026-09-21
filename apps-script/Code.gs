/**
 * Shree Guru Sangeet Vidyalaya — website lead form.
 * Saves each submission as a row in this spreadsheet.
 * Setup steps are in README.md.
 */

var SHEET  = 'Leads';
var NOTIFY = 'ainallimath@gmail.com';   // '' to switch off email alerts

var HEADERS = ['Date & Time', 'Student Name', 'Email', 'Mobile Number', 'Course',
               'Course Type', 'Language Learnt', 'Previous Experience', 'Submitted From'];

// Must match the name="..." attributes on the form inputs, in HEADERS order.
var FIELDS = ['name', 'email', 'mobile', 'course', 'certification', 'language', 'experience', 'source'];


function doPost(e) {
  var p = e.parameter;

  if (p.website) return reply('success');            // hidden field: only bots fill it in
  if (!p.name || !p.mobile) return reply('error', 'Name and mobile number are required.');

  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET) || book.insertSheet(SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  var row = [new Date()].concat(FIELDS.map(function (f) { return p[f] || ''; }));
  sheet.appendRow(row);

  if (NOTIFY) notify(row);
  return reply('success');
}


/** Opening the /exec URL in a browser shows this — confirms the deployment is live. */
function doGet() {
  return reply('success', 'Lead endpoint is running.');
}


function reply(result, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ result: result, message: message || '' }))
    .setMimeType(ContentService.MimeType.JSON);
}


function notify(row) {
  var body = HEADERS.map(function (h, i) { return h + ': ' + row[i]; }).join('\n');
  var options = { name: 'Shree Guru Sangeet Vidyalaya — Website' };
  if (row[2]) options.replyTo = row[2];              // reply goes straight to the student
  MailApp.sendEmail(NOTIFY, 'New course enquiry — ' + row[1], body, options);
}


/** Run this once from the editor: approves permissions and writes a test row. */
function testSubmission() {
  Logger.log(doPost({ parameter: {
    name: 'Test Student', email: 'test@example.com', mobile: '9110490540',
    course: 'Hindustani Vocal', certification: 'With Certification',
    language: 'Kannada', experience: 'Beginner', source: 'Manual test'
  }}).getContent());
}
