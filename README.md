# ClearStage

A classy, professional presentation site with one purpose: let anyone upload a **PDF or PowerPoint (.pptx)**, present it full-screen, and show **live speech-to-text captions** while they talk — built for deaf, hard-of-hearing, and mute students to follow along.

PDF files can run entirely in the browser. PPTX files use the included local Python server so LibreOffice can render the deck faithfully before presentation.

## Features

### Reliable slide rendering

ClearStage renders PDFs pixel-perfect with PDF.js. When run through `server.py`, PPTX files are converted by LibreOffice first, preserving slide dimensions, fonts, artwork, transparency, fills, and element placement much more faithfully than browser-side PPTX parsing.

- **Upload PDF or PPTX** — drag-and-drop or click to browse. PDFs render pixel-perfect via PDF.js; PPTX files are converted locally by Python and LibreOffice before entering the same PDF renderer.
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

Vercel can host the static interface, but it does not run `server.py` or LibreOffice. To support PPTX online:

1. Deploy this repository's `Dockerfile` to a Docker host such as Render, Railway, or Fly.io.
2. Set the backend environment variable `CLEARSTAGE_ALLOWED_ORIGIN` to your Vercel URL, for example `https://saigai-siragu.vercel.app`.
3. Copy the backend's public HTTPS URL into `js/renderer-config.js`:
   ```javascript
   window.CLEARSTAGE_RENDERER_URL = 'https://your-pptx-backend.example.com';
   ```
4. Commit and push `js/renderer-config.js`, then redeploy Vercel.

The browser sends PPTX files to that backend, where LibreOffice converts them to PDF. The files are processed temporarily and are not stored by the included server. Keep the backend URL on HTTPS and restrict `CLEARSTAGE_ALLOWED_ORIGIN` to your Vercel domain.

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

Canva does not provide a local browser rendering engine for uploaded PowerPoint files. The included Python endpoint uses LibreOffice's presentation renderer, then sends the resulting PDF pages through the same pixel-accurate path used for PDF uploads. Exact font matching still depends on the fonts installed on the computer doing the conversion. Old binary `.ppt` files should be saved as `.pptx` first.

## Customizing

- Colors, fonts, and spacing are all defined as CSS variables at the top of `css/styles.css` (`:root`) — change the palette there.
- Add more caption languages by adding `<option>` values to `#lang-select` in `index.html` (use any [BCP-47](https://en.wikipedia.org/wiki/IETF_language_tag) code your browser's speech engine supports).

---
Built with vanilla HTML/CSS/JS, [PDF.js](https://mozilla.github.io/pdf.js/), and Python's standard library.
