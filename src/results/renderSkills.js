import { $, escapeHtml } from '../utils.js';
import { state, copyTimeout, setCopyTimeout } from '../modules/state.js';

export function renderSkills() {
  const a = state.analysis;
  if (!a) return;

  $('foundKeywords').innerHTML = a.found.length
    ? a.found.map((k) => `<span class="keyword-tag found">${escapeHtml(k)}</span>`).join('')
    : '<span class="empty-state-text">Aucun mot-clé commun détecté</span>';
  $('foundCount').textContent = a.found.length + ' compétences';
  $('skillCountBadge').textContent = a.found.length + a.missing.length;

  const detailContainer = $('missingDetail');
  if (a.missingDetail && a.missingDetail.length > 0) {
    detailContainer.innerHTML = a.missingDetail
      .map(
        (m) => `
      <div class="missing-detail-row">
        <div><span class="missing-kw">${escapeHtml(m.kw)}</span></div>
        <div>
          <div class="missing-section-label text-light">Dans l'offre</div>
          <div class="missing-detail-text">${escapeHtml(m.inOffer)}</div>
        </div>
        <div>
          <div class="missing-section-label text-blue">À ajouter dans</div>
          <div class="missing-detail-target">${escapeHtml(m.addTo)}</div>
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
          <div class="missing-detail-text">Compétence attendue par l'offre</div>
        </div>
        <div>
          <div class="missing-section-label text-blue">À ajouter dans</div>
          <div class="missing-detail-target">Section Compétences techniques</div>
        </div>
      </div>
    `,
      )
      .join('');
  } else {
    detailContainer.innerHTML = '<span class="empty-state-text">Toutes les compétences sont présentes !</span>';
  }
}

export function renderReformulations() {
  const a = state.analysis;
  if (!a) return;
  const copyIconCheck = 'M3.5 8.5l3 3 6-7';
  const copyIconCopy = 'M5.5 5.5V3.5h7v7h-2M3.5 5.5h7v7h-7z';

  const list = $('reformulationsList');
  list.innerHTML = a.reformulations
    .map((rf, i) => {
      const on = state.copied === i;
      return `<div class="reformulation-item">
      <div class="reformulation-block reformulation-block-before">
        <div class="reformulation-block-label reformulation-block-label-before">Avant</div>
        <div class="reformulation-block-content reformulation-block-content-before">${escapeHtml(rf.cv)}</div>
      </div>
      <div class="afb-arrow"><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M4 10h11M11 5l5 5-5 5" stroke="#2F6BFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="reformulation-block reformulation-block-after">
        <div class="reformulation-header">
          <div class="reformulation-block-label reformulation-block-label-after">Après</div>
          <button class="copy-btn${on ? ' copied' : ''}" data-index="${i}">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="${on ? copyIconCheck : copyIconCopy}" stroke="${on ? '#16A34A' : '#2F6BFF'}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            ${on ? 'Copié' : 'Copier'}
          </button>
        </div>
        <div class="reformulation-block-content reformulation-block-content-after">${escapeHtml(rf.suggestion)}</div>
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
      setCopyTimeout(
        setTimeout(() => {
          state.copied = null;
          renderReformulations();
        }, 1600),
      );
      renderReformulations();
    });
  });
}
