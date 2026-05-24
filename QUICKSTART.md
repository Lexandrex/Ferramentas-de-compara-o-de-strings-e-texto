# Quick Start 🚀

## Instalação (30 segundos)
```bash
npm install
```

## Executar Testes (10 segundos)
```bash
npm test
```

**Resultado esperado:**
```
✓ 53 testes passando
✓ 93.61% cobertura
✓ 2.361s tempo total
```

## Ver Telemetria em Ação (15 segundos)
```bash
node example-with-telemetry.js
```

**Você verá:**
- Execução de 4 algoritmos diferentes
- Comparações e tempos de execução
- Resumo com estatísticas por algoritmo
- Traces completos capturados

---

## Uso em Seu Código (1 minuto)

### Passo 1: Importar
```javascript
import { NaiveSearch } from './algorithms.js';
import { initTelemetry, startSpan, getSummary } from './telemetry.js';
```

### Passo 2: Inicializar
```javascript
initTelemetry();
```

### Passo 3: Usar com Rastreamento
```javascript
const span = startSpan('search.naive', { algorithm: 'naive' });
const searcher = new NaiveSearch();
const result = searcher.search('seu texto', 'padrão');
span.end(result);
```

### Passo 4: Ver Resultados
```javascript
console.log(getSummary());
/* Output:
{
  totalExecutions: 1,
  totalComparisons: 50,
  averageDuration: 0.12,
  byAlgorithm: {
    naive: { count: 1, totalComparisons: 50, totalDuration: 0.12 }
  }
}
*/
```

---

## Próximos Passos

### 1. Visualizar em Jaeger (5 minutos)
```bash
docker run -d --name jaeger \
  -e COLLECTOR_OTLP_ENABLED=true \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one

# Acesse: http://localhost:16686
```

### 2. Ler Documentação Completa
- [OPENTELEMETRY_GUIDE.md](OPENTELEMETRY_GUIDE.md) - Explicação detalhada
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - O que foi feito
- [CONTRIBUTING.md](CONTRIBUTING.md) - Como contribuir

### 3. Explorar Testes
```bash
# Ver todos os testes
npm test -- --verbose

# Modo watch (reexecuta ao salvar)
npm test:watch

# Cobertura detalhada
npm test -- --coverage
```

---

## Algoritmos Disponíveis

```javascript
import {
  NaiveSearch,      // Simples, O(n*m)
  RabinKarpSearch,  // Hash-based, múltiplos padrões
  KMPSearch,        // O(n+m), sem retrocesso
  BoyerMooreSearch  // Mais eficiente em média
} from './algorithms.js';
```

## Exemplo Comparando Todos
```javascript
const text = 'texto para buscar';
const pattern = 'buscar';

[
  new NaiveSearch(),
  new RabinKarpSearch(),
  new KMPSearch(),
  new BoyerMooreSearch()
].forEach(searcher => {
  const result = searcher.search(text, pattern);
  console.log(`${searcher.constructor.name}: ${result.indices.length} encontrados`);
});
```

---

## Telemetria Disponível

### Dados Capturados Automaticamente
- ✅ Tempo de execução (nanosegundos)
- ✅ Número de comparações
- ✅ Padrões encontrados
- ✅ Algoritmo utilizado
- ✅ Tamanho do texto e padrão

### Métodos
```javascript
getSummary()      // Resumo estatístico
getTraces()       // Todos os traces
getMetrics()      // Todas as métricas
getLogs()         // Todos os logs
clearTelemetry()  // Limpar dados
```

---

## Troubleshooting

### "ModuleNotFoundError"
```bash
# Reinstalar dependências
rm -r node_modules package-lock.json
npm install
```

### Testes falhando
```bash
npm test -- --verbose   # Ver detalhes
npm test:algorithms     # Apenas algoritmos
```

### Telemetria não funciona
```javascript
import { getTraces } from './telemetry.js';
console.log(getTraces()); // Verificar dados
```

---

## Características ✨

- ✅ **53 Testes Unitários** - Cobertura completa
- ✅ **OpenTelemetry Real** - Não simulado
- ✅ **93.61% Cobertura** - Código bem testado
- ✅ **4 Algoritmos** - Naive, Rabin-Karp, KMP, Boyer-Moore
- ✅ **Rastreamento Automático** - Sem código extra
- ✅ **Export OTLP** - Compatível com Jaeger, Zipkin, etc
- ✅ **Documentação Completa** - Guias e exemplos

---

## Tempo de Leitura

| Documento | Tempo |
|-----------|-------|
| Este arquivo | 5 min |
| OPENTELEMETRY_GUIDE.md | 10 min |
| IMPLEMENTATION_SUMMARY.md | 5 min |
| Código (algorithms.js) | 15 min |

**Total: ~35 minutos para dominar**

---

## Suporte

Dúvidas? Veja:
1. [OPENTELEMETRY_GUIDE.md](OPENTELEMETRY_GUIDE.md) - Conceitos
2. [CONTRIBUTING.md](CONTRIBUTING.md) - Extensão
3. `node example-with-telemetry.js` - Exemplo prático

---

**Pronto para começar? Execute:**
```bash
npm test
```

🎉
