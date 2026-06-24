import { $, showToast, deduplicateArray, calculateGlobalScore } from '../utils.js';
import { analyzeStepLabels, keywordDatabase } from '../data.js';
import { state, scoreInterval, analyzeInterval, setAnalyzeInterval } from '../modules/state.js';
import { showView } from '../modules/router.js';
import { fetchAnalysis } from '../modules/api.js';
import { enterResults } from '../results/enterResults.js';

export function checkCanAnalyze() {
  const cvOk = (state.cvText || '').trim().length > 0;
  const offerOk = (state.offerText || '').trim().length > 0;
  const btn = $('analyzeBtn');
  const hintBox = $('hintBox');

  if (cvOk && offerOk) {
    btn.disabled = false;
    btn.classList.add('ready');
    hintBox.classList.remove('hint-box--invalid');
    hintBox.classList.add('hint-box--valid');
    hintBox.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2l6 3v5c0 3.5-2.5 6.5-6 8-3.5-1.5-6-4.5-6-8V5l6-3z" stroke="#5B6678" stroke-width="1.4" stroke-linejoin="round"/></svg>Analyse IA · aucun stockage de vos documents';
  } else {
    btn.disabled = true;
    btn.classList.remove('ready');
    hintBox.classList.remove('hint-box--valid');
    hintBox.classList.add('hint-box--invalid');
    hintBox.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M10 2l6 3v5c0 3.5-2.5 6.5-6 8-3.5-1.5-6-4.5-6-8V5l6-3z" stroke="#C0322E" stroke-width="1.4" stroke-linejoin="round"/></svg>Ajoutez votre CV et l\'offre pour lancer l\'analyse';
  }
}

export function renderAnalyzeSteps(index) {
  const container = $('analyzeSteps');
  container.innerHTML = analyzeStepLabels
    .map((label, i) => {
      const done = i < index;
      const active = i === index;
      const state = done ? 'done' : active ? 'active' : 'pending';
      return `<div class="analyze-step">
      <div class="step-dot" data-state="${state}">
        <span class="step-check ${done ? 'is-visible' : ''}"><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M4 8.5l2.5 2.5 5-6" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </div>
      <span class="step-label" data-state="${state}">${label}</span>
    </div>`;
    })
    .join('');
}

export async function runAnalysis() {
  const cv = state.cvText;
  const offer = state.offerText;
  if (!cv.trim() || !offer.trim()) return;

  clearInterval(scoreInterval);
  showView('analyzing');
  state.analyzeIndex = 0;
  renderAnalyzeSteps(0);

  let idx = 0;
  clearInterval(analyzeInterval);
  setAnalyzeInterval(
    setInterval(() => {
      idx++;
      if (idx > analyzeStepLabels.length) {
        clearInterval(analyzeInterval);
        return;
      }
      renderAnalyzeSteps(idx);
    }, 480),
  );

  setTimeout(async () => {
    clearInterval(analyzeInterval);
    renderAnalyzeSteps(analyzeStepLabels.length);

    try {
      const data = await fetchAnalysis(cv, offer);
      showToast('Analyse IA terminée avec succès.', 'success');
      processAIResults(data);
    } catch (err) {
      clearInterval(analyzeInterval);
      renderAnalyzeSteps(0);
      showView('input');

      let message = "L'analyse IA est momentanément indisponible. Veuillez réessayer.";
      if (err.name === 'AbortError' || err.message.includes('Timeout')) {
        message = "L'analyse a pris trop de temps. Veuillez réessayer avec un CV ou une offre plus courte.";
      } else if (err.message.includes('429')) {
        message = 'Trop de demandes. Veuillez patienter quelques minutes.';
      } else if (err.message.includes('500')) {
        message = "Le service d'analyse IA a rencontré une erreur. Réessayez dans quelques instants.";
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        message = "Impossible de contacter le serveur d'analyse. Vérifiez votre connexion.";
      }

      showToast(message, 'error');
      console.error('Erreur analyse IA:', err);
    }
  }, 2200);
}

export function processAIResults(data) {
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

  const checklist = [];
  if (data.missingKeywords && data.missingKeywords.length > 0) {
    data.missingKeywords.slice(0, 5).forEach((mk, i) => {
      checklist.push({
        priority: i < 2 ? 'Haute' : i < 4 ? 'Moyenne' : 'Basse',
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

  const missingDetail = [];
  if (data.missingKeywords && data.missingKeywords.length > 0) {
    data.missingKeywords.forEach((mk) => {
      missingDetail.push({
        kw: mk.keyword || mk.concreteSkill || '',
        inOffer: mk.concreteSkill ? '« ' + mk.concreteSkill + ' »' : "Compétence attendue par l'offre",
        addTo: keywordDatabase[mk.category] ? keywordDatabase[mk.category].label : 'Section Compétences',
      });
    });
  } else {
    dedupMissing.slice(0, 5).forEach((k) => {
      missingDetail.push({
        kw: k,
        inOffer: "Compétence attendue par l'offre",
        addTo: 'Section Compétences techniques',
      });
    });
  }

  const reformulations = (data.reformulationAdvice || []).slice(0, 3).map((a) => ({
    cv: a.cvSays || 'Expérience générique',
    suggestion: a.suggestion || "Reformulez avec plus d'impact",
  }));
  if (reformulations.length === 0) {
    reformulations.push({
      cv: 'Expérience professionnelle dans le domaine.',
      suggestion: 'Concrétisez avec des métriques : "réalisé X projet, traité Y utilisateurs...',
    });
    reformulations.push({
      cv: 'Compétence en développement.',
      suggestion: 'Précisez la tech stack : "Développement React/Node.js avec API REST"',
    });
  }

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
  state.ats = null;
  enterResults();
}
