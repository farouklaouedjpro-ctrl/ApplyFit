const BACKEND_URL = 'http://localhost:3001/api';

async function callBackendAPI(cvText, offerText, signal) {
  const response = await fetch(`${BACKEND_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cvText, offerText }),
    signal,
  });
  if (!response.ok) throw new Error(`Backend error: ${response.status}`);
  return response.json();
}

const keywordDatabase = {
  technical: {
    label: 'Compétences techniques',
    keywords: [
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
    ],
  },
  soft: {
    label: 'Soft skills',
    keywords: [
      'communication', 'leadership', 'travail d\'équipe', 'teamwork', 'autonomie', 'autonomous',
      'gestion de projet', 'project management', 'résolution de problèmes', 'problem solving',
      'créativité', 'creativity', 'adaptabilité', 'adaptability', 'curiosité', 'curiosity',
      'rigueur', 'rigor', 'organisation', 'organization', 'gestion du temps', 'time management',
      'esprit critique', 'critical thinking', 'négociation', 'negotiation',
      'présentation', 'presentation', 'rédaction', 'writing',
      'collaboration', 'collaboration', 'empathie', 'empathy',
      'résilience', 'resilience', 'initiative', 'initiative',
      'polyvalence', 'versatility', 'pédagogie', 'teaching',
      'prise de décision', 'decision making', 'management', 'management',
      'relation client', 'customer relations', 'service client', 'customer service',
    ],
  },
  tools: {
    label: 'Outils & logiciels',
    keywords: [
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
    ],
  },
  education: {
    label: 'Formation & diplômes',
    keywords: [
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
    ],
  },
  languages: {
    label: 'Langues',
    keywords: [
      'français', 'francais', 'french', 'anglais', 'english', 'espagnol', 'spanish',
      'allemand', 'german', 'italien', 'italian', 'portugais', 'portuguese',
      'chinois', 'mandarin', 'japonais', 'japanese', 'arabe', 'arabic',
      'bilingue', 'bilingual', 'courant', 'fluent', 'native', 'langue maternelle',
      'toeic', 'toefl', 'ielts', 'cambridge', 'dalf', 'delf', 'tcf',
      'niveau c1', 'niveau c2', 'niveau b2', 'niveau b1',
    ],
  },
  experience: {
    label: 'Expérience & secteurs',
    keywords: [
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
    ],
  },
};

if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  average: 40,
  low: 20,
};

const reformulationAdvice = {
  excellent: [
    'Votre CV est très bien aligné avec cette offre. Mettez en avant les expériences les plus pertinentes dans un résumé en haut du CV.',
    'Utilisez des chiffres et des résultats concrets pour chaque réalisation listée. Cela renforcera votre crédibilité.',
    'Personnalisez votre lettre de motivation en reprenant les mots-clés spécifiques de l\'offre.',
  ],
  good: [
    'Ajoutez les compétences manquantes à votre CV si vous les possédez, même partiellement',
    'Reformulez vos expériences pour qu\'elles correspondent davantage au vocabulaire utilisé dans l\'offre.',
    'Créez une section "Compétences" visible qui reprend les termes exacts de l\'annonce.',
    'Mettez en avant les projets ou réalisations qui démontrent les compétences clés demandées.',
  ],
  average: [
    'Identifiez les compétences manquantes que vous pouvez acquérir rapidement (formations en ligne, certifications).',
    'Restructurez votre CV pour qu\'il mette en avant les expériences les plus pertinentes pour le poste.',
    'Utilisez des verbes d\'action (développé, piloté, optimisé, conçu) pour décrire vos expériences.',
    'Supprimez les informations non pertinentes pour le poste visé afin de gagner en clarté.',
  ],
  low: [
    'Repensez la structure de votre CV : commencez par un profil/résumé percutant adapté au poste.',
    'Suivez des formations courtes pour acquérir les compétences techniques manquantes.',
    'Faites correspondre votre langage à celui du secteur : utilisez le vocabulaire professionnel adéquat.',
    'Mettez en avant vos soft skills et votre capacité d\'apprentissage si l\'expérience technique vous manque.',
    'Adaptez votre CV pour chaque candidature plutôt que d\'envoyer un CV générique.',
  ],
};

function getLevel(score) {
  if (score >= SCORE_THRESHOLDS.excellent) return 'excellent';
  if (score >= SCORE_THRESHOLDS.good) return 'good';
  if (score >= SCORE_THRESHOLDS.average) return 'average';
  return 'low';
}

function getScoreMessage(score) {
  const level = getLevel(score);
  const messages = {
    excellent: { text: 'Excellent matching ! Votre CV est très bien adapté', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    good: { text: 'Bon matching, quelques améliorations possibles', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    average: { text: 'Matching moyen, des ajustements sont recommandés', color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
    low: { text: 'Faible matching, votre CV nécessite des modifications', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  };
  return messages[level];
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
      if (lowerText.includes(kw)) {
        found.push(kw);
      }
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
    const multiWordCV = new Set(extractMultiWordKeywords(cvText, category.keywords));
    const multiWordOffer = new Set(extractMultiWordKeywords(offerText, category.keywords));

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
    if (totalRelevant > 0) {
      score = Math.round((cvFound.length / totalRelevant) * 100);
    }

    categories[catKey] = {
      label: category.label,
      score,
      found: cvFound,
      missing: missingFromCV,
      total: totalRelevant,
    };
  }

  return categories;
}

function calculateGlobalScore(categories) {
  let totalScore = 0;
  let totalWeight = 0;

  const weights = {
    technical: 35,
    experience: 25,
    soft: 15,
    education: 15,
    languages: 5,
    tools: 5,
  };

  for (const [key, cat] of Object.entries(categories)) {
    const weight = weights[key] || 10;
    totalScore += cat.score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return 0;
  const base = Math.round(totalScore / totalWeight);

  const allMissing = Object.values(categories).reduce((acc, cat) => acc + cat.missing.length, 0);
  const penalty = Math.max(0, allMissing - 3) * 2;
  const finalScore = Math.max(0, Math.min(100, base - penalty));

  return finalScore;
}

function generateAdvice(score, categories) {
  const level = getLevel(score);
  let advice = [...reformulationAdvice[level]];

  const missingSummary = {};
  for (const [key, cat] of Object.entries(categories)) {
    if (cat.missing.length > 0) {
      missingSummary[key] = cat.missing.slice(0, 3);
    }
  }

  if (missingSummary.technical && missingSummary.technical.length > 0) {
    advice.push(`Ajoutez des mots-clés techniques à votre CV : ${missingSummary.technical.slice(0, 4).join(', ')}.`);
  }
  if (missingSummary.experience && missingSummary.experience.length > 0) {
    advice.push(`Valorisez votre expérience dans les domaines suivants : ${missingSummary.experience.slice(0, 3).join(', ')}.`);
  }
  if (missingSummary.languages && missingSummary.languages.length > 0) {
    advice.push(`Mettez en avant vos compétences linguistiques : ${missingSummary.languages.slice(0, 2).join(', ')}.`);
  }

  return advice.slice(0, 6);
}

let gaugeChartInstance = null;
let radarChartInstance = null;

function getScoreColor(score) {
  if (score >= 80) return ['#22C55E', '#16A34A'];
  if (score >= 60) return ['#F59E0B', '#D97706'];
  if (score >= 40) return ['#F97316', '#EA580C'];
  return ['#EF4444', '#DC2626'];
}

function renderGaugeChart(score) {
  const ctx = document.getElementById('gaugeChart').getContext('2d');
  if (gaugeChartInstance) gaugeChartInstance.destroy();

  const [color1, color2] = getScoreColor(score);
  const gradient = ctx.createLinearGradient(0, 0, 220, 220);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  gaugeChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [gradient, '#E2E8F0'],
        borderWidth: 0,
        borderRadius: 4,
        circumference: 360,
        spacing: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: '82%',
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      animation: {
        animateRotate: true,
        duration: 1200,
        easing: 'easeOutQuart',
      },
    },
  });
}

function renderRadarChart(categories) {
  const ctx = document.getElementById('radarChart').getContext('2d');
  if (radarChartInstance) radarChartInstance.destroy();

  const labels = Object.values(categories).map(c => c.label);
  const scores = Object.values(categories).map(c => c.score);

  radarChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Score %',
        data: scores,
        backgroundColor: scores.map(s => {
          if (s >= 80) return 'rgba(34,197,94,0.7)';
          if (s >= 60) return 'rgba(245,158,11,0.7)';
          if (s >= 40) return 'rgba(249,115,22,0.7)';
          return 'rgba(239,68,68,0.7)';
        }),
        borderColor: scores.map(s => {
          if (s >= 80) return '#22C55E';
          if (s >= 60) return '#F59E0B';
          if (s >= 40) return '#F97316';
          return '#EF4444';
        }),
        borderWidth: 1,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.parsed.x}%`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            font: { size: 11, family: 'Inter' },
            color: '#94A3B8',
          },
        },
        y: {
          grid: { display: false },
          ticks: {
            font: { size: 11, family: 'Inter' },
            color: '#64748B',
          },
        },
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart',
      },
    },
  });
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

function renderCategoryDetails(categories) {
  const card = document.getElementById('categoryDetailsCard');
  const list = document.getElementById('categoryDetailsList');

  const entries = Object.entries(categories);
  if (entries.length === 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'block';
  list.innerHTML = entries.map(([key, cat]) => {
    const missingCount = cat.missing?.length || 0;
    const foundCount = cat.found?.length || 0;
    const catLabels = {
      technical: 'Technique',
      soft: 'Soft skills',
      tools: 'Outils',
      education: 'Formation',
      languages: 'Langues',
      experience: 'Expérience',
    };
    return `
      <div class="category-detail-item">
        <div class="category-detail-left">
          <span class="category-detail-label">${catLabels[key] || cat.label}</span>
          <div class="category-detail-badges">
            <span class="badge-found-count">${foundCount}</span>
            ${missingCount > 0 ? `<span class="badge-missing">${missingCount} manquant${missingCount > 1 ? 's' : ''}</span>` : ''}
          </div>
        </div>
        <span class="category-detail-score" style="color: ${getScoreColor(cat.score)[0]}">${cat.score}%</span>
      </div>
    `;
  }).join('');
}

function displayResults(categories, globalScore) {
  document.getElementById('confidenceWrapper').style.display = 'none';

  const section = document.getElementById('resultsSection');
  section.style.display = 'block';

  document.getElementById('gaugeScore').textContent = globalScore;

  const msg = getScoreMessage(globalScore);
  const msgEl = document.getElementById('scoreMessage');
  msgEl.textContent = msg.text;
  msgEl.style.color = msg.color;
  msgEl.style.background = msg.bg;

  const badge = document.getElementById('scoreBadge');
  badge.style.background = msg.bg;
  badge.style.color = msg.color;
  badge.textContent = `${globalScore}% - ${msg.text}`;

  renderGaugeChart(globalScore);
  renderRadarChart(categories);
  renderCategoryDetails(categories);

  let allFound = [];
  let allMissing = [];
  for (const cat of Object.values(categories)) {
    allFound = allFound.concat(cat.found);
    allMissing = allMissing.concat(cat.missing);
  }
  allFound = deduplicateArray(allFound);
  allMissing = deduplicateArray(allMissing);

  const foundKeywords = document.getElementById('foundKeywords');
  foundKeywords.innerHTML = allFound.length
    ? allFound.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')
    : '<span style="color: var(--text-tertiary); font-size: 13px;">Aucun mot-clé commun détecté</span>';

  const missingKeywords = document.getElementById('missingKeywords');
  missingKeywords.innerHTML = allMissing.length
    ? allMissing.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')
    : '<span style="color: var(--text-tertiary); font-size: 13px;">Tous les mots-clés sont présents !</span>';

  const advice = generateAdvice(globalScore, categories);
  const adviceList = document.getElementById('adviceList');
  adviceList.innerHTML = advice.map(a => `<li>${a}</li>`).join('');

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function analyzeCV(cvText, offerText) {
  if (!cvText.trim() || !offerText.trim()) return;

  const btn = document.getElementById('analyzeBtn');
  btn.classList.add('loading');
  btn.disabled = true;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const aiResult = await callBackendAPI(cvText, offerText, controller.signal);
    clearTimeout(timeoutId);
    displayAIResults(aiResult, cvText, offerText);
  } catch {
    clearTimeout(timeoutId);
    document.getElementById('alertsCard').style.display = 'none';
    document.getElementById('concreteSkillsCard').style.display = 'none';
    document.getElementById('aiAdviceCard').style.display = 'none';
    const categories = analyzeKeywords(cvText, offerText);
    const globalScore = calculateGlobalScore(categories);
    displayResults(categories, globalScore);
  }

  btn.classList.remove('loading');
  btn.disabled = false;
}

function displayAIResults(result, cvText, offerText) {
  const categories = {};
  for (const [key, cat] of Object.entries(result.categories)) {
    categories[key] = {
      label: keywordDatabase[key]?.label || key,
      score: cat.score,
      found: deduplicateArray(cat.found || []),
      missing: deduplicateArray(cat.missing || []),
      total: (cat.found?.length || 0) + (cat.missing?.length || 0),
    };
  }

  const section = document.getElementById('resultsSection');
  section.style.display = 'block';

  document.getElementById('gaugeScore').textContent = result.globalScore;

  const msg = getScoreMessage(result.globalScore);
  const msgEl = document.getElementById('scoreMessage');
  msgEl.textContent = msg.text;
  msgEl.style.color = msg.color;
  msgEl.style.background = msg.bg;

  const badge = document.getElementById('scoreBadge');
  badge.style.background = msg.bg;
  badge.style.color = msg.color;
  badge.textContent = `${result.globalScore}% - ${msg.text}`;

  document.getElementById('aiBadge').textContent = 'Analyse IA';
  document.getElementById('aiBadge').style.background = 'rgba(99,102,241,0.1)';
  document.getElementById('aiBadge').style.color = '#6366F1';

  renderGaugeChart(result.globalScore);
  renderRadarChart(categories);
  renderCategoryDetails(categories);

  renderConfidenceGauge(result.confidence);

  let allFound = [];
  let allMissing = [];
  for (const cat of Object.values(categories)) {
    allFound = allFound.concat(cat.found);
    allMissing = allMissing.concat(cat.missing);
  }
  allFound = deduplicateArray(allFound);
  allMissing = deduplicateArray(allMissing);

  const foundKeywords = document.getElementById('foundKeywords');
  foundKeywords.innerHTML = allFound.length
    ? allFound.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')
    : '<span style="color: var(--text-tertiary); font-size: 13px;">Aucun mot-clé commun détecté</span>';

  const missingKeywords = document.getElementById('missingKeywords');
  missingKeywords.innerHTML = allMissing.length
    ? allMissing.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')
    : '<span style="color: var(--text-tertiary); font-size: 13px;">Tous les mots-clés sont présents !</span>';

  renderAlerts(result.alerts);
  renderConcreteSkills(result.missingKeywords);
  renderAIAdvice(result.reformulationAdvice);

  const advice = generateAdvice(result.globalScore, categories);
  const adviceList = document.getElementById('adviceList');
  adviceList.innerHTML = advice.map(a => `<li>${a}</li>`).join('');

  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderConfidenceGauge(confidence) {
  const wrapper = document.getElementById('confidenceWrapper');
  if (confidence === null || confidence === undefined) {
    wrapper.style.display = 'none';
    return;
  }
  wrapper.style.display = 'flex';
  document.getElementById('confidenceFill').style.width = `${confidence}%`;
  document.getElementById('confidenceValue').textContent = `${confidence}%`;
}

function renderConcreteSkills(missingKeywords) {
  const card = document.getElementById('concreteSkillsCard');
  const list = document.getElementById('concreteSkillsList');
  const countBadge = document.getElementById('concreteSkillsCount');

  if (!missingKeywords || missingKeywords.length === 0) {
    card.style.display = 'none';
    return;
  }

  const unique = [];
  const seen = new Set();
  for (const mk of missingKeywords) {
    const key = (mk.keyword || '').toLowerCase().trim();
    if (key && !seen.has(key)) {
      seen.add(key);
      unique.push(mk);
    }
  }

  card.style.display = 'block';
  countBadge.textContent = unique.length;
  list.innerHTML = unique.map(mk => `
    <div class="skill-item">
      <div class="skill-header">
        <span class="skill-category">${mk.category || ''}</span>
        <span class="skill-keyword">${escapeHtml(mk.keyword)}</span>
      </div>
      <div class="skill-concrete">${escapeHtml(mk.concreteSkill)}</div>
    </div>
  `).join('');

  openAccordion('concreteSkillsBody');
}

function renderAIAdvice(adviceList) {
  const card = document.getElementById('aiAdviceCard');
  const list = document.getElementById('aiAdviceList');
  const countBadge = document.getElementById('aiAdviceCount');

  if (!adviceList || adviceList.length === 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'block';
  countBadge.textContent = adviceList.length;
  list.innerHTML = adviceList.map(a => `
    <div class="advice-item">
      <div class="advice-context">
        <div>
          <div class="advice-label">Ton CV dit</div>
          <div class="advice-cv">${escapeHtml(a.cvSays)}</div>
        </div>
        <div>
          <div class="advice-label">L'offre demande</div>
          <div class="advice-offer">${escapeHtml(a.offerRequires)}</div>
        </div>
      </div>
      <div>
        <div class="advice-label">Reformule ainsi</div>
        <div class="advice-suggestion">${escapeHtml(a.suggestion)}</div>
      </div>
    </div>
  `).join('');

  openAccordion('aiAdviceBody');
}

function renderAlerts(alerts) {
  const card = document.getElementById('alertsCard');
  const list = document.getElementById('alertsList');

  if (!alerts || alerts.length === 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'block';
  list.innerHTML = alerts.map(a => `
    <div class="alert-item">
      <div class="alert-type">${escapeHtml(a.type === 'education_level' ? "Niveau d'etudes" : a.type)}</div>
      <div class="alert-detail">
        <div><strong>L'offre demande :</strong> ${escapeHtml(a.offerRequires)}</div>
        <div><strong>Votre CV indique :</strong> ${escapeHtml(a.cvShows)}</div>
      </div>
      <div class="alert-suggestion">${escapeHtml(a.suggestion)}</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

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

function setupFileUpload(config) {
  const {
    dropZoneId, fileInputId, fileInfoId, fileNameId, removeBtnId,
    textareaEl, textareaPlaceholder,
    onFileLoaded, onFileRemoved,
  } = config;

  const dropZone = document.getElementById(dropZoneId);
  const fileInput = document.getElementById(fileInputId);
  const fileInfo = document.getElementById(fileInfoId);
  const fileName = document.getElementById(fileNameId);
  const removeBtn = document.getElementById(removeBtnId);

  let fileContent = null;

  async function handleFile(file) {
    if (!file) return;
    try {
      const content = await readFileContent(file);
      fileContent = content;
      fileName.textContent = file.name;
      fileInfo.style.display = 'flex';
      dropZone.querySelector('.drop-zone-content').style.display = 'none';
      textareaEl.value = content;
      textareaEl.disabled = true;
      textareaEl.placeholder = 'Contenu chargé depuis le fichier';
      if (onFileLoaded) onFileLoaded(content);
    } catch (err) {
      showError('Erreur lors de la lecture du fichier. Formats supportés : TXT, PDF.');
    }
  }

  function removeFile() {
    fileContent = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    dropZone.querySelector('.drop-zone-content').style.display = 'flex';
    textareaEl.value = '';
    textareaEl.disabled = false;
    textareaEl.placeholder = textareaPlaceholder;
    if (onFileRemoved) onFileRemoved();
  }

  fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

  removeBtn.addEventListener('click', removeFile);

  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });
  dropZone.addEventListener('click', (e) => {
    if (e.target.closest('.btn-file')) return;
    if (e.target === dropZone || e.target.closest('.drop-zone-content')) {
      fileInput.click();
    }
  });

  textareaEl.addEventListener('input', () => {
    if (textareaEl.value.trim().length > 0 && fileContent !== null) {
      removeFile();
    }
  });

  return { getFileContent: () => fileContent, removeFile };
}

function showError(message) {
  const el = document.getElementById('errorMessage');
  const text = document.getElementById('errorText');
  text.textContent = message;
  el.style.display = 'flex';
  el.classList.remove('fade-out');
  el.classList.add('fade-in');
  setTimeout(() => {
    el.classList.remove('fade-in');
    el.classList.add('fade-out');
    setTimeout(() => { el.style.display = 'none'; }, 300);
  }, 4000);
}

function openAccordion(bodyId) {
  const body = document.getElementById(bodyId);
  if (!body) return;
  const header = document.querySelector(`[data-accordion="${bodyId}"]`);
  body.classList.add('open');
  if (header) header.querySelector('.accordion-chevron')?.classList.add('open');
}

function toggleAccordion(bodyId) {
  const body = document.getElementById(bodyId);
  if (!body) return;
  const header = document.querySelector(`[data-accordion="${bodyId}"]`);
  const isOpen = body.classList.toggle('open');
  if (header) {
    const chevron = header.querySelector('.accordion-chevron');
    if (chevron) chevron.classList.toggle('open', isOpen);
  }
}

document.addEventListener('click', (e) => {
  const header = e.target.closest('[data-accordion]');
  if (header) {
    const bodyId = header.getAttribute('data-accordion');
    toggleAccordion(bodyId);
  }
});

// DOM Elements
const cvText = document.getElementById('cvText');
const offerText = document.getElementById('offerText');
const analyzeBtn = document.getElementById('analyzeBtn');

let cvFileContent = null;
let offerFileContent = null;

const cvUpload = setupFileUpload({
  dropZoneId: 'dropZone',
  fileInputId: 'fileInput',
  fileInfoId: 'fileInfo',
  fileNameId: 'fileName',
  removeBtnId: 'removeFile',
  textareaEl: cvText,
  textareaPlaceholder: 'Collez ici le contenu de votre CV (expériences, compétences, formations...)',
  onFileLoaded: (content) => { cvFileContent = content; checkCanAnalyze(); },
  onFileRemoved: () => { cvFileContent = null; checkCanAnalyze(); },
});

const offerUpload = setupFileUpload({
  dropZoneId: 'dropZoneOffer',
  fileInputId: 'fileInputOffer',
  fileInfoId: 'fileInfoOffer',
  fileNameId: 'fileNameOffer',
  removeBtnId: 'removeFileOffer',
  textareaEl: offerText,
  textareaPlaceholder: 'Collez ici l\'offre d\'emploi (intitulé du poste, missions, pré-requis, compétences demandées...)',
  onFileLoaded: (content) => { offerFileContent = content; checkCanAnalyze(); },
  onFileRemoved: () => { offerFileContent = null; checkCanAnalyze(); },
});

function checkCanAnalyze() {
  const hasCV = cvText.value.trim().length > 0 || cvFileContent !== null;
  const hasOffer = offerText.value.trim().length > 0 || offerFileContent !== null;
  analyzeBtn.disabled = !(hasCV && hasOffer);
}

offerText.addEventListener('input', checkCanAnalyze);
cvText.addEventListener('input', checkCanAnalyze);

analyzeBtn.addEventListener('click', () => {
  const cv = cvFileContent || cvText.value;
  const offer = offerFileContent || offerText.value;
  if (!cv.trim() && !offer.trim()) {
    showError('Veuillez fournir un CV et une offre d\'emploi avant de lancer l\'analyse.');
    return;
  }
  if (!cv.trim()) {
    showError('Veuillez fournir un CV (déposez un fichier ou collez le texte).');
    return;
  }
  if (!offer.trim()) {
    showError('Veuillez fournir une offre d\'emploi (déposez un fichier ou collez le texte).');
    return;
  }
  analyzeCV(cv, offer);
});
