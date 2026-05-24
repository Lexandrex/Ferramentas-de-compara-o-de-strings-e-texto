# OpenTelemetry SDK: Guia Completo

## O Que é OpenTelemetry?

**OpenTelemetry** é um padrão aberto e agnóstico de fornecedor para observabilidade de aplicações. Ele fornece um conjunto de ferramentas, APIs e SDKs para instrumentar, gerar, coletar e exportar dados de telemetria (traces, métricas e logs).

### Pilares da Observabilidade

OpenTelemetry cobre os três pilares da observabilidade moderna:

#### 1. **Traces (Rastreamento Distribuído)**
- Segue a jornada completa de uma solicitação através de múltiplos serviços
- Estruturados em "Spans" (unidades de trabalho)
- Cada span tem:
  - Nome
  - Timestamp de início e fim
  - Atributos (metadados)
  - Status (sucesso/erro)

Exemplo no projeto:
```javascript
const span = startSpan('search.naive', { 
  algorithm: 'naive', 
  textLength: 100, 
  patternLength: 5 
});
// ... executar algoritmo ...
span.end({ indices: [10, 25], comparisons: 500 });
```

#### 2. **Métricas**
- Números agregados que descrevem seu sistema
- Exemplos: latência, throughput, taxa de erro, uso de memória
- Tipos principais:
  - **Counter**: Valor que sempre cresce (ex: total de requisições)
  - **Gauge**: Valor que pode aumentar e diminuir (ex: memória em uso)
  - **Histogram**: Distribuição de valores (ex: latências de requisições)

No projeto:
```javascript
// Histogram de duração
searchDurationHistogram.record(durationMs, { algorithm: 'naive' });

// Counter de comparações
comparisonsCounter.add(500, { algorithm: 'naive' });
```

#### 3. **Logs**
- Eventos estruturados do aplicativo
- Com contexto (attributes/tags)
- Correlacionáveis com traces e métricas

---

## Como Funciona o OpenTelemetry SDK

### 1. **Instrumentação**
Você adiciona código para coletar dados:
```javascript
const tracer = trace.getTracer('myapp-tracer');
const span = tracer.startSpan('my-operation');
```

### 2. **Coleta**
O SDK recolhe todos os dados:
- Spans são armazenados na memória
- Métricas são agregadas
- Logs são capturados

### 3. **Exportação**
Os dados são enviados para backends:
- **OTLP (OpenTelemetry Protocol)**: Protocolo padrão
- **Jaeger**: Visualização de traces distribuídos
- **Zipkin**: Análise de performance
- **Datadog, New Relic, etc**: Plataformas comerciais

```javascript
// Exportador OTLP HTTP
const otlpTraceExporter = new OTLPTraceExporter({
  url: 'http://localhost:4318',
});
```

---

## Implementação no Projeto

### Arquivos Criados

#### 1. **otel-config.js**
Configuração central do OpenTelemetry SDK:
```javascript
// Inicializa o SDK com Resource (identificação da app)
const sdk = new NodeSDK({
  resource: resource,
  traceExporter: consoleTraceExporter,
  metricReader: new PeriodicExportingMetricReader({
    exporter: otlpMetricExporter,
  }),
});

await sdk.start();
```

#### 2. **telemetry.js (Atualizado)**
Funções para instrumentar os algoritmos:

```javascript
// Criar um span para operação
const span = startSpan('search.naive', { algorithm: 'naive' });

// ... executar código ...

// Finalizar span e registrar resultado
span.end({ indices: [10], comparisons: 100 });
```

Recursos principais:
- `initTelemetry()`: Inicializa a observabilidade
- `startSpan()`: Cria um novo span
- `recordMetric()`: Registra uma métrica
- `logEvent()`: Registra um evento de log
- `getSummary()`: Retorna resumo estatístico
- `getTraces()`: Retorna todos os traces capturados

#### 3. **algorithms.test.js**
Testes unitários de todos os 4 algoritmos:
- **NaiveSearch**: 12 testes
- **RabinKarpSearch**: 10 testes
- **KMPSearch**: 12 testes
- **BoyerMooreSearch**: 10 testes
- **Testes de comparação**: Valida que todos retornam mesmo resultado

---

## Como Usar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar Testes
```bash
# Todos os testes com cobertura
npm test

# Testes em modo watch
npm test:watch

# Apenas testes de algoritmos
npm run test:algorithms
```

### 3. Usar com Telemetria

```javascript
import { 
  initTelemetry, 
  startSpan, 
  getSummary 
} from './telemetry.js';
import { NaiveSearch } from './algorithms.js';

// Inicializar
initTelemetry();

// Executar com rastreamento
const span = startSpan('search.naive', { 
  algorithm: 'naive',
  textLength: 100 
});

const searcher = new NaiveSearch();
const result = searcher.search('abcdef', 'cd');

span.end(result);

// Ver resumo
console.log(getSummary());
```

### 4. Exemplo Completo
```bash
node example-with-telemetry.js
```

---

## Dados Exportados

### Traces
```javascript
{
  name: 'search.naive',
  attributes: { algorithm: 'naive', textLength: 100 },
  durationNs: 1000000,
  timestamp: '2026-05-24T12:00:00.000Z',
  result: { indices: [2], comparisons: 150 }
}
```

### Métricas
```javascript
{
  'search_execution_duration_ms': [
    { value: 1.234, attributes: { algorithm: 'naive' } },
    { value: 0.987, attributes: { algorithm: 'kmp' } }
  ],
  'search_comparisons_total': [
    { value: 150, attributes: { algorithm: 'naive' } }
  ]
}
```

---

## Conectar a um Backend Real

### Jaeger (Recomendado para Desenvolvimento)

1. **Iniciar Jaeger com Docker:**
```bash
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one
```

2. **Configurar variável de ambiente:**
```bash
set OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

3. **Acessar Jaeger UI:**
- Abra http://localhost:16686 no navegador
- Procure por "string-comparison-algorithms"

### Zipkin
```bash
docker run -d -p 9410:9410 openzipkin/zipkin
set OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:9411
```

---

## Vantagens da Abordagem Real

✅ **Integração com Ferramentas Profissionais**: Jaeger, Datadog, New Relic
✅ **Padrão da Indústria**: Mesmo padrão usado por Google, Netflix, Uber
✅ **Escalável**: Funciona do desenvolvimento até produção
✅ **Performance**: Exportação assíncrona não bloqueia aplicação
✅ **Debugging**: Visualizar fluxo completo de execução
✅ **Análise**: Identificar gargalos de performance

---

## Estrutura de Métricas Disponíveis

### Histogramas
- `search_execution_duration_ms`: Tempo de execução por algoritmo

### Contadores
- `search_comparisons_total`: Total de comparações por algoritmo

### Logs e Spans
- Cada execução gera um span completo
- Erros são automaticamente capturados e marcados

---

## Próximos Passos

1. **Adicione métricas customizadas** para suas análises
2. **Implemente alertas** baseados em métricas
3. **Configure alertas** para execuções lentas
4. **Visualize dados** em dashboards
5. **Analise performance** entre algoritmos em larga escala

---

## Referências

- [OpenTelemetry Oficial](https://opentelemetry.io/)
- [OpenTelemetry JavaScript SDK](https://github.com/open-telemetry/opentelemetry-js)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [OTLP Protocol](https://opentelemetry.io/docs/specs/otel/protocol/)
