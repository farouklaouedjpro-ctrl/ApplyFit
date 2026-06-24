import { $, band, getAtsVerdict } from '../utils.js';
import { state } from '../modules/state.js';
import { fetchATSScoreData } from '../modules/api.js';

export async function fetchATSScore() {
  if (!state.analysis || state.ats) return;
  const cv = state.cvText;
  const offer = state.offerText;
  if (!cv.trim() || !offer.trim()) return;

  try {
    state.ats = await fetchATSScoreData(cv, offer);
    renderATS();
  } catch (err) {
    state.ats = { error: true, message: "L'analyse ATS est momentanément indisponible." };
    renderATS();
    console.error('Erreur analyse ATS:', err);
  }
}

export function renderATS() {
  const loading = $('atsLoading');
  const resultPanel = $('atsResult');
  const errorPanel = $('atsError');
  if (!loading || !resultPanel || !errorPanel) return;

  const ats = state.ats;
  if (!ats || (!ats.score && !ats.error)) {
    loading.classList.remove('is-hidden');
    resultPanel.classList.add('is-hidden');
    errorPanel.classList.add('is-hidden');
    return;
  }

  loading.classList.add('is-hidden');

  if (ats.error) {
    resultPanel.classList.add('is-hidden');
    errorPanel.classList.remove('is-hidden');
    $('atsErrorMsg').textContent = ats.message || "L'analyse ATS est indisponible.";
    return;
  }

  errorPanel.classList.add('is-hidden');
  resultPanel.classList.remove('is-hidden');

  const b = band(ats.score);
  const verdict = ats.verdict || getAtsVerdict(ats.score);

  $('atsScore').textContent = ats.score;
  $('atsScore').style.color = b.color;
  $('atsVerdict').textContent = verdict;
  $('atsVerdict').style.color = b.color;
  $('atsSummary').textContent = ats.summary || '';

  const criteriaContainer = $('atsCriteria');
  criteriaContainer.innerHTML = '';
  if (Array.isArray(ats.criteria)) {
    ats.criteria.forEach((c) => {
      const row = document.createElement('div');
      row.className = 'ats-criterion-row';
      const status = document.createElement('span');
      status.className = 'ats-criterion-status';
      status.style.background = c.passed ? '#16A34A' : '#E5484D';
      status.textContent = c.passed ? 'OK' : 'KO';
      const body = document.createElement('div');
      body.className = 'ats-criterion-body';
      const title = document.createElement('div');
      title.className = 'ats-criterion-name';
      title.textContent = c.name;
      const comment = document.createElement('div');
      comment.className = 'ats-criterion-comment';
      comment.textContent = c.comment;
      body.appendChild(title);
      body.appendChild(comment);
      row.appendChild(status);
      row.appendChild(body);
      criteriaContainer.appendChild(row);
    });
  }

  const recContainer = $('atsRecommendations');
  recContainer.innerHTML = '';
  if (Array.isArray(ats.recommendations)) {
    ats.recommendations.forEach((r) => {
      const li = document.createElement('li');
      li.textContent = r;
      recContainer.appendChild(li);
    });
  }

  const badge = $('atsScoreBadge');
  if (badge) {
    badge.textContent = ats.score;
    badge.classList.remove('inactive');
    badge.classList.add('active');
    badge.style.background = b.bg;
    badge.style.color = b.color;
  }
}
