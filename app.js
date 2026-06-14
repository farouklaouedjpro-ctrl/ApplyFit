const BACKEND_URL = 'http://localhost:3001/api';

const keywordDatabase = {
  technical: { label: 'Compétences techniques', keywords: [
    'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'svelte', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'oracle',
    'docker', 'kubernetes', 'jenkins', 'github actions', 'gitlab ci', 'ci/cd', 'terraform', 'ansible',
    'aws', 'azure', 'gcp', 'cloud', 'serverless',
    'rest', 'graphql', 'grpc', 'api', 'microservices',
    'machine learning', 'deep learning', 'ai', 'data science', 'nlp', 'tensorflow', 'pytorch',
    'agile', 'scrum', 'kanban', 'jira', 'confluence',
    'git', 'linux', 'bash', 'powershell', 'vim',
    'react native', 'flutter', 'android', 'ios',
    'unit testing', 'jest', 'pytest', 'cypress', 'selenium',
    'redux', 'context api', 'zustand', 'mobx',
    'webpack', 'vite', 'babel', 'esbuild', 'npm', 'yarn',
    'design patterns', 'solid', 'clean architecture', 'tdd', 'ddd',
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    'seo', 'accessibility', 'a11y', 'responsive', 'performance',
    'blockchain', 'web3', 'solidity',
  ]},
  soft: { label: 'Soft skills', keywords: [
    'communication', 'leadership', 'travail d\'équipe', 'teamwork', 'autonomie', 'autonomous',
    'gestion de projet', 'project management', 'résolution de problèmes', 'problem solving',
    'créativité', 'creativity', 'adaptabilité', 'adaptability', 'curiosité', 'curiosity',
    'rigueur', 'rigor', 'organisation', 'organization', 'gestion du temps', 'time management',
    'esprit critique', 'critical thinking', 'négociation', 'negotiation',
    'présentation', 'presentation', 'rédaction', 'writing',
    'collaboration', 'collaboration', 'empathie', 'empathy',
    'résilience', 'resilience', 'initiative', 'initiative',
    'polyvalence', 'versatility', 'pédagogie', 'teaching',
    'prise de décision', 'decision making', 'management',
    'relation client', 'customer relations', 'service client', 'customer service',
  ]},
  tools: { label: 'Outils & logiciels', keywords: [
    'excel', 'word', 'powerpoint', 'outlook', 'teams', 'slack', 'discord', 'notion',
    'tableau', 'power bi', 'looker', 'google analytics', 'matomo',
    'salesforce', 'hubspot', 'zoho', 'oracle crm',
    'sap', 'oracle erp', 'microsoft dynamics',
    'photoshop', 'illustrator', 'indesign', 'premiere pro', 'after effects', 'final cut',
    'blender', 'unity', 'unreal engine',
    'matlab', 'r', 'spss', 'stata', 'sas', 'minitab',
    'revit', 'autocad', 'solidworks', 'catia',
    'trello', 'asana', 'notion', 'basecamp', 'clickup',
    'sentry', 'datadog', 'new relic', 'grafana', 'prometheus',
  ]},
  education: { label: 'Formation & diplômes', keywords: [
    'master', 'bachelor', 'licence', 'doctorat', 'phd', 'dut', 'bts', 'bac+5', 'bac+3', 'bac+2',
    'ingénieur', 'engineering', 'informatique', 'computer science',
    'marketing', 'finance', 'commerce', 'business', 'gestion', 'management',
    'école de commerce', 'business school', 'université', 'university',
    'alternance', 'apprentissage', 'stage', 'internship',
    'formation', 'certification', 'certificate',
    'mooc', 'coursera', 'udemy', 'udacity', 'openclassrooms',
    'baccalauréat', 'bac', 'brevet',
    'master spécialisé', 'mastère', 'mba', 'executive education',
    'rh', 'ressources humaines', 'psychologie', 'sociologie',
    'droit', 'law', 'science politique', 'political science',
    'architecture', 'design', 'art', 'création',
  ]},
  languages: { label: 'Langues', keywords: [
    'français', 'francais', 'french', 'anglais', 'english', 'espagnol', 'spanish',
    'allemand', 'german', 'italien', 'italian', 'portugais', 'portuguese',
    'chinois', 'mandarin', 'japonais', 'japanese', 'arabe', 'arabic',
    'bilingue', 'bilingual', 'courant', 'fluent', 'native', 'langue maternelle',
    'toeic', 'toefl', 'ielts', 'cambridge', 'dalf', 'delf', 'tcf',
    'niveau c1', 'niveau c2', 'niveau b2', 'niveau b1',
  ]},
  experience: { label: 'Expérience & secteurs', keywords: [
    'stage', 'internship', 'alternance', 'apprentissage', 'cdi', 'cdd', 'freelance',
    'développement', 'development', 'web', 'mobile', 'logiciel', 'software',
    'data', 'analyse', 'analysis', 'business intelligence', 'bi',
    'cybersécurité', 'cybersecurity', 'sécurité', 'security',
    'devops', 'sre', 'infrastructure', 'sysadmin', 'network',
    'marketing digital', 'digital marketing', 'seo', 'sea', 'social media',
    'commerce', 'sales', 'business development', 'commercial',
    'finance', 'comptabilité', 'accounting', 'audit', 'contrôle de gestion',
    'ressources humaines', 'human resources', 'recrutement', 'recruitment',
    'conseil', 'consulting', 'strategy', 'stratégie',
    'logistique', 'logistics', 'supply chain', 'achats', 'procurement',
    'enseignement', 'education', 'formation', 'training',
    'santé', 'health', 'médical', 'medical', 'soins', 'care',
    'immobilier', 'real estate', 'construction', 'btp',
    'hôtellerie', 'hospitality', 'tourisme', 'tourism', 'restauration',
    'agriculture', 'agroalimentaire', 'food', 'environnement', 'environment',
    'design', 'ux', 'ui', 'product design', 'graphic design',
    'product management', 'product owner', 'chef de produit',
    'chef de projet', 'project manager', 'scrum master',
    'support', 'helpdesk', 'assistance', 'technicien', 'technician',
  ]},
};

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const SCORE_THRESHOLDS = { excellent: 80, good: 60, average: 40, low: 20 };

