function doGet() {
  const template = HtmlService.createTemplateFromFile('form');
  template.email = Session.getActiveUser().getEmail();
  return template.evaluate()
    .setTitle('Докладна книга')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// TODO
// tickbox za chas predi start_date i end_date
// ako putni pari e ticknato - da se poqvqvat dve poleta start_location i end_location, otnovo s dropdown

// da se editnat +2 dokumenta, za ako ima tova pole za chas i tova za marshrut :(

function submitForm(data) {
  const templateFileId = '1da1-21k1CoW4JeXgRGpNHaARGNSKivj7luyfPn6gA18';
  const folderId = '1Z-2hr-hHY-VeFHXyk7taxqWFSl0NHMhh';

  const folder = DriveApp.getFolderById(folderId);
  const copy = DriveApp.getFileById(templateFileId)
    .makeCopy(`Командировка - ${data.name} - ${new Date().toISOString()}`, folder);

  const doc = DocumentApp.openById(copy.getId());
  const body = doc.getBody();

  // Convert type_money array into a comma-separated string
  const typeMoneyString = Array.isArray(data.type_money) ? data.type_money.join(', ') : data.type_money;

  body.replaceText('{{name}}', data.name);
  body.replaceText('{{city}}', data.city);
  body.replaceText('{{start_date}}', data.start_date);
  body.replaceText('{{end_date}}', data.end_date);
  body.replaceText('{{type_money}}', typeMoneyString);
  body.replaceText('{{biller}}', data.biller);
  body.replaceText('{{email}}', data.email);
  body.replaceText('{{date}}', new Date().toLocaleString());

  doc.saveAndClose();

  copy.addViewer(data.email);

  const pdfBlob = copy.getAs(MimeType.PDF);

  // Email body with optional comment
  let emailBody = 'Вашата командировка е подготвена. Вижте прикачения файл.';
  if (data.comment && data.comment.trim()) {
    emailBody += '\n\n---\nКоментар:\n' + data.comment.trim();
  }

  MailApp.sendEmail({
    to: data.email,
    subject: 'Служебна командировка',
    body: emailBody,
    attachments: [pdfBlob]
  });

  return {
    message: 'Вашата командировка е записана и изпратена по имейл!',
    fileUrl: copy.getUrl()
  };
}
