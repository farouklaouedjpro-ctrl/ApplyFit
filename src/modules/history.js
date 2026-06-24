import { $, escapeHtml, band } from '../utils.js';
import { state, scoreInterval, analyzeInterval } from './state.js';
import { showView } from './router.js';
import { enterResults } from '../results/enterResults.js';

export let historyIdCounter = 0;
export const STORAGE_KEY = 'applyfit_history';

export function loadHistory() {
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

export function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
  } catch {
    // localStorage unavailable
  }
}

export const historyData = loadHistory();

export function clearActiveAnalysis() {
  clearInterval(scoreInterval);
  clearInterval(analyzeInterval);
  state.analysis = null;
  state.displayedScore = 0;
  state.checked = {};
  state.currentHistoryIndex = -1;
  showView('input');
}

export function renderHistory(activeIndex) {
  $('historyList').innerHTML = historyData
    .map((h, i) => {
      const b = band(h.score);
      const isActive = i === (activeIndex !== undefined ? activeIndex : 0);
      return `<div class="history-item ${isActive ? 'is-active' : ''}" data-index="${i}">
      <div class="score-badge ${b.className}">${h.score}</div>
      <div class="history-item-content">
        <div class="history-job-title" data-index="${i}">${escapeHtml(h.job)}</div>
        <div class="history-date">${h.date}</div>
      </div>
      <button class="history-delete" title="Supprimer">
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
          $('historyList').innerHTML = '<div class="history-empty">Aucune analyse</div>';
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

export function loadHistoryAnalysis(index) {
  const entry = historyData[index];
  if (!entry || !entry.analysis) return;
  state.currentHistoryIndex = index;
  state.analysis = JSON.parse(JSON.stringify(entry.analysis));
  state.ats = null;
  state.checked = { ...(entry.checked || {}) };
  state.targetScore = state.analysis.globalScore;
  enterResults(true);
}

export function saveAnalysisToHistory() {
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

export function commitJobTitle(newTitle) {
  if (state.currentHistoryIndex < 0 || state.currentHistoryIndex >= historyData.length) return;
  const trimmed = newTitle.trim();
  if (!trimmed) return;
  historyData[state.currentHistoryIndex].job = trimmed;
  $('resultJobTitle').textContent = trimmed;
  renderHistory(state.currentHistoryIndex);
  saveHistory();
}

export function makeJobTitleEditable(el, onCommit) {
  el.addEventListener('dblclick', () => {
    const current = el.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = current;
    input.className = 'history-job-input';
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