function getLevel(score) {
  if (score >= SCORE_THRESHOLDS.excellent) return 'excellent';
  if (score >= SCORE_THRESHOLDS.good) return 'good';
  if (score >= SCORE_THRESHOLDS.average) return 'average';
  return 'low';
}

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^a-zàâçéèêëîïôûùüÿœæ0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(t => t.length > 1);
}

function extractMultiWordKeywords(text, keywords) {
  const lowerText = text.toLowerCase();
  const found = [];
  for (const kw of keywords) {
    if (kw.includes(' ') || kw.includes('-')) {
      if (lowerText.includes(kw)) found.push(kw);
    }
  }
  return found;
}

function analyzeKeywords(cvText, offerText) {
  const cvTokens = tokenize(cvText);
  const cvTokensSet = new Set(cvTokens);
  const cvLower = cvText.toLowerCase();
  const offerLower = offerText.toLowerCase();
  const offerTokens = new Set(tokenize(offerText));
  const categories = {};

  for (const [catKey, category] of Object.entries(keywordDatabase)) {
    const cvFound = [];
    const offerFound = [];
    const missingFromCV = [];

    for (const kw of category.keywords) {
      const isMulti = kw.includes(' ') || kw.includes('-');
      const inOffer = isMulti ? offerLower.includes(kw) : offerTokens.has(kw);
      const inCV = isMulti ? cvLower.includes(kw) : cvTokensSet.has(kw);
      if (inOffer) offerFound.push(kw);
      if (inOffer && inCV) cvFound.push(kw);
      if (inOffer && !inCV) missingFromCV.push(kw);
    }

    const totalRelevant = offerFound.length;
    let score = 0;
    if (totalRelevant > 0) score = Math.round((cvFound.length / totalRelevant) * 100);

    categories[catKey] = { label: category.label, score, found: cvFound, missing: missingFromCV, total: totalRelevant };
  }
  return categories;
}

