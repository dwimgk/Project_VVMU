function doGet() {
  const template = HtmlService.createTemplateFromFile('form');
  template.email = Session.getActiveUser().getEmail(); // Inject user email
  return template.evaluate()
    .setTitle('Докладна книга')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function submitForm(data) {
  const templateFileId = '1AAwBIUJsJ9-XpBtQXKW0sTueSmtbEhFLVd_R3DhIn_0'; // Replace with your template file ID
  const folderId = '1Z-2hr-hHY-VeFHxYkTazqWfSl0ENHMhH'; // Replace with your folder ID

  // Make a copy of the template in the target folder
  const folder = DriveApp.getFolderById(folderId);
  const copy = DriveApp.getFileById(templateFileId)
    .makeCopy(`Feedback - ${data.name} - ${new Date().toISOString()}`, folder);

  // Open the copied document and replace placeholders
  const doc = DocumentApp.openById(copy.getId());
  const body = doc.getBody();
  body.replaceText('{{name}}', data.name);
  body.replaceText('{{email}}', data.email);
  body.replaceText('{{feedback}}', data.feedback);
  body.replaceText('{{date}}', new Date().toLocaleString());
  doc.saveAndClose();

  // Share with the user
  copy.addViewer(data.email);

  // Convert to PDF and send via email
  const pdfBlob = copy.getAs(MimeType.PDF);
  MailApp.sendEmail({
    to: data.email,
    subject: 'Your Feedback Confirmation',
    body: 'Thank you for your feedback! Please find your submission attached as a PDF.',
    attachments: [pdfBlob]
  });

  return {
    message: 'Your response has been recorded and a PDF has been emailed to you!',
    fileUrl: copy.getUrl()
  };
}
