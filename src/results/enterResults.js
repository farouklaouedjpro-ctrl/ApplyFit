import { $, getLevel, band } from '../utils.js';
import { state, analyzeInterval } from '../modules/state.js';
import { isResultsPage, showView, switchTab } from '../modules/router.js';
import { historyData, saveAnalysisToHistory } from '../modules/history.js';
import { renderGauge, renderCategories, animateScore } from './renderOverview.js';
import { renderSkills, renderReformulations } from './renderSkills.js';
import { renderChecklist } from './renderPlan.js';
import { fetchATSScore, renderATS } from './renderATS.js';

export function enterResults(skipHistorySave) {
  clearInterval(analyzeInterval);

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
          cvText: state.cvText,
          offerText: state.offerText,
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

  renderGauge();
  animateScore(a.globalScore);

  $('kpiScore').style.color = b.color;
  $('kpiFound').textContent = a.found.length;
  $('kpiMissing').textContent = a.missing.length;

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

  const modeLabel = $('modeLabel');
  if (modeLabel) {
    modeLabel.textContent = 'Analyse IA · Gemini 2.0 Flash';
  }

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

  if (a.alerts && a.alerts.length > 0) {
    const al = a.alerts[0];
    $('alertBanner').classList.add('active');
    $('alertTitle').textContent = 'Alerte · ' + (al.type || 'Écart détecté');
    $('alertDesc').textContent = al.offerRequires + ' — ' + al.suggestion;
  } else {
    $('alertBanner').classList.remove('active');
  }

  renderCategories();
  renderSkills();
  renderReformulations();

  $('skillCountBadge').textContent = a.found.length + a.missing.length;
  $('planCountBadge').textContent = a.checklist.length;

  renderChecklist();

  if (state.ats) renderATS();
  else fetchATSScore();

  switchTab('overview');

  $('viewResults').scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (!skipHistorySave) saveAnalysisToHistory();
}
