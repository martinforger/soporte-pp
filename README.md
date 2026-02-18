# Herramienta de Soporte para la Evaluación Preliminar de Proyectos (UCAB)

> **Sistema automatizado para la gestión, validación y organización logística de propuestas de Pasantía y Trabajo de Grado mediante Inteligencia Artificial Generativa.**

![Status](https://img.shields.io/badge/Estado-En_Desarrollo-yellow)
![Tech](https://img.shields.io/badge/Google-Apps_Script-4285F4)
![AI](https://img.shields.io/badge/AI-Gemini_2.5_Flash_Lite-8E44AD)

## 📋 Descripción del Proyecto

Este proyecto aborda la necesidad de optimizar el flujo de revisión de propuestas académicas en la Escuela de Ingeniería Informática de la UCAB. La herramienta actúa como un primer filtro y un organizador logístico automatizado.

Funcionalidades principales:
1.  **Recepción Centralizada:** Captura de propuestas (PDF) y video-resúmenes a través de formularios web.
2.  **Pre-evaluación Inteligente:** Utiliza la API de **Gemini 2.5 Flash Lite** para auditar el PDF contra el reglamento (Objetivos, Alcance, Normativa), proporcionando feedback inmediato al estudiante.
3.  **Gestión Documental Jerárquica:** Organiza automáticamente los archivos en Google Drive clasificándolos por **Año > Mes > Comité (Miércoles) > Tipo > Estatus**.
4.  **Control de Versiones:** Distingue entre propuestas "Nuevas" y "Revisiones" (1era, 2da, 3era), ubicándolas correctamente para la revisión humana.

El sistema opera bajo una arquitectura **Serverless** estricta dentro del ecosistema de Google Workspace con costo cero de infraestructura.

## 🚀 Características Técnicas

* **Arquitectura Desacoplada (Producer-Consumer):** Utiliza Google Sheets como cola de mensajes y *Time-Driven Triggers* para procesar solicitudes asíncronamente, evitando tiempos de espera en el cliente.
* **Gestión Híbrida de Contenido:** * **PDF:** Procesado y analizado por la IA.
    * **Video:** Gestión *Pass-through* (se almacena y enlaza para el comité humano, pero no es consumido por la IA).
* **Algoritmo de Enrutamiento de Archivos:** Lógica dinámica que crea o busca carpetas basadas en la fecha del próximo **Comité Evaluador (Miércoles)** y el número de versión de la propuesta.
* **Validación Estructurada:** Extracción de datos en formato JSON para verificar criterios excluyentes antes de molestar al comité humano.

## 🛠️ Stack Tecnológico

* **Backend:** Google Apps Script (Runtime V8).
* **Frontend:** HTML5, CSS (Tailwind/Bootstrap), JavaScript (Google Script Run).
* **Base de Datos:** Google Sheets (API).
* **Almacenamiento:** Google Drive (Estructura Dinámica).
* **IA:** Google Gemini API (Modelo: `gemini-2.5-flash-lite`).
* **Desarrollo Local:** Node.js + CLASP.

## 📂 Estructura del Repositorio

El código fuente se encuentra en la carpeta `src/` para facilitar el despliegue con CLASP.

```text
/src
├── config/             # Configuraciones globales (IDs, API Keys)
├── controllers/        # Orquestadores: asyncProcessor (Cola) y webController (Formulario)
├── services/           # Integraciones:
│   ├── driveService.js # Lógica de creación de carpetas Año/Mes/Comite
│   ├── geminiService.js# Conexión con IA
│   └── sheetsService.js# Persistencia de datos
├── utils/              # Herramientas:
│   ├── prompts.js      # Criterios de evaluación (TG vs Pasantía)
│   └── utils.js        # Calculadora de fechas (Próximo Miércoles)
├── views/              # Frontend (Formularios y Dashboard)
└── appsscript.json     # Manifiesto del proyecto
```

## ⚙️ Instalación y Configuración

### **Prerrequisitos**

- Node.js instalado.
- Cuenta de Google (Institucional UCAB o personal).
- Acceso a Google AI Studio (para la API Key).

### **Pasos para el Despliegue**

1. **Clonar el repositorio:**

```bash
git clone [https://github.com/martinforger/soporte-pp.git](https://github.com/martinforger/soporte-pp.git)
cd soporte-pp
```

2. **Instalar dependencias globales:**

```bash
npm install -g @google/clasp
```

3. **Login en Google:**

```bash
clasp login
```

4. **Vincular con el Script Remoto:**
   Crea un nuevo proyecto en script.google.com y obtén el Script ID.

```bash
clasp clone "TU_SCRIPT_ID" --rootDir ./src
```

5. **Configurar Variables de Entorno:**
   En el editor de Apps Script, ve a Configuración del Proyecto > Propiedades de la secuencia de comandos y añade:

- `GEMINI_API_KEY`: Clave de API de Gemini.
- `SHEET_ID`: ID del Spreadsheet "DB_Gestion_Propuestas".
- `FOLDER_ID`: ID de la carpeta raíz "GESTION_PROPUESTAS".

6. **Subir Cambios:**

```bash
clasp push
```

7. **Configurar Triggers:**
   Añadir disparador manual: Función processPendingProposals, evento Time-driven (cada 5 minutos).

## 🔄 Flujo de Trabajo y Lógica de Carpetas

1. **Recepción y Pre-evaluación (IA)**
   - Estudiante sube PDF + Video.
   - Sistema valida PDF con Gemini.
      - Si reprueba: Correo automático con feedback (No se guarda en carpetas de comité).
      - Si aprueba: Pasa a fase logística.

2. Logística de Archivos (Drive)
El sistema calcula la fecha del próximo Miércoles (Corte semanal) y organiza el archivo:

- Ruta: Raíz / Año / Mes / Comite [DD-MM-YYYY] / [Tipo] / [Categoría]

- Lógica de Categoría:
  - Versión 0 -> Carpeta "Nuevas".
  - Versión 1 -> Carpeta "1era Revision".
  - Versión 2 -> Carpeta "2da Revision".
  - Versión 3 -> Carpeta "3era Revision".

3. Gestión del Comité (Humano)
- El comité revisa la carpeta de la semana.
- Si no da tiempo de revisar: El coordinador marca "Pendiente" en el Dashboard.
- Acción del Sistema: Mueve el archivo físico a la carpeta "Pendientes" del siguiente Comité (Miércoles próximo).