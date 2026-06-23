import { BACKEND_URL, keywordDatabase, analyzeStepLabels } from './data.js';
import { $, getLevel, deduplicateArray, band, escapeHtml, showToast, calculateGlobalScore } from './utils.js';

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

function clearActiveAnalysis() {
  clearInterval(scoreInterval);
  clearInterval(analyzeInterval);
  state.analysis = null;
  state.displayedScore = 0;
  state.checked = {};
  state.currentHistoryIndex = -1;
  showView('input');
}

// ===== State =====
const state = {
  step: 'input',
  tab: 'overview',
  cvMode: 'file',
  offerMode: 'file',
  displayedScore: 0,
  targetScore: 0,
  checked: {},
  cvText: '',
  offerText: '',
  analysis: null,
  fileContent: { cv: null, offer: null },
  currentHistoryIndex: -1,
  copied: null,
};

let historyIdCounter = 0;
const STORAGE_KEY = 'applyfit_history';

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        historyIdCounter = parsed.reduce((max, h) => Math.max(max, h.id || 0), 0);
        return parsed;
      }
    }
  } catch {
    // localStorage unavailable or corrupted
  }
  return [];
}

function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
  } catch {
    // localStorage unavailable
  }
}

const historyData = loadHistory();

let scoreInterval = null;
let analyzeInterval = null;
let copyTimeout = null;
const modeSetters = {};

// ===== DOM refs =====
const viewInput = $('viewInput');
const viewAnalyzing = $('viewAnalyzing');
const viewResults = $('viewResults');
const isResultsPage = !viewInput && !viewAnalyzing && !!viewResults;

function showView(name) {
  if (viewInput) viewInput.classList.remove('active');
  if (viewAnalyzing) viewAnalyzing.classList.remove('active');
  if (viewResults) viewResults.classList.remove('active');
  if (name === 'input' && viewInput) viewInput.classList.add('active');
  else if (name === 'analyzing' && viewAnalyzing) viewAnalyzing.classList.add('active');
  else if (name === 'results' && viewResults) viewResults.classList.add('active');
}

// ===== Tab switching =====
function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab-content').forEach((el) => el.classList.remove('active'));
  const el = $('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (el) el.classList.add('active');

  const btnMap = { overview: 'tabOverviewBtn', skills: 'tabSkillsBtn', plan: 'tabPlanBtn' };
  document.querySelectorAll('.tab-btn, .tab-card').forEach((btn) => {
    const isActive = btn.id === btnMap[tab];
    btn.classList.toggle('active', isActive);
    if (btn.classList.contains('tab-card')) {
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
    const iconBox = btn.querySelector('.tab-icon');
    if (iconBox) {
      iconBox.classList.toggle('active', isActive);
      iconBox.classList.toggle('inactive', !isActive);
      const paths = iconBox.querySelectorAll('svg path');
      paths.forEach((p) => {
        if (p.getAttribute('stroke') && p.getAttribute('stroke') !== '#fff') {
          p.setAttribute('stroke', isActive ? '#2F6BFF' : '#7A8699');
        }
      });
    }
    const subText = btn.querySelector('.tab-subtitle, .tab-subtitle-light');
    if (subText) subText.className = isActive ? 'tab-subtitle' : 'tab-subtitle-light';
    const dot = btn.querySelector('.tab-dot');
    if (dot) {
      dot.classList.toggle('active', isActive);
      dot.classList.toggle('inactive', !isActive);
    }
    const badge = btn.querySelector('[id$="Badge"]');
    if (badge) {
      badge.classList.toggle('active', isActive);
      badge.classList.toggle('inactive', !isActive);
    }
  });
}

// ===== Mode toggling (Importer/Coller) =====
function setupModeToggle(type) {
  const fileBtn = $(type + 'FileMode');
  const pasteBtn = $(type + 'PasteMode');
  const filePanel = $(type + 'FilePanel');
  const pastePanel = $(type + 'PastePanel');
  const textarea = $(type + 'Text');

  function setMode(mode) {
    if (mode === 'file') {
      state[type + 'Mode'] = 'file';
      fileBtn.classList.add('active');
      pasteBtn.classList.remove('active');
      pasteBtn.style.background = 'transparent';
      pasteBtn.style.color = '#5B6678';
      fileBtn.style.background = '#101826';
      fileBtn.style.color = '#fff';
      fileBtn.style.boxShadow = '0 1px 2px rgba(16,24,38,.25)';
      filePanel.style.display = 'block';
      pastePanel.style.display = 'none';
    } else {
      state[type + 'Mode'] = 'paste';
      pasteBtn.classList.add('active');
      fileBtn.classList.remove('active');
      fileBtn.style.background = 'transparent';
      fileBtn.style.color = '#5B6678';
      pasteBtn.style.background = '#101826';
      pasteBtn.style.color = '#fff';
      pasteBtn.style.boxShadow = '0 1px 2px rgba(16,24,38,.25)';
      filePanel.style.display = 'none';
      pastePanel.style.display = 'block';
    }
  }

  modeSetters[type] = setMode;

  fileBtn.addEventListener('click', () => setMode('file'));
  pasteBtn.addEventListener('click', () => setMode('paste'));

  textarea.addEventListener('input', () => {
    state[type + 'Text'] = textarea.value;
    checkCanAnalyze();
  });

  setMode(state[type + 'Mode']);
}

// ===== File upload & drag-drop =====
async function readPDFContent(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map((item) => item.str).join(' ') + '\n';
  }
  return fullText;
}

function readFileContent(file) {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      readPDFContent(file).then(resolve).catch(reject);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}

function setupFileUpload(type) {
  const fileInput = $(type + 'FileInput');
  const fileInfo = $(type + 'FileInfo');
  const fileName = $(type + 'FileName');
  const removeBtn = $(type + 'RemoveFile');
  const dropZone = $(type + 'DropZone');
  const textarea = $(type + 'Text');
  const dropCard = document.querySelector(`[data-drop="${type}"]`);

  let dragCounter = 0;

  function showDragOver() {
    dropZone.style.borderColor = type === 'cv' ? '#2F6BFF' : '#D98A00';
    dropZone.style.background = type === 'cv' ? 'rgba(47,107,255,.04)' : 'rgba(217,138,0,.04)';
    dropCard.classList.add('drag-over');
  }

  function hideDragOver() {
    dropZone.style.borderColor = '#CBD5E6';
    dropZone.style.background = '#FAFBFD';
    dropCard.classList.remove('drag-over');
  }

  async function handleFile(file) {
    if (!file) return;
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('Fichier trop volumineux. Taille maximum : 5 Mo.', 'error');
      return;
    }
    const allowedTypes = ['text/plain', 'application/pdf'];
    const allowedExt = ['.txt', '.pdf'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExt.includes(ext)) {
      showToast('Format non supporté. Utilisez PDF ou TXT.', 'error');
      return;
    }
    try {
      const content = await readFileContent(file);
      state.fileContent[type] = content;
      fileName.textContent = file.name;
      fileInfo.classList.add('active');
      textarea.value = content;
      state[type + 'Text'] = content;
      checkCanAnalyze();
    } catch {
      showToast("Erreur lors de la lecture du fichier. Vérifiez qu'il n'est pas protégé par mot de passe.", 'error');
    }
  }

  function removeFile() {
    state.fileContent[type] = null;
    fileInput.value = '';
    fileInfo.classList.remove('active');
    textarea.value = '';
    state[type + 'Text'] = '';
    checkCanAnalyze();
  }

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    if (dragCounter === 1) showDragOver();
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      hideDragOver();
    }
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    hideDragOver();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
  removeBtn.addEventListener('click', removeFile);
}

function checkCanAnalyze() {
  const cvOk = (state.cvText || '').trim().length > 0;
  const offerOk = (state.offerText || '').trim().length > 0;
  const btn = $('analyzeBtn');
  const hintBox = $('hintBox');

  if (cvOk && offerOk) {
    btn.disabled = false;
    btn.classList.add('ready');
    hintBox.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2l6 3v5c0 3.5-2.5 6.5-6 8-3.5-1.5-6-4.5-6-8V5l6-3z" stroke="#5B6678" stroke-width="1.4" stroke-linejoin="round"/></svg>Analyse IA · aucun stockage de vos documents';
    hintBox.style.color = '#5B6678';
  } else {
    btn.disabled = true;
    btn.classList.remove('ready');
    hintBox.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2l6 3v5c0 3.5-2.5 6.5-6 8-3.5-1.5-6-4.5-6-8V5l6-3z" stroke="#C0322E" stroke-width="1.4" stroke-linejoin="round"/></svg>Ajoutez votre CV et l\'offre pour lancer l\'analyse';
    hintBox.style.color = '#C0322E';
  }
}

// ===== Analyze steps =====
function renderAnalyzeSteps(index) {
  const container = $('analyzeSteps');
  container.innerHTML = analyzeStepLabels
    .map((label, i) => {
      const done = i < index;
      const active = i === index;
      let dotBg, checkOp, textColor;
      if (done) {
        dotBg = '#16A34A';
        checkOp = '1';
        textColor = '#101826';
      } else if (active) {
        dotBg = '#2F6BFF';
        checkOp = '0';
        textColor = '#101826';
      } else {
        dotBg = '#D7DEEA';
        checkOp = '0';
        textColor = '#9AA4B2';
      }
      return `<div class="analyze-step">
      <div class="step-dot" style="background:${dotBg};">
        <span style="opacity:${checkOp};display:flex;"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M4 8.5l2.5 2.5 5-6" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </div>
      <span class="step-label" style="color:${textColor};">${label}</span>
    </div>`;
    })
    .join('');
}

// ===== History =====
function renderHistory(activeIndex) {
  $('historyList').innerHTML = historyData
    .map((h, i) => {
      const b = band(h.score);
      const isActive = i === (activeIndex !== undefined ? activeIndex : 0);
      return `<div class="history-item" data-index="${i}" style="background:${isActive ? 'rgba(47,107,255,.14)' : 'transparent'};">
      <div style="width:38px;height:38px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;background:${b.bg};color:${b.color};">${h.score}</div>
      <div style="min-width:0;flex:1;">
        <div class="history-job-title" data-index="${i}" style="font-size:13px;font-weight:600;color:${isActive ? '#fff' : '#C7D0DE'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:text;">${escapeHtml(h.job)}</div>
        <div style="font-size:11px;color:#6B7689;">${h.date}</div>
      </div>
      <button class="history-delete" title="Supprimer" style="width:26px;height:26px;border-radius:6px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0;transition:opacity .15s,background .15s;" onmouseover="this.style.opacity='1';this.style.background='rgba(255,255,255,.08)'" onmouseout="this.style.opacity='0';this.style.background='transparent'">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#9AA4B2" stroke-width="1.7" stroke-linecap="round"/></svg>
      </button>
    </div>`;
    })
    .join('');

  $('historyList')
    .querySelectorAll('.history-item')
    .forEach((el) => {
      const idx = parseInt(el.dataset.index);
      const deleteBtn = el.querySelector('.history-delete');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const wasActive = idx === state.currentHistoryIndex;
        historyData.splice(idx, 1);
        saveHistory();
        if (wasActive) clearActiveAnalysis();
        if (historyData.length === 0) {
          $('historyList').innerHTML =
            '<div style="padding:20px 12px;text-align:center;font-size:13px;color:#5B6678;">Aucune analyse</div>';
          return;
        }
        const newIdx = Math.min(idx, historyData.length - 1);
        renderHistory(newIdx);
      });
      el.addEventListener('click', (e) => {
        if (e.target.closest('.history-delete') || e.target.closest('.history-job-title')) return;
        renderHistory(idx);
        loadHistoryAnalysis(idx);
      });
    });

  $('historyList')
    .querySelectorAll('.history-job-title')
    .forEach((el) => {
      makeJobTitleEditable(el, (val) => commitJobTitle(val));
    });
}

function loadHistoryAnalysis(index) {
  const entry = historyData[index];
  if (!entry || !entry.analysis) return;
  state.currentHistoryIndex = index;
  state.analysis = JSON.parse(JSON.stringify(entry.analysis));
  state.checked = { ...(entry.checked || {}) };
  state.targetScore = state.analysis.globalScore;
  enterResults(true);
}

function saveAnalysisToHistory() {
  const a = state.analysis;
  if (!a) return;
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString('fr-FR', { month: 'short' });
  const label = 'Analyse du ' + day + ' ' + month;
  historyData.unshift({
    id: ++historyIdCounter,
    job: label,
    score: a.globalScore,
    date: day + ' ' + month,
    analysis: JSON.parse(JSON.stringify(a)),
    checked: { ...state.checked },
  });
  state.currentHistoryIndex = 0;
  renderHistory(0);
  saveHistory();
}

function commitJobTitle(newTitle) {
  if (state.currentHistoryIndex < 0 || state.currentHistoryIndex >= historyData.length) return;
  const trimmed = newTitle.trim();
  if (!trimmed) return;
  historyData[state.currentHistoryIndex].job = trimmed;
  $('resultJobTitle').textContent = trimmed;
  renderHistory(state.currentHistoryIndex);
  saveHistory();
}

function makeJobTitleEditable(el, onCommit) {
  el.style.cursor = 'text';
  el.addEventListener('dblclick', () => {
    const current = el.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = current;
    input.style.cssText =
      'font-family:inherit;font-size:inherit;font-weight:inherit;background:transparent;border:none;border-bottom:2px solid #2F6BFF;outline:none;color:inherit;width:100%;padding:0;';
    el.textContent = '';
    el.appendChild(input);
    input.focus();
    input.select();
    const finish = () => {
      const val = input.value;
      el.textContent = val || current;
      onCommit(val || current);
    };
    input.addEventListener('blur', finish);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      }
      if (e.key === 'Escape') {
        el.textContent = current;
      }
    });
  });
}

function animateScore(target) {
  state.displayedScore = 0;
  const kpi = $('kpiScore');
  const gauge = $('gaugeScore');
  clearInterval(scoreInterval);
  const r = 78;
  const circ = 2 * Math.PI * r;

  scoreInterval = setInterval(() => {
    let v = state.displayedScore + Math.max(1, Math.round((target - state.displayedScore) / 7));
    if (v >= target) {
      v = target;
      clearInterval(scoreInterval);
    }
    state.displayedScore = v;
    kpi.textContent = v;
    gauge.textContent = v;

    const b = band(target);
    gauge.style.color = b.color;
    const offset = circ * (1 - v / 100);
    $('gaugeArc').setAttribute('stroke-dashoffset', offset.toFixed(1));
    $('gaugeArc').setAttribute('stroke', b.color);
  }, 28);
}

