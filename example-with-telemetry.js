/**
 * Exemplo de uso: Como usar os algoritmos com OpenTelemetry
 * 
 * Este arquivo demonstra como usar os algoritmos de busca com
 * rastreamento automático via OpenTelemetry SDK
 */

import { NaiveSearch, RabinKarpSearch, KMPSearch, BoyerMooreSearch } from './algorithms.js';
import { 
  initTelemetry, 
  startSpan, 
  getSummary, 
  getTraces, 
  getLogs 
} from './telemetry.js';

// Inicializar telemetria
initTelemetry();

/**
 * Função wrapper para executar algoritmo com rastreamento automático
 */
function searchWithTelemetry(algorithmName, SearchClass, text, pattern) {
  const span = startSpan(`search.${algorithmName}`, {
    algorithm: algorithmName,
    textLength: text.length,
    patternLength: pattern.length,
  });

  try {
    const searcher = new SearchClass();
    const result = searcher.search(text, pattern);

    span.end(result);
    return result;
  } catch (error) {
    span.setAttribute('error', true);
    span.setAttribute('error.message', error.message);
    span.end();
    throw error;
  }
}

// Exemplo de uso
const text = 'O rápido foxe marrom salta sobre o cachorro preguiçoso. Um foxe é um animal inteligente.';
const pattern = 'foxe';

console.log('='.repeat(80));
console.log('EXECUTANDO BUSCAS COM OPENTELEMETRY');
console.log('='.repeat(80));
console.log(`Texto: "${text}"`);
console.log(`Padrão: "${pattern}"`);
console.log('='.repeat(80));

// Executar cada algoritmo
const results = {};

results.naive = searchWithTelemetry('naive', NaiveSearch, text, pattern);
console.log(`\n✓ Naive Search: ${results.naive.indices.length} ocorrências encontradas`);

results.rabinKarp = searchWithTelemetry('rabin-karp', RabinKarpSearch, text, pattern);
console.log(`✓ Rabin-Karp: ${results.rabinKarp.indices.length} ocorrências encontradas`);

results.kmp = searchWithTelemetry('kmp', KMPSearch, text, pattern);
console.log(`✓ KMP: ${results.kmp.indices.length} ocorrências encontradas`);

results.boyerMoore = searchWithTelemetry('boyer-moore', BoyerMooreSearch, text, pattern);
console.log(`✓ Boyer-Moore: ${results.boyerMoore.indices.length} ocorrências encontradas`);

// Exibir resumo
console.log('\n' + '='.repeat(80));
console.log('RESUMO DE EXECUÇÃO');
console.log('='.repeat(80));

const summary = getSummary();
console.log(`Total de execuções: ${summary.totalExecutions}`);
console.log(`Total de comparações: ${summary.totalComparisons}`);
console.log(`Tempo médio: ${summary.averageDuration}ms`);

console.log('\nPor algoritmo:');
Object.entries(summary.byAlgorithm).forEach(([algo, stats]) => {
  console.log(`  ${algo}:`);
  console.log(`    - Execuções: ${stats.count}`);
  console.log(`    - Comparações: ${stats.totalComparisons}`);
  console.log(`    - Tempo total: ${Math.round(stats.totalDuration)}ms`);
});

// Exibir traces
console.log('\n' + '='.repeat(80));
console.log('TRACES CAPTURADOS');
console.log('='.repeat(80));

const traces = getTraces();
traces.forEach((trace) => {
  console.log(`\n[${trace.timestamp}] ${trace.name}`);
  console.log(`  Duração: ${trace.durationNs}ns`);
  if (trace.result) {
    console.log(`  Matches: ${trace.result.indices?.length || 0}`);
    console.log(`  Comparações: ${trace.result.comparisons}`);
  }
});

console.log('\n' + '='.repeat(80));
