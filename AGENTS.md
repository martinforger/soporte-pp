# AGENTS.md

## Project Overview
This project is an **Automated Proposal Evaluation System** for the UCAB Computer Engineering School. It uses **Google Apps Script (GAS)** as the backend/serverless infrastructure and **Gemini 2.5 Flash Lite** for AI-based pre-evaluation of academic proposals (Internships and Thesis).

## Tech Stack & Environment
- **Runtime:** Google Apps Script (V8 Engine).
- **Local Dev:** Node.js + CLASP (Command Line Apps Script Projects).
- **Database:** Google Sheets (via `SpreadsheetApp`).
- **Storage:** Google Drive (via `DriveApp`).
- **AI Model:** Google Gemini 2.5 Flash Lite (via REST API `UrlFetchApp`).
- **Frontend:** HTML5 + TailwindCSS (via CDN) served as `HtmlService`.

## Development Commands
- **Push changes:** `clasp push` (Uploads local `/src` files to Google Drive).
- **Watch mode:** `clasp push --watch` (Auto-uploads on save).
- **Pull changes:** `clasp pull` (Download changes made in the browser editor - *Dont use*).
- **Open Editor:** `clasp open` (Opens the script in the browser).

## Architecture & Logic (CRITICAL)

### 1. File Structure
All source code resides in `./src`. CLASP flattens subdirectories upon upload (e.g., `src/controllers/main.js` becomes `controllers/main.gs`).
- `src/controllers/`: Main entry points (`doGet`, `doPost`) and orchestrators.
- `src/services/`: Interactions with Google APIs (Drive, Sheets, Gemini).
- `src/utils/`: Helpers, Prompts, and Date Logic.
- `src/views/`: HTML files for the Web App.

### 2. The "Producer-Consumer" Pattern
To avoid the 6-minute execution limit of GAS:
- **Producer (Frontend):** User submits form -> Saves to Drive -> Log to Sheet with status `PENDIENTE` -> Returns "Success" immediately.
- **Consumer (Trigger):** A time-driven trigger runs `processPendingProposals()` every 5 mins -> Pick one `PENDIENTE` -> Call Gemini -> Update Sheet -> Email Student.

### 3. Google Drive Folder Hierarchy
The `DriveService` must enforce this strictly. Do not hardcode folder IDs except for the Root.
**Path:** `ROOT / Year / Month / Comite [DD-MM-YYYY] / [Type] / [Category]`
- **Committee Date:** Always the **Next Wednesday**. Calculated in `utils.js`.
- **Type:** "Trabajo de Grado" or "Pasantias".
- **Category (Version Logic):**
  - Version 0 -> `Nuevas`
  - Version 1 -> `1era Revision`
  - Version 2 -> `2da Revision`
  - Version 3 -> `3era Revision`
  - Manual Move -> `Pendientes` (Moved from previous committee).

### 4. AI Interaction (Gemini)
- **Model:** `gemini-2.5-flash-lite`.
- **Input:** PDF Text (extracted).
- **Video:** Pass-through only. The AI **does not** analyze the video. It is just stored in Drive.
- **Output:** Strict JSON. Use `utils.limpiarYParsearJSON` to handle Markdown code blocks returned by the LLM.

## Code Style & Guidelines
- **No Modules:** GAS does not support `import/export` natively in the cloud. All `.js` files in `/src` share the **global scope** once uploaded.
- **JSDoc:** Use JSDoc comments for all functions to enable type checking in the editor.
- **PropertiesService:** NEVER hardcode API Keys or Sheet IDs. Use `PropertiesService.getScriptProperties().getProperty('KEY_NAME')`.
- **Error Handling:** Wrap external API calls (`UrlFetchApp`, `DriveApp`) in `try/catch` blocks. Log errors to the Spreadsheet, not just `console.log`.

## Testing Instructions
- **Unit Testing:** Not available locally.
- **Integration Testing:**
  1. Run `clasp push`.
  2. Open the browser editor.
  3. Manually run specific functions (e.g., `testDriveCreation()`) from the execution bar.
- **Web App Testing:** Deploy as a "Test Deployment" (Head deployment) to see frontend changes immediately without versioning.

## Security Considerations
- **Git:** Ensure `.clasp.json` and any `creds.json` are in `.gitignore`.
- **Access:** The Web App should be deployed as "Execute as: Me" and "Who has access: Anyone" (or "Anyone with Google Account" depending on UCAB policy).