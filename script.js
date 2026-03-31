const sections = {
  home: document.getElementById('section-home'),
  execution: document.getElementById('section-execution'),
  metrics: document.getElementById('section-metrics'),
  comparison: document.getElementById('section-comparison')
};

function showSection(name){
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
const metricsOutput = document.getElementById('metrics-output');

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

function adjustTextFromInput(){
  currentText = textInput.value;
}
textInput.addEventListener('input', adjustTextFromInput);

function run(searchStepByStep){
  adjustTextFromInput();
  const text = currentText;
  const pattern = patternInput.value;
  const algorithm = algorithmSelect.value;
  if (!text) { alert('Insira texto a ser buscado.'); return; }
  if (!pattern) { alert('Insira pattern.'); return; }

  const strategy = createStrategy(algorithm);
  const result = strategy.search(text, pattern, searchStepByStep);

  logOutput.textContent = '';
  if (searchStepByStep){
    result.steps.forEach((step, idx) => {
      logOutput.textContent += `[${idx}] i=${step.i} j=${step.j} text='${step.textChar}' pattern='${step.patternChar}' comp=${step.comparisons}\n`;
    });
    if(result.steps.length===0) logOutput.textContent='Sem comparações acumuladas.';
  } else {
    logOutput.textContent = `Índices encontrados: [${result.indices.join(', ')}]\n` +
      `Comparações: ${result.comparisons}\n` +
      `Tempo: ${result.timeNs} ns\n`;
  }

  metricsOutput.innerHTML = `
    <p>Tamanho do texto: ${text.length}</p>
    <p>Tamanho do padrão: ${pattern.length}</p>
    <p>Algoritmo: ${algorithm}</p>
    <p>Tempo real: ${result.timeNs} ns</p>
    <p>Comparações: ${result.comparisons}</p>
    <p>Complexidade teórica: ${getComplexity(algorithm)}</p>
  `;
}

function getComplexity(name){
  switch(name){
    case 'naive': return 'O(n*m)';
    case 'rabin-karp': return 'O(n+m) médio';
    case 'kmp': return 'O(n+m)';
    case 'boyer-moore': return 'O(n/m) melhor caso';
    default: return 'N/A';
  }
}

document.getElementById('btn-run').addEventListener('click', () => run(false));
document.getElementById('btn-step').addEventListener('click', () => run(true));

// Comparação total de algoritmos
const comparisonPatternInput = document.getElementById('comparison-pattern-input');
const comparisonOutput = document.getElementById('comparison-output');
const algorithms = ['naive', 'rabin-karp', 'kmp', 'boyer-moore'];

function compareAllAlgorithms() {
  adjustTextFromInput();
  const text = currentText;
  const pattern = comparisonPatternInput.value;
  
  if (!text) { alert('Insira texto a ser buscado.'); return; }
  if (!pattern) { alert('Insira padrão.'); return; }

  const results = [];
  
  algorithms.forEach(algName => {
    const strategy = createStrategy(algName);
    const result = strategy.search(text, pattern, false);
    results.push({
      name: algName.charAt(0).toUpperCase() + algName.slice(1),
      comparisons: result.comparisons,
      timeNs: result.timeNs,
      timeMs: (result.timeNs / 1000).toFixed(3),
      matches: result.indices.length,
      complexity: getComplexity(algName)
    });
  });

  displayComparisonTable(results);
}

function displayComparisonTable(results) {
  let html = `
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Algoritmo</th>
          <th>N° de Comparações</th>
          <th>Tempo (ms)</th>
          <th>Tempo (μs)</th>
          <th>Ocorrências</th>
          <th>Complexidade Teórica</th>
        </tr>
      </thead>
      <tbody>
  `;

  results.forEach(result => {
    html += `
      <tr>
        <td>${result.name}</td>
        <td>${result.comparisons.toLocaleString()}</td>
        <td>${(result.timeNs / 1000000).toFixed(4)}</td>
        <td>${result.timeMs}</td>
        <td>${result.matches}</td>
        <td>${result.complexity}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <div class="comparison-summary">
      <p><strong>Resumo:</strong> Tamanho do texto: ${currentText.length} | Tamanho do padrão: ${comparisonPatternInput.value.length}</p>
    </div>
  `;

  comparisonOutput.innerHTML = html;
}

document.getElementById('btn-compare-all').addEventListener('click', compareAllAlgorithms);
