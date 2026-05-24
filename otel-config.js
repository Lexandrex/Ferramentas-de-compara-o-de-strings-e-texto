import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// Configuração do Resource que identifica a aplicação
const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'string-comparison-algorithms',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    environment: 'development',
  })
);

// Exportador de Traces para Console (desenvolvimento)
const consoleTraceExporter = new ConsoleSpanExporter();

// Exportador de Traces via OTLP HTTP (para Jaeger, Zipkin, etc)
// Para usar, defina: OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
const otlpTraceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
});

// Exportador de Métricas via OTLP HTTP
const otlpMetricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
});

// Configuração do SDK Node
export const sdk = new NodeSDK({
  resource: resource,
  traceExporter: consoleTraceExporter,
  // Descomente para usar OTLP:
  // traceExporter: otlpTraceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: otlpMetricExporter,
    intervalMillis: 5000,
  }),
});

// Inicializa o SDK
export async function initializeOpenTelemetry() {
  console.log('[OpenTelemetry] Inicializando SDK...');
  await sdk.start();
  console.log('[OpenTelemetry] SDK iniciado com sucesso');
  
  // Registra handler para graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[OpenTelemetry] Encerrando SDK...');
    await sdk.shutdown();
    console.log('[OpenTelemetry] SDK encerrado');
    process.exit(0);
  });
}

export { consoleTraceExporter, otlpTraceExporter, otlpMetricExporter };
