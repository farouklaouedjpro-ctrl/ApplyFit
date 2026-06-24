import { $, band, escapeHtml } from '../utils.js';
import { state, scoreInterval, setScoreInterval } from '../modules/state.js';

export function animateScore(target) {
  state.displayedScore = 0;
  const kpi = $('kpiScore');
  const gauge = $('gaugeScore');
  clearInterval(scoreInterval);
  const r = 78;
  const circ = 2 * Math.PI * r;

  setScoreInterval(
    setInterval(() => {
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
    }, 28),
  );
}

export function renderGauge() {
  const a = state.analysis;
  if (!a) return;
  const r = 78;
  const circ = 2 * Math.PI * r;

  $('gaugeArc').setAttribute('stroke-dasharray', circ.toFixed(1));
  $('gaugeArcProj').setAttribute('stroke-dasharray', circ.toFixed(1));
}

export function renderCategories() {
  const a = state.analysis;
  if (!a) return;
  const grid = $('categoriesGrid');
  grid.innerHTML = '';
  a.categories.forEach((cat) => {
    const cb = band(cat.score);
    const div = document.createElement('div');
    div.className = 'kpi-card category-card';
    div.innerHTML = `
      <div class="category-card-header">
        <span class="category-card-label">${escapeHtml(cat.label)}</span>
        <span class="tab-badge inactive category-card-weight">${cat.weight}%</span>
      </div>
      <div class="category-card-score">
        <span class="category-card-score-value" style="color:${cb.color};">${cat.score}</span>
        <span class="text-light category-card-score-total">/100</span>
      </div>
      <div class="category-bar">
        <div class="category-bar-fill" style="background:${cb.color};width:${cat.score}%;"></div>
      </div>`;
    grid.appendChild(div);
  });
}
