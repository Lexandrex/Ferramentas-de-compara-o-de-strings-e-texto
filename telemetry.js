const traceStorage = [];
const metricStorage = {};
const logStorage = [];

function createTimestamp() {
  return new Date().toISOString();
}

export function initTelemetry() {
  logEvent('info', 'Observabilidade inicializada', { toolkit: 'OpenTelemetry-like' });
}

export function startSpan(name, attributes = {}) {
  const startTime = performance.now();
  const span = {
    name,
    attributes: { ...attributes },
    startTime,
    setAttribute(key, value) {
      this.attributes[key] = value;
    },
    end() {
      const durationNs = Math.round((performance.now() - startTime) * 1e6);
      const traceRecord = {
        name: this.name,
        attributes: this.attributes,
        durationNs,
        timestamp: createTimestamp()
      };
      traceStorage.unshift(traceRecord);
      if (traceStorage.length > 50) {
        traceStorage.pop();
      }
      logEvent('info', `Span finalizado: ${this.name}`, { durationNs, ...this.attributes });
      recordMetric('search.execution_time_ns', durationNs, this.attributes);
      return traceRecord;
    }
  };

  logEvent('debug', `Span iniciado: ${name}`, attributes);
  return span;
}

export function recordMetric(name, value, attributes = {}) {
  if (!metricStorage[name]) {
    metricStorage[name] = [];
  }
  metricStorage[name].push({ value, attributes, timestamp: createTimestamp() });
  return metricStorage[name].length;
}

export function logEvent(level, message, context = {}) {
  const entry = {
    level,
    message,
    context,
    timestamp: createTimestamp()
  };
  logStorage.unshift(entry);
  if (logStorage.length > 100) {
    logStorage.pop();
  }

  const output = `[${entry.timestamp}] ${level.toUpperCase()} - ${message}`;
  if (level === 'error') {
    console.error(output, context);
  } else if (level === 'warn') {
    console.warn(output, context);
  } else {
    console.log(output, context);
  }
}

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
