# Herramienta de Soporte para la Evaluación Preliminar de Proyectos (UCAB)

> **Sistema automatizado para la gestión y validación de propuestas de Pasantía y Trabajo de Grado mediante Inteligencia Artificial Generativa.**

![Status](https://img.shields.io/badge/Estado-En_Desarrollo-yellow)
![Tech](https://img.shields.io/badge/Google-Apps_Script-4285F4)
![AI](https://img.shields.io/badge/AI-Gemini_2.5_Flash_Lite-8E44AD)

## 📋 Descripción del Proyecto

Este proyecto aborda la necesidad de optimizar el flujo de revisión de propuestas académicas en la Escuela de Ingeniería Informática de la UCAB. Actualmente, la revisión manual genera cuellos de botella administrativos.

Esta herramienta permite:

1.  **Automatizar la recepción** de propuestas (PDF) a través de formularios web controlados.
2.  **Pre-evaluar requisitos** (objetivos, alcance, normativa) utilizando la API de **Gemini 2.5 Flash Lite**, reduciendo la carga operativa del comité.
3.  **Gestionar notificaciones** automáticas a los estudiantes sobre el estatus de su solicitud.
4.  **Centralizar la administración** en un Dashboard para el coordinador de prácticas profesionales.

El sistema opera bajo una arquitectura **Serverless** estricta dentro del ecosistema de Google Workspace.

## 🚀 Características Técnicas

- **Arquitectura Desacoplada (Producer-Consumer):** Utiliza Google Sheets como cola de mensajes y _Time-Driven Triggers_ para procesar solicitudes asíncronamente, evitando el límite de ejecución de 6 minutos de Apps Script.
- **Análisis Multimodal:** Capacidad de procesar documentos PDF (texto) y videos explicativos mediante la ventana de contexto de Gemini 1.5.
- **Validación Estructurada:** Extracción de datos en formato JSON para verificar el cumplimiento del reglamento.
- **Seguridad:** Gestión de API Keys mediante `PropertiesService`, sin exponer credenciales en el cliente.

## 🛠️ Stack Tecnológico

- **Backend:** Google Apps Script (Runtime V8).
- **Frontend:** HTML5, CSS (Tailwind/Bootstrap), JavaScript (Google Script Run).
- **Base de Datos:** Google Sheets (API).
- **Almacenamiento:** Google Drive.
- **IA:** Google Gemini API (Modelo: `gemini-2.5-flash-lite`).
- **Desarrollo Local:** Node.js + CLASP (Command Line Apps Script Projects).

## 📂 Estructura del Repositorio

El código fuente se encuentra en la carpeta `src/` para facilitar el despliegue con CLASP.

```text
/src
├── config/             # Configuraciones globales y acceso a Propiedades del Script
├── controllers/        # Lógica de negocio (Manejo de formularios y Cola de procesos)
├── services/           # Integraciones (Gemini API, GmailApp, Sheets API)
├── utils/              # Prompts de sistema y parsers de respuesta JSON
├── views/              # Archivos HTML/JS para el Frontend (Formularios y Dashboard)
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
git clone [https://github.com/usuario/proyecto-pasantia-ucab.git](https://github.com/usuario/proyecto-pasantia-ucab.git)
cd proyecto-pasantia-ucab
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

- `GEMINI_API_KEY`: Tu clave de API de Google AI Studio.
- `SHEET_ID`: El ID de la hoja de cálculo que servirá de base de datos.
- `FOLDER_ID`: El ID de la carpeta de Drive para guardar los adjuntos.

6. **Subir Cambios:**

```bash
clasp push
```

7. **Configurar Triggers:**
   Configura manualmente un disparador por tiempo (Time-driven) para la función processPendingProposals (ej. cada 5 minutos) para activar la cola de procesamiento.

## 📖 Uso

1. **Estudiante:** Accede a la URL de la Web App desplegada -> Sube PDF/Video -> Recibe correo de confirmación.

2. **Sistema (Bot):** El trigger detecta la solicitud -> Envía datos a Gemini -> Guarda la pre-evaluación en Sheets.

3. **Comité/Coordinador:** Accede al Dashboard -> Visualiza propuestas "Pre-aprobadas" o "Rechazadas" -> Toma decisión final.
