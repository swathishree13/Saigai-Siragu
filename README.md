# ClearStage

A classy, professional presentation site with one purpose: let anyone upload a **PDF or PowerPoint (.pptx)**, present it full-screen, and show **live speech-to-text captions** while they talk — built for deaf, hard-of-hearing, and mute students to follow along.

PDF and PPTX files render directly in the browser. PPTX fidelity depends on the browser renderer and installed fonts.

## Features

### Reliable slide rendering

ClearStage renders PDFs with PDF.js and PPTX files with the browser-based `pptx-preview` renderer. This keeps the Vercel deployment fully self-contained and requires no backend.

- **Upload PDF or PPTX** — drag-and-drop or click to browse. Both formats are processed locally in the browser.
- **Slide rail** — thumbnail/list navigation of every slide.
- **Present button** — opens a distraction-free, full-screen stage with slide navigation (buttons, arrow keys, spacebar).
- **Live captions** — uses the browser's built-in Web Speech API to transcribe the presenter's microphone in real time, in large high-contrast text.
- **English (India/US), Tamil, and Hindi** caption language options.
- **Transcript panel** — a running, timestamped log of everything captioned, with one-click copy.
- **Adjustable caption size**, full keyboard control, light/dark theme, and screen-reader-friendly markup (`aria-live`, focus states, skip link).

## Running it

No installation needed — it's static HTML/CSS/JS.

Open `index.html` directly, or deploy the folder to Vercel or another static host. PDF and PPTX files are processed locally in the browser.

### Vercel deployment

The frontend and PDF renderer work from the static Vercel deployment. No backend is required.

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
└── README.md
```

## Notes on PPTX rendering

The browser renderer supports modern `.pptx` files and keeps the uploaded file local to the browser. Some advanced PowerPoint features, fonts, transparency, and complex effects may differ from PowerPoint or Canva. Export to PDF when exact visual fidelity is required.

## Customizing

- Colors, fonts, and spacing are all defined as CSS variables at the top of `css/styles.css` (`:root`) — change the palette there.
- Add more caption languages by adding `<option>` values to `#lang-select` in `index.html` (use any [BCP-47](https://en.wikipedia.org/wiki/IETF_language_tag) code your browser's speech engine supports).

---
Built with vanilla HTML/CSS/JS, [PDF.js](https://mozilla.github.io/pdf.js/), and [pptx-preview](https://www.npmjs.com/package/pptx-preview).
