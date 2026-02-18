// src/controllers/asyncProcessor.js

/**
 * Controlador principal para el procesamiento asíncrono de propuestas.
 * Se ejecuta vía Trigger (Time-driven) o manualmente desde el Dashboard.
 */

const AsyncProcessor = {

  /**
   * Procesa una propuesta individual validada por la IA.
   * Determina la carpeta destino basándose en el número de versión.
   * @param {Object} propuesta - Objeto con datos de la propuesta (blob, id, version, tipo, etc.)
   * @param {boolean} aprobadoIA - Resultado de la evaluación preliminar.
   */
  procesarPropuesta: function (propuesta, aprobadoIA) {

    if (aprobadoIA) {
      // 1. Calcular fecha del próximo comité (Viernes)
      const fechaProxComite = Utils.obtenerProximoComite();

      // 2. Determinar la Categoría de la carpeta
      let nombreCarpeta = "Nuevas"; // Default para Version 0

      // Si la versión es mayor a 0, es una REVISIÓN enviada por el estudiante
      if (propuesta.version > 0) {
        if (propuesta.version === 1) nombreCarpeta = "1era Revision";
        else if (propuesta.version === 2) nombreCarpeta = "2da Revision";
        else if (propuesta.version >= 3) nombreCarpeta = "3era Revision";
      }

      // 3. Guardar el archivo en la jerarquía (Crear nuevo, NO mover)
      try {
        const urlPdf = DriveService.guardarArchivoEnJerarquia(
          propuesta.pdfBlob,
          propuesta.tipo,
          nombreCarpeta,
          fechaProxComite
        );

        // Si hay video, guardarlo también en la misma estructura (opcional, o en carpeta 'Videos')
        let urlVideo = "";
        if (propuesta.videoBlob) {
          urlVideo = DriveService.guardarArchivoEnJerarquia(
            propuesta.videoBlob,
            propuesta.tipo,
            nombreCarpeta,
            fechaProxComite
          );
        }

        // 4. Actualizar Base de Datos
        SheetsService.registrarPasoAComite(
          propuesta.id,
          propuesta.version,
          urlPdf,
          urlVideo,
          fechaProxComite,
          nombreCarpeta
        );

        // 5. Notificar al Estudiante
        EmailService.enviarConfirmacionComite(propuesta.email, propuesta.version, fechaProxComite);

      } catch (e) {
        console.error("Error guardando en Drive: " + e.toString());
        SheetsService.registrarError(propuesta.id, e.toString());
      }

    } else {
      // Lógica de rechazo (Feedback inmediato IA, no pasa a carpetas de comité)
      EmailService.enviarRechazoIA(propuesta.email, propuesta.feedbackIA);
      SheetsService.actualizarEstado(propuesta.id, 'AI_RECHAZADO', propuesta.feedbackIA);
    }
  },

  /**
   * ACCIÓN MANUAL: Marcar una propuesta como "Pendiente".
   * Esto se dispara desde el Dashboard cuando el comité no logra revisar una propuesta a tiempo.
   * Mueve el archivo físico a la carpeta "Pendientes" del SIGUIENTE comité.
   * @param {string} idPropuesta - ID único del expediente.
   */
  marcarComoPendiente: function (idPropuesta) {
    const propuesta = SheetsService.obtenerPropuestaPorId(idPropuesta);

    // Calcular el SIGUIENTE viernes (para reprogramar)
    const fechaNuevoComite = Utils.obtenerProximoComite();

    // Mover el archivo PDF existente
    if (propuesta.fileIdPdf) {
      DriveService.moverArchivoAComite(
        propuesta.fileIdPdf,
        propuesta.tipo,
        "Pendientes",
        fechaNuevoComite
      );
    }

    // Mover el archivo Video existente (si existe)
    if (propuesta.fileIdVideo) {
      DriveService.moverArchivoAComite(
        propuesta.fileIdVideo,
        propuesta.tipo,
        "Pendientes",
        fechaNuevoComite
      );
    }

    // Actualizar log en Sheets
    SheetsService.actualizarEstadoLogistico(idPropuesta, "PENDIENTE_REPROGRAMADO", fechaNuevoComite);

    // Opcional: Notificar al estudiante que su revisión se pospuso
    // EmailService.notificarReprogramacion(propuesta.email, fechaNuevoComite);
  }
};