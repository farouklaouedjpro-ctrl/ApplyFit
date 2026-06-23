import { $ } from '../utils.js';

export function initSidebar() {
  const hamburgerBtn = $('hamburgerBtn');
  const sidebar = $('sidebar');
  const sidebarOverlay = $('sidebarOverlay');
  if (!hamburgerBtn || !sidebar || !sidebarOverlay) return;

  function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('open');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  }

  hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  sidebarOverlay.addEventListener('click', closeSidebar);

  const historyList = $('historyList');
  if (historyList) {
    historyList.addEventListener('click', () => {
      if (window.innerWidth <= 940) closeSidebar();
    });
  }
}
