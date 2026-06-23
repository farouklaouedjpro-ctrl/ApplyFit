export const state = {
  step: 'input',
  tab: 'overview',
  cvMode: 'file',
  offerMode: 'file',
  displayedScore: 0,
  targetScore: 0,
  checked: {},
  cvText: '',
  offerText: '',
  analysis: null,
  ats: null,
  fileContent: { cv: null, offer: null },
  currentHistoryIndex: -1,
  copied: null,
};

export let scoreInterval = null;
export let analyzeInterval = null;
export let copyTimeout = null;
export const modeSetters = {};

export function setScoreInterval(v) {
  scoreInterval = v;
}
export function setAnalyzeInterval(v) {
  analyzeInterval = v;
}
export function setCopyTimeout(v) {
  copyTimeout = v;
}