function calculateGlobalScore(categories) {
  let totalScore = 0, totalWeight = 0;
  const weights = { technical: 35, experience: 25, soft: 15, education: 15, languages: 5, tools: 5 };
  for (const [key, cat] of Object.entries(categories)) {
    const weight = weights[key] || 10;
    totalScore += cat.score * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return 0;
  const base = Math.round(totalScore / totalWeight);
  const allMissing = Object.values(categories).reduce((acc, cat) => acc + cat.missing.length, 0);
  const penalty = Math.max(0, allMissing - 3) * 2;
  return Math.max(0, Math.min(100, base - penalty));
}

function deduplicateArray(arr) {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  return arr.filter(item => {
    const key = String(item).toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function band(s) {
  if (s >= 75) return { color: '#16A34A', bg: '#E7F6EC', tint: '#B6E6C7' };
  if (s >= 55) return { color: '#D98A00', bg: '#FFF6E6', tint: '#F5D79A' };
  return { color: '#E5484D', bg: '#FDECEC', tint: '#F4B8B6' };
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ===== State =====
const state = {
  step: 'input',
  tab: 'overview',
  cvMode: 'file',
  offerMode: 'file',
  displayedScore: 0,
  targetScore: 0,
  checked: {},
  cvText: "Développeur web junior — 2 ans d'expérience\n\nCompétences : JavaScript, React, Node.js, HTML/CSS, Git, API REST, méthode Agile.\nExpérience : sites web pour des PME. Bonne connaissance de JavaScript.\nFormation : Licence professionnelle Développement Web (Bac+3).\nLangues : Français (natif), Anglais (courant).",
  offerText: "Développeur Full-Stack JavaScript (H/F) — Nexora\n\nMissions : applications réactives, conception d'API, déploiement continu.\nProfil : React, Node, TypeScript, Docker, tests unitaires, CI/CD, PostgreSQL.\nFormation : Bac+5. Anglais professionnel.",
  analysis: null,
  fileContent: { cv: null, offer: null },
  currentHistoryIndex: -1,
};

let historyIdCounter = 0;
const historyData = [
  {
    id: ++historyIdCounter,
    job: 'Développeur Full-Stack JS',
    score: 74, date: '14 juin · Nexora',
    analysis: {
      globalScore: 74, confidence: 92,
      categories: [
        { label: 'Technique', weight: 35, score: 78 },
        { label: 'Expérience', weight: 25, score: 65 },
        { label: 'Soft skills', weight: 15, score: 82 },
        { label: 'Formation', weight: 15, score: 60 },
        { label: 'Langues', weight: 5, score: 90 },
        { label: 'Outils', weight: 5, score: 70 },
      ],
      found: ['JavaScript','React','Node.js','Git','API REST','Agile','Communication','Anglais'],
      missing: ['TypeScript','Docker','CI/CD','Tests unitaires','PostgreSQL'],
      missingDetail: [
        { kw:'TypeScript', inOffer:'« maîtrise de React, Node, TypeScript »', addTo:'Section Compétences techniques' },
        { kw:'Docker', inOffer:'« Docker, déploiement continu »', addTo:'Une expérience de projet' },
        { kw:'CI/CD', inOffer:'« tests unitaires, CI/CD »', addTo:'Section Compétences / Outils' },
        { kw:'Tests unitaires', inOffer:'« tests unitaires »', addTo:'Décrire dans une expérience' },
        { kw:'PostgreSQL', inOffer:'« PostgreSQL »', addTo:'Section Compétences techniques' },
      ],
      checklist: [
        { priority:'Haute', task:'Ajouter TypeScript à vos compétences techniques', pts:6 },
        { priority:'Haute', task:'Chiffrer vos résultats sur chaque expérience', pts:5 },
        { priority:'Moyenne', task:'Mentionner Docker et le déploiement continu', pts:4 },
        { priority:'Basse', task:'Préciser votre niveau d\'anglais (TOEIC...)', pts:1 },
      ],
      reformulations: [
        { cv:'J\'ai travaillé sur des sites web pour des PME.', suggestion:'Développé 3 applications React en production (5 000+ utilisateurs/mois).' },
        { cv:'Bonne connaissance de JavaScript.', suggestion:'Maîtrise de JavaScript ES6+, React et Node.js, API REST déployée en autonomie.' },
      ],
    },
    checked: {},
  },
  {
    id: ++historyIdCounter,
    job: 'Développeur Front-End React',
    score: 81, date: '12 juin · Alvio',
    analysis: {
      globalScore: 81, confidence: 94,
      categories: [
        { label: 'Technique', weight: 35, score: 85 },
        { label: 'Expérience', weight: 25, score: 78 },
        { label: 'Soft skills', weight: 15, score: 84 },
        { label: 'Formation', weight: 15, score: 75 },
        { label: 'Langues', weight: 5, score: 90 },
        { label: 'Outils', weight: 5, score: 80 },
      ],
      found: ['JavaScript','React','TypeScript','Redux','HTML/CSS','Git','Agile','Anglais'],
      missing: ['Next.js','Storybook','Cypress'],
      missingDetail: [
        { kw:'Next.js', inOffer:'« framework React côté serveur »', addTo:'Section Compétences techniques' },
        { kw:'Storybook', inOffer:'« bibliothèque de composants »', addTo:'Section Outils' },
        { kw:'Cypress', inOffer:'« tests end-to-end »', addTo:'Décrire dans une expérience' },
      ],
      checklist: [
        { priority:'Haute', task:'Ajouter Next.js à vos compétences', pts:5 },
        { priority:'Moyenne', task:'Mentionner Storybook pour les composants', pts:3 },
        { priority:'Basse', task:'Ajouter Cypress aux outils de test', pts:2 },
      ],
      reformulations: [
        { cv:'Développement d\'interfaces utilisateur.', suggestion:'Développement d\'applications React avec TypeScript et Redux, déploiement via Vercel.' },
      ],
    },
    checked: {},
  },
];

const analyzeStepLabels = [
  'Lecture du CV', 'Extraction des compétences', 'Comparaison à l\'offre', 'Calcul du score pondéré'
];

let scoreInterval = null;
let analyzeInterval = null;
let copyTimeout = null;

// ===== DOM refs =====
const $ = id => document.getElementById(id);
const viewInput = $('viewInput');
const viewAnalyzing = $('viewAnalyzing');
const viewResults = $('viewResults');

function showView(name) {
  viewInput.style.display = 'none';
  viewAnalyzing.style.display = 'none';
  viewResults.style.display = 'none';
  if (name === 'input') viewInput.style.display = 'block';
  else if (name === 'analyzing') viewAnalyzing.style.display = 'flex';
  else if (name === 'results') viewResults.style.display = 'block';
}

// ===== Tab switching =====
function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  const el = $('tab' + tab.charAt(0).toUpperCase() + tab.slice(1));
  if (el) el.style.display = 'block';

  const btnMap = { overview: 'tabOverviewBtn', skills: 'tabSkillsBtn', plan: 'tabPlanBtn' };
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.id === btnMap[tab];
    btn.style.borderColor = isActive ? '#2F6BFF' : '#E1E6EF';
    btn.style.boxShadow = isActive ? '0 8px 20px -10px rgba(47,107,255,.45)' : 'none';
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    const iconBox = btn.querySelector('div:first-child');
    if (iconBox) {
      iconBox.style.background = isActive ? '#EAF0FF' : '#EEF1F6';
      const svg = iconBox.querySelector('svg path, svg rect');
      const paths = iconBox.querySelectorAll('svg path');
      if (svg) svg.setAttribute('stroke', isActive ? '#2F6BFF' : '#7A8699');
      paths.forEach(p => {
        if (p.getAttribute('stroke') && p.getAttribute('stroke') !== '#fff') {
          p.setAttribute('stroke', isActive ? '#2F6BFF' : '#7A8699');
        }
      });
    }
    const subText = btn.querySelector('div:nth-child(2) div:last-child');
    if (subText) subText.style.color = isActive ? '#5B6678' : '#9AA4B2';
    const dot = btn.querySelector('span:last-child');
    if (dot && btn.querySelector('div:nth-child(2)')) dot.style.background = isActive ? '#2F6BFF' : '#D7DEEA';
    const badge = btn.querySelector('[id$="Badge"]');
    if (badge) {
      badge.style.background = isActive ? '#EAF0FF' : '#EEF1F6';
      badge.style.color = isActive ? '#2F6BFF' : '#7A8699';
    }
  });
}

// ===== Mode toggling (Importer/Coller) =====
function setupModeToggle(type) {
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

  fileBtn.addEventListener('click', () => setMode('file'));
  pasteBtn.addEventListener('click', () => setMode('paste'));

  textarea.addEventListener('input', () => {
    state[type + 'Text'] = textarea.value;
    checkCanAnalyze();
  });

  setMode(state[type + 'Mode']);
}

// ===== File upload & drag-drop =====
async function readPDFContent(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    fullText += textContent.items.map(item => item.str).join(' ') + '\n';
  }
  return fullText;
}

function readFileContent(file) {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      readPDFContent(file).then(resolve).catch(reject);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}

function setupFileUpload(type) {
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
    try {
      const content = await readFileContent(file);
      state.fileContent[type] = content;
      fileName.textContent = file.name;
      fileInfo.style.display = 'flex';
      textarea.value = content;
      state[type + 'Text'] = content;
      checkCanAnalyze();
    } catch (err) {
      alert('Erreur lors de la lecture du fichier.');
    }
  }

  function removeFile() {
    state.fileContent[type] = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    textarea.value = '';
    state[type + 'Text'] = '';
    checkCanAnalyze();
  }

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragenter', e => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;
    if (dragCounter === 1) showDragOver();
  });

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopPropagation();
  });

  dropZone.addEventListener('dragleave', e => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;
    if (dragCounter <= 0) { dragCounter = 0; hideDragOver(); }
  });

  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    hideDragOver();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener('change', e => handleFile(e.target.files[0]));
  removeBtn.addEventListener('click', removeFile);
}

