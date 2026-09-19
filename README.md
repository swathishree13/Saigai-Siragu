# ClearStage

A classy, professional presentation site with one purpose: let anyone upload a **PDF or PowerPoint (.pptx)**, present it full-screen, and show **live speech-to-text captions** while they talk — built for deaf, hard-of-hearing, and mute students to follow along.

PDF and PPTX files now render directly in the browser. PPTX fidelity depends on the browser renderer and installed fonts.

## Features

### Reliable slide rendering

ClearStage renders PDFs with PDF.js and PPTX files with the browser-based `pptx-preview` renderer. This keeps the Vercel deployment fully self-contained and requires no Python backend.

- **Upload PDF or PPTX** — drag-and-drop or click to browse. PDFs render via PDF.js; PPTX files are parsed and rendered locally in the browser.
- **Slide rail** — thumbnail/list navigation of every slide.
- **Present button** — opens a distraction-free, full-screen stage with slide navigation (buttons, arrow keys, spacebar).
- **Live captions** — uses the browser's built-in Web Speech API to transcribe the presenter's microphone in real time, in large high-contrast text.
- **English (India/US), Tamil, and Hindi** caption language options.
- **Transcript panel** — a running, timestamped log of everything captioned, with one-click copy.
- **Adjustable caption size**, full keyboard control, light/dark theme, and screen-reader-friendly markup (`aria-live`, focus states, skip link).

## Running it

No installation needed — it's static HTML/CSS/JS.

1. Install [LibreOffice](https://www.libreoffice.org/download/download/) and make sure `soffice` is available on your PATH.
2. Start the included Python server:
   ```bash
   cd clearstage
   py server.py
   ```
3. Visit `http://127.0.0.1:8000`. Uploading a PPTX now sends it only to this local server for conversion; no file leaves your computer.

If port 8000 is already in use, start on another port with `$env:CLEARSTAGE_PORT=8001; py server.py`, then open `http://127.0.0.1:8001`.

Opening `index.html` directly still supports PDF files, but accurate PPTX rendering requires `py server.py`.

### Vercel deployment

The frontend, PDF renderer, and browser-based PPTX renderer all work from the static Vercel deployment. No Python server, Docker container, LibreOffice installation, or backend URL is required.

## Browser support

- Slide upload, viewing, and presenting work in **any modern browser**.
- **Live captions** use the Web Speech API, which currently only ships in **Chrome and Edge** (desktop and Android). Other browsers will show a friendly message instead of captions — the rest of the app still works.
- The presenter must allow **microphone access** when prompted for captions to start.

## File structure

```
clearstage/
├── index.html        # Page structure & content
├── css/
│   └── styles.css    # Design tokens, layout, present-mode styling
├── js/
│   └── app.js         # File loading, presentation mode, captions
├── server.py          # Local PPTX-to-PDF conversion endpoint
└── README.md
```

## Notes on PPTX rendering

The browser renderer supports modern `.pptx` files and keeps the uploaded file local to the browser. Some advanced PowerPoint features, fonts, transparency, and complex effects may differ from PowerPoint or Canva. Old binary `.ppt` files should be saved as `.pptx` first.

## Customizing

- Colors, fonts, and spacing are all defined as CSS variables at the top of `css/styles.css` (`:root`) — change the palette there.
- Add more caption languages by adding `<option>` values to `#lang-select` in `index.html` (use any [BCP-47](https://en.wikipedia.org/wiki/IETF_language_tag) code your browser's speech engine supports).

---
Built with vanilla HTML/CSS/JS, [PDF.js](https://mozilla.github.io/pdf.js/), and [pptx-preview](https://www.npmjs.com/package/pptx-preview).
