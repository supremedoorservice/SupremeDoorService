/**
 * Supreme Garage Door — website request handler
 * Receives requests from the website's Contact form and emails them to
 * supremedoorservice@gmail.com (sent from your own Gmail account).
 *
 * Setup: paste this into a new Google Apps Script project, then
 * Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone.
 */
const TO_EMAIL = 'supremedoorservice@gmail.com';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d._honey) return json_({ success: true }); // spam bot

    const rows = [
      ['Request type', d.type],
      ['Name', d.name],
      ['Phone', d.phone],
      ['Email', d.email],
      ['City', d.city],
      ['Service', d.service],
      ['Competitor company', d.otherCo],
      ['Competitor price', d.otherPrice ? '$' + d.otherPrice : ''],
      ['Message', d.message],
    ].filter(r => r[1]);

    const html =
      '<h2 style="font-family:Arial">New website request</h2>' +
      '<table cellpadding="8" style="border-collapse:collapse;font-family:Arial;font-size:14px">' +
      rows.map(r =>
        '<tr><th align="left" style="background:#f4f2ee;border:1px solid #ddd">' + esc_(r[0]) +
        '</th><td style="border:1px solid #ddd">' + esc_(r[1]).replace(/\n/g, '<br>') + '</td></tr>'
      ).join('') +
      '</table>';

    const msg = {
      to: TO_EMAIL,
      subject: (d.type || 'Request') + ' — ' + (d.name || 'Website customer') + (d.city ? ' (' + d.city + ')' : ''),
      htmlBody: html,
      name: 'Supreme Garage Door Website',
    };
    if (d.email) msg.replyTo = d.email;
    if (d.file && d.file.data) {
      msg.attachments = [Utilities.newBlob(
        Utilities.base64Decode(d.file.data),
        d.file.type || 'application/octet-stream',
        d.file.name || 'quote'
      )];
    }
    MailApp.sendEmail(msg);
    return json_({ success: true });
  } catch (err) {
    return json_({ success: false, message: String(err) });
  }
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function esc_(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Run this once from the editor to grant email permission and send yourself a test.
function testSend() {
  doPost({ postData: { contents: JSON.stringify({
    type: 'Test', name: 'Website test', phone: '408-461-1483', message: 'If you got this, the form is set up correctly.'
  }) } });
}