function checkCanAnalyze() {
  const cvOk = (state.cvText || '').trim().length > 0;
  const offerOk = (state.offerText || '').trim().length > 0;
  const btn = $('analyzeBtn');
  const hintBox = $('hintBox');

  if (cvOk && offerOk) {
    btn.disabled = false;
    btn.style.background = '#101826';
    btn.style.cursor = 'pointer';
    btn.style.opacity = '1';
    hintBox.innerHTML = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2l6 3v5c0 3.5-2.5 6.5-6 8-3.5-1.5-6-4.5-6-8V5l6-3z" stroke="#5B6678" stroke-width="1.4" stroke-linejoin="round"/></svg>Traitement local et sécurisé · aucun stockage';
    hintBox.style.color = '#5B6678';
  } else {
    btn.disabled = true;
    btn.style.background = '#9AA4B2';
    btn.style.cursor = 'not-allowed';
    btn.style.opacity = '.7';
    hintBox.innerHTML = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2l6 3v5c0 3.5-2.5 6.5-6 8-3.5-1.5-6-4.5-6-8V5l6-3z" stroke="#C0322E" stroke-width="1.4" stroke-linejoin="round"/></svg>Ajoutez votre CV et l\'offre pour lancer l\'analyse';
    hintBox.style.color = '#C0322E';
  }
}

// ===== Analyze steps =====
function renderAnalyzeSteps(index) {
  const container = $('analyzeSteps');
  container.innerHTML = analyzeStepLabels.map((label, i) => {
    const done = i < index;
    const active = i === index;
    let dotBg, checkOp, textColor;
    if (done) { dotBg = '#16A34A'; checkOp = '1'; textColor = '#101826'; }
    else if (active) { dotBg = '#2F6BFF'; checkOp = '0'; textColor = '#101826'; }
    else { dotBg = '#D7DEEA'; checkOp = '0'; textColor = '#9AA4B2'; }
    return `<div style="display:flex;align-items:center;gap:11px;padding:10px 14px;background:#fff;border:1px solid #E1E6EF;border-radius:10px;">
      <div style="width:20px;height:20px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:${dotBg};">
        <span style="opacity:${checkOp};display:flex;"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M4 8.5l2.5 2.5 5-6" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </div>
      <span style="font-size:13.5px;font-weight:500;color:${textColor};">${label}</span>
    </div>`;
  }).join('');
}

// ===== History =====
function renderHistory(activeIndex) {
  $('historyList').innerHTML = historyData.map((h, i) => {
    const b = band(h.score);
    const isActive = i === (activeIndex !== undefined ? activeIndex : 0);
    return `<div class="history-item" data-index="${i}" style="background:${isActive ? 'rgba(47,107,255,.14)' : 'transparent'};">
      <div style="width:38px;height:38px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;background:${b.bg};color:${b.color};">${h.score}</div>
      <div style="min-width:0;flex:1;">
        <div class="history-job-title" data-index="${i}" style="font-size:13px;font-weight:600;color:${isActive ? '#fff' : '#C7D0DE'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:text;">${escapeHtml(h.job)}</div>
        <div style="font-size:11px;color:#6B7689;">${h.date}</div>
      </div>
      <button class="history-delete" title="Supprimer" style="width:26px;height:26px;border-radius:6px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;opacity:0;transition:opacity .15s,background .15s;" onmouseover="this.style.opacity='1';this.style.background='rgba(255,255,255,.08)'" onmouseout="this.style.opacity='0';this.style.background='transparent'">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="#9AA4B2" stroke-width="1.7" stroke-linecap="round"/></svg>
      </button>
    </div>`;
  }).join('');

  $('historyList').querySelectorAll('.history-item').forEach(el => {
    const idx = parseInt(el.dataset.index);
    const deleteBtn = el.querySelector('.history-delete');
    deleteBtn.addEventListener('click', e => {
      e.stopPropagation();
      const wasActive = idx === state.currentHistoryIndex;
      historyData.splice(idx, 1);
      if (historyData.length === 0) {
        $('historyList').innerHTML = '<div style="padding:20px 12px;text-align:center;font-size:13px;color:#5B6678;">Aucune analyse</div>';
        if (wasActive) {
          clearInterval(scoreInterval);
          clearInterval(analyzeInterval);
          state.analysis = null;
          state.displayedScore = 0;
          state.checked = {};
          state.currentHistoryIndex = -1;
          showView('input');
        }
        return;
      }
      if (wasActive) {
        clearInterval(scoreInterval);
        clearInterval(analyzeInterval);
        state.analysis = null;
        state.displayedScore = 0;
        state.checked = {};
        state.currentHistoryIndex = -1;
        showView('input');
      }
      const newIdx = Math.min(idx, historyData.length - 1);
      renderHistory(newIdx);
    });
    el.addEventListener('click', (e) => {
      if (e.target.closest('.history-delete') || e.target.closest('.history-job-title')) return;
      renderHistory(idx);
      loadHistoryAnalysis(idx);
    });
  });

  $('historyList').querySelectorAll('.history-job-title').forEach(el => {
    makeJobTitleEditable(el, val => commitJobTitle(val));
  });
}

