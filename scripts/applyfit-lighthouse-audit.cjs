const { chromium } = require('playwright');
const { playAudit } = require('playwright-lighthouse');

const URLS = [
  { url: 'http://localhost:4173/', name: 'index' },
  { url: 'http://localhost:4173/results.html', name: 'results' },
];

const PRESETS = ['mobile', 'desktop'];
const CDP_PORT = 9222;
const RUNS = 3;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [`--remote-debugging-port=${CDP_PORT}`],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const { url, name } of URLS) {
    console.log(`\n=== ${name} (${url}) ===`);
    for (const preset of PRESETS) {
      const runs = [];
      for (let i = 0; i < RUNS; i++) {
        await page.goto(url, { waitUntil: 'networkidle' });
        const result = await playAudit({
          page,
          port: CDP_PORT,
          thresholds: { performance: 0, accessibility: 0, 'best-practices': 0, seo: 0 },
          config: {
            extends: 'lighthouse:default',
            settings: {
              formFactor: preset === 'desktop' ? 'desktop' : 'mobile',
              throttling:
                preset === 'desktop'
                  ? { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 }
                  : undefined,
              screenEmulation:
                preset === 'desktop'
                  ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1 }
                  : undefined,
              onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            },
          },
        });
        const scores = {};
        for (const [key, cat] of Object.entries(result.lhr.categories)) {
          scores[key] = Math.round(cat.score * 100);
        }
        runs.push(scores);
      }

      const medians = {};
      for (const key of ['performance', 'accessibility', 'best-practices', 'seo']) {
        medians[key] = Math.round(median(runs.map((r) => r[key])));
      }
      console.log(`${preset} median:`, medians);
      console.log(`${preset} runs:`, runs);
    }
  }

  await browser.close();
})();
