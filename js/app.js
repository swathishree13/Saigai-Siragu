(() => {
  'use strict';

  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  // ---------- State ----------
  let slides = [];        // [{kind:'image', src}] or [{kind:'pptx', node}]
  let currentIndex = 0;
  let deckName = '';
  let recognizer = null;
  let micOn = false;
  let langCode = 'en-IN';
  let transcript = [];    // [{time, text}]
  let captionSize = 1.5;  // rem
  let userStoppedMic = false;
  let uiLanguage = 'en';

  const uiTranslations = {
    en: {
      skipUpload: 'Skip to upload', captionLanguage: 'Caption language', eyebrow: 'ACCESSIBLE PRESENTING',
      heroTitle: 'Every slide, heard and read.', heroSub: "சைகைசிறகு turns any PDF or PowerPoint into a full-screen presentation with live, real-time captions — so deaf and hard-of-hearing students can follow along with what's being said, word for word.", uploadDeck: 'Upload a deck', exportPdf: 'Export as PDF',
      presentFullscreen: 'Present full-screen', startLiveCaptions: 'Start live captions', choosePdf: 'Choose a presentation PDF',
      removeFile: 'Remove file', present: 'Present ▸', startCaptions: 'Start captions', stopCaptions: 'Stop captions',
      captionWaiting: 'Captions will appear here once you press “Start captions.”', transcript: 'Transcript', copy: 'Copy',
      slide: 'Slide', loaded: 'Loaded', reading: 'Reading', invalidFile: 'Please choose a PDF or PowerPoint (.pptx) file.',
      noSlides: 'Couldn’t find any slide content in that file. Try exporting it to PDF instead.',
      unsupported: 'Live captions aren’t supported in this browser. Try Chrome or Edge.', listening: 'Listening…',
      micBlocked: 'Microphone access was blocked. Allow microphone permission and press Start captions again.',
      micFailed: 'Couldn’t start the microphone. Please try again.', copyFailed: 'Select & copy manually', copied: 'Copied',
      runsInBrowser: 'Runs entirely in your browser. No files are uploaded anywhere.', featureExport: 'Drop in a PDF or PowerPoint file. Slides are rendered in your browser.', featurePresent: 'Open a distraction-free stage with clean navigation and captions.', featureCaptions: 'Your words appear on screen in real time while you talk.', accessibilityTitle: 'Built around one need: keep up with every word.', browserNote: 'Live captions work best in Chrome and Edge. The presentation and slide viewer work everywhere.'
    },
    ta: {
      skipUpload: 'பதிவேற்றத்திற்குச் செல்லவும்', captionLanguage: 'தலைப்பு மொழி', eyebrow: 'அணுகக்கூடிய வழங்கல்',
      heroTitle: 'ஒவ்வொரு ஸ்லைடும் கேட்கவும் படிக்கவும்.', uploadDeck: 'வழங்கலைப் பதிவேற்றவும்', exportPdf: 'PDF ஆக ஏற்றுமதி',
      presentFullscreen: 'முழுத்திரையில் வழங்கவும்', startLiveCaptions: 'நேரடி தலைப்புகளைத் தொடங்கவும்', choosePdf: 'வழங்கல் PDF-ஐத் தேர்ந்தெடுக்கவும்',
      removeFile: 'கோப்பை அகற்றவும்', present: 'வழங்கவும் ▸', startCaptions: 'தலைப்புகளைத் தொடங்கவும்', stopCaptions: 'தலைப்புகளை நிறுத்தவும்',
      captionWaiting: '“தலைப்புகளைத் தொடங்கவும்” என்பதை அழுத்தியதும் தலைப்புகள் தோன்றும்.', transcript: 'மாற்றெழுத்து', copy: 'நகலெடு',
      slide: 'ஸ்லைடு', loaded: 'ஏற்றப்பட்டது', reading: 'படிக்கிறது', invalidFile: 'PDF அல்லது PowerPoint (.pptx) கோப்பைத் தேர்ந்தெடுக்கவும்.',
      noSlides: 'இந்தக் கோப்பில் ஸ்லைடு உள்ளடக்கம் இல்லை. PDF ஆக ஏற்றுமதி செய்து முயற்சிக்கவும்.',
      unsupported: 'இந்த உலாவியில் நேரடி தலைப்புகள் ஆதரிக்கப்படவில்லை. Chrome அல்லது Edge-ஐ முயற்சிக்கவும்.', listening: 'கேட்கிறது…',
      micBlocked: 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. அனுமதியை வழங்கி மீண்டும் முயற்சிக்கவும்.',
      micFailed: 'மைக்ரோஃபோனைத் தொடங்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.', copyFailed: 'கைமுறையாகத் தேர்ந்தெடுத்து நகலெடுக்கவும்', copied: 'நகலெடுக்கப்பட்டது',
      runsInBrowser: 'அனைத்தும் உங்கள் உலாவியில் இயங்குகிறது. கோப்புகள் எங்கும் பதிவேற்றப்படாது.', heroSub: 'சைகைசிறகு PDF அல்லது PowerPoint வழங்கல்களை நேரடி தலைப்புகளுடன் முழுத்திரையில் காட்டுகிறது — கேட்கும் திறன் குறைபாடு உள்ள மாணவர்கள் ஒவ்வொரு வார்த்தையையும் பின்தொடரலாம்.', featureExport: 'PDF அல்லது PowerPoint கோப்பைத் தேர்ந்தெடுக்கவும். ஸ்லைடுகள் உலாவியில் காட்டப்படும்.', featurePresent: 'தெளிவான வழிசெலுத்தல் மற்றும் தலைப்புகளுடன் கவனச்சிதறல் இல்லாத காட்சியைத் திறக்கவும்.', featureCaptions: 'நீங்கள் பேசும்போது உங்கள் வார்த்தைகள் திரையில் நிகழ்நேரத்தில் தோன்றும்.', accessibilityTitle: 'ஒவ்வொரு வார்த்தையையும் பின்தொடர்வதே எங்கள் நோக்கம்.', browserNote: 'நேரடி தலைப்புகள் Chrome மற்றும் Edge-ல் சிறப்பாக இயங்கும். வழங்கல் எல்லா உலாவிகளிலும் இயங்கும்.'
    },
    hi: {
      skipUpload: 'अपलोड पर जाएं', captionLanguage: 'कैप्शन भाषा', eyebrow: 'सुलभ प्रस्तुति',
      heroTitle: 'हर स्लाइड सुनें और पढ़ें।', uploadDeck: 'प्रस्तुति अपलोड करें', exportPdf: 'PDF के रूप में निर्यात',
      presentFullscreen: 'पूर्ण स्क्रीन में प्रस्तुत करें', startLiveCaptions: 'लाइव कैप्शन शुरू करें', choosePdf: 'प्रस्तुति PDF चुनें',
      removeFile: 'फ़ाइल हटाएं', present: 'प्रस्तुत करें ▸', startCaptions: 'कैप्शन शुरू करें', stopCaptions: 'कैप्शन रोकें',
      captionWaiting: '“कैप्शन शुरू करें” दबाने के बाद कैप्शन यहां दिखाई देंगे।', transcript: 'प्रतिलिपि', copy: 'कॉपी',
      slide: 'स्लाइड', loaded: 'लोड हुआ', reading: 'पढ़ा जा रहा है', invalidFile: 'PDF या PowerPoint (.pptx) फ़ाइल चुनें।',
      noSlides: 'इस फ़ाइल में स्लाइड सामग्री नहीं मिली। इसे PDF में निर्यात करके देखें।',
      unsupported: 'इस ब्राउज़र में लाइव कैप्शन समर्थित नहीं हैं। Chrome या Edge आज़माएं।', listening: 'सुन रहा है…',
      micBlocked: 'माइक्रोफ़ोन अनुमति अवरुद्ध है। अनुमति दें और फिर कैप्शन शुरू करें।',
      micFailed: 'माइक्रोफ़ोन शुरू नहीं हो सका। कृपया फिर कोशिश करें।', copyFailed: 'मैन्युअल रूप से चुनकर कॉपी करें', copied: 'कॉपी हो गया',
      runsInBrowser: 'सब कुछ आपके ब्राउज़र में चलता है। कोई फ़ाइल कहीं अपलोड नहीं होती।', heroSub: 'सைகைசிறகு PDF या PowerPoint को लाइव कैप्शन के साथ पूर्ण स्क्रीन प्रस्तुति में बदलता है, ताकि हर छात्र हर शब्द समझ सके।', featureExport: 'PDF या PowerPoint फ़ाइल चुनें। स्लाइड ब्राउज़र में दिखाई जाएंगी।', featurePresent: 'साफ नेविगेशन और कैप्शन के साथ बिना किसी बाधा का मंच खोलें।', featureCaptions: 'आपके बोलते समय आपके शब्द स्क्रीन पर दिखाई देते हैं।', accessibilityTitle: 'हर शब्द के साथ बने रहना ही हमारा उद्देश्य है।', browserNote: 'लाइव कैप्शन Chrome और Edge में बेहतर काम करते हैं। प्रस्तुति सभी ब्राउज़र में चलती है।'
    }
  };

  // ---------- Element refs ----------
  const $ = (id) => document.getElementById(id);
  const dropzone = $('dropzone');
  const fileInput = $('file-input');
  const uploadStatus = $('upload-status');
  const workspace = $('workspace');
  const slideList = $('slide-list');
  const stagePreview = $('stage-preview');
  const deckNameEl = $('deck-name');
  const currentNumEl = $('current-num');
  const totalNumEl = $('total-num');
  const prevBtn = $('prev-btn');
  const nextBtn = $('next-btn');
  const presentBtn = $('present-btn');
  const resetBtn = $('reset-btn');

  const presentOverlay = $('present-overlay');
  const presentTitle = $('present-title');
  const presentStage = $('present-stage');
  const presentCounter = $('present-counter');
  const presentPrev = $('present-prev');
  const presentNext = $('present-next');
  const exitPresentBtn = $('exit-present-btn');
  const micBtn = $('mic-btn');
  const micBtnLabel = $('mic-btn-label');
  const captionText = $('caption-text');
  const langSelect = $('lang-select');
  const captionSmaller = $('caption-smaller');
  const captionLarger = $('caption-larger');
  const transcriptToggle = $('transcript-toggle');
  const transcriptPanel = $('transcript-panel');
  const transcriptBody = $('transcript-body');
  const copyTranscriptBtn = $('copy-transcript-btn');
  const themeToggle = $('theme-toggle');
  const headerLangSelect = $('header-lang-select');
  const workspaceMicBtn = $('workspace-mic-btn');
  const workspaceMicBtnLabel = $('workspace-mic-btn-label');
  const workspaceLangSelect = $('workspace-lang-select');
  const workspaceCaptionText = $('workspace-caption-text');

  // ---------- Theme ----------
  (function initTheme() {
    const saved = localStorage.getItem('clearstage-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon();
  })();

  function updateThemeIcon() {
    const isDark = getComputedTheme() === 'dark';
    $('theme-icon-sun').style.display = isDark ? 'none' : 'block';
    $('theme-icon-moon').style.display = isDark ? 'block' : 'none';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function getComputedTheme() {
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function t(key) {
    return uiTranslations[uiLanguage][key] || uiTranslations.en[key] || key;
  }

  function applyTranslations() {
    const text = (selector, value) => {
      const element = document.querySelector(selector);
      if (element) element.textContent = t(value);
    };
    text('.skip-link', 'skipUpload');
    text('.eyebrow', 'eyebrow');
    document.querySelector('.hero h1').innerHTML = uiLanguage === 'en'
      ? 'Every slide, heard <em>and</em> read.' : t('heroTitle');
    text('.hero-sub', 'heroSub');
    text('.hero-actions .btn', 'uploadDeck');
    text('.feature:nth-child(1) h3', 'exportPdf');
    text('.feature:nth-child(2) h3', 'presentFullscreen');
    text('.feature:nth-child(3) h3', 'startLiveCaptions');
    text('.feature:nth-child(1) p', 'featureExport');
    text('.feature:nth-child(2) p', 'featurePresent');
    text('.feature:nth-child(3) p', 'featureCaptions');
    text('.dz-title', 'choosePdf');
    text('#reset-btn', 'removeFile');
    text('#present-btn', 'present');
    text('#mic-btn-label', 'startCaptions');
    text('#workspace-mic-btn-label', 'startCaptions');
    text('#transcript-panel h2', 'transcript');
    text('#caption-text', 'captionWaiting');
    text('#workspace-caption-text', 'captionWaiting');
    text('#accessibility h2', 'accessibilityTitle');
    text('.acc-note p', 'browserNote');
    text('.footer-row span:last-child', 'runsInBrowser');
    text('#copy-transcript-btn', 'copy');
    document.querySelectorAll('.sr-only').forEach(element => {
      if (element.textContent.trim() === 'Caption language') element.textContent = t('captionLanguage');
    });
    document.title = `${uiLanguage === 'en' ? 'சைகைசிறகு' : uiLanguage === 'ta' ? 'சைகைசிறகு' : 'सைகைசிறகு'} — Present with live captions`;
  }

  applyTranslations();

  themeToggle.addEventListener('click', () => {
    const next = getComputedTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('clearstage-theme', next);
    updateThemeIcon();
  });

  // ---------- Upload handling ----------
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });
  ['dragenter', 'dragover'].forEach(evt =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); })
  );
  ['dragleave', 'drop'].forEach(evt =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('drag-over'); })
  );
  dropzone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) handleFile(file);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  function setStatus(msg, isError) {
    uploadStatus.textContent = msg;
    uploadStatus.classList.toggle('error', !!isError);
  }

  async function handleFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    deckName = file.name;
    slides = [];
    currentIndex = 0;

    if (ext !== 'pdf' && ext !== 'pptx') {
      setStatus(t('invalidFile'), true);
      return;
    }

    setStatus(`${t('reading')} ${file.name}\u2026`, false);
    try {
      if (ext === 'pdf') await loadPDF(file);
      else await loadPPTX(file);

      if (slides.length === 0) {
        setStatus(t('noSlides'), true);
        return;
      }
      const plural = uiLanguage === 'en' && slides.length !== 1 ? 's' : '';
      setStatus(`${t('loaded')} ${slides.length} ${t('slide')}${plural} from ${file.name}.`, false);
      deckNameEl.textContent = deckName;
      totalNumEl.textContent = slides.length;
      renderSlideList();
      showSlide(0);
      workspace.classList.remove('hidden');
      workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      console.error(err);
      setStatus(err instanceof Error && err.message
        ? err.message
        : 'Something went wrong reading that file. Please check it isn\u2019t corrupted and try again.', true);
    }
  }

  async function loadPDF(file) {
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      slides.push({ kind: 'image', src: canvas.toDataURL('image/png') });
    }
  }

  async function loadPPTX(file) {
    if (!window.pptxPreview || typeof window.pptxPreview.init !== 'function') {
      throw new Error('The browser PowerPoint viewer could not be loaded. Check your internet connection and try again.');
    }
    const renderBuffer = document.createElement('div');
    const viewer = window.pptxPreview.init(renderBuffer, { width: 960, height: 540, mode: 'list' });
    await viewer.preview(await file.arrayBuffer());
    const renderedSlides = [...renderBuffer.querySelectorAll('.pptx-preview-slide-wrapper')];
    if (!renderedSlides.length) throw new Error('No supported slides were found in this PowerPoint.');
    renderedSlides.forEach(node => slides.push({ kind: 'pptx', node }));
  }

  // ---------- Slide list / preview ----------
  function renderSlideList() {
    slideList.innerHTML = '';
    slides.forEach((s, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'button');
      li.tabIndex = 0;
      li.addEventListener('click', () => showSlide(i));
      li.addEventListener('keydown', (e) => { if (e.key === 'Enter') showSlide(i); });

      const thumb = document.createElement('div');
      thumb.className = 'slide-thumb';
      if (s.kind === 'image') {
        const img = document.createElement('img');
        img.src = s.src;
        img.alt = '';
        thumb.appendChild(img);
      } else {
        const numSpan = document.createElement('span');
        numSpan.className = 'slide-thumb-num';
        numSpan.textContent = i + 1;
        thumb.appendChild(numSpan);
      }

      const label = document.createElement('span');
      label.className = 'slide-label';
      label.textContent = `${t('slide')} ${i + 1}`;

      li.appendChild(thumb);
      li.appendChild(label);
      slideList.appendChild(li);
    });
  }

  function buildSlideEl(slide) {
    if (slide.kind === 'pptx') {
      const source = slide.node.cloneNode(true);
      const host = document.createElement('div');
      const width = parseFloat(source.style.width) || 960;
      const height = parseFloat(source.style.height) || 540;
      host.className = 'pptx-host';
      host.style.width = `${width}px`;
      host.style.height = `${height}px`;
      host.style.setProperty('--pptx-width', `${width}px`);
      host.style.setProperty('--pptx-height', `${height}px`);

      const shadow = host.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = `
        :host { display: block; width: var(--pptx-width); height: var(--pptx-height); }
        * { box-sizing: content-box; }
        img { max-width: none; }
      `;
      source.style.margin = '0';
      shadow.append(style, source);
      return host;
    }
    const img = document.createElement('img');
    img.src = slide.src;
    img.alt = `Slide ${currentIndex + 1}`;
    return img;
  }

  function showSlide(i) {
    if (!slides.length) return;
    currentIndex = Math.max(0, Math.min(i, slides.length - 1));
    currentNumEl.textContent = currentIndex + 1;

    stagePreview.innerHTML = '';
    stagePreview.appendChild(buildSlideEl(slides[currentIndex]));
    fitPptxSlide(stagePreview);

    [...slideList.children].forEach((li, idx) => li.classList.toggle('active', idx === currentIndex));

    if (!presentOverlay.classList.contains('hidden')) {
      presentStage.innerHTML = '';
      presentStage.appendChild(buildSlideEl(slides[currentIndex]));
      fitPptxSlide(presentStage);
      presentCounter.textContent = `${currentIndex + 1} / ${slides.length}`;
    }
  }

  function fitPptxSlide(container) {
    const slide = container.querySelector('.pptx-host');
    if (!slide) return;
    requestAnimationFrame(() => {
      const availableWidth = Math.max(0, container.clientWidth - 16);
      const availableHeight = Math.max(0, container.clientHeight - 16);
      const width = parseFloat(slide.style.width) || slide.offsetWidth;
      const height = parseFloat(slide.style.height) || slide.offsetHeight;
      if (!width || !height || !availableWidth || !availableHeight) return;
      const scale = Math.min(availableWidth / width, availableHeight / height, 1);
      slide.style.transform = 'none';
      slide.style.zoom = scale;
    });
  }

  prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

  resetBtn.addEventListener('click', () => {
    slides = [];
    currentIndex = 0;
    workspace.classList.add('hidden');
    fileInput.value = '';
    setStatus('', false);
  });

  // ---------- Present mode ----------
  function enterPresent() {
    if (!slides.length) return;
    presentTitle.textContent = deckName;
    presentOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    showSlide(currentIndex);
    if (presentOverlay.requestFullscreen) {
      presentOverlay.requestFullscreen().catch(() => {});
    }
    presentOverlay.focus();
  }

  function exitPresent() {
    presentOverlay.classList.add('hidden');
    document.body.style.overflow = '';
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    stopMic();
  }

  presentBtn.addEventListener('click', enterPresent);
  exitPresentBtn.addEventListener('click', exitPresent);
  presentPrev.addEventListener('click', () => showSlide(currentIndex - 1));
  presentNext.addEventListener('click', () => showSlide(currentIndex + 1));

  document.addEventListener('keydown', (e) => {
    if (presentOverlay.classList.contains('hidden')) return;
    if (e.target && ['SELECT', 'INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key === 'Escape') exitPresent();
    else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); showSlide(currentIndex + 1); }
    else if (e.key === 'ArrowLeft') showSlide(currentIndex - 1);
    else if (e.key.toLowerCase() === 'c') toggleMic();
  });

  window.addEventListener('resize', () => {
    if (slides.length) showSlide(currentIndex);
  });

  // ---------- Transcript panel ----------
  transcriptToggle.addEventListener('click', () => {
    const showing = !transcriptPanel.classList.contains('hidden');
    transcriptPanel.classList.toggle('hidden', showing);
    transcriptToggle.setAttribute('aria-pressed', String(!showing));
  });

  copyTranscriptBtn.addEventListener('click', async () => {
    await copyTranscript(copyTranscriptBtn);
  });

  async function copyTranscript(button) {
    const text = transcript.map(t => `[${t.time}] ${t.text}`).join('\n');
    try {
      await navigator.clipboard.writeText(text || 'No captions yet.');
      button.textContent = t('copied');
      setTimeout(() => { button.textContent = t('copy'); }, 1600);
    } catch {
      button.textContent = t('copyFailed');
    }
  }

  function addTranscriptLine(text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    transcript.push({ time, text });
    const p = document.createElement('p');
    const span = document.createElement('span');
    span.className = 't-time';
    span.textContent = time;
    p.appendChild(span);
    p.appendChild(document.createTextNode(text));
    transcriptBody.appendChild(p);
    transcriptBody.scrollTop = transcriptBody.scrollHeight;
  }

  // ---------- Caption size ----------
  captionSmaller.addEventListener('click', () => setCaptionSize(captionSize - 0.15));
  captionLarger.addEventListener('click', () => setCaptionSize(captionSize + 0.15));
  function setCaptionSize(size) {
    captionSize = Math.max(1, Math.min(2.6, size));
    document.documentElement.style.setProperty('--caption-size', captionSize + 'rem');
  }

  // ---------- Speech recognition captions ----------
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

  function setLanguage(value) {
    langCode = value;
    uiLanguage = value.startsWith('ta') ? 'ta' : value.startsWith('hi') ? 'hi' : 'en';
    langSelect.value = value;
    headerLangSelect.value = value;
    workspaceLangSelect.value = value;
    applyTranslations();
    if (micOn) { stopMic(); startMic(); }
  }

  langSelect.addEventListener('change', () => {
    setLanguage(langSelect.value);
  });

  headerLangSelect.addEventListener('change', () => {
    setLanguage(headerLangSelect.value);
  });

  workspaceLangSelect.addEventListener('change', () => {
    setLanguage(workspaceLangSelect.value);
  });

  micBtn.addEventListener('click', toggleMic);
  workspaceMicBtn.addEventListener('click', toggleMic);

  function setCaptionText(text) {
    captionText.textContent = text;
    workspaceCaptionText.textContent = text;
  }

  function setMicUI(active) {
    micBtn.setAttribute('aria-pressed', String(active));
    workspaceMicBtn.setAttribute('aria-pressed', String(active));
    micBtnLabel.textContent = active ? t('stopCaptions') : t('startCaptions');
    workspaceMicBtnLabel.textContent = active ? t('stopCaptions') : t('startCaptions');
  }

  function toggleMic() {
    if (micOn) stopMic();
    else startMic();
  }

  function startMic() {
    if (!SpeechRecognitionCtor) {
      setCaptionText(t('unsupported'));
      return;
    }
    userStoppedMic = false;
    recognizer = new SpeechRecognitionCtor();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = langCode;

    recognizer.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) addTranscriptLine(chunk.trim());
        else interim += chunk;
      }
      const lastFinal = transcript.length ? transcript[transcript.length - 1].text : '';
      setCaptionText((interim || lastFinal || '\u2026').trim());
    };

    recognizer.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setCaptionText(t('micBlocked'));
        stopMic();
      }
    };

    recognizer.onend = () => {
      if (micOn && !userStoppedMic) {
        try { recognizer.start(); } catch { /* already starting */ }
      }
    };

    try {
      recognizer.start();
      micOn = true;
      setMicUI(true);
      setCaptionText(t('listening'));
    } catch {
      setCaptionText(t('micFailed'));
    }
  }

  function stopMic() {
    userStoppedMic = true;
    micOn = false;
    setMicUI(false);
    if (recognizer) {
      try { recognizer.stop(); } catch { /* ignore */ }
    }
  }

})();
