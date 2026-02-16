// Función para obtener propiedades de forma segura
function getScriptProperty(key) {
  return PropertiesService.getScriptProperties().getProperty(key);
}

const CONFIG = {
  SHEET_ID: getScriptProperty('SHEET_ID'),
  GEMINI_API_KEY: getScriptProperty('GEMINI_API_KEY'),
  MODEL_NAME: 'gemini-2.5-flash-lite'
};