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
    loading.style.display = 'block';
    resultPanel.style.display = 'none';
    errorPanel.style.display = 'none';
    return;
  }

  loading.style.display = 'none';

  if (ats.error) {
    resultPanel.style.display = 'none';
    errorPanel.style.display = 'flex';
    $('atsErrorMsg').textContent = ats.message || "L'analyse ATS est indisponible.";
    return;
  }

  errorPanel.style.display = 'none';
  resultPanel.style.display = 'block';

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
      row.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:10px;background:#f8f9fb';
      const status = document.createElement('span');
      status.style.cssText = `flex-shrink:0;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;background:${c.passed ? '#16A34A' : '#E5484D'}`;
      status.textContent = c.passed ? 'OK' : 'KO';
      const body = document.createElement('div');
      body.style.cssText = 'flex:1;min-width:0';
      const title = document.createElement('div');
      title.style.cssText = 'font-size:13px;font-weight:600;color:#101826';
      title.textContent = c.name;
      const comment = document.createElement('div');
      comment.style.cssText = 'font-size:12.5px;color:#6b7689;line-height:1.45;margin-top:2px';
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
      li.style.marginBottom = '6px';
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
