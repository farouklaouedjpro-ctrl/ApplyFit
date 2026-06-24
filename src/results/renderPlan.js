import { $, escapeHtml, band } from '../utils.js';
import { state } from '../modules/state.js';

export function renderChecklist() {
  const a = state.analysis;
  if (!a) return;
  const totalPts = a.checklist.reduce((s, c) => s + c.pts, 0);
  const realized = a.checklist.reduce((s, c, i) => s + (state.checked[i] ? c.pts : 0), 0);
  const projected = Math.min(100, a.globalScore + realized);
  const doneCount = Object.values(state.checked).filter(Boolean).length;
  const allDone = doneCount === a.checklist.length;

  $('kpiProjected').textContent = projected;
  const delta = realized > 0 ? '+' + realized + ' pts' : 'à activer';
  $('deltaLabel').textContent = delta;
  $('deltaLabel').className = 'delta-label ' + (realized > 0 ? 'delta-label-success' : 'delta-label-muted');

  const r = 78;
  const circ = 2 * Math.PI * r;
  const projOffset = circ * (1 - projected / 100);
  const arcProj = $('gaugeArcProj');
  arcProj.setAttribute('stroke-dashoffset', projOffset.toFixed(1));
  const b = band(a.globalScore);
  arcProj.setAttribute('stroke', b.tint);

  const projCard = $('projCard');
  projCard.querySelector('div:last-child').textContent = projected;
  $('projHint').textContent =
    realized > 0 ? '+' + realized + ' pts gagnés sur ' + totalPts : "jusqu'à +" + totalPts + ' pts · cochez le plan';
  projCard.className = 'kpi-card ' + (realized > 0 ? 'proj-card-success' : 'proj-card-default');

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
      return `<div class="checklist-item ${on ? 'checklist-item-done' : ''}" data-index="${i}">
      <div class="checklist-checkbox">
        <span class="checklist-check"><svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M4 8.5l2.5 2.5 5-6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </div>
      <span class="prio-badge" style="background:${p.bg};color:${p.color};">${item.priority}</span>
      <span class="checklist-task">${escapeHtml(item.task)}</span>
      <span class="checklist-points">+${item.pts} pts</span>
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