function renderGauge() {
  const a = state.analysis;
  if (!a) return;
  const r = 78;
  const circ = 2 * Math.PI * r;

  $('gaugeArc').setAttribute('stroke-dasharray', circ.toFixed(1));
  $('gaugeArcProj').setAttribute('stroke-dasharray', circ.toFixed(1));
}

function renderCategories() {
  const a = state.analysis;
  if (!a) return;
  const grid = $('categoriesGrid');
  grid.innerHTML = '';
  a.categories.forEach((cat) => {
    const cb = band(cat.score);
    const div = document.createElement('div');
    div.className = 'kpi-card';
    div.style.cssText = 'padding:14px;';
    div.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;">
        <span style="font-size:13px;font-weight:600;">${escapeHtml(cat.label)}</span>
        <span class="tab-badge inactive" style="font-size:10.5px;">${cat.weight}%</span>
      </div>
      <div style="display:flex;align-items:baseline;gap:5px;margin-bottom:8px;">
        <span class="font-grotesk" style="font-size:22px;font-weight:700;color:${cb.color};">${cat.score}</span>
        <span class="text-light" style="font-size:12px;font-weight:600;">/100</span>
      </div>
      <div class="category-bar">
        <div class="category-bar-fill" style="background:${cb.color};width:${cat.score}%;"></div>
      </div>`;
    grid.appendChild(div);
  });
}

function renderSkills() {
  const a = state.analysis;
  if (!a) return;

  $('foundKeywords').innerHTML = a.found.length
    ? a.found.map((k) => `<span class="keyword-tag found">${escapeHtml(k)}</span>`).join('')
    : '<span style="font-size:13px;color:#9AA4B2;">Aucun mot-clé commun détecté</span>';
  $('foundCount').textContent = a.found.length + ' compétences';
  $('skillCountBadge').textContent = a.found.length + a.missing.length;

  // Missing detail
  const detailContainer = $('missingDetail');
  if (a.missingDetail && a.missingDetail.length > 0) {
    detailContainer.innerHTML = a.missingDetail
      .map(
        (m) => `
      <div class="missing-detail-row">
        <div><span class="missing-kw">${escapeHtml(m.kw)}</span></div>
        <div>
          <div class="missing-section-label text-light">Dans l'offre</div>
          <div style="font-size:13px; color:#5B6678; font-style:italic; line-height:1.45;">${escapeHtml(m.inOffer)}</div>
        </div>
        <div>
          <div class="missing-section-label text-blue">À ajouter dans</div>
          <div style="font-size:13px; color:#101826; font-weight:600; line-height:1.45;">${escapeHtml(m.addTo)}</div>
        </div>
      </div>
    `,
      )
      .join('');
  } else if (a.missing && a.missing.length > 0) {
    detailContainer.innerHTML = a.missing
      .map(
        (k) => `
      <div class="missing-detail-row">
        <div><span class="missing-kw">${escapeHtml(k)}</span></div>
        <div>
          <div class="missing-section-label text-light">Dans l'offre</div>
          <div style="font-size:13px; color:#5B6678; font-style:italic; line-height:1.45;">Compétence attendue par l'offre</div>
        </div>
        <div>
          <div class="missing-section-label text-blue">À ajouter dans</div>
          <div style="font-size:13px; color:#101826; font-weight:600; line-height:1.45;">Section Compétences techniques</div>
        </div>
      </div>
    `,
      )
      .join('');
  } else {
    detailContainer.innerHTML =
      '<span style="font-size:13px; color:#9AA4B2;">Toutes les compétences sont présentes !</span>';
  }
}

function renderReformulations() {
  const a = state.analysis;
  if (!a) return;
  const copyIconCheck = 'M3.5 8.5l3 3 6-7';
  const copyIconCopy = 'M5.5 5.5V3.5h7v7h-2M3.5 5.5h7v7h-7z';

  const list = $('reformulationsList');
  list.innerHTML = a.reformulations
    .map((rf, i) => {
      const on = state.copied === i;
      return `<div class="reformulation-item">
      <div style="padding:12px 14px;background:#FDECEC;border-radius:9px;">
        <div style="font-size:10.5px;font-weight:700;letter-spacing:.4px;color:#C0322E;text-transform:uppercase;margin-bottom:6px;">Avant</div>
        <div style="font-size:13px;color:#7A4F4D;line-height:1.5;">${escapeHtml(rf.cv)}</div>
      </div>
      <div class="afb-arrow" style="display:flex;align-items:center;justify-content:center;"><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M4 10h11M11 5l5 5-5 5" stroke="#2F6BFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div style="padding:12px 14px;background:#EAF0FF;border-radius:9px;position:relative;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <div style="font-size:10.5px;font-weight:700;letter-spacing:.4px;color:#2F6BFF;text-transform:uppercase;">Après</div>
          <button class="copy-btn${on ? ' copied' : ''}" data-index="${i}">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="${on ? copyIconCheck : copyIconCopy}" stroke="${on ? '#16A34A' : '#2F6BFF'}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            ${on ? 'Copié' : 'Copier'}
          </button>
        </div>
        <div style="font-size:13px;color:#101826;font-weight:500;line-height:1.5;">${escapeHtml(rf.suggestion)}</div>
      </div>
    </div>`;
    })
    .join('');

  list.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const i = parseInt(btn.dataset.index);
      const text = a.reformulations[i]?.suggestion || '';
      try {
        navigator.clipboard.writeText(text);
      } catch {
        // clipboard API unavailable
      }
      state.copied = i;
      clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        state.copied = null;
        renderReformulations();
      }, 1600);
      renderReformulations();
    });
  });
}

function renderChecklist() {
  const a = state.analysis;
  if (!a) return;
  const totalPts = a.checklist.reduce((s, c) => s + c.pts, 0);
  const realized = a.checklist.reduce((s, c, i) => s + (state.checked[i] ? c.pts : 0), 0);
  const projected = Math.min(100, a.globalScore + realized);
  const doneCount = Object.values(state.checked).filter(Boolean).length;
  const allDone = doneCount === a.checklist.length;

  // KPI projected box
  $('kpiProjected').textContent = projected;
  const delta = realized > 0 ? '+' + realized + ' pts' : 'à activer';
  $('deltaLabel').textContent = delta;
  $('deltaLabel').style.background = realized > 0 ? 'rgba(127,208,166,.2)' : 'rgba(255,255,255,.1)';
  $('deltaLabel').style.color = realized > 0 ? '#7FD0A6' : '#9AA4B2';

  // Gauge projected arc
  const r = 78;
  const circ = 2 * Math.PI * r;
  const projOffset = circ * (1 - projected / 100);
  const arcProj = $('gaugeArcProj');
  arcProj.setAttribute('stroke-dashoffset', projOffset.toFixed(1));
  const b = band(a.globalScore);
  arcProj.setAttribute('stroke', b.tint);

  // Proj card
  const projCard = $('projCard');
  projCard.querySelector('div:last-child').textContent = projected;
  $('projHint').textContent =
    realized > 0 ? '+' + realized + ' pts gagnés sur ' + totalPts : "jusqu'à +" + totalPts + ' pts · cochez le plan';
  projCard.style.background = realized > 0 ? '#F1FBF5' : '#F7FAFC';
  projCard.style.borderColor = realized > 0 ? '#BFE6CD' : '#DCE3EC';

  // Plan box
  $('planBaseScore').textContent = a.globalScore;
  $('planProjectedScore').textContent = projected;
  $('progressLabel').textContent = doneCount + '/' + a.checklist.length + ' action(s)';

  const pct = totalPts > 0 ? Math.round((realized / totalPts) * 100) : 0;
  $('planProgressBar').querySelector('div').style.width = pct + '%';

  const prioStyles = {
    Haute: { bg: '#FDECEC', color: '#C0322E' },
    Moyenne: { bg: '#FFF6E6', color: '#B07908' },
    Basse: { bg: '#EEF1F6', color: '#5B6678' },
  };

  $('checklistContainer').innerHTML = a.checklist
    .map((item, i) => {
      const on = !!state.checked[i];
      const p = prioStyles[item.priority] || prioStyles['Basse'];
      return `<div class="checklist-item" data-index="${i}" style="border:1px solid ${on ? '#CDEBD6' : '#EDF0F5'};background:${on ? '#F4FBF6' : '#fff'};">
      <div style="width:24px;height:24px;border-radius:7px;border:2px solid ${on ? '#16A34A' : '#C5CDDA'};background:${on ? '#16A34A' : '#fff'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="opacity:${on ? '1' : '0'};display:flex;"><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 8.5l2.5 2.5 5-6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </div>
      <span class="prio-badge" style="background:${p.bg};color:${p.color};">${item.priority}</span>
      <span style="flex:1;font-size:14px;font-weight:500;opacity:${on ? '.5' : '1'};text-decoration:${on ? 'line-through' : 'none'};">${escapeHtml(item.task)}</span>
      <span style="font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:${on ? '#9AA4B2' : '#16A34A'};">+${item.pts} pts</span>
    </div>`;
    })
    .join('');

  $('checklistContainer')
    .querySelectorAll('.checklist-item')
    .forEach((el) => {
      el.addEventListener('click', () => {
        const i = parseInt(el.dataset.index);
        state.checked[i] = !state.checked[i];
        renderChecklist();
      });
    });

  // Plan done box
  const doneBox = $('planDoneBox');
  if (allDone) {
    doneBox.classList.add('active');
    $('planFootnote').textContent =
      'Plan terminé — score projeté à ' +
      projected +
      '/100. Pensez à mettre à jour votre CV puis relancez une analyse.';
  } else {
    doneBox.classList.remove('active');
  }
}

function enterResults(skipHistorySave) {
  clearInterval(analyzeInterval);

  // If on input page, store results and redirect to results page
  if (!isResultsPage && state.analysis) {
    if (!skipHistorySave) saveAnalysisToHistory();
    try {
      const historyEntry = state.currentHistoryIndex >= 0 ? historyData[state.currentHistoryIndex] : null;
      sessionStorage.setItem(
        'applyfit_analysis',
        JSON.stringify({
          analysis: state.analysis,
          checked: state.checked,
          targetScore: state.targetScore,
          jobTitle: historyEntry?.job || '',
        }),
      );
    } catch {
      // sessionStorage unavailable
    }
    window.location.href = 'results.html';
    return;
  }

  showView('results');
  const a = state.analysis;
  if (!a) return;

  state.targetScore = a.globalScore;
  state.displayedScore = 0;

  const b = band(a.globalScore);

  // Gauge setup
  renderGauge();

  // Score animation
  animateScore(a.globalScore);

  // KPI
  $('kpiScore').style.color = b.color;
  $('kpiFound').textContent = a.found.length;
  $('kpiMissing').textContent = a.missing.length;

  // Exec summary
  const level = getLevel(a.globalScore);
  const totalPts = a.checklist ? a.checklist.reduce((s, c) => s + c.pts, 0) : 0;
  const ceiling = Math.min(100, a.globalScore + totalPts);
  const levelLabels = { excellent: 'excellent', good: 'solide', average: 'à consolider', low: 'à retravailler' };
  $('execSummary').textContent =
    `Profil ${levelLabels[level] || 'solide'} — ${a.checklist.length} actions pour passer de ${a.globalScore} à ${ceiling}.`;

  if (a.confidence !== undefined) {
    $('confidenceLabel').textContent = a.confidence + '%';
    $('confidenceBar').querySelector('div').style.width = a.confidence + '%';
  }

  // Mode label
  const modeLabel = $('modeLabel');
  if (modeLabel) {
    modeLabel.textContent = 'Analyse IA · Gemini 2.0 Flash';
  }

  // Verdict
  let verdict, vmsg;
  if (a.globalScore >= 75) {
    verdict = 'Forte compatibilité';
    vmsg = "Profil très aligné avec l'offre.";
  } else if (a.globalScore >= 60) {
    verdict = 'Bonne base à renforcer';
    vmsg = '3 actions suffisent pour viser 90.';
  } else if (a.globalScore >= 45) {
    verdict = 'Compatibilité partielle';
    vmsg = 'Le potentiel est là, à consolider.';
  } else {
    verdict = 'À retravailler';
    vmsg = 'Plusieurs attentes clés manquent.';
  }
  $('verdictTitle').textContent = verdict;
  $('verdictTitle').style.color = b.color;
  $('verdictBox').style.background = b.bg;
  $('verdictMessage').textContent = vmsg;

  // Alert
  if (a.alerts && a.alerts.length > 0) {
    const al = a.alerts[0];
    $('alertBanner').classList.add('active');
    $('alertTitle').textContent = 'Alerte · ' + (al.type || 'Écart détecté');
    $('alertDesc').textContent = al.offerRequires + ' — ' + al.suggestion;
  } else {
    $('alertBanner').classList.remove('active');
  }

  // Categories
  renderCategories();

  // Skills
  renderSkills();

  // Reformulations
  renderReformulations();

  // Badges
  $('skillCountBadge').textContent = a.found.length + a.missing.length;
  $('planCountBadge').textContent = a.checklist.length;

  // Proj card
  renderChecklist();

  // Show overview tab
  switchTab('overview');

  viewResults.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (!skipHistorySave) saveAnalysisToHistory();
}

// ===== Analysis flow =====
async function runAnalysis() {
  const cv = state.cvText;
  const offer = state.offerText;
  if (!cv.trim() || !offer.trim()) return;

  clearInterval(scoreInterval);
  showView('analyzing');
  state.analyzeIndex = 0;
  renderAnalyzeSteps(0);

  let idx = 0;
  clearInterval(analyzeInterval);
  analyzeInterval = setInterval(() => {
    idx++;
    if (idx > analyzeStepLabels.length) {
      clearInterval(analyzeInterval);
      return;
    }
    renderAnalyzeSteps(idx);
  }, 480);

  setTimeout(async () => {
    clearInterval(analyzeInterval);
    renderAnalyzeSteps(analyzeStepLabels.length);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 75000);
      const result = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: cv, offerText: offer }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!result.ok) {
        const errBody = await result.text().catch(() => '');
        throw new Error(`HTTP ${result.status}: ${errBody}`);
      }

      const data = await result.json();
      showToast('Analyse IA terminée avec succès.', 'success');
      processAIResults(data, cv, offer);
    } catch (err) {
      clearInterval(analyzeInterval);
      renderAnalyzeSteps(0);
      showView('input');

      let message = "L'analyse IA est momentanément indisponible. Veuillez réessayer.";
      if (err.name === 'AbortError' || err.message.includes('Timeout')) {
        message = "L'analyse a pris trop de temps. Veuillez réessayer avec un CV ou une offre plus courte.";
      } else if (err.message.includes('429')) {
        message = 'Trop de demandes. Veuillez patienter quelques minutes.';
      } else if (err.message.includes('500')) {
        message = "Le service d'analyse IA a rencontré une erreur. Réessayez dans quelques instants.";
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        message = "Impossible de contacter le serveur d'analyse. Vérifiez votre connexion.";
      }

      showToast(message, 'error');
      console.error('Erreur analyse IA:', err);
    }
  }, 2200);
}

function processAIResults(data) {
  const categories = {};
  for (const [key, cat] of Object.entries(data.categories || {})) {
    categories[key] = {
      label: keywordDatabase[key]?.label || key,
      score: cat.score || 0,
      found: deduplicateArray(cat.found || []),
      missing: deduplicateArray(cat.missing || []),
    };
  }

  const allFound = [];
  const allMissing = [];
  for (const cat of Object.values(categories)) {
    allFound.push(...cat.found);
    allMissing.push(...cat.missing);
  }
  const dedupFound = deduplicateArray(allFound);
  const dedupMissing = deduplicateArray(allMissing);

  const catEntries = Object.entries(categories);
  const globalScore = data.globalScore || calculateGlobalScore(categories);

  const categoryDisplay = catEntries.map(([key, cat]) => ({
    label: cat.label,
    weight: { technical: 35, experience: 25, soft: 15, education: 15, languages: 5, tools: 5 }[key] || 10,
    score: cat.score,
  }));

  // Build checklist from AI data
  const checklist = [];
  if (data.missingKeywords && data.missingKeywords.length > 0) {
    data.missingKeywords.slice(0, 5).forEach((mk, i) => {
      checklist.push({
        priority: i < 2 ? 'Haute' : i < 4 ? 'Moyenne' : 'Basse',
        task: `Ajouter ${mk.concreteSkill || mk.keyword} à votre CV`,
        pts: Math.max(1, 6 - i),
      });
    });
  } else if (dedupMissing.length > 0) {
    dedupMissing.slice(0, 4).forEach((k, i) => {
      checklist.push({
        priority: i < 2 ? 'Haute' : 'Moyenne',
        task: `Ajouter ${k} à vos compétences`,
        pts: Math.max(1, 6 - i),
      });
    });
  }
  if (checklist.length < 2) {
    checklist.push({ priority: 'Haute', task: 'Chiffrer vos résultats sur chaque expérience', pts: 5 });
  }

  // Build missing detail
  const missingDetail = [];
  if (data.missingKeywords && data.missingKeywords.length > 0) {
    data.missingKeywords.forEach((mk) => {
      missingDetail.push({
        kw: mk.keyword || mk.concreteSkill || '',
        inOffer: mk.concreteSkill ? '« ' + mk.concreteSkill + ' »' : "Compétence attendue par l'offre",
        addTo: keywordDatabase[mk.category] ? keywordDatabase[mk.category].label : 'Section Compétences',
      });
    });
  } else {
    dedupMissing.slice(0, 5).forEach((k) => {
      missingDetail.push({
        kw: k,
        inOffer: "Compétence attendue par l'offre",
        addTo: 'Section Compétences techniques',
      });
    });
  }

  // Reformulations
  const reformulations = (data.reformulationAdvice || []).slice(0, 3).map((a) => ({
    cv: a.cvSays || 'Expérience générique',
    suggestion: a.suggestion || "Reformulez avec plus d'impact",
  }));
  if (reformulations.length === 0) {
    reformulations.push({
      cv: 'Expérience professionnelle dans le domaine.',
      suggestion: 'Concrétisez avec des métriques : "réalisé X projet, traité Y utilisateurs...',
    });
    reformulations.push({
      cv: 'Compétence en développement.',
      suggestion: 'Précisez la tech stack : "Développement React/Node.js avec API REST"',
    });
  }

  // Alerts
  const alerts = (data.alerts || []).slice(0, 3);

  state.analysis = {
    globalScore,
    confidence: data.confidence,
    categories: categoryDisplay,
    found: dedupFound,
    missing: dedupMissing,
    missingDetail,
    checklist,
    reformulations,
    alerts,
  };
  state.checked = {};
  state.targetScore = globalScore;
  enterResults();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  // --- Results page ---
  if (isResultsPage) {
    // Read analysis from sessionStorage
    try {
      const raw = sessionStorage.getItem('applyfit_analysis');
      if (raw) {
        const saved = JSON.parse(raw);
        state.analysis = saved.analysis;
        state.checked = saved.checked || {};
        state.targetScore = saved.targetScore || saved.analysis.globalScore;
        if (saved.jobTitle) {
          state.cvText = '';
          state.offerText = '';
        }
      }
    } catch {
      // sessionStorage unavailable
    }

    // Tab switching
    document.querySelectorAll('.tab-card').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.id.replace('Btn', '').replace('tab', '').toLowerCase()));
    });

    // Proj card click -> plan tab
    $('projCard').addEventListener('click', () => switchTab('plan'));

    // Result title inline edit
    makeJobTitleEditable($('resultJobTitle'), (val) => commitJobTitle(val));

    // History
    renderHistory(0);

    // Mobile sidebar toggle
    const hamburgerBtn = $('hamburgerBtn');
    const sidebar = $('sidebar');
    const sidebarOverlay = $('sidebarOverlay');

    function openSidebar() {
      sidebar.classList.add('open');
      sidebarOverlay.classList.add('open');
    }
    function closeSidebar() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('open');
    }

    hamburgerBtn.addEventListener('click', () => {
      sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    sidebarOverlay.addEventListener('click', closeSidebar);

    $('historyList').addEventListener('click', () => {
      if (window.innerWidth <= 940) closeSidebar();
    });

    // Share button
    $('shareBtn').addEventListener('click', () => {
      const a = state.analysis;
      if (!a) return;
      const title = $('resultJobTitle').textContent;
      const text = [
        `Analyse ApplyFit — ${title}`,
        `Score : ${a.globalScore}/100`,
        `Compétences trouvées : ${a.found.length}`,
        `Compétences manquantes : ${a.missing.length}`,
        `Actions recommandées : ${a.checklist.length}`,
        '',
        'Analysé via ApplyFit',
      ].join('\n');

      if (navigator.share) {
        navigator.share({ title: 'ApplyFit — ' + title, text }).catch(() => {});
      } else {
        navigator.clipboard.writeText(text).then(
          () => showToast('Résumé copié dans le presse-papier.', 'success'),
          () => showToast('Impossible de copier le résumé.', 'error'),
        );
      }
    });

    // Export PDF button (download)
    $('exportPdfBtn').addEventListener('click', () => {
      if (!state.analysis) return;
      if (typeof html2pdf === 'undefined') {
        showToast('Générateur PDF indisponible.', 'error');
        return;
      }

      const source = $('viewResults');
      const title = $('resultJobTitle').textContent.trim() || 'ApplyFit-analyse';
      const safeTitle = title.replace(/[^a-z0-9\u00C0-\u017F_-]+/gi, '-').replace(/^-|-$/g, '');

      const clone = source.cloneNode(true);
      clone.style.maxWidth = '920px';
      clone.style.margin = '0';
      clone.style.padding = '24px';
      clone.style.background = '#ffffff';

      // Hide action buttons in PDF
      const shareBtn = clone.querySelector('#shareBtn');
      const exportBtn = clone.querySelector('#exportPdfBtn');
      if (shareBtn) shareBtn.style.display = 'none';
      if (exportBtn) exportBtn.style.display = 'none';

      // Show all tab contents in PDF
      clone.querySelectorAll('.tab-content').forEach((tab) => {
        tab.classList.add('active');
        tab.style.display = 'block';
        tab.style.marginBottom = '24px';
      });

      // Hide tab navigation in PDF
      const tabNav = clone.querySelector('#tabNav');
      if (tabNav) tabNav.style.display = 'none';

      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      const opt = {
        margin: [10, 10],
        filename: `${safeTitle || 'ApplyFit-analyse'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      html2pdf()
        .set(opt)
        .from(clone)
        .save()
        .then(() => wrapper.remove())
        .catch(() => {
          wrapper.remove();
          showToast('Erreur lors de la génération du PDF.', 'error');
        });
    });

    // Render results
    if (state.analysis) {
      enterResults(true);
    } else {
      window.location.replace('index.html');
    }
    return;
  }

  // --- Input page ---
  // Set initial values
  $('cvText').value = state.cvText;
  $('offerText').value = state.offerText;
  checkCanAnalyze();

  // Mode toggles
  setupModeToggle('cv');
  setupModeToggle('offer');

  // File upload with drag-drop
  setupFileUpload('cv');
  setupFileUpload('offer');

  // Analyze button
  $('analyzeBtn').addEventListener('click', runAnalysis);

  // New analysis button
  $('newAnalysisBtn').addEventListener('click', () => {
    clearInterval(scoreInterval);
    clearInterval(analyzeInterval);
    clearTimeout(copyTimeout);
    state.analysis = null;
    state.displayedScore = 0;
    state.checked = {};
    state.currentHistoryIndex = -1;
    state.cvText = '';
    state.offerText = '';
    state.fileContent = { cv: null, offer: null };
    $('cvText').value = '';
    $('offerText').value = '';
    $('cvFileInput').value = '';
    $('offerFileInput').value = '';
    $('cvFileInfo').classList.remove('active');
    $('offerFileInfo').classList.remove('active');
    modeSetters.cv?.('file');
    modeSetters.offer?.('file');
    checkCanAnalyze();
    showView('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // History
  renderHistory(0);

  // Mobile sidebar toggle
  const hamburgerBtn = $('hamburgerBtn');
  const sidebar = $('sidebar');
  const sidebarOverlay = $('sidebarOverlay');

  function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('open');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  }

  hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  sidebarOverlay.addEventListener('click', closeSidebar);

  // Close sidebar on history click (mobile)
  $('historyList').addEventListener('click', () => {
    if (window.innerWidth <= 940) closeSidebar();
  });
});
