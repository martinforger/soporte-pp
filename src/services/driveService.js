// src/services/driveService.js

/**
 * Servicio para gestionar la estructura de carpetas y archivos en Google Drive.
 * Dependencias: CONFIG (para FOLDER_ID)
 */

const DriveService = {

  /**
   * Guarda un archivo NUEVO (o revisión subida) en la estructura jerárquica.
   * NO mueve versiones anteriores, crea un "snapshot" nuevo.
   * @param {Blob} fileBlob - El archivo a guardar (PDF o Video).
   * @param {string} tipo - "TG" o "PASANTIA".
   * @param {string} categoria - "Nuevas", "1era Revision", "2da Revision", etc.
   * @param {Date} fechaComite - Objeto Date del próximo viernes.
   * @return {string} URL del archivo creado.
   */
  guardarArchivoEnJerarquia: function (fileBlob, tipo, categoria, fechaComite) {
    const targetFolder = this._navegarOCrearRuta(tipo, categoria, fechaComite);
    const file = targetFolder.createFile(fileBlob);
    return file.getUrl();
  },

  /**
   * Mueve un archivo EXISTENTE a una nueva carpeta de comité (Caso: Pendientes).
   * @param {string} fileId - ID del archivo en Drive.
   * @param {string} tipo - "TG" o "PASANTIA".
   * @param {string} categoria - Generalmente "Pendientes".
   * @param {Date} fechaComite - Fecha del NUEVO comité destino.
   * @return {string} Nueva URL del archivo (aunque suele ser la misma, es buena práctica retornarla).
   */
  moverArchivoAComite: function (fileId, tipo, categoria, fechaComite) {
    const file = DriveApp.getFileById(fileId);
    const targetFolder = this._navegarOCrearRuta(tipo, categoria, fechaComite);
    file.moveTo(targetFolder);
    return file.getUrl();
  },

  /**
   * Método privado (helper) para navegar la jerarquía y crear carpetas faltantes.
   * Estructura: Raíz > Año > Mes > Comité [Fecha] > Tipo > Categoría
   */
  _navegarOCrearRuta: function (tipo, categoria, fechaComite) {
    const ROOT_ID = CONFIG.FOLDER_ID;
    const rootFolder = DriveApp.getFolderById(ROOT_ID);

    // 1. Año (ej: "2026")
    const year = fechaComite.getFullYear().toString();
    const yearFolder = this._getOrCreateSubFolder(rootFolder, year);

    // 2. Mes (ej: "02-Febrero")
    const monthNames = ["01-Enero", "02-Febrero", "03-Marzo", "04-Abril", "05-Mayo", "06-Junio",
      "07-Julio", "08-Agosto", "09-Septiembre", "10-Octubre", "11-Noviembre", "12-Diciembre"];
    const monthName = monthNames[fechaComite.getMonth()];
    const monthFolder = this._getOrCreateSubFolder(yearFolder, monthName);

    // 3. Comité Específico (ej: "Comite Evaluador 27-02-2026")
    const dateStr = Utilities.formatDate(fechaComite, Session.getScriptTimeZone(), "dd-MM-yyyy");
    const committeeFolderName = `Comite Evaluador ${dateStr}`;
    const committeeFolder = this._getOrCreateSubFolder(monthFolder, committeeFolderName);

    // 4. Tipo (Normalizado: "TG" o "Pasantias")
    // Aseguramos que coincida con tus nombres de carpeta exactos
    const tipoFolderStr = (tipo === 'TG') ? 'Trabajo de Grado' : 'Pasantias';
    const typeFolder = this._getOrCreateSubFolder(committeeFolder, tipoFolderStr);

    // 5. Categoría (Nuevas, 1era Revision, Pendientes...)
    return this._getOrCreateSubFolder(typeFolder, categoria);
  },

  /**
   * Helper atómico: Busca una carpeta por nombre, si no existe la crea.
   */
  _getOrCreateSubFolder: function (parentFolder, folderName) {
    const folders = parentFolder.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    } else {
      return parentFolder.createFolder(folderName);
    }
  }
};