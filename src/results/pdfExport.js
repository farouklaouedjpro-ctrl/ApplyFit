import { $, showToast } from '../utils.js';
import { state } from '../modules/state.js';

export function initPdfExport() {
  const exportPdfBtn = $('exportPdfBtn');
  if (!exportPdfBtn) return;

  exportPdfBtn.addEventListener('click', () => {
    if (!state.analysis) return;
    if (typeof html2pdf === 'undefined') {
      showToast('Générateur PDF indisponible.', 'error');
      return;
    }

    const source = $('viewResults');
    const title = $('resultJobTitle').textContent.trim() || 'ApplyFit-analyse';
    const safeTitle = title.replace(/[^a-z0-9\u00C0-\u017F_-]+/gi, '-').replace(/^-|-$/g, '');

    const clone = source.cloneNode(true);
    clone.style.maxWidth = '920px';
    clone.style.margin = '0';
    clone.style.padding = '24px';
    clone.style.background = '#ffffff';

    const shareBtn = clone.querySelector('#shareBtn');
    const exportBtn = clone.querySelector('#exportPdfBtn');
    if (shareBtn) shareBtn.style.display = 'none';
    if (exportBtn) exportBtn.style.display = 'none';

    clone.querySelectorAll('.tab-content').forEach((tab) => {
      tab.classList.add('active');
      tab.style.display = 'block';
      tab.style.marginBottom = '24px';
    });

    const tabNav = clone.querySelector('#tabNav');
    if (tabNav) tabNav.style.display = 'none';

    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-9999px';
    wrapper.style.top = '0';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const opt = {
      margin: [10, 10],
      filename: `${safeTitle || 'ApplyFit-analyse'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .set(opt)
      .from(clone)
      .save()
      .then(() => wrapper.remove())
      .catch(() => {
        wrapper.remove();
        showToast('Erreur lors de la génération du PDF.', 'error');
      });
  });
}
