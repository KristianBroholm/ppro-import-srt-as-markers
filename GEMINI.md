# SRT to Markers for Premiere Pro

This project is an Adobe Premiere Pro extension (CEP - Common Extensibility Platform) that allows users to import `.srt` subtitle files as markers into a selected sequence. It leverages a modern HTML/CSS/JS frontend and an ExtendScript (JSX) backend to interact with the Premiere Pro Object Model.

## Project Overview

- **Purpose:** Fast and accurate conversion of SRT subtitles into Premiere Pro markers with duration, color, and comments.
- **Main Technologies:**
    - **Frontend:** HTML5, CSS3, JavaScript (ES6).
    - **Host Script:** ExtendScript (JSX) for Premiere Pro automation.
    - **Communication:** `CSInterface.js` bridge between the panel and the host application.
    - **Runtime:** CEF (Chromium Embedded Framework) within Premiere Pro.

## Project Architecture

- `client/`: Contains the UI layer.
    - `index.html`: Structure of the panel.
    - `main.js`: Main application logic, SRT parsing, and CSInterface management.
    - `CSInterface.js`: Adobe's standard library for CEP extension communication.
- `host/`: Contains the Premiere Pro logic.
    - `script.jsx`: ExtendScript logic for creating markers, fetching sequences, and showing native dialogs.
- `CSXS/`: Configuration.
    - `manifest.xml`: Defines extension ID, version, supported host (PPRO), and entry points.
- `css/`: Styling.
    - `style.css`: Theme-aligned styles for a native Adobe look and feel.
- `.debug`: Enables remote debugging (port 8088).

## Building and Running

- **TODO:** No automated build system (e.g., Webpack, Gulp) is currently configured.
- **Running:**
    - Deploy the directory to the Adobe CEP extensions folder (e.g., `~/Library/Application Support/Adobe/CEP/extensions/`).
    - Restart Premiere Pro.
    - Open via `Window > Extensions > SRT to Markers`.
- **Debugging:**
    - Enable "Player Debug Mode" in the system registry/plist for the Adobe version.
    - Use the `.debug` file for remote Chrome debugging at `http://localhost:8088`.

## Development Conventions

- **Host Logic:** All Premiere Pro-specific operations should be contained within the `srtImporter` object in `host/script.jsx`.
- **SRT Parsing:** Custom logic is implemented in `client/main.js`. If parsing needs to become more complex, consider moving to a dedicated parser module.
- **Communication:**
    - UI to Host: `csInterface.evalScript('srtImporter.functionName(args)', callback)`.
    - Results from Host should be JSON-stringified for safe transport.
- **Confirmation Dialogs:** Favor native Premiere Pro dialogs (`srtImporter.confirmDialog`) over browser `confirm()` for a better user experience.
- **Consistency:** Markers should always have the subtitle text applied to both their **Name** and **Comments** fields.
- **Status Messages:** Use the `showStatus()` function in `main.js` to provide consistent feedback to the user.