function loadHistoryAnalysis(index) {
  const entry = historyData[index];
  if (!entry || !entry.analysis) return;
  state.currentHistoryIndex = index;
  state.analysis = JSON.parse(JSON.stringify(entry.analysis));
  state.checked = { ...(entry.checked || {}) };
  state.targetScore = state.analysis.globalScore;
  enterResults(true);
}

function saveAnalysisToHistory() {
  const a = state.analysis;
  if (!a) return;
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleDateString('fr-FR', { month: 'short' });
  const label = 'Analyse du ' + day + ' ' + month;
  historyData.unshift({
    id: ++historyIdCounter,
    job: label,
    score: a.globalScore,
    date: day + ' ' + month,
    analysis: JSON.parse(JSON.stringify(a)),
    checked: { ...state.checked },
  });
  state.currentHistoryIndex = 0;
  renderHistory(0);
}

function commitJobTitle(newTitle) {
  if (state.currentHistoryIndex < 0 || state.currentHistoryIndex >= historyData.length) return;
  const trimmed = newTitle.trim();
  if (!trimmed) return;
  historyData[state.currentHistoryIndex].job = trimmed;
  $('resultJobTitle').textContent = trimmed;
  renderHistory(state.currentHistoryIndex);
}

function makeJobTitleEditable(el, onCommit) {
  el.style.cursor = 'text';
  el.addEventListener('dblclick', () => {
    const current = el.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = current;
    input.style.cssText = 'font-family:inherit;font-size:inherit;font-weight:inherit;background:transparent;border:none;border-bottom:2px solid #2F6BFF;outline:none;color:inherit;width:100%;padding:0;';
    el.textContent = '';
    el.appendChild(input);
    input.focus();
    input.select();
    const finish = () => {
      const val = input.value;
      el.textContent = val || current;
      onCommit(val || current);
    };
    input.addEventListener('blur', finish);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { input.blur(); }
      if (e.key === 'Escape') { el.textContent = current; }
    });
  });
}

function animateScore(target) {
  state.displayedScore = 0;
  const kpi = $('kpiScore');
  const gauge = $('gaugeScore');
  clearInterval(scoreInterval);
  const r = 78;
  const circ = 2 * Math.PI * r;

  scoreInterval = setInterval(() => {
    let v = state.displayedScore + Math.max(1, Math.round((target - state.displayedScore) / 7));
    if (v >= target) { v = target; clearInterval(scoreInterval); }
    state.displayedScore = v;
    kpi.textContent = v;
    gauge.textContent = v;

    const b = band(target);
    gauge.style.color = b.color;
    const offset = circ * (1 - v / 100);
    $('gaugeArc').setAttribute('stroke-dashoffset', offset.toFixed(1));
    $('gaugeArc').setAttribute('stroke', b.color);
  }, 28);
}

function renderGauge() {
  const a = state.analysis;
  if (!a) return;
  const target = a.globalScore;
  const r = 78;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - target / 100);

  $('gaugeArc').setAttribute('stroke-dasharray', circ.toFixed(1));
  $('gaugeArcProj').setAttribute('stroke-dasharray', circ.toFixed(1));
}

