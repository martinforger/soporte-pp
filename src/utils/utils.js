/**
 * src/utils/utils.js
 * Utilidades generales para fechas, formateo de texto y parsing de IA.
 */

const Utils = {

  /**
   * Calcula la fecha del próximo Comité Evaluador (Miércoles).
   * Lógica:
   * - Si hoy es Lunes o Martes -> Próximo Miércoles (esta misma semana).
   * - Si hoy es Jueves, Viernes, Sábado o Domingo -> Miércoles de la semana siguiente.
   * - Si hoy es Miércoles:
   * - Antes de la HORA_CORTE (ej. 12:00 PM) -> Hoy mismo.
   * - Después de la HORA_CORTE -> Próximo Miércoles.
   * * @return {Date} Objeto Date con la fecha del comité (sin hora).
   */
  obtenerProximoComite: function () {
    const HORA_CORTE = 13; // 1:00 PM (Ajusta según la regla de la escuela)
    const DIA_COMITE = 3;  // 0=Dom, 1=Lun, 2=Mar, 3=Miércoles...

    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const hora = hoy.getHours();

    let diasParaSumar = 0;

    if (diaSemana === DIA_COMITE) {
      // Es Miércoles. ¿Llegó a tiempo?
      if (hora >= HORA_CORTE) {
        diasParaSumar = 7; // Ya pasó el corte, va para la semana que viene
      } else {
        diasParaSumar = 0; // Entra en el comité de hoy
      }
    } else if (diaSemana < DIA_COMITE) {
      // Es Domingo (0), Lunes (1) o Martes (2) -> Va para este Miércoles
      // Nota: JS getDay() devuelve 0 para Domingo.
      // Si es Domingo (0), necesitamos sumar 3 días.
      // Si es Lunes (1), sumar 2 días.
      // Si es Martes (2), sumar 1 día.
      diasParaSumar = DIA_COMITE - diaSemana;
    } else {
      // Es Jueves (4), Viernes (5) o Sábado (6) -> Va para el Miércoles siguiente
      diasParaSumar = 7 - (diaSemana - DIA_COMITE);
    }

    // Calcular fecha
    const fechaComite = new Date(hoy);
    fechaComite.setDate(hoy.getDate() + diasParaSumar);

    // Resetear horas para que sea puramente fecha (00:00:00)
    fechaComite.setHours(0, 0, 0, 0);

    return fechaComite;
  },

  /**
   * Limpia y formatea la respuesta JSON de Gemini.
   * A veces la IA devuelve bloques de código Markdown (```json ... ```) que rompen el JSON.parse.
   * * @param {string} textoIA - La respuesta cruda de Gemini.
   * @return {Object} Objeto JSON parseado y seguro.
   */
  limpiarYParsearJSON: function (textoIA) {
    if (!textoIA) return null;

    let textoLimpio = textoIA.trim();

    // Eliminar envoltorios de Markdown ```json y ```
    if (textoLimpio.startsWith("```")) {
      textoLimpio = textoLimpio.replace(/^```(json)?/, "").replace(/```$/, "");
    }

    try {
      return JSON.parse(textoLimpio);
    } catch (e) {
      console.error("Error parseando JSON de IA: ", e);
      console.error("Texto recibido: ", textoIA);
      // Fallback: Intentar encontrar el primer '{' y el último '}'
      try {
        const start = textoIA.indexOf('{');
        const end = textoIA.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          return JSON.parse(textoIA.substring(start, end + 1));
        }
      } catch (e2) {
        throw new Error("No se pudo extraer JSON válido de la respuesta de la IA.");
      }
    }
    return null;
  },

  /**
   * Normaliza nombres de carpetas y archivos (quita acentos y caracteres especiales).
   * Útil para crear rutas consistentes en Drive.
   * Ej: "Pasantía de Validación" -> "Pasantia_de_Validacion"
   */
  normalizarTexto: function (texto) {
    if (!texto) return "";
    return texto
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
      .replace(/[^a-zA-Z0-9 ]/g, "") // Quitar caracteres raros
      .replace(/\s+/g, "_"); // Reemplazar espacios con guiones bajos
  },

  /**
   * Formatea una fecha para nombres de carpetas (DD-MM-YYYY).
   */
  formatearFechaCarpeta: function (date) {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd-MM-yyyy");
  }

};