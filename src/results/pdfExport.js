import { $, showToast, band, getAtsVerdict } from '../utils.js';
import { state } from '../modules/state.js';

const COLORS = {
  primary: '#2f6bff',
  primaryDark: '#1a4fd8',
  text: '#101826',
  textSecondary: '#5b6678',
  textMuted: '#6b7689',
  textLight: '#9aa4b2',
  border: '#e1e6ef',
  surface: '#ffffff',
  success: '#16a34a',
  warning: '#d98a00',
  danger: '#e5484d',
};

const FONTS = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
};

function formatDate() {
  const now = new Date();
  return now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function scoreCell(label, value, color) {
  return {
    table: {
      widths: ['*'],
      body: [
        [
          {
            stack: [
              { text: value.toString(), fontSize: 28, bold: true, color, alignment: 'center' },
              { text: '/100', fontSize: 11, color: COLORS.textLight, alignment: 'center', margin: [0, -4, 0, 0] },
              { text: label, fontSize: 10, color: COLORS.textSecondary, alignment: 'center', margin: [0, 6, 0, 0] },
            ],
            padding: 14,
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => COLORS.border,
      vLineColor: () => COLORS.border,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
  };
}

function sectionTitle(title) {
  return {
    text: title,
    fontSize: 14,
    bold: true,
    color: COLORS.text,
    margin: [0, 18, 0, 8],
  };
}

function chip(text, color, background) {
  return {
    text,
    fontSize: 9,
    bold: true,
    color,
    background,
    margin: [0, 0, 4, 4],
    padding: [6, 3, 6, 3],
    borderRadius: 4,
  };
}

function buildDocumentDefinition(analysis, ats, jobTitle) {
  const b = band(analysis.globalScore);
  const atsScore = ats?.score;
  const atsBand = atsScore !== undefined ? band(atsScore) : null;
  const confidence = analysis.confidence ?? 0;

  const content = [
    {
      columns: [
        {
          stack: [
            { text: 'ApplyFit', fontSize: 18, bold: true, color: COLORS.primary },
            { text: 'Analyse CV & Offre', fontSize: 10, color: COLORS.textLight, margin: [0, 2, 0, 0] },
          ],
        },
        {
          text: formatDate(),
          fontSize: 10,
          color: COLORS.textLight,
          alignment: 'right',
        },
      ],
      margin: [0, 0, 0, 20],
    },
    {
      text: jobTitle || 'Analyse de compatibilité',
      fontSize: 22,
      bold: true,
      color: COLORS.text,
      margin: [0, 0, 0, 4],
    },
    {
      text: `Score global · ${analysis.globalScore}/100`,
      fontSize: 11,
      color: COLORS.textSecondary,
      margin: [0, 0, 0, 16],
    },
    {
      columns: [
        scoreCell('Compatibilité', analysis.globalScore, b.color),
        scoreCell('Confiance', confidence, COLORS.primary),
        atsBand ? scoreCell('ATS', atsScore, atsBand.color) : {},
      ],
      columnGap: 12,
      margin: [0, 0, 0, 20],
    },
  ];

  if (analysis.found?.length || analysis.missing?.length) {
    content.push(sectionTitle('Compétences'));
    if (analysis.found?.length) {
      content.push({
        text: 'Présentes dans le CV',
        fontSize: 10,
        bold: true,
        color: COLORS.success,
        margin: [0, 0, 0, 6],
      });
      content.push({
        columns: analysis.found.map((k) => chip(k, COLORS.success, '#f0fdf4')),
        columnGap: 0,
        margin: [0, 0, 0, 12],
      });
    }
    if (analysis.missing?.length) {
      content.push({
        text: 'À ajouter',
        fontSize: 10,
        bold: true,
        color: COLORS.danger,
        margin: [0, 0, 0, 6],
      });
      content.push({
        columns: analysis.missing.map((k) => chip(k, COLORS.danger, '#fef2f2')),
        columnGap: 0,
        margin: [0, 0, 0, 12],
      });
    }
  }

  if (analysis.categories?.length) {
    content.push(sectionTitle('Détail par catégorie'));
    const tableBody = [
      [
        { text: 'Catégorie', bold: true, color: COLORS.textSecondary, fontSize: 10 },
        { text: 'Poids', bold: true, color: COLORS.textSecondary, fontSize: 10, alignment: 'center' },
        { text: 'Score', bold: true, color: COLORS.textSecondary, fontSize: 10, alignment: 'center' },
      ],
    ];
    analysis.categories.forEach((cat) => {
      const cb = band(cat.score);
      tableBody.push([
        { text: cat.label, fontSize: 10 },
        { text: `${cat.weight}%`, fontSize: 10, alignment: 'center', color: COLORS.textMuted },
        { text: `${cat.score}/100`, fontSize: 10, bold: true, alignment: 'center', color: cb.color },
      ]);
    });
    content.push({
      table: {
        widths: ['*', 'auto', 'auto'],
        body: tableBody,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0,
        hLineColor: () => COLORS.border,
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
      margin: [0, 0, 0, 12],
    });
  }

  if (analysis.checklist?.length) {
    content.push(sectionTitle(`Plan d'action · ${analysis.checklist.length} étapes`));
    analysis.checklist.forEach((item) => {
      content.push({
        columns: [
          {
            text: '○',
            fontSize: 12,
            color: COLORS.textLight,
            width: 16,
          },
          {
            stack: [
              { text: item.text, fontSize: 10, color: COLORS.text },
              { text: `+${item.pts} pts`, fontSize: 9, color: COLORS.success, margin: [0, 2, 0, 0] },
            ],
          },
        ],
        margin: [0, 0, 0, 8],
      });
    });
  }

  if (analysis.reformulations?.length) {
    content.push(sectionTitle('Reformulations proposées'));
    analysis.reformulations.forEach((rf) => {
      content.push({
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  { text: 'AVANT', fontSize: 8, bold: true, color: COLORS.danger, margin: [0, 0, 0, 3] },
                  { text: rf.cv || rf.original || '', fontSize: 10, color: COLORS.text, italics: true },
                ],
                fillColor: '#fef2f2',
                padding: [8, 8, 8, 8],
              },
            ],
            [
              {
                stack: [
                  { text: 'APRÈS', fontSize: 8, bold: true, color: COLORS.primary, margin: [0, 0, 0, 3] },
                  { text: rf.suggestion, fontSize: 10, color: COLORS.text },
                ],
                fillColor: '#f4f8ff',
                padding: [8, 8, 8, 8],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 0, 0, 12],
      });
    });
  }

  if (ats?.score !== undefined && !ats.error) {
    content.push(sectionTitle('Analyse ATS'));
    content.push({
      text: `${atsScore}/100 — ${ats.verdict || getAtsVerdict(atsScore)}`,
      fontSize: 12,
      bold: true,
      color: atsBand?.color || COLORS.text,
      margin: [0, 0, 0, 6],
    });
    if (ats.summary) {
      content.push({
        text: ats.summary,
        fontSize: 10,
        color: COLORS.textSecondary,
        margin: [0, 0, 0, 12],
      });
    }
    if (ats.recommendations?.length) {
      content.push({
        text: 'Recommandations',
        fontSize: 10,
        bold: true,
        color: COLORS.textSecondary,
        margin: [0, 0, 0, 6],
      });
      ats.recommendations.forEach((r) => {
        content.push({
          columns: [
            { text: '•', width: 12, fontSize: 10, color: COLORS.primary },
            { text: r, fontSize: 10, color: COLORS.text },
          ],
          margin: [0, 0, 0, 4],
        });
      });
    }
  }

  content.push({
    text: 'Généré par ApplyFit',
    fontSize: 9,
    color: COLORS.textLight,
    alignment: 'center',
    margin: [0, 30, 0, 0],
  });

  return {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    defaultStyle: {
      font: 'Roboto',
      fontSize: 10,
      color: COLORS.text,
    },
    content,
  };
}

export function initPdfExport() {
  const exportPdfBtn = $('exportPdfBtn');
  if (!exportPdfBtn) return;

  exportPdfBtn.addEventListener('click', async () => {
    if (!state.analysis) return;

    const title = $('resultJobTitle').textContent.trim() || 'ApplyFit-analyse';
    const safeTitle = title.replace(/[^a-z0-9\u00C0-\u017F_-]+/gi, '-').replace(/^-|-$/g, '');

    try {
      const [{ default: pdfMake }, pdfFonts] = await Promise.all([
        import('pdfmake/build/pdfmake'),
        import('pdfmake/build/vfs_fonts'),
      ]);
      pdfMake.addVirtualFileSystem(pdfFonts.default || pdfFonts);
      pdfMake.fonts = FONTS;
      const docDefinition = buildDocumentDefinition(state.analysis, state.ats, title);
      pdfMake.createPdf(docDefinition).download(`${safeTitle || 'ApplyFit-analyse'}.pdf`);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      showToast('Erreur lors de la génération du PDF.', 'error');
    }
  });
}
