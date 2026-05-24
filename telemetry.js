import { trace, context, metrics } from '@opentelemetry/api';

// Obter tracer e meter do OpenTelemetry
const tracer = trace.getTracer('string-comparison-tracer', '1.0.0', {
  schemaUrl: 'https://opentelemetry.io/schemas/1.20.0',
});

const meter = metrics.getMeter('string-comparison-meter', '1.0.0', {
  schemaUrl: 'https://opentelemetry.io/schemas/1.20.0',
});

// Criar instrumentos de métricas
const searchDurationHistogram = meter.createHistogram('search_execution_duration_ms', {
  description: 'Tempo de execução de busca em ms',
  unit: 'ms',
});

const comparisonsCounter = meter.createCounter('search_comparisons_total', {
  description: 'Total de comparações realizadas durante buscas',
  unit: '1',
});

// Storage local para compatibilidade com interface existente
const traceStorage = [];
const metricStorage = {};
const logStorage = [];
const algorithms = [];

function createTimestamp() {
  return new Date().toISOString();
}

/**
 * Inicializa a telemetria com OpenTelemetry
 */
export function initTelemetry() {
  logEvent('info', 'Observabilidade OpenTelemetry inicializada', {
    toolkit: 'OpenTelemetry SDK Real',
    timestamp: createTimestamp(),
  });
  console.log('[Telemetry] OpenTelemetry inicializado com sucesso');
}

/**
 * Cria um span para rastrear execução de algoritmos
 */
export function startSpan(name, attributes = {}) {
  const span = tracer.startSpan(name, {
    attributes: {
      'algorithm.type': attributes.algorithm || 'unknown',
      'text.length': attributes.textLength || 0,
      'pattern.length': attributes.patternLength || 0,
      ...attributes,
    },
  });

  const startTime = performance.now();

  return {
    span,
    startTime,
    attributes: { ...attributes },

    setAttribute(key, value) {
      span.setAttribute(key, value);
      this.attributes[key] = value;
    },

    end(result = {}) {
      const endTime = performance.now();
      const durationMs = endTime - this.startTime;
      const durationNs = Math.round(durationMs * 1e6);

      // Atualizar span com resultado
      span.setAttributes({
        'search.comparisons': result.comparisons || 0,
        'search.matches': result.indices?.length || 0,
        'search.duration_ms': durationMs,
        'search.success': result.indices !== undefined,
      });

      span.end();

      // Registrar métricas
      searchDurationHistogram.record(durationMs, {
        algorithm: this.attributes.algorithm || 'unknown',
      });

      if (result.comparisons !== undefined) {
        comparisonsCounter.add(result.comparisons, {
          algorithm: this.attributes.algorithm || 'unknown',
        });
      }

      // Manter compatibilidade com código existente
      const traceRecord = {
        name,
        attributes: this.attributes,
        durationNs,
        timestamp: createTimestamp(),
        result,
      };

      traceStorage.unshift(traceRecord);
      if (traceStorage.length > 100) {
        traceStorage.pop();
      }

      algorithms.push({
        algorithm: this.attributes.algorithm,
        found: result.indices?.length || 0,
        comparisons: result.comparisons,
        duration: durationMs,
      });

      logEvent('info', `Span finalizado: ${name}`, {
        durationNs,
        ...this.attributes,
        ...result,
      });

      return traceRecord;
    },
  };
}

/**
 * Registra uma métrica
 */
export function recordMetric(name, value, attributes = {}) {
  if (!metricStorage[name]) {
    metricStorage[name] = [];
  }

  metricStorage[name].push({
    value,
    attributes,
    timestamp: createTimestamp(),
  });

  // Registrar como métrica real do OpenTelemetry também
  if (name === 'search.execution_time_ns') {
    const durationMs = value / 1e6;
    searchDurationHistogram.record(durationMs, attributes);
  }

  return metricStorage[name].length;
}

/**
 * Registra um evento de log
 */
export function logEvent(level, message, attributes = {}) {
  const logEntry = {
    level,
    message,
    timestamp: createTimestamp(),
    attributes,
  };

  logStorage.unshift(logEntry);
  if (logStorage.length > 200) {
    logStorage.pop();
  }

  // Log no console também para desenvolvimento
  const logFn = console[level] || console.log;
  logFn(`[${level.toUpperCase()}] ${message}`, attributes);
}

/**
 * Obter traces armazenados
 */
export function getTraces() {
  return traceStorage;
}

/**
 * Obter métricas armazenadas
 */
export function getMetrics() {
  return metricStorage;
}

/**
 * Obter logs armazenados
 */
export function getLogs() {
  return logStorage;
}

/**
 * Limpar storage de telemetria
 */
export function clearTelemetry() {
  traceStorage.length = 0;
  Object.keys(metricStorage).forEach((key) => {
    metricStorage[key] = [];
  });
  logStorage.length = 0;
  algorithms.length = 0;
  logEvent('info', 'Telemetria limpa');
}

/**
 * Obter resumo das execuções de algoritmos
 */
export function getSummary() {
  const totalExecutions = algorithms.length;
  const totalComparisons = algorithms.reduce((sum, a) => sum + (a.comparisons || 0), 0);
  const averageDuration = totalExecutions > 0 
    ? algorithms.reduce((sum, a) => sum + a.duration, 0) / totalExecutions 
    : 0;

  const byAlgorithm = {};
  algorithms.forEach((algo) => {
    if (!byAlgorithm[algo.algorithm]) {
      byAlgorithm[algo.algorithm] = { count: 0, totalComparisons: 0, totalDuration: 0 };
    }
    byAlgorithm[algo.algorithm].count++;
    byAlgorithm[algo.algorithm].totalComparisons += algo.comparisons || 0;
    byAlgorithm[algo.algorithm].totalDuration += algo.duration || 0;
  });

  return {
    totalExecutions,
    totalComparisons,
    averageDuration: Math.round(averageDuration * 100) / 100,
    byAlgorithm,
    timestamp: createTimestamp(),
  };
}

// Compatibilidade com interface antiga
export function getTelemetrySummary() {
  const summaries = {};
  Object.keys(metricStorage).forEach(metricName => {
    const items = metricStorage[metricName];
    summaries[metricName] = {
      count: items.length,
      lastValue: items[items.length - 1]?.value ?? 0,
      allValues: items.map(item => item.value)
    };
  });
  return {
    traces: [...traceStorage],
    metrics: summaries,
    logs: [...logStorage]
  };
}

export function getTraceEntries(limit = 20) {
  return traceStorage.slice(0, limit);
}

export function getLogEntries(limit = 20) {
  return logStorage.slice(0, limit);
}

export { tracer, meter };
