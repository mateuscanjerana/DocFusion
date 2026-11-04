/* DocFusion V1 — PDF workspace, 100% client-side.
   Libraries: PDF.js (render), pdf-lib (export), SortableJS (reordering). */
(() => {
  'use strict';
  const A4 = { width: 595.28, height: 841.89 };
  const MAX_FILE_BYTES = 30 * 1024 * 1024;
  const MAX_TOTAL_BYTES = 120 * 1024 * 1024;
  const MAX_PAGES = 240;
  const state = { sources: new Map(), pages: [], selectedId: null, zoom: 1, busy: false, modalEditing: null, renderToken: 0, sortable: null, thumbObserver: null };
  let nextId = 0;
  let dragDepth = 0;
  const uid = (prefix) => `${prefix}-${++nextId}`;
  const $ = (id) => document.getElementById(id);
  const el = {
    fileInput: $('fileInput'), sourceList: $('sourceList'), uploadTile: $('uploadTile'),
    pageGrid: $('pageGrid'), pagesScroll: $('pagesScroll'), workspace: $('workspace'),
    emptyState: $('emptyState'), previewPageWrap: $('previewPageWrap'),
    previewScroll: $('previewScroll'), coverModal: $('coverModal'), coverForm: $('coverForm'),
    coverPreviewCanvas: $('coverPreviewCanvas'), helpModal: $('helpModal'),
    dropOverlay: $('dropOverlay'), exportBtn: $('exportBtn'), exportBtnText: $('exportBtnText')
  };

  function refreshIcons(root = document) {
    try { if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 }, root }); } catch (err) { console.debug('Ícones:', err); }
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  function pageById(id) { return state.pages.find((page) => page.id === id); }
  function selectedPage() { return pageById(state.selectedId); }
  function indexOfSelected() { return state.pages.findIndex((page) => page.id === state.selectedId); }
  function formatSize(bytes) { return bytes < 1048576 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1048576).toFixed(1)} MB`; }
  function toast(message, type = 'success', ms = 4800) {
    const div = document.createElement('div');
    div.className = `toast ${type === 'error' ? 'error' : ''}`;
    div.innerHTML = `<i data-lucide="${type === 'error' ? 'alert-circle' : 'check-circle-2'}"></i><span>${escapeHtml(message)}</span><button type="button" aria-label="Fechar aviso"><i data-lucide="x"></i></button>`;
    div.querySelector('button').addEventListener('click', () => div.remove());
    $('toastArea').appendChild(div);
    refreshIcons();
    setTimeout(() => div.remove(), ms);
  }
  function busy(on, label = '') {
    state.busy = on;
    el.exportBtn.disabled = on || state.pages.length === 0;
    if (label) el.exportBtnText.textContent = label;
    else el.exportBtnText.textContent = 'Exportar PDF';
    el.fileInput.disabled = on;
    $('createCoverBtn').disabled = on;
  }
  function ensureLibraries() {
    if (!window.pdfjsLib || !window.PDFLib) {
      toast('As bibliotecas de PDF não carregaram. Verifique sua conexão com a internet e recarregue a página.', 'error', 9000);
      return false;
    }
    return true;
  }

  async function importFiles(inputFiles) {
    const files = Array.from(inputFiles || []);
    if (!files.length) return;
    if (!ensureLibraries()) return;
    if (state.busy) { toast('Aguarde o processamento atual.', 'error'); return; }
    busy(true, 'Preparando...');
    let added = 0;
    let failed = 0;
    const currentBytes = Array.from(state.sources.values()).reduce((a, item) => a + item.bytes.length, 0);
    let batchBytes = 0;
    try {
      for (let idx = 0; idx < files.length; idx++) {
        const file = files[idx];
        try {
          if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') throw new Error('Arquivo não é PDF');
          if (!file.size) throw new Error('Arquivo vazio');
          if (file.size > MAX_FILE_BYTES) throw new Error('Acima de 30 MB por arquivo');
          if (currentBytes + batchBytes + file.size > MAX_TOTAL_BYTES) throw new Error('Limite total de 120 MB atingido');
          const bytes = new Uint8Array(await file.arrayBuffer());
          // PDF.js takes a copy so that pdf-lib keeps a valid independent buffer.
          const loading = pdfjsLib.getDocument({ data: bytes.slice() });
          let pdfJsDoc = null;
          try {
            pdfJsDoc = await loading.promise;
            if (!pdfJsDoc.numPages) throw new Error('PDF sem páginas');
            if (state.pages.length + pdfJsDoc.numPages > MAX_PAGES) throw new Error('Limite de 240 páginas atingido');
            const libDoc = await PDFLib.PDFDocument.load(bytes.slice(), { updateMetadata: false });
            const sourceId = uid('file');
            state.sources.set(sourceId, { id: sourceId, name: file.name, bytes, size: file.size, pdfJsDoc, libDoc, pageCount: pdfJsDoc.numPages });
            for (let pageIndex = 0; pageIndex < pdfJsDoc.numPages; pageIndex++) {
              state.pages.push({ id: uid('page'), kind: 'pdf', sourceId, pageIndex, rotation: 0 });
            }
            batchBytes += file.size;
            added++;
          } catch (err) {
            if (pdfJsDoc) { try { await pdfJsDoc.destroy(); } catch (_) {} }
            throw err;
          }
        } catch (err) {
          failed++;
          console.warn('Erro ao importar', file.name, err);
          const reason = err?.name === 'PasswordException' ? 'PDF protegido por senha' : (err.message || 'PDF não suportado');
          toast(`${file.name}: ${reason}`, 'error', 7400);
        }
      }
      if (added && !state.selectedId) state.selectedId = state.pages[0]?.id ?? null;
      if (added) toast(`${added} arquivo(s) adicionado(s). Agora organize suas páginas.`);
      if (!added && !failed) toast('Nenhum PDF foi selecionado.', 'error');
    } finally {
      busy(false);
      el.fileInput.value = '';
      renderAll();
    }
  }

  function sourceUsage(id) { return state.pages.filter((page) => page.kind === 'pdf' && page.sourceId === id).length; }
  function renderSources() {
    $('fileCountLabel').textContent = String(state.sources.size);
    if (!state.sources.size) {
      el.sourceList.innerHTML = '<div class="source-placeholder">Seus PDFs aparecerão aqui depois do upload.</div>';
      return;
    }
    el.sourceList.innerHTML = Array.from(state.sources.values()).map((src) => `
      <div class="source-item" title="${escapeHtml(src.name)}">
        <span class="source-file-icon"><i data-lucide="file-text"></i></span>
        <span class="source-meta"><strong>${escapeHtml(src.name)}</strong><small>${src.pageCount} pág. • ${formatSize(src.size)}</small></span>
        <button type="button" class="source-delete" data-remove-source="${src.id}" aria-label="Remover ${escapeHtml(src.name)}" title="Remover arquivo"><i data-lucide="x"></i></button>
      </div>`).join('');
    el.sourceList.querySelectorAll('[data-remove-source]').forEach((button) => button.addEventListener('click', () => removeSource(button.dataset.removeSource)));
  }
  async function removeSource(id) {
    const src = state.sources.get(id);
    if (!src || state.busy) return;
    if (!window.confirm(`Remover “${src.name}” e todas as suas páginas do projeto?`)) return;
    state.pages = state.pages.filter((page) => page.sourceId !== id);
    if (!pageById(state.selectedId)) state.selectedId = state.pages[0]?.id || null;
    state.sources.delete(id);
    try { await src.pdfJsDoc.destroy(); } catch (_) {}
    renderAll();
    toast('Arquivo removido do projeto.');
  }
  async function clearAll() {
    if (!state.pages.length || state.busy) return;
    if (!window.confirm('Limpar o documento inteiro? Esta ação não pode ser desfeita.')) return;
    const sources = Array.from(state.sources.values());
    state.sources.clear(); state.pages = []; state.selectedId = null;
    state.renderToken++;
    renderAll();
    for (const src of sources) { try { await src.pdfJsDoc.destroy(); } catch (_) {} }
    toast('Documento limpo.');
  }

  function renderMetrics() {
    $('statFiles').textContent = String(state.sources.size).padStart(2, '0');
    $('statPages').textContent = String(state.pages.length).padStart(2, '0');
    $('statCovers').textContent = String(state.pages.filter((p) => p.kind === 'cover').length).padStart(2, '0');
    $('boardCount').textContent = String(state.pages.length);
    $('boardSummary').textContent = `${state.pages.length} página${state.pages.length === 1 ? '' : 's'}`;
    const ready = state.pages.length > 0;
    el.emptyState.classList.toggle('hidden', ready);
    el.workspace.classList.toggle('hidden', !ready);
    el.exportBtn.disabled = !ready || state.busy;
    $('exportStatus').textContent = ready ? 'Documento pronto para exportação' : 'Nenhum documento carregado';
    $('exportSubstatus').textContent = ready ? `${state.pages.length} página(s) • PDF final gerado neste dispositivo` : 'Adicione PDFs ou crie uma capa para começar';
  }
  function renderBoard() {
    if (state.thumbObserver) state.thumbObserver.disconnect();
    el.pageGrid.innerHTML = state.pages.map((page, index) => {
      const src = page.kind === 'pdf' ? state.sources.get(page.sourceId) : null;
      const name = page.kind === 'cover' ? 'Capa personalizada' : `${src?.name || 'PDF'} · p. ${page.pageIndex + 1}`;
      return `<div class="page-card ${page.id === state.selectedId ? 'selected' : ''}" data-page-id="${page.id}" role="button" tabindex="0" aria-label="Selecionar página ${index + 1}: ${escapeHtml(name)}" aria-pressed="${page.id === state.selectedId}">
        ${page.kind === 'cover' ? '<span class="cover-card-tag">CAPA</span>' : ''}
        <div class="page-preview-slot" data-thumbnail="${page.id}"><div class="page-skeleton"></div></div>
        <div class="page-meta"><span class="page-num">Página ${String(index + 1).padStart(2, '0')}</span><span class="drag-handle" title="Arrastar página"><i data-lucide="grip-vertical"></i></span></div>
        <div class="page-description" title="${escapeHtml(name)}">${escapeHtml(name)}</div>
      </div>`;
    }).join('');
    el.pageGrid.querySelectorAll('.page-card').forEach((card) => {
      card.addEventListener('click', () => selectPage(card.dataset.pageId));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPage(card.dataset.pageId); }
        if ((event.altKey && event.key === 'ArrowLeft') || (event.altKey && event.key === 'ArrowUp')) { event.preventDefault(); movePage(card.dataset.pageId, -1); }
        if ((event.altKey && event.key === 'ArrowRight') || (event.altKey && event.key === 'ArrowDown')) { event.preventDefault(); movePage(card.dataset.pageId, 1); }
      });
    });
    if (state.sortable) { state.sortable.destroy(); state.sortable = null; }
    if (window.Sortable) {
      state.sortable = new Sortable(el.pageGrid, {
        animation: 170, handle: '.drag-handle', ghostClass: 'sortable-ghost', chosenClass: 'sortable-chosen',
        onEnd(event) {
          if (event.oldIndex == null || event.newIndex == null || event.oldIndex === event.newIndex) return;
          const [moved] = state.pages.splice(event.oldIndex, 1);
          state.pages.splice(event.newIndex, 0, moved);
          renderAll();
        }
      });
    }
    if ('IntersectionObserver' in window) {
      state.thumbObserver = new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) { observer.unobserve(entry.target); drawThumbnail(entry.target.dataset.thumbnail, entry.target); }
        }
      }, { root: el.pagesScroll, rootMargin: '250px 0px' });
      el.pageGrid.querySelectorAll('[data-thumbnail]').forEach((slot) => state.thumbObserver.observe(slot));
    } else {
      el.pageGrid.querySelectorAll('[data-thumbnail]').forEach((slot) => drawThumbnail(slot.dataset.thumbnail, slot));
    }
  }
  async function drawThumbnail(id, slot) {
    const page = pageById(id);
    if (!page || !slot.isConnected) return;
    const canvas = document.createElement('canvas');
    try {
      if (page.kind === 'cover') {
        drawCover(canvas, page.cover, 200);
      } else {
        const src = state.sources.get(page.sourceId);
        if (!src) return;
        const pdfPage = await src.pdfJsDoc.getPage(page.pageIndex + 1);
        const normal = pdfPage.getViewport({ scale: 1, rotation: (pdfPage.rotate + page.rotation) % 360 });
        const scale = Math.min(188 / normal.width, 270 / normal.height);
        const view = pdfPage.getViewport({ scale, rotation: (pdfPage.rotate + page.rotation) % 360 });
        canvas.width = Math.round(view.width); canvas.height = Math.round(view.height);
        await pdfPage.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport: view }).promise;
      }
      if (slot.isConnected && pageById(id)) { slot.replaceChildren(canvas); }
    } catch (err) {
      console.warn('Falha na miniatura:', err);
      if (slot.isConnected) slot.innerHTML = '<span style="color:#aaa;font-size:10px">Prévia indisponível</span>';
    }
  }
  function selectPage(id) {
    if (!pageById(id)) return;
    state.selectedId = id;
    el.pageGrid.querySelectorAll('.page-card').forEach((card) => {
      const isSelected = card.dataset.pageId === id;
      card.classList.toggle('selected', isSelected);
      card.setAttribute('aria-pressed', String(isSelected));
    });
    renderSelectedPreview();
  }
  function movePage(id, delta) {
    const from = state.pages.findIndex((p) => p.id === id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= state.pages.length) return;
    const [page] = state.pages.splice(from, 1);
    state.pages.splice(to, 0, page);
    renderAll();
    el.pageGrid.querySelector(`[data-page-id="${id}"]`)?.focus();
  }
  function nextPage(step) {
    if (!state.pages.length) return;
    const idx = indexOfSelected();
    const next = Math.max(0, Math.min(state.pages.length - 1, idx + step));
    selectPage(state.pages[next].id);
    el.pageGrid.querySelector(`[data-page-id="${state.selectedId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function renderSelectedPreview() {
    const page = selectedPage();
    const token = ++state.renderToken;
    if (!page) { el.previewPageWrap.replaceChildren(); return; }
    const index = indexOfSelected();
    const src = page.kind === 'pdf' ? state.sources.get(page.sourceId) : null;
    $('selectedDetails').textContent = page.kind === 'cover' ? 'Capa personalizada • A4' : `${src?.name || 'Documento'} • Página ${page.pageIndex + 1}`;
    $('previewFooterLabel').textContent = page.kind === 'cover' ? 'Capa personalizada' : (src?.name || 'PDF');
    $('paginationLabel').textContent = `${index + 1} / ${state.pages.length}`;
    $('zoomLabel').textContent = `${Math.round(state.zoom * 100)}%`;
    $('prevPageBtn').disabled = index <= 0;
    $('nextPageBtn').disabled = index === state.pages.length - 1;
    $('editCoverBtn').hidden = page.kind !== 'cover';
    $('rotateLeftBtn').disabled = page.kind === 'cover';
    $('rotateRightBtn').disabled = page.kind === 'cover';
    const width = Math.max(240, Math.min(570, el.previewScroll.clientWidth - 65)) * state.zoom;
    const ratio = Math.min(2, window.devicePixelRatio || 1.5);
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', `Página ${index + 1} do documento`);
    (async () => {
      try {
        if (page.kind === 'cover') {
          drawCover(canvas, page.cover, Math.floor(width * ratio));
          canvas.style.width = `${width}px`;
          canvas.style.height = 'auto';
        } else {
          if (!src) return;
          const pdfPage = await src.pdfJsDoc.getPage(page.pageIndex + 1);
          if (token !== state.renderToken) return;
          const rotation = (pdfPage.rotate + page.rotation) % 360;
          const normal = pdfPage.getViewport({ scale: 1, rotation });
          const scale = width / normal.width;
          const viewport = pdfPage.getViewport({ scale: scale * ratio, rotation });
          if (viewport.width * viewport.height > 16000000) throw new Error('Prévia excede o limite seguro de memória');
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          canvas.style.width = `${Math.round(viewport.width / ratio)}px`;
          canvas.style.height = `${Math.round(viewport.height / ratio)}px`;
          await pdfPage.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport }).promise;
        }
        if (token === state.renderToken) el.previewPageWrap.replaceChildren(canvas);
      } catch (err) {
        console.warn(err);
        if (token === state.renderToken) { el.previewPageWrap.innerHTML = '<p style="color:#cbd2df;font-size:12px;padding:30px">Não foi possível visualizar esta página.</p>'; }
      }
    })();
  }
  function renderAll() { renderSources(); renderMetrics(); if (state.pages.length) { renderBoard(); renderSelectedPreview(); } else { state.renderToken++; el.previewPageWrap.replaceChildren(); } refreshIcons(); }

  function deleteSelected() {
    if (state.busy) return;
    const idx = indexOfSelected();
    if (idx < 0) return;
    state.pages.splice(idx, 1);
    state.selectedId = state.pages[Math.min(idx, state.pages.length - 1)]?.id || null;
    renderAll();
    toast('Página removida.');
  }
  function duplicateSelected() {
    const page = selectedPage();
    if (!page || state.busy) return;
    if (state.pages.length >= MAX_PAGES) { toast('Limite de 240 páginas atingido.', 'error'); return; }
    const clone = { ...page, id: uid('page'), ...(page.kind === 'cover' ? { cover: { ...page.cover } } : {}) };
    state.pages.splice(indexOfSelected() + 1, 0, clone);
    state.selectedId = clone.id;
    renderAll();
    toast('Página duplicada.');
  }
  function rotateSelected(direction) {
    const page = selectedPage();
    if (!page || page.kind !== 'pdf' || state.busy) return;
    page.rotation = (page.rotation + direction + 360) % 360;
    renderAll();
  }

  // A4 cover is drawn on Canvas so accents, punctuation and international text
  // are rendered correctly even without a custom embedded PDF font.
  function drawCover(canvas, cover, pixelWidth = 595) {
    canvas.width = Math.round(pixelWidth);
    canvas.height = Math.round(pixelWidth * A4.height / A4.width);
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.setTransform(canvas.width / A4.width, 0, 0, canvas.height / A4.height, 0, 0);
    ctx.clearRect(0, 0, A4.width, A4.height);
    const t = cover.template;
    const isMinimal = t === 'minimal';
    const isEditorial = t === 'editorial';
    let ink = '#ffffff', detail = '#ffb49a';
    if (t === 'aurora') {
      const grd = ctx.createLinearGradient(0, 0, 595, 842);
      grd.addColorStop(0, '#151d38'); grd.addColorStop(.57, '#353044'); grd.addColorStop(1, '#aa6060');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, 595, 842);
      ctx.fillStyle = '#ffffff08'; ctx.beginPath(); ctx.arc(550, 110, 260, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff0c'; ctx.beginPath(); ctx.arc(420, 730, 210, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffffff22'; ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(390 + i * 30, 0); ctx.lineTo(595, 260 - i * 21); ctx.stroke(); }
      ctx.fillStyle = detail; ctx.fillRect(65, 71, 45, 5);
    } else if (isMinimal) {
      ctx.fillStyle = '#f9faf8'; ctx.fillRect(0, 0, 595, 842);
      ctx.fillStyle = '#f0f2f1'; ctx.fillRect(0, 0, 145, 842);
      ctx.fillStyle = '#d67f68'; ctx.fillRect(145, 0, 6, 842);
      ctx.fillStyle = '#e8d1c8'; ctx.beginPath(); ctx.arc(540, 55, 150, 0, 2 * Math.PI); ctx.fill();
      ink = '#1e2932'; detail = '#be6857';
    } else if (isEditorial) {
      ctx.fillStyle = '#e9ddc7'; ctx.fillRect(0, 0, 595, 842);
      ctx.fillStyle = '#22303a'; ctx.fillRect(0, 578, 595, 264);
      ctx.fillStyle = '#b68b63'; ctx.fillRect(0, 566, 595, 12);
      ctx.strokeStyle = '#b69f7d'; ctx.lineWidth = 1.4; ctx.strokeRect(44, 40, 507, 490);
      ink = '#20313b'; detail = '#996e4d';
    }
    function text(content, x, y, size, color, weight = 400, family = 'sans-serif') {
      ctx.font = `${weight} ${size}px ${family}`; ctx.fillStyle = color; ctx.fillText(content, x, y);
    }
    function wrap(content, x, y, maxWidth, fontSize, lineHeight, maxLines, color, weight = 700) {
      const words = String(content || '').trim().split(/\s+/);
      ctx.font = `${weight} ${fontSize}px system-ui, sans-serif`;
      const lines = [];
      let line = '';
      for (const word of words) {
        const attempt = line ? `${line} ${word}` : word;
        if (ctx.measureText(attempt).width <= maxWidth) line = attempt;
        else if (line) { lines.push(line); line = word; }
        else {
          let partial = '';
          for (const char of word) { if (ctx.measureText(partial + char).width > maxWidth && partial) { lines.push(partial); partial = char; } else partial += char; }
          line = partial;
        }
      }
      if (line) lines.push(line);
      const limited = lines.slice(0, maxLines);
      for (let i = 0; i < limited.length; i++) text(limited[i], x, y + i * lineHeight, fontSize, color, weight, 'system-ui, sans-serif');
      return limited.length * lineHeight;
    }
    if (isEditorial) {
      text('D O C F U S I O N   /   S T U D I O', 67, 91, 11, detail, 700);
      const titleHeight = wrap(cover.title, 65, 208, 460, 42, 52, 5, ink, 800);
      wrap(cover.subtitle, 67, Math.min(440, 215 + titleHeight), 450, 16, 25, 3, '#56636a', 400);
      text('PREPARADO POR', 67, 660, 11, '#b9a48c', 700);
      wrap(cover.author, 67, 694, 455, 20, 27, 2, '#f9f4e7', 650);
      text(cover.date || '', 67, 792, 12, '#d9c7a8', 500);
      text('01', 515, 792, 12, '#d9c7a8', 600);
    } else {
      const offsetX = isMinimal ? 184 : 65;
      const contentWidth = isMinimal ? 356 : 465;
      text('D O C F U S I O N  /  S T U D I O', offsetX, isMinimal ? 98 : 115, 10, detail, 800);
      const top = isMinimal ? 235 : 289;
      const titleSize = isMinimal ? 37 : 43;
      const titleHeight = wrap(cover.title, offsetX, top, contentWidth, titleSize, titleSize + 12, 5, ink, 800);
      wrap(cover.subtitle, offsetX, Math.min(top + titleHeight + 24, 620), contentWidth, 17, 26, 4, isMinimal ? '#707a85' : '#dbd5e3', 400);
      ctx.fillStyle = detail; ctx.fillRect(offsetX, 697, 39, 3);
      text((cover.author || '').slice(0, 85), offsetX, 737, 14, ink, 600);
      text((cover.date || '').slice(0, 55), offsetX, 772, 11, isMinimal ? '#79818c' : '#d5c4cd', 400);
      if (!isMinimal) {
        ctx.strokeStyle = '#ffffff33'; ctx.strokeRect(65, 820, 465, 0.7);
      }
    }
    return canvas;
  }
  function formCoverData() {
    const form = el.coverForm;
    return {
      template: form.querySelector('[name="template"]:checked')?.value || 'aurora',
      title: $('coverTitle').value.trim(), subtitle: $('coverSubtitle').value.trim(),
      author: $('coverAuthor').value.trim(), date: $('coverDate').value.trim()
    };
  }
  function updateCoverPreview() {
    const cover = formCoverData();
    drawCover(el.coverPreviewCanvas, cover, 590);
  }
  function openCoverModal(edit = false) {
    if (state.busy) return;
    let page = null;
    if (edit) {
      page = selectedPage();
      if (!page || page.kind !== 'cover') return;
    }
    state.modalEditing = page?.id || null;
    el.coverForm.reset();
    if (page) {
      const cover = page.cover;
      el.coverForm.querySelector(`[name="template"][value="${cover.template}"]`).checked = true;
      $('coverTitle').value = cover.title; $('coverSubtitle').value = cover.subtitle;
      $('coverAuthor').value = cover.author; $('coverDate').value = cover.date;
    } else {
      $('coverDate').value = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      $('coverPosition').value = state.pages.length ? 'after' : 'start';
    }
    $('coverPosition').closest('label');
    $('coverPosition').style.display = edit ? 'none' : '';
    $('coverPosition').previousElementSibling.style.display = edit ? 'none' : '';
    $('coverHeading').textContent = edit ? 'Editar capa' : 'Personalize sua capa';
    $('saveCoverBtn').querySelector('span').textContent = edit ? 'Salvar alterações' : 'Adicionar capa';
    el.coverModal.classList.remove('hidden');
    el.coverModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateCoverPreview();
    refreshIcons();
    $('coverTitle').focus();
  }
  function closeModal(modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function saveCover(event) {
    event.preventDefault();
    const cover = formCoverData();
    if (!cover.title) { toast('Informe um título para a capa.', 'error'); return; }
    if (state.modalEditing) {
      const page = pageById(state.modalEditing);
      if (page?.kind === 'cover') page.cover = cover;
      toast('Capa atualizada.');
    } else {
      if (state.pages.length >= MAX_PAGES) { toast('Limite de 240 páginas atingido.', 'error'); return; }
      const page = { id: uid('page'), kind: 'cover', cover };
      const position = $('coverPosition').value;
      const selectedIndex = indexOfSelected();
      const insertAt = position === 'start' ? 0 : position === 'after' && selectedIndex >= 0 ? selectedIndex + 1 : state.pages.length;
      state.pages.splice(insertAt, 0, page);
      state.selectedId = page.id;
      toast('Nova capa adicionada ao documento.');
    }
    closeModal(el.coverModal);
    renderAll();
  }

  async function exportPDF() {
    if (!state.pages.length || state.busy) return;
    if (!ensureLibraries()) return;
    busy(true, 'Exportando...');
    try {
      const output = await PDFLib.PDFDocument.create();
      output.setTitle('Documento criado com DocFusion');
      output.setCreator('DocFusion V1');
      output.setProducer('DocFusion V1 — pdf-lib');
      for (let i = 0; i < state.pages.length; i++) {
        const page = state.pages[i];
        el.exportBtnText.textContent = `Página ${i + 1}/${state.pages.length}`;
        if (page.kind === 'pdf') {
          const source = state.sources.get(page.sourceId);
          if (!source) throw new Error('Arquivo original não encontrado para uma das páginas.');
          const copied = (await output.copyPages(source.libDoc, [page.pageIndex]))[0];
          if (page.rotation) copied.setRotation(PDFLib.degrees((copied.getRotation().angle + page.rotation) % 360));
          output.addPage(copied);
        } else {
          const coverCanvas = document.createElement('canvas');
          drawCover(coverCanvas, page.cover, 1340);
          const png = await output.embedPng(coverCanvas.toDataURL('image/png'));
          const newPage = output.addPage([A4.width, A4.height]);
          newPage.drawImage(png, { x: 0, y: 0, width: A4.width, height: A4.height });
        }
        // Yield a frame for large files and keep the UI responsive.
        if (i % 3 === 0) await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      el.exportBtnText.textContent = 'Gerando PDF...';
      const bytes = await output.save({ useObjectStreams: true });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `docfusion-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(anchor);
      anchor.click(); anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      toast(`PDF exportado com ${state.pages.length} página(s)!`);
    } catch (err) {
      console.error('Erro ao exportar:', err);
      toast(`Falha na exportação: ${err.message || 'erro desconhecido'}`, 'error', 8500);
    } finally { busy(false); }
  }

  function initDrop() {
    el.uploadTile.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); el.fileInput.click(); }
    });
    window.addEventListener('dragenter', (event) => {
      if (!event.dataTransfer?.types?.includes('Files')) return;
      event.preventDefault(); dragDepth++;
      el.dropOverlay.classList.remove('hidden');
    });
    window.addEventListener('dragover', (event) => {
      if (!event.dataTransfer?.types?.includes('Files')) return;
      event.preventDefault(); event.dataTransfer.dropEffect = 'copy';
    });
    window.addEventListener('dragleave', (event) => {
      if (!event.dataTransfer?.types?.includes('Files')) return;
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) el.dropOverlay.classList.add('hidden');
    });
    window.addEventListener('drop', (event) => {
      event.preventDefault(); dragDepth = 0;
      el.dropOverlay.classList.add('hidden');
      if (event.dataTransfer?.files?.length) importFiles(event.dataTransfer.files);
    });
  }
  function init() {
    if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    el.fileInput.addEventListener('change', (event) => importFiles(event.target.files));
    $('createCoverBtn').addEventListener('click', () => openCoverModal());
    $('clearBtn').addEventListener('click', clearAll);
    $('rotateLeftBtn').addEventListener('click', () => rotateSelected(-90));
    $('rotateRightBtn').addEventListener('click', () => rotateSelected(90));
    $('duplicateBtn').addEventListener('click', duplicateSelected);
    $('deletePageBtn').addEventListener('click', deleteSelected);
    $('editCoverBtn').addEventListener('click', () => openCoverModal(true));
    $('prevPageBtn').addEventListener('click', () => nextPage(-1));
    $('nextPageBtn').addEventListener('click', () => nextPage(1));
    $('zoomInBtn').addEventListener('click', () => { state.zoom = Math.min(2, Math.round((state.zoom + .25) * 100) / 100); renderSelectedPreview(); });
    $('zoomOutBtn').addEventListener('click', () => { state.zoom = Math.max(.5, Math.round((state.zoom - .25) * 100) / 100); renderSelectedPreview(); });
    el.exportBtn.addEventListener('click', exportPDF);
    el.coverForm.addEventListener('submit', saveCover);
    el.coverForm.addEventListener('input', updateCoverPreview);
    el.coverForm.addEventListener('change', updateCoverPreview);
    $('closeCoverBtn').addEventListener('click', () => closeModal(el.coverModal));
    $('cancelCoverBtn').addEventListener('click', () => closeModal(el.coverModal));
    $('helpBtn').addEventListener('click', () => { el.helpModal.classList.remove('hidden'); el.helpModal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; });
    $('closeHelpBtn').addEventListener('click', () => closeModal(el.helpModal));
    document.querySelectorAll('[data-close-modal]').forEach((backdrop) => backdrop.addEventListener('click', () => closeModal(backdrop.parentElement)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (!el.coverModal.classList.contains('hidden')) closeModal(el.coverModal);
        if (!el.helpModal.classList.contains('hidden')) closeModal(el.helpModal);
        return;
      }
      const tag = document.activeElement?.tagName;
      if (!el.workspace.classList.contains('hidden') && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && !event.ctrlKey && !event.metaKey) {
        if (event.key === 'Delete' && el.coverModal.classList.contains('hidden') && el.helpModal.classList.contains('hidden')) deleteSelected();
      }
    });
    initDrop(); renderAll();
    if (!ensureLibraries()) console.warn('Dependências ausentes: confira conexão e bloqueadores de scripts.');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
