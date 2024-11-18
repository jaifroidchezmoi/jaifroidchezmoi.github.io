const sheetName = 'data'
const scriptProp = PropertiesService.getScriptProperties()

function encrypt(text, key) {
  //Transform to string case text is a number
  text = text.toString(16)
  encryptedMessage = CryptoJS['Rabbit'].encrypt(text, key).toString()
  return encryptedMessage
}

function decrypt(text, key) {
  //Transform to string case text is a number
  text = text.toString(16)
  dencryptedMessage = CryptoJS['Rabbit'].decrypt(text, key).toString(CryptoJS.enc.Utf8)
  return dencryptedMessage
}

function intialSetup () {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function doPost(e) {
  let data = e.parameter
  const lock = LockService.getScriptLock()

  lock.tryLock(10000)
  try {

    const key = "5432109876543210" // Sample key
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    const sheet = doc.getSheetByName(sheetName)
    sheet.appendRow([data.datetime, encrypt(data.client_nb, key), data.address, data.temperature, data.humidity])
    sendMyMail(data)
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON)
  }
  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }
  finally {
    lock.releaseLock()
  }
}

function sendMyMail(data) {
  // const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
  // const sheet = doc.getSheetByName(sheetName)
  // // var startRow = 3 // First row of data to process (row 2 would contains the column headers, and row 1 the spreadsheet title)
  // var numRows = sheet.getLastRow() // Number of rows to process, this picks up to the last row that has data
  // // Fetch the range of cells A3:L3, columns 1 through 12
  // var dataRange = sheet.getRange(numRows, 1, numRows+1, 6) // column 12, where the EMAIL_SENT status is written, change to the column you want
  // // Fetch values for each row in the Range.
  // var data = dataRange.getValues()
  if (data == undefined)
    data = {'datetime': '00/00/0000 00:00:00', 'temperature': '0.0', 'humidity': '0.0', 'address': 'null', 'client_nb': '000000-0'}
  // var row = data[0]
  var to = "haouhaou.driss@gmail.com"
  var replyTo = data.email
  var subject = "Mise à jour la temperature."
  // var body = "Le " + row[0] + "\n\nTemperature: "+ row[3] + "\nHumidité: " + row[4] + "\nAdresse: " + row[2] + "\n\nN° de Client: " + row[1] + "\n\nCordialement."
  var body = "Le " + data.datetime + "\n\nTemperature: "+ data.temperature + "\nHumidité: " + data.humidity + "\nAdresse: " + data.address + "\n\n\nEmail: " + data.email + "\nN° de Client: " + data.client_nb + "\n\nCordialement."

  MailApp.sendEmail(to, replyTo, subject, body)
}