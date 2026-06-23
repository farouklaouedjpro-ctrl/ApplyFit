import { $ } from '../utils.js';
import { state } from './state.js';

const viewInput = $('viewInput');
const viewAnalyzing = $('viewAnalyzing');
const viewResults = $('viewResults');
export const isResultsPage = !viewInput && !viewAnalyzing && !!viewResults;

export function showView(name) {
  if (viewInput) viewInput.classList.remove('active');
  if (viewAnalyzing) viewAnalyzing.classList.remove('active');
  if (viewResults) viewResults.classList.remove('active');
  if (name === 'input' && viewInput) viewInput.classList.add('active');
  else if (name === 'analyzing' && viewAnalyzing) viewAnalyzing.classList.add('active');
  else if (name === 'results' && viewResults) viewResults.classList.add('active');
}

export function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab-content').forEach((el) => el.classList.remove('active'));
  const el = $('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (el) el.classList.add('active');

  const btnMap = { overview: 'tabOverviewBtn', skills: 'tabSkillsBtn', plan: 'tabPlanBtn', ats: 'tabAtsBtn' };
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
