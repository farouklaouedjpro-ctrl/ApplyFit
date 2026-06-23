import { $, showToast } from '../utils.js';
import { state } from '../modules/state.js';
import { readFileContent } from '../modules/pdfReader.js';
import { checkCanAnalyze } from './analyzeForm.js';

export function setupFileUpload(type) {
  const fileInput = $(type + 'FileInput');
  const fileInfo = $(type + 'FileInfo');
  const fileName = $(type + 'FileName');
  const removeBtn = $(type + 'RemoveFile');
  const dropZone = $(type + 'DropZone');
  const textarea = $(type + 'Text');
  const dropCard = document.querySelector(`[data-drop="${type}"]`);

  let dragCounter = 0;

  function showDragOver() {
    dropZone.style.borderColor = type === 'cv' ? '#2F6BFF' : '#D98A00';
    dropZone.style.background = type === 'cv' ? 'rgba(47,107,255,.04)' : 'rgba(217,138,0,.04)';
    dropCard.classList.add('drag-over');
  }

  function hideDragOver() {
    dropZone.style.borderColor = '#CBD5E6';
    dropZone.style.background = '#FAFBFD';
    dropCard.classList.remove('drag-over');
  }

  async function handleFile(file) {
    if (!file) return;
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('Fichier trop volumineux. Taille maximum : 5 Mo.', 'error');
      return;
    }
    const allowedTypes = ['text/plain', 'application/pdf'];
    const allowedExt = ['.txt', '.pdf'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExt.includes(ext)) {
      showToast('Format non supporté. Utilisez PDF ou TXT.', 'error');
      return;
    }
    try {
      const content = await readFileContent(file);
      state.fileContent[type] = content;
      fileName.textContent = file.name;
      fileInfo.classList.add('active');
      textarea.value = content;
      state[type + 'Text'] = content;
      checkCanAnalyze();
    } catch {
      showToast("Erreur lors de la lecture du fichier. Vérifiez qu'il n'est pas protégé par mot de passe.", 'error');
    }
  }

  function removeFile() {
    state.fileContent[type] = null;
    fileInput.value = '';
    fileInfo.classList.remove('active');
    textarea.value = '';
    state[type + 'Text'] = '';
    checkCanAnalyze();
  }

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    if (dragCounter === 1) showDragOver();
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      hideDragOver();
    }
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    hideDragOver();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));
  removeBtn.addEventListener('click', removeFile);
}
