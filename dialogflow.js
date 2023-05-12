const {google} = require('googleapis');
const {WebhookClient} = require('dialogflow-fulfillment');

exports.dialogflowWebhook = async (req, res) => {
  const {queryResult} = req.body;
  const sheetId = 'TU_ID_DE_HOJA_DE_CÁLCULO'; // Cambiar por el ID de tu hoja de cálculo en Google Sheets
  const sheetRange = 'TU_RANGO_EN_LA_HOJA_DE_CÁLCULO'; // Cambiar por el rango en el que están tus datos en Google Sheets
  const sheetData = queryResult.parameters;
  
  // Configurar las credenciales de Google Sheets
  const auth = new google.auth.GoogleAuth({
    keyFile: 'TU_ARCHIVO_DE_CREDENCIALES.JSON', // Cambiar por la ruta del archivo de credenciales JSON de tu proyecto en Google Cloud
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const authClient = await auth.getClient();
  
  // Inicializar la API de Google Sheets
  const sheets = google.sheets({version: 'v4', auth: authClient});
  
  // Obtener los datos de la hoja de cálculo
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: sheetRange,
  });
  const rows = response.data.values;
  
  // Buscar el valor de la cotización en la hoja de cálculo
  let cotizacion = '';
  rows.forEach((row) => {
    if (row[0] === sheetData.modelo && row[1] === sheetData.color && row[2] === sheetData.talla) {
      cotizacion = row[3];
    }
  });
  
  // Construir la respuesta del webhook
  const webhook = new WebhookClient({request: req, response: res});
  if (cotizacion) {
    webhook.add(`La cotización para ${sheetData.modelo}, ${sheetData.color} y ${sheetData.talla} es de ${cotizacion} pesos.`);
  } else {
    webhook.add(`Lo siento, no pude encontrar una cotización para ${sheetData.modelo}, ${sheetData.color} y ${sheetData.talla}.`);
  }
  webhook.send();
};
