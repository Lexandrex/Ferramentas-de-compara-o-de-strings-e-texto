import { algorithmLabels } from './algorithms.js';

const executionHistory = [];
const charts = {
  timeChart: null,
  comparisonsChart: null,
  countChart: null
};

function round(value) {
  return Number(value.toFixed(2));
}

function average(values) {
  if (!values.length) return 0;
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function buildAlgorithmSummary() {
  const labels = [];
  const averageTime = [];
  const averageComparisons = [];
  const runCount = [];

  const groups = executionHistory.reduce((agg, entry) => {
    if (!agg[entry.algorithm]) {
      agg[entry.algorithm] = [];
    }
    agg[entry.algorithm].push(entry);
    return agg;
  }, {});

  Object.keys(algorithmLabels).forEach(key => {
    const label = algorithmLabels[key];
    const entries = groups[key] || [];
    labels.push(label);
    averageTime.push(round(average(entries.map(item => item.timeNs / 1000))));
    averageComparisons.push(round(average(entries.map(item => item.comparisons))));
    runCount.push(entries.length);
  });

  return { labels, averageTime, averageComparisons, runCount };
}

export function recordExecution(algorithm, result) {
  executionHistory.push({
    algorithm,
    timeNs: result.timeNs,
    comparisons: result.comparisons,
    matches: result.indices.length,
    timestamp: new Date().toISOString()
  });
}

export function getExecutionSummary() {
  const totalRuns = executionHistory.length;
  const lastRun = executionHistory[executionHistory.length - 1] || null;
  const totalMatches = executionHistory.reduce((acc, item) => acc + item.matches, 0);
  const totalComparisons = executionHistory.reduce((acc, item) => acc + item.comparisons, 0);
  const averageTimeMs = totalRuns ? round(executionHistory.reduce((acc, item) => acc + item.timeNs / 1e6, 0) / totalRuns) : 0;

  return {
    totalRuns,
    totalMatches,
    totalComparisons,
    averageTimeMs,
    lastRun
  };
}

function createChart(elementId, type, title, labels, datasetLabel, data, backgroundColor) {
  const canvas = document.getElementById(elementId);
  if (!canvas || typeof Chart === 'undefined') return null;

  return new Chart(canvas.getContext('2d'), {
    type,
    data: {
      labels,
      datasets: [{
        label: datasetLabel,
        data,
        backgroundColor,
        borderColor: '#1c4d99',
        borderWidth: 1,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: title }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function updateChart(chart, labels, data) {
  if (!chart) return;
  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
}

export function renderMetricsDashboard() {
  const summary = getExecutionSummary();
  const summaryElement = document.getElementById('metrics-summary');
  if (summaryElement) {
    summaryElement.innerHTML = `
      <div class="panel-row metrics-overview">
        <div><strong>Total de execuções:</strong> ${summary.totalRuns}</div>
        <div><strong>Tempo médio:</strong> ${summary.averageTimeMs} ms</div>
        <div><strong>Total de comparações:</strong> ${summary.totalComparisons}</div>
        <div><strong>Total de ocorrências:</strong> ${summary.totalMatches}</div>
      </div>
      ${summary.lastRun ? `<div class="panel"><strong>Última execução:</strong> ${algorithmLabels[summary.lastRun.algorithm]} — ${summary.lastRun.timeNs / 1000000} ms, ${summary.lastRun.comparisons} comparações, ${summary.lastRun.matches} ocorrências</div>` : '<div class="panel">Nenhuma execução registrada ainda.</div>'}
    `;
  }

  const metrics = buildAlgorithmSummary();
  if (!charts.timeChart) {
    charts.timeChart = createChart('chart-execution-time', 'bar', 'Tempo médio por algoritmo (ms)', metrics.labels, 'Tempo (ms)', metrics.averageTime, 'rgba(28, 77, 153, 0.7)');
    charts.comparisonsChart = createChart('chart-comparisons', 'bar', 'Comparações médias', metrics.labels, 'Comparações', metrics.averageComparisons, 'rgba(37, 116, 55, 0.7)');
    charts.countChart = createChart('chart-run-count', 'bar', 'Total de execução por algoritmo', metrics.labels, 'Execuções', metrics.runCount, 'rgba(169, 53, 102, 0.7)');
  } else {
    updateChart(charts.timeChart, metrics.labels, metrics.averageTime);
    updateChart(charts.comparisonsChart, metrics.labels, metrics.averageComparisons);
    updateChart(charts.countChart, metrics.labels, metrics.runCount);
  }
}
