# Comparador de Algoritmos de Busca em Strings

Este projeto compara algoritmos de busca de padrão em texto e adiciona observabilidade com métricas, traces e dashboard de execução.

## O que foi implementado

- Padrão Strategy para selecionar algoritmos de forma extensível.
- Estrutura de retorno `SearchResult` unificada para resultados de busca.
- Separação de responsabilidades entre:
  - `algorithms.js` — implementa as estratégias de busca.
  - `script.js` — gerencia a interface e a experiência do usuário.
  - `telemetry.js` — coleta métricas, traces e logs de execução.
  - `metrics.js` — agrega resultados e gera o dashboard.
- Dashboard visual com gráficos de tempo médio, comparações e contagem de execuções.
- Instrumentação de observabilidade inspirada em OpenTelemetry:
  - spans de execução
  - registros de métricas
  - logs estruturados

## Arquivos

- `index.html` — layout da aplicação e importação do Chart.js.
- `style.css` — estilo das telas, painéis e gráficos.
- `algorithms.js` — implementações de Naive, Rabin-Karp, KMP e Boyer-Moore.
- `script.js` — código principal da interface e do fluxo de execução.
- `telemetry.js` — wrapper de observabilidade para traces, métricas e logs.
- `metrics.js` — lógica de dashboard e agregação de dados.

## Como usar

1. Abra `index.html` em um navegador moderno.
2. Vá para a aba `Execução`.
3. Carregue um ou mais arquivos `.txt` ou cole texto diretamente.
4. Insira o padrão de busca e clique em `Executar`.
5. Para comparar todos os algoritmos, use a aba `Comparação Total`.
6. A aba `Métricas` exibe gráficos e trace de execução.

## Observabilidade e monitoramento

- Cada execução inicia um span de observabilidade.
- Métricas coletadas:
  - número de execuções por algoritmo
  - tempo de execução em nanosegundos
  - número de comparações realizadas
- Os gráficos fornecem visão prática sobre o comportamento teórico e real.

## Estrutura e qualidade de código

- Arquitetura modular usando ES Modules.
- Reutilização por meio do padrão Strategy.
- Separação clara entre domínio (algoritmos), apresentação (UI) e observabilidade.
- Dashboard pronto para comparar comportamento entre algoritmos.

## Próximos passos sugeridos

- Adicionar testes unitários para cada algoritmo.
- Conectar a um backend OpenTelemetry/OTLP para coleta centralizada.
- Criar relatórios de uso reais com arquivos grandes.
- Adicionar suporte a exportar resultados e gráficos.

