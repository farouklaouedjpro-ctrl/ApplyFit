import { $ } from '../utils.js';
import { state, modeSetters } from '../modules/state.js';
import { checkCanAnalyze } from './analyzeForm.js';

export function setupModeToggle(type) {
  const fileBtn = $(type + 'FileMode');
  const pasteBtn = $(type + 'PasteMode');
  const filePanel = $(type + 'FilePanel');
  const pastePanel = $(type + 'PastePanel');
  const textarea = $(type + 'Text');

  function setMode(mode) {
    if (mode === 'file') {
      state[type + 'Mode'] = 'file';
      fileBtn.classList.add('active');
      pasteBtn.classList.remove('active');
      pasteBtn.style.background = 'transparent';
      pasteBtn.style.color = '#5B6678';
      fileBtn.style.background = '#101826';
      fileBtn.style.color = '#fff';
      fileBtn.style.boxShadow = '0 1px 2px rgba(16,24,38,.25)';
      filePanel.style.display = 'block';
      pastePanel.style.display = 'none';
    } else {
      state[type + 'Mode'] = 'paste';
      pasteBtn.classList.add('active');
      fileBtn.classList.remove('active');
      fileBtn.style.background = 'transparent';
      fileBtn.style.color = '#5B6678';
      pasteBtn.style.background = '#101826';
      pasteBtn.style.color = '#fff';
      pasteBtn.style.boxShadow = '0 1px 2px rgba(16,24,38,.25)';
      filePanel.style.display = 'none';
      pastePanel.style.display = 'block';
    }
  }

  modeSetters[type] = setMode;

  fileBtn.addEventListener('click', () => setMode('file'));
  pasteBtn.addEventListener('click', () => setMode('paste'));

  textarea.addEventListener('input', () => {
    state[type + 'Text'] = textarea.value;
    checkCanAnalyze();
  });

  setMode(state[type + 'Mode']);
}