function renderCategories() {
  const a = state.analysis;
  if (!a) return;
  const grid = $('categoriesGrid');
  grid.innerHTML = '';
  a.categories.forEach(cat => {
    const cb = band(cat.score);
    const div = document.createElement('div');
    div.style.cssText = 'border:1px solid #EDF0F5; border-radius:11px; padding:14px;';
    div.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;">
        <span style="font-size:13px;font-weight:600;">${cat.label}</span>
        <span style="font-size:10.5px;font-weight:600;color:#9AA4B2;background:#F4F6FA;padding:2px 7px;border-radius:99px;">${cat.weight}%</span>
      </div>
      <div style="display:flex;align-items:baseline;gap:5px;margin-bottom:8px;">
        <span style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${cb.color};">${cat.score}</span>
        <span style="font-size:12px;color:#9AA4B2;font-weight:600;">/100</span>
      </div>
      <div class="category-bar">
        <div class="category-bar-fill" style="background:${cb.color};width:${cat.score}%;"></div>
      </div>`;
    grid.appendChild(div);
  });
}

function renderSkills() {
  const a = state.analysis;
  if (!a) return;

  $('foundKeywords').innerHTML = a.found.length
    ? a.found.map(k => `<span class="keyword-tag found">${escapeHtml(k)}</span>`).join('')
    : '<span style="font-size:13px;color:#9AA4B2;">Aucun mot-clé commun détecté</span>';
  $('foundCount').textContent = a.found.length + ' compétences';
  $('skillCountBadge').textContent = a.found.length + a.missing.length;

  // Missing detail
  const detailContainer = $('missingDetail');
  if (a.missingDetail && a.missingDetail.length > 0) {
    detailContainer.innerHTML = a.missingDetail.map(m => `
      <div style="display:grid; grid-template-columns:150px 1fr 1fr; gap:14px; align-items:center; border:1px solid #F1E0E0; background:#FEF7F7; border-radius:12px; padding:14px 16px;">
        <div><span style="display:inline-block; padding:6px 12px; border-radius:8px; font-size:13px; font-weight:700; background:#FDECEC; color:#C0322E; border:1px solid #F6D4D3;">${escapeHtml(m.kw)}</span></div>
        <div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; color:#9AA4B2; margin-bottom:3px;">Dans l'offre</div>
          <div style="font-size:13px; color:#5B6678; font-style:italic; line-height:1.45;">${escapeHtml(m.inOffer)}</div>
        </div>
        <div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; color:#2F6BFF; margin-bottom:3px;">À ajouter dans</div>
          <div style="font-size:13px; color:#101826; font-weight:600; line-height:1.45;">${escapeHtml(m.addTo)}</div>
        </div>
      </div>
    `).join('');
  } else if (a.missing && a.missing.length > 0) {
    detailContainer.innerHTML = a.missing.map(k => `
      <div style="display:grid; grid-template-columns:150px 1fr 1fr; gap:14px; align-items:center; border:1px solid #F1E0E0; background:#FEF7F7; border-radius:12px; padding:14px 16px;">
        <div><span style="display:inline-block; padding:6px 12px; border-radius:8px; font-size:13px; font-weight:700; background:#FDECEC; color:#C0322E; border:1px solid #F6D4D3;">${escapeHtml(k)}</span></div>
        <div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; color:#9AA4B2; margin-bottom:3px;">Dans l'offre</div>
          <div style="font-size:13px; color:#5B6678; font-style:italic; line-height:1.45;">Compétence attendue par l'offre</div>
        </div>
        <div>
          <div style="font-size:10.5px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; color:#2F6BFF; margin-bottom:3px;">À ajouter dans</div>
          <div style="font-size:13px; color:#101826; font-weight:600; line-height:1.45;">Section Compétences techniques</div>
        </div>
      </div>
    `).join('');
  } else {
    detailContainer.innerHTML = '<span style="font-size:13px; color:#9AA4B2;">Toutes les compétences sont présentes !</span>';
  }
}

function renderReformulations() {
  const a = state.analysis;
  if (!a) return;
  const copyIconCheck = 'M3.5 8.5l3 3 6-7';
  const copyIconCopy = 'M5.5 5.5V3.5h7v7h-2M3.5 5.5h7v7h-7z';

  const list = $('reformulationsList');
  list.innerHTML = a.reformulations.map((rf, i) => {
    const on = state.copied === i;
    return `<div class="reformulation-item">
      <div style="padding:12px 14px;background:#FDECEC;border-radius:9px;">
        <div style="font-size:10.5px;font-weight:700;letter-spacing:.4px;color:#C0322E;text-transform:uppercase;margin-bottom:6px;">Avant</div>
        <div style="font-size:13px;color:#7A4F4D;line-height:1.5;">${escapeHtml(rf.cv)}</div>
      </div>
      <div class="afb-arrow" style="display:flex;align-items:center;justify-content:center;"><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><path d="M4 10h11M11 5l5 5-5 5" stroke="#2F6BFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div style="padding:12px 14px;background:#EAF0FF;border-radius:9px;position:relative;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <div style="font-size:10.5px;font-weight:700;letter-spacing:.4px;color:#2F6BFF;text-transform:uppercase;">Après</div>
          <button class="copy-btn" data-index="${i}" data-text="${escapeHtml(rf.suggestion)}" style="display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:7px;border:1px solid ${on ? '#C9EAD4' : '#CDD9EC'};background:${on ? '#E7F6EC' : '#fff'};color:${on ? '#16A34A' : '#2F6BFF'};font-family:inherit;font-size:11.5px;font-weight:600;cursor:pointer;">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="${on ? copyIconCheck : copyIconCopy}" stroke="${on ? '#16A34A' : '#2F6BFF'}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            ${on ? 'Copié' : 'Copier'}
          </button>
        </div>
        <div style="font-size:13px;color:#101826;font-weight:500;line-height:1.5;">${escapeHtml(rf.suggestion)}</div>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const i = parseInt(btn.dataset.index);
      const text = btn.dataset.text;
      try { navigator.clipboard.writeText(text); } catch(e) {}
      state.copied = i;
      clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => { state.copied = null; renderReformulations(); }, 1600);
      renderReformulations();
    });
  });
}

function renderChecklist() {
  const a = state.analysis;
  if (!a) return;
  const totalPts = a.checklist.reduce((s, c) => s + c.pts, 0);
  const realized = a.checklist.reduce((s, c, i) => s + (state.checked[i] ? c.pts : 0), 0);
  const projected = Math.min(100, a.globalScore + realized);
  const doneCount = Object.values(state.checked).filter(Boolean).length;
  const allDone = doneCount === a.checklist.length;

  // KPI projected box
  $('kpiProjected').textContent = projected;
  const delta = realized > 0 ? ('+' + realized + ' pts') : 'à activer';
  $('deltaLabel').textContent = delta;
  $('deltaLabel').style.background = realized > 0 ? 'rgba(127,208,166,.2)' : 'rgba(255,255,255,.1)';
  $('deltaLabel').style.color = realized > 0 ? '#7FD0A6' : '#9AA4B2';

  // Gauge projected arc
  const r = 78;
  const circ = 2 * Math.PI * r;
  const projOffset = circ * (1 - projected / 100);
  const arcProj = $('gaugeArcProj');
  arcProj.setAttribute('stroke-dashoffset', projOffset.toFixed(1));
  const b = band(a.globalScore);
  arcProj.setAttribute('stroke', b.tint);

  // Proj card
  const projCard = $('projCard');
  projCard.querySelector('div:last-child').textContent = projected;
  $('projHint').textContent = realized > 0
    ? ('+' + realized + ' pts gagnés sur ' + totalPts)
    : ('jusqu\'à +' + totalPts + ' pts · cochez le plan');
  projCard.style.background = realized > 0 ? '#F1FBF5' : '#F7FAFC';
  projCard.style.borderColor = realized > 0 ? '#BFE6CD' : '#DCE3EC';

  // Plan box
  $('planBaseScore').textContent = a.globalScore;
  $('planProjectedScore').textContent = projected;
  $('progressLabel').textContent = doneCount + '/' + a.checklist.length + ' action(s)';

  const pct = totalPts > 0 ? Math.round((realized / totalPts) * 100) : 0;
  $('planProgressBar').querySelector('div').style.width = pct + '%';

  const prioStyles = { 'Haute': { bg: '#FDECEC', color: '#C0322E' }, 'Moyenne': { bg: '#FFF6E6', color: '#B07908' }, 'Basse': { bg: '#EEF1F6', color: '#5B6678' } };

  $('checklistContainer').innerHTML = a.checklist.map((item, i) => {
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
  }).join('');

  $('checklistContainer').querySelectorAll('.checklist-item').forEach(el => {
    el.addEventListener('click', () => {
      const i = parseInt(el.dataset.index);
      state.checked[i] = !state.checked[i];
      renderChecklist();
    });
  });

  // Plan done box
  const doneBox = $('planDoneBox');
  if (allDone) {
    doneBox.style.display = 'flex';
    $('planFootnote').textContent = 'Plan terminé — score projeté à ' + projected + '/100. Pensez à mettre à jour votre CV puis relancez une analyse.';
  } else {
    doneBox.style.display = 'none';
  }
}

function enterResults(skipHistorySave) {
  clearInterval(analyzeInterval);
  showView('results');
  const a = state.analysis;
  if (!a) return;

  state.targetScore = a.globalScore;
  state.displayedScore = 0;

  const b = band(a.globalScore);

  // Gauge setup
  renderGauge();

  // Score animation
  animateScore(a.globalScore);

  // KPI
  $('kpiScore').style.color = b.color;
  $('kpiFound').textContent = a.found.length;
  $('kpiMissing').textContent = a.missing.length;

  // Exec summary
  const level = getLevel(a.globalScore);
  const totalPts = a.checklist ? a.checklist.reduce((s, c) => s + c.pts, 0) : 0;
  const ceiling = Math.min(100, a.globalScore + totalPts);
  const levelLabels = { excellent: 'excellent', good: 'solide', average: 'à consolider', low: 'à retravailler' };
  $('execSummary').textContent = `Profil ${levelLabels[level] || 'solide'} — ${a.checklist.length} actions pour passer de ${a.globalScore} à ${ceiling}.`;

  if (a.confidence !== undefined) {
    $('confidenceLabel').textContent = a.confidence + '%';
    $('confidenceBar').querySelector('div').style.width = a.confidence + '%';
  }

  // Verdict
  let verdict, vmsg;
  if (a.globalScore >= 75) { verdict = 'Forte compatibilité'; vmsg = 'Profil très aligné avec l\'offre.'; }
  else if (a.globalScore >= 60) { verdict = 'Bonne base à renforcer'; vmsg = '3 actions suffisent pour viser 90.'; }
  else if (a.globalScore >= 45) { verdict = 'Compatibilité partielle'; vmsg = 'Le potentiel est là, à consolider.'; }
  else { verdict = 'À retravailler'; vmsg = 'Plusieurs attentes clés manquent.'; }
  $('verdictTitle').textContent = verdict;
  $('verdictTitle').style.color = b.color;
  $('verdictBox').style.background = b.bg;
  $('verdictMessage').textContent = vmsg;

  // Alert
  if (a.alerts && a.alerts.length > 0) {
    const al = a.alerts[0];
    $('alertBanner').style.display = 'flex';
    $('alertTitle').textContent = 'Alerte · Écart de formation';
    $('alertDesc').textContent = al.offerRequires + ' — ' + al.suggestion;
  } else {
    $('alertBanner').style.display = 'flex';
    $('alertTitle').textContent = 'Alerte · Écart de formation';
    $('alertDesc').textContent = "L'offre demande un Bac+5, votre CV indique un Bac+3. Mettez en avant projets et certifications — un écart d'un niveau est rarement bloquant si l'expérience suit.";
  }

  // Categories
  renderCategories();

  // Skills
  renderSkills();

  // Reformulations
  renderReformulations();

  // Badges
  $('skillCountBadge').textContent = a.found.length + a.missing.length;
  $('planCountBadge').textContent = a.checklist.length;

  // Proj card
  renderChecklist();

  // Show overview tab
  switchTab('overview');

  viewResults.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (!skipHistorySave) saveAnalysisToHistory();
}

