# Guia de Contribuição e Extensão

## Adicionando Novos Testes

### 1. Estrutura de um Novo Teste
```javascript
describe('MeuAlgoritmo', () => {
  let searcher;

  beforeEach(() => {
    searcher = new MeuAlgoritmo();
  });

  test('deve encontrar padrão simples', () => {
    const result = searcher.search('abcdef', 'cd');
    expect(result.indices).toEqual([2]);
    expect(result.comparisons).toBeGreaterThan(0);
  });
});
```

### 2. Boas Práticas
- Use `beforeEach` para inicializar o searcher
- Teste casos extremos (vazio, padrão > texto, etc)
- Valide `indices`, `comparisons` e `timeNs`
- Use `stepByStep: true` para validar steps

### 3. Executar Um Teste Específico
```bash
npm test -- --testNamePattern="seu padrão"
```

---

## Adicionando Novas Métricas

### 1. Definir Métrica em telemetry.js
```javascript
const meuGauge = meter.createGauge('minha_metrica', {
  description: 'Descrição da métrica',
  unit: 'unidade',
});
```

### 2. Registrar Valor
```javascript
meuGauge.observe(valor, {
  algoritmo: 'naive',
  tipo: 'benchmark'
});
```

### 3. Tipos de Métricas Disponíveis
- **Counter**: `meter.createCounter()` - sempre cresce
- **Gauge**: `meter.createGauge()` - pode aumentar/diminuir
- **Histogram**: `meter.createHistogram()` - distribuição
- **Observable**: `meter.createObservableGauge()` - callback

---

## Adicionando Novos Atributos a Spans

### 1. Ao Iniciar
```javascript
const span = startSpan('search.novo', {
  algorithm: 'novo',
  textLength: 100,
  meuAtributo: 'valor'
});
```

### 2. Durante Execução
```javascript
span.setAttribute('chave', 'valor');
span.setAttribute('estado', 'em-progresso');
```

### 3. Ao Finalizar
```javascript
span.end({
  indices: [1, 5],
  comparisons: 50,
  meuDado: 'customizado'
});
```

---

## Exportando Dados para Backends

### Jaeger (Recomendado)
```javascript
// Em otel-config.js
const otlpTraceExporter = new OTLPTraceExporter({
  url: 'http://seu-jaeger:4318',
});
```

### Zipkin
```javascript
// Instalar: npm install @opentelemetry/exporter-trace-zipkin
import { ZipkinExporter } from '@opentelemetry/exporter-trace-zipkin';

const zipkinExporter = new ZipkinExporter({
  serviceName: 'string-comparison',
  url: 'http://localhost:9411/api/v2/spans',
});
```

### Datadog
```javascript
// Usar SDK da Datadog com OpenTelemetry
const { datadogMetricReader } = require('@datadog/browser-rum');
```

---

## Criando Testes de Integração

### Exemplo: Teste com Telemetria
```javascript
import { startSpan, getTraces } from './telemetry.js';
import { NaiveSearch } from './algorithms.js';

test('deve registrar trace completo', () => {
  const span = startSpan('integration-test');
  const result = new NaiveSearch().search('abc', 'b');
  const trace = span.end(result);

  const traces = getTraces();
  expect(traces[0].name).toBe('integration-test');
  expect(traces[0].result.indices).toEqual([1]);
});
```

---

## Debug de Problemas

### 1. Testes Falhando
```bash
npm test -- --verbose
npm test -- --detectOpenHandles  # Detectar handles abertos
```

### 2. Spans Não Aparecendo
```javascript
// Verificar se telemetria está inicializada
initTelemetry();

// Logs no console devem aparecer
logEvent('debug', 'Debug message');
```

### 3. Métricas Não Coletadas
```javascript
// Verificar se exportador está configurado
console.log(sdk); // Validar SDK

// Force flush
await sdk.shutdown();
```

---

## Padrões Recomendados

### 1. Sempre Use Try-Catch com Spans
```javascript
const span = startSpan('operacao');
try {
  // código
  span.end(resultado);
} catch (error) {
  span.setAttribute('error', true);
  span.setAttribute('error.message', error.message);
  span.end();
  throw error;
}
```

### 2. Use Contexto para Correlação
```javascript
import { context, trace } from '@opentelemetry/api';

const activeSpan = trace.getActiveSpan();
context.with(context.active(), () => {
  // Código executado com contexto ativo
});
```

### 3. Organize Atributos Semanticamente
```javascript
const span = startSpan('search.execute', {
  'algorithm.name': 'naive',
  'algorithm.complexity': 'O(n*m)',
  'search.text_length': 100,
  'search.pattern_length': 5,
  'search.result_count': 3,
});
```

---

## Performance Tips

### 1. Batch Exportation
```javascript
// Já configurado por padrão
new PeriodicExportingMetricReader({
  exporter: otlpMetricExporter,
  intervalMillis: 5000,  // Exportar a cada 5s
});
```

### 2. Limitar Spans em Memória
```javascript
// Em telemetry.js
if (traceStorage.length > 100) {
  traceStorage.pop();  // Remove antigos
}
```

### 3. Sampling para Produção
```javascript
const sampler = new TraceIdRatioBasedSampler(0.1); // 10% sampling
```

---

## CI/CD Integration

### GitHub Actions
```yaml
name: Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

### Pre-commit Hook
```bash
#!/bin/bash
npm test || exit 1
```

---

## Recursos Adicionais

- [OpenTelemetry JS Docs](https://opentelemetry.io/docs/instrumentation/js/)
- [Jaeger Query API](https://www.jaegertracing.io/docs/latest/apis/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Babel Configuration](https://babeljs.io/docs/en/configuration)

---

## Contato e Contribuições

Para contribuir:
1. Crie branch: `git checkout -b feature/nova-feature`
2. Commit: `git commit -am 'Adiciona X'`
3. Push: `git push origin feature/nova-feature`
4. Pull Request

Certifique-se que todos os testes passam antes de fazer PR!
