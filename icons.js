/* Tiny local SVG icon collection inspired by Lucide (ISC licensed).
   Keeping icons local makes the UI independent from icon CDNs. */
(() => {
  const d = {
    'layers-3':'<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
    'folder-open':'<path d="M3 7V5a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v2"/><path d="M3 11h18l-3 9H6l-3-9Z"/>',
    'file-up':'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7Z"/><path d="M13 2v7h7M12 18v-7m-3 3 3-3 3 3"/>',
    'plus':'<path d="M12 5v14M5 12h14"/>',
    'file-text':'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7Z"/><path d="M13 2v7h7M8 13h8M8 17h8"/>',
    'panel-top':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/>',
    'file-pen-line':'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7M13 2v7h7M20 12l2 2-7 7-3 1 1-3 7-7Z"/>',
    'chevron-right':'<path d="m9 18 6-6-6-6"/>',
    'chevron-left':'<path d="m15 18-6-6 6-6"/>',
    'chevron-down':'<path d="m6 9 6 6 6-6"/>',
    'shield-check':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    'circle-help':'<circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 1 1 4.3 1.7c-.8.7-1.8 1.2-1.8 2.8M12 17h.01"/>',
    'sparkles':'<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3ZM19 18l.6 1.4L21 20l-1.4.6L19 22l-.6-1.4L17 20l1.4-.6L19 18Z"/>',
    'files':'<path d="M15 2H6a2 2 0 0 0-2 2v13h2M9 6h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"/>',
    'book-open':'<path d="M12 7a9 9 0 0 0-9-3v15a9 9 0 0 1 9 2 9 9 0 0 1 9-2V4a9 9 0 0 0-9 3ZM12 7v14"/>',
    'layout-template':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/>',
    'wand-sparkles':'<path d="m3 21 13-13 4 4L7 25M14 8l2-2 4 4-2 2M4 3v4M2 5h4M19 2v4M17 4h4"/>',
    'upload-cloud':'<path d="M20 16a4 4 0 0 0-1-7.9A7 7 0 0 0 5.7 10 4 4 0 0 0 6 18h3M12 22V12m-4 4 4-4 4 4"/>',
    'arrow-up-right':'<path d="M7 17 17 7M7 7h10v10"/>',
    'lock-keyhole':'<rect x="5" y="10" width="14" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v3"/>',
    'lightbulb':'<path d="M9 18h6M10 22h4M8 15a6 6 0 1 1 8 0l-1 3H9l-1-3Z"/>',
    'check':'<path d="m4 12 5 5L20 6"/>',
    'file-type':'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7Z"/><path d="M13 2v7h7M7 16h10M7 19h6"/>',
    'download':'<path d="M12 3v12m-4-4 4 4 4-4M4 17v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    'trash-2':'<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 10v7M14 10v7"/>',
    'grip-vertical':'<circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/>',
    'eye':'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    'rotate-ccw':'<path d="M3 11a9 9 0 1 1 2.6 6.4M3 4v7h7"/>',
    'rotate-cw':'<path d="M21 11a9 9 0 1 0-2.6 6.4M21 4v7h-7"/>',
    'copy-plus':'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h2M11 14h7m-3.5-3.5v7"/>',
    'pencil':'<path d="m16 4 4 4-12 12-5 1 1-5L16 4Z M14 6l4 4"/>',
    'minus':'<path d="M5 12h14"/>',
    'x':'<path d="M18 6 6 18M6 6l12 12"/>',
    'check-circle-2':'<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
    'alert-circle':'<circle cx="12" cy="12" r="10"/><path d="M12 7v6M12 17h.01"/>'
  };
  function createIcons() {
    document.querySelectorAll('i[data-lucide]').forEach((placeholder) => {
      const name = placeholder.getAttribute('data-lucide');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '18');
      svg.setAttribute('height', '18');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '1.8');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = d[name] || d['circle-help'];
      placeholder.replaceWith(svg);
    });
  }
  window.lucide = { createIcons };
})();