// ===== Analysis flow =====
async function runAnalysis() {
  const cv = state.cvText;
  const offer = state.offerText;
  if (!cv.trim() || !offer.trim()) return;

  clearInterval(scoreInterval);
  showView('analyzing');
  state.analyzeIndex = 0;
  renderAnalyzeSteps(0);

  let idx = 0;
  clearInterval(analyzeInterval);
  analyzeInterval = setInterval(() => {
    idx++;
    if (idx > analyzeStepLabels.length) {
      clearInterval(analyzeInterval);
      return;
    }
    renderAnalyzeSteps(idx);
  }, 480);

  setTimeout(async () => {
    clearInterval(analyzeInterval);
    renderAnalyzeSteps(analyzeStepLabels.length);

    // Try backend, fallback to local
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const result = await fetch(`${BACKEND_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: cv, offerText: offer }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (result.ok) {
        const data = await result.json();
        processAIResults(data, cv, offer);
        return;
      }
    } catch (e) {}

    // Fallback: local analysis
    const categories = analyzeKeywords(cv, offer);
    const globalScore = calculateGlobalScore(categories);
    const allFound = [];
    const allMissing = [];
    for (const cat of Object.values(categories)) {
      allFound.push(...cat.found);
      allMissing.push(...cat.missing);
    }
    const dedupFound = deduplicateArray(allFound);
    const dedupMissing = deduplicateArray(allMissing);

    const checklist = [];
    if (dedupMissing.length > 0) {
      dedupMissing.slice(0, 5).forEach((k, i) => {
        const priority = ['typescript', 'docker', 'ci/cd', 'postgresql', 'tests unitaires', 'aws', 'graphql', 'kubernetes'].includes(k.toLowerCase()) ? 'Haute' : 'Moyenne';
        checklist.push({ priority, task: `Ajouter ${k} à vos compétences`, pts: Math.max(1, 6 - i) });
      });
    }
    checklist.push({ priority: 'Haute', task: 'Chiffrer vos résultats sur chaque expérience', pts: 5 });

    const missingDetail = dedupMissing.slice(0, 5).map(k => ({
      kw: k,
      inOffer: 'Compétence attendue par l\'offre',
      addTo: 'Section Compétences techniques',
    }));

    state.analysis = {
      globalScore,
      confidence: null,
      categories: Object.entries(categories).map(([key, cat]) => ({
        label: cat.label,
        weight: { technical: 35, experience: 25, soft: 15, education: 15, languages: 5, tools: 5 }[key] || 10,
        score: cat.score,
      })),
      found: dedupFound,
      missing: dedupMissing,
      missingDetail,
      checklist,
      reformulations: [
        { cv: 'Expérience professionnelle dans le domaine.', suggestion: 'Concrétisez avec des métriques : "réalisé X projet, traité Y utilisateurs...' },
        { cv: 'Compétence en développement.', suggestion: 'Précisez la tech stack : "Développement React/Node.js avec API REST"' },
      ],
      alerts: [],
    };
    state.checked = {};
    state.targetScore = globalScore;
    enterResults();
  }, 2200);
}

function processAIResults(data, cvText, offerText) {
  const categories = {};
  for (const [key, cat] of Object.entries(data.categories || {})) {
    categories[key] = {
      label: keywordDatabase[key]?.label || key,
      score: cat.score || 0,
      found: deduplicateArray(cat.found || []),
      missing: deduplicateArray(cat.missing || []),
    };
  }

  const allFound = [];
  const allMissing = [];
  for (const cat of Object.values(categories)) {
    allFound.push(...cat.found);
    allMissing.push(...cat.missing);
  }
  const dedupFound = deduplicateArray(allFound);
  const dedupMissing = deduplicateArray(allMissing);

  const catEntries = Object.entries(categories);
  const globalScore = data.globalScore || calculateGlobalScore(categories);

  const categoryDisplay = catEntries.map(([key, cat]) => ({
    label: cat.label,
    weight: { technical: 35, experience: 25, soft: 15, education: 15, languages: 5, tools: 5 }[key] || 10,
    score: cat.score,
  }));

  // Build checklist from AI data
  const checklist = [];
  if (data.missingKeywords && data.missingKeywords.length > 0) {
    data.missingKeywords.slice(0, 5).forEach((mk, i) => {
      checklist.push({
        priority: i < 2 ? 'Haute' : (i < 4 ? 'Moyenne' : 'Basse'),
        task: `Ajouter ${mk.concreteSkill || mk.keyword} à votre CV`,
        pts: Math.max(1, 6 - i),
      });
    });
  } else if (dedupMissing.length > 0) {
    dedupMissing.slice(0, 4).forEach((k, i) => {
      checklist.push({
        priority: i < 2 ? 'Haute' : 'Moyenne',
        task: `Ajouter ${k} à vos compétences`,
        pts: Math.max(1, 6 - i),
      });
    });
  }
  if (checklist.length < 2) {
    checklist.push({ priority: 'Haute', task: 'Chiffrer vos résultats sur chaque expérience', pts: 5 });
  }

  // Build missing detail
  const missingDetail = [];
  if (data.missingKeywords && data.missingKeywords.length > 0) {
    data.missingKeywords.forEach(mk => {
      missingDetail.push({
        kw: mk.keyword || mk.concreteSkill || '',
        inOffer: mk.concreteSkill ? '« ' + mk.concreteSkill + ' »' : 'Compétence attendue par l\'offre',
        addTo: keywordDatabase[mk.category] ? keywordDatabase[mk.category].label : 'Section Compétences',
      });
    });
  } else {
    dedupMissing.slice(0, 5).forEach(k => {
      missingDetail.push({
        kw: k,
        inOffer: 'Compétence attendue par l\'offre',
        addTo: 'Section Compétences techniques',
      });
    });
  }

  // Reformulations
  const reformulations = (data.reformulationAdvice || []).slice(0, 3).map(a => ({
    cv: a.cvSays || 'Expérience générique',
    suggestion: a.suggestion || 'Reformulez avec plus d\'impact',
  }));
  if (reformulations.length === 0) {
    reformulations.push({ cv: 'Expérience professionnelle dans le domaine.', suggestion: 'Concrétisez avec des métriques : "réalisé X projet, traité Y utilisateurs...' });
    reformulations.push({ cv: 'Compétence en développement.', suggestion: 'Précisez la tech stack : "Développement React/Node.js avec API REST"' });
  }

  // Alerts
  const alerts = (data.alerts || []).slice(0, 3);

  state.analysis = {
    globalScore,
    confidence: data.confidence,
    categories: categoryDisplay,
    found: dedupFound,
    missing: dedupMissing,
    missingDetail,
    checklist,
    reformulations,
    alerts,
  };
  state.checked = {};
  state.targetScore = globalScore;
  enterResults();
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  // Set initial values
  $('cvText').value = state.cvText;
  $('offerText').value = state.offerText;
  checkCanAnalyze();

  // Mode toggles
  setupModeToggle('cv');
  setupModeToggle('offer');

  // File upload with drag-drop
  setupFileUpload('cv');
  setupFileUpload('offer');

  // Analyze button
  $('analyzeBtn').addEventListener('click', runAnalysis);

  // New analysis button
  $('newAnalysisBtn').addEventListener('click', () => {
    clearInterval(scoreInterval);
    clearInterval(analyzeInterval);
    clearTimeout(copyTimeout);
    state.analysis = null;
    state.displayedScore = 0;
    state.checked = {};
    state.currentHistoryIndex = -1;
    showView('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.id.replace('Btn', '').replace('tab', '').toLowerCase()));
  });

  // Proj card click -> plan tab
  $('projCard').addEventListener('click', () => switchTab('plan'));

  // Result title inline edit
  makeJobTitleEditable($('resultJobTitle'), val => commitJobTitle(val));

  // History
  renderHistory(0);
});
