import { createStrategy, algorithmComplexity, algorithmLabels } from './algorithms.js';
import { initTelemetry, startSpan, recordMetric, logEvent, getTraceEntries } from './telemetry.js';
import { recordExecution, renderMetricsDashboard } from './metrics.js';

const sections = {
  home: document.getElementById('section-home'),
  execution: document.getElementById('section-execution'),
  metrics: document.getElementById('section-metrics'),
  comparison: document.getElementById('section-comparison')
};

function showSection(name) {
  Object.values(sections).forEach(s => s.classList.remove('active'));
  sections[name].classList.add('active');
}

document.getElementById('btn-home').onclick = () => showSection('home');
document.getElementById('btn-execution').onclick = () => showSection('execution');
document.getElementById('btn-metrics').onclick = () => showSection('metrics');
document.getElementById('btn-comparison').onclick = () => showSection('comparison');

const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const textInput = document.getElementById('text-input');
const patternInput = document.getElementById('pattern-input');
const algorithmSelect = document.getElementById('algorithm-select');
const logOutput = document.getElementById('log-output');
const traceOutput = document.getElementById('trace-output');
const comparisonPatternInput = document.getElementById('comparison-pattern-input');
const comparisonOutput = document.getElementById('comparison-output');

let currentText = '';

fileInput.addEventListener('change', async (event) => {
  const files = Array.from(event.target.files);
  fileList.innerHTML = '';
  currentText = '';
  for (const file of files) {
    const li = document.createElement('li');
    li.textContent = file.name;
    fileList.appendChild(li);
    const content = await file.text();
    currentText += content + '\n';
  }
  textInput.value = currentText.trim();
});

function adjustTextFromInput() {
  currentText = textInput.value;
}
textInput.addEventListener('input', adjustTextFromInput);

function renderTraceLog() {
  const entries = getTraceEntries(20);
  traceOutput.textContent = entries.length
    ? entries.map(entry => `• ${entry.timestamp} | ${entry.name} | ${entry.durationNs} ns | ${JSON.stringify(entry.attributes)}`).join('\n')
    : 'Nenhum trace registrado ainda.';
}

function run(searchStepByStep) {
  adjustTextFromInput();
  const text = currentText;
  const pattern = patternInput.value.trim();
  const algorithm = algorithmSelect.value;

  if (!text) {
    alert('Insira texto a ser buscado.');
    return;
  }
  if (!pattern) {
    alert('Insira o padrão de busca.');
    return;
  }

  const strategy = createStrategy(algorithm);
  const span = startSpan('search.execution', {
    algorithm: algorithmLabels[algorithm],
    patternLength: pattern.length,
    textLength: text.length
  });
  const result = strategy.search(text, pattern, searchStepByStep);
  span.setAttribute('resultCount', result.indices.length);
  const trace = span.end();

  recordMetric('search.execution_count', 1, { algorithm: algorithmLabels[algorithm] });
  recordMetric('search.comparisons', result.comparisons, { algorithm: algorithmLabels[algorithm] });
  recordExecution(algorithm, result);

  renderMetricsDashboard();
  renderTraceLog();
  renderLogOutput(result, searchStepByStep, trace);
}

function renderLogOutput(result, searchStepByStep, trace) {
  if (searchStepByStep) {
    if (result.steps.length === 0) {
      logOutput.textContent = 'Sem comparações acumuladas.';
      return;
    }
    logOutput.textContent = result.steps
      .map((step, index) => `[${index}] i=${step.i ?? step.s} j=${step.j} text='${step.textChar}' pattern='${step.patternChar}' comp=${step.comparisons}`)
      .join('\n');
  } else {
    logOutput.textContent = `Índices encontrados: [${result.indices.join(', ')}]\n` +
      `Comparações: ${result.comparisons}\n` +
      `Tempo: ${result.timeNs} ns\n` +
      `Trace: ${trace.name} (${trace.durationNs} ns)`;
  }
}

function compareAllAlgorithms() {
  adjustTextFromInput();
  const text = currentText;
  const pattern = comparisonPatternInput.value.trim();

  if (!text) {
    alert('Insira texto a ser buscado.');
    return;
  }
  if (!pattern) {
    alert('Insira o padrão de busca.');
    return;
  }

  const comparisonSpan = startSpan('search.compare_all', { patternLength: pattern.length, textLength: text.length });
  const results = [];

  Object.keys(algorithmLabels).forEach((algorithm) => {
    const strategy = createStrategy(algorithm);
    const result = strategy.search(text, pattern, false);
    recordMetric('search.execution_count', 1, { algorithm: algorithmLabels[algorithm] });
    recordMetric('search.comparisons', result.comparisons, { algorithm: algorithmLabels[algorithm] });
    recordExecution(algorithm, result);

    results.push({
      name: algorithmLabels[algorithm],
      comparisons: result.comparisons,
      timeNs: result.timeNs,
      timeMs: (result.timeNs / 1000000).toFixed(4),
      matches: result.indices.length,
      complexity: algorithmComplexity[algorithm]
    });
  });

  comparisonSpan.end();
  renderMetricsDashboard();
  renderTraceLog();
  displayComparisonTable(results);
}

document.getElementById('btn-run').addEventListener('click', () => run(false));
document.getElementById('btn-step').addEventListener('click', () => run(true));
document.getElementById('btn-compare-all').addEventListener('click', compareAllAlgorithms);

window.addEventListener('load', () => {
  initTelemetry();
  renderMetricsDashboard();
  renderTraceLog();
});
