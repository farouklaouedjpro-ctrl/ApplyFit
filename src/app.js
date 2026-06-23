import { $, showToast } from './utils.js';
import { state, scoreInterval, analyzeInterval, copyTimeout, modeSetters } from './modules/state.js';
import { isResultsPage, showView, switchTab } from './modules/router.js';
import { initSidebar } from './modules/sidebar.js';
import { setupModeToggle } from './input/modeToggle.js';
import { setupFileUpload } from './input/fileUpload.js';
import { checkCanAnalyze, runAnalysis } from './input/analyzeForm.js';
import { renderHistory, makeJobTitleEditable, commitJobTitle, clearActiveAnalysis } from './modules/history.js';
import { enterResults } from './results/enterResults.js';
import { initPdfExport } from './results/pdfExport.js';

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

document.addEventListener('DOMContentLoaded', () => {
  if (isResultsPage) {
    try {
      const raw = sessionStorage.getItem('applyfit_analysis');
      if (raw) {
        const saved = JSON.parse(raw);
        state.analysis = saved.analysis;
        state.ats = saved.ats || null;
        state.checked = saved.checked || {};
        state.targetScore = saved.targetScore || saved.analysis.globalScore;
        state.cvText = saved.cvText || '';
        state.offerText = saved.offerText || '';
        if (saved.jobTitle) {
          state.cvText = saved.cvText || '';
          state.offerText = saved.offerText || '';
        }
      }
    } catch {
      // sessionStorage unavailable
    }

    document.querySelectorAll('.tab-card').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.id.replace('Btn', '').replace('tab', '').toLowerCase()));
    });

    $('projCard').addEventListener('click', () => switchTab('plan'));
    makeJobTitleEditable($('resultJobTitle'), (val) => commitJobTitle(val));
    renderHistory(0);
    initSidebar();
    initPdfExport();

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

    if (state.analysis) {
      enterResults(true);
    } else {
      window.location.replace('index.html');
    }
    return;
  }

  $('cvText').value = state.cvText;
  $('offerText').value = state.offerText;
  checkCanAnalyze();

  setupModeToggle('cv');
  setupModeToggle('offer');
  setupFileUpload('cv');
  setupFileUpload('offer');

  $('analyzeBtn').addEventListener('click', runAnalysis);

  $('newAnalysisBtn').addEventListener('click', () => {
    clearInterval(scoreInterval);
    clearInterval(analyzeInterval);
    clearTimeout(copyTimeout);
    state.analysis = null;
    state.ats = null;
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

  renderHistory(0);
  initSidebar();
});
