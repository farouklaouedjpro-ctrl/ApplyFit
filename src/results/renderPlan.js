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
  $('deltaLabel').style.background = realized > 0 ? 'rgba(127,208,166,.2)' : 'rgba(255,255,255,.1)';
  $('deltaLabel').style.color = realized > 0 ? '#7FD0A6' : '#9AA4B2';

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
  projCard.style.background = realized > 0 ? '#F1FBF5' : '#F7FAFC';
  projCard.style.borderColor = realized > 0 ? '#BFE6CD' : '#DCE3EC';

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
