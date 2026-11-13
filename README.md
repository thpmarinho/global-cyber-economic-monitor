# 🛡️ Global Cyber & Economic Real-Time Monitor

> **Atividade Prática 06 — Qualidade e Teste de Software (12/11/2026)**  
> **Aluno:** Thiago Pimentel Marinho  
> **Curso:** Análise e Desenvolvimento de Sistemas (ADS) — 4º Semestre  

---

[![React](https://img.shields.io/badge/React-19.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-5.1-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![Coverage](https://img.shields.io/badge/Coverage-88.8%25%20Lines-brightgreen)](https://vitest.dev)
[![npm audit](https://img.shields.io/badge/npm_audit-0_vulnerabilities-brightgreen?logo=npm)](#-3-segurança-ux-e-performance)

---

## 📌 Sumário
- [🎯 Missão da Atividade](#-missão-da-atividade)
- [🏗️ 1. Refatoração e Clean Code](#-1-refatoração-e-clean-code)
- [🧪 2. Técnicas de Testes Aplicadas](#-2-técnicas-de-testes-aplicadas)
- [🔒 3. Segurança, UX e Performance](#-3-segurança-ux-e-performance)
- [📊 4. Cobertura e Resultados dos Testes](#-4-cobertura-e-resultados-dos-testes)
- [🚀 5. Como Executar o Projeto](#-5-como-executar-o-projeto)

---

## 🎯 Missão da Atividade

1. **Testes:** Configurar suíte de testes com **Vitest** validando regras críticas de negócio: *Token Bucket*, *Circuit Breaker*, *Filtros Geográficos/Setoriais* e *Tolerância a Falhas nos Feeds OSINT*.
2. **Refatoração:** Aplicar princípios de **Clean Code**, decomposição de responsabilidades e desacoplamento na pasta `src/`.
3. **Segurança, UX e Performance:** Validar defesas anti-XSS e anti-DDoS, zerar vulnerabilidades no `npm audit` e otimizar acessibilidade e métricas do Lighthouse.
4. **Documentação:** Registrar formalmente no `README.md` as técnicas aplicadas, melhorias implementadas e evidências de execução.

---

## 🏗️ 1. Refatoração e Clean Code

### Diagnóstico do Código Legado
O arquivo original `src/App.jsx` era um **God Component monolítico de 1.424 linhas**, acumulando em um único bloco:
- Primitivas de segurança e algoritmos de controle de tráfego;
- Bases de dados estáticas e constantes de telemetria;
- Lógica de persistência em cache e consumo de APIs externas;
- Funções de agregação matemática e manipulação de estado;
- Mais de 8 seções visuais acopladas (cabeçalho, barra de telemetria, filtros, KPIs, 2 gráficos Recharts, feed OSINT, tabela e modal).

Além disso, foram identificados e corrigidos os seguintes problemas no código original:
- **Arredondamento cumulativo inadequado:** no cálculo setorial, o método `.toFixed()` era chamado a cada iteração do loop, introduzindo imprecisões de ponto flutuante;
- **Vulnerabilidade na sanitização:** remoção parcial de tags permitia bypasses em payloads aninhados;
- **Falta de validação contra clock skew:** no rate limiter, recuos no relógio do sistema podiam congelar ou travar a recarga de tokens;
- **Comportamento instável no estado `HALF-OPEN` do Circuit Breaker:** a sondagem não tratava a reabertura imediata em caso de nova falha.

### Nova Arquitetura Modular (`src/`)

O projeto foi refatorado seguindo o **Princípio da Responsabilidade Única (SRP)** e **Injeção de Dependências**:

```text
src/
├── components/                 # Componentes visuais desacoplados e reutilizáveis
│   ├── AnalyticsCharts.jsx     # Gráficos Recharts (Série Temporal e Barras Setoriais)
│   ├── ApiModal.jsx            # Modal de documentação de integração SIEM/FastAPI
│   ├── FilterControls.jsx      # Drill-down hierárquico (País -> Estado -> Município) e Setores
│   ├── Header.jsx              # Cabeçalho com status do feed e nível SANS Infocon
│   ├── KpiCards.jsx            # 4 Cards de métricas executivas consolidadas
│   ├── OrganizationsTable.jsx  # Tabela com listagem, badges e estado vazio
│   ├── SecurityBanner.jsx      # Telemetria WAF, Circuit Breaker e simulação DDoS
│   └── ThreatLogFeed.jsx       # Feed de ameaças OSINT sanitizadas
├── data/                       # Bases dimensionais isoladas
│   ├── geoHierarchy.js         # Hierarquia de países, estados e cidades
│   ├── organizations.js        # Base de organizações dos setores primário, secundário, terciário e ONGs
│   ├── osintBaseline.js        # Linha de base curada e limites de buffer circular
│   └── sectors.js              # Classificação setorial da economia
├── security/                   # Camada de blindagem de borda (Edge Defense)
│   ├── circuitBreaker.js       # Máquina de estados do Circuit Breaker (CLOSED/OPEN/HALF-OPEN)
│   ├── sanitizer.js            # Sanitização estrita anti-XSS, anti-SQLi e validação IPv4/IPv6
│   └── tokenBucket.js          # Algoritmo Token Bucket para mitigação de rajadas DDoS
├── services/                   # Camada de integração externa e resiliência
│   └── osintService.js         # Ingestão de feeds OSINT com padrão SWR e fallback em cache
├── utils/                      # Funções puras de cálculo e filtragem
│   └── calculations.js         # filterOrganizations, calculateKpis, calculateSectorSummary
├── test/                       # Suíte abrangente de testes automatizados com Vitest
│   ├── setup.js                # Setup do ambiente JSDOM e mocks
│   ├── components/             # Testes de integração de componentes React
│   ├── security/               # Testes unitários de segurança e rate limit
│   ├── services/               # Testes de resiliência e simulação de falhas de rede
│   └── utils/                  # Testes das regras de negócio e agregações
├── App.jsx                     # Orquestrador enxuto e limpo (< 190 linhas)
├── index.css                   # Estilos globais Tailwind
└── main.jsx                    # Ponto de entrada React 19
```

---

## 🧪 2. Técnicas de Testes Aplicadas

A suíte de testes foi estruturada com base nas metodologias formais da disciplina de **Qualidade e Teste de Software**:

### 1. Particionamento em Classes de Equivalência (*Equivalence Partitioning - EP*)
- **Entradas Válidas vs. Inválidas na Sanitização:**
  - *Classe Válida:* Strings normais de busca ("Manaus", "Bolsa de Valores", "Agro").
  - *Classe Inválida / Maliciosa:* Strings com tags `<script>`, seletores `javascript:`, injeções SQL (`UNION SELECT`, `DROP TABLE`) e tipos não-string (`null`, `undefined`, números, objetos).
- **Validação de Endereços IP:**
  - *Classe IPv4 Válido:* Octetos dentro da faixa 0 a 255 (`127.0.0.1`, `255.255.255.255`).
  - *Classe IPv4 Inválido:* Octetos acima de 255 (`256.0.0.1`) ou com número incorreto de octetos.
  - *Classe IPv6:* Formatos canônicos e comprimidos (`::1`, `fe80::1`) vs. strings arbitrárias.
- **Filtros Geográficos:**
  - *Classe Geral:* Filtro `"ALL"` retornando todas as entidades.
  - *Classe Específica:* Filtragem estrita por País (`"BR"`), Estado (`"SP"`) e Município.

### 2. Análise do Valor Limite (*Boundary Value Analysis - BVA*)
- **Comprimento de Entrada (`maxLen`):**
  - Testes nos limites exatos: `0` (vazio), `maxLen - 1`, `maxLen` (corte exato) e `maxLen + 1`.
- **Capacidade do *Token Bucket*:**
  - Limite superior: balde totalmente cheio.
  - Limite de exaustão: consumo do último token disponível (`saldo = 0`).
  - Limite negativo: tentativa de consumo com `saldo = 0` rejeitada.
  - Entradas de consumo inválidas: valores `0`, negativos e fracionários.
- **Threshold de Falhas do *Circuit Breaker*:**
  - Teste com `failures = threshold - 1` (circuito ainda fechado).
  - Teste com `failures = threshold` (transição exata para `OPEN`).
- **Agregações com Coleção Vazia:**
  - Comportamento de `calculateKpis` e `calculateSectorSummary` ao receber listas vazias `[]`, garantindo zero divisões por zero ou quebras de formatação.

### 3. Teste Baseado em Transição de Estados (*State Transition Testing*)
Aplicado diretamente na validação da máquina de estados do **ApiCircuitBreaker**:
- `CLOSED` → `OPEN`: Quando falhas consecutivas alcançam o `failureThreshold`.
- `OPEN` → `OPEN`: Enquanto o tempo atual for menor que `nextAttempt` (bloqueio total).
- `OPEN` → `HALF-OPEN`: Assim que o tempo supera `nextAttempt`, permitindo uma requisição de sondagem.
- `HALF-OPEN` → `CLOSED`: Se a requisição de prova for bem-sucedida (sistema recuperado).
- `HALF-OPEN` → `OPEN`: Se a requisição de prova falhar, rearmando o disjuntor imediatamente.

### 4. *Test Doubles* (Mocks, Stubs, Spies e Fakes)
- **Mocks de API (`fetch`):**
  - Simulação de respostas HTTP `200 OK` da SANS ISC para validar ingestão em tempo real.
  - Simulação de erros `500 Internal Server Error`, falhas de rede e timeout (`AbortController`).
- **Fakes de Armazenamento (`fakeStorage`):**
  - Simulação do `localStorage` para validar persistência e recuperação do padrão SWR (*Stale-While-Revalidate*).
- **Isolamento de Relógio (Injeção de Timestamps):**
  - Métodos `consume(count, now)` e `canRequest(now)` com timestamps determinísticos, eliminando a dependência do relógio real da máquina em testes unitários.

### 5. Testes de Integração e Componentes (*React Testing Library*)
- **Renderização da Interface:** Validação da árvore de componentes, cards de KPIs e cabeçalho.
- **Drill-Down em Cascata:** Simulação de seleção de País pelo usuário, verificando a habilitação reativa de Estado e Município.
- **Busca em Tempo Real:** Simulação de digitação no campo de pesquisa e filtragem correspondente da tabela.
- **Defesa Ativa / DDoS:** Alternância do botão de simulação DDoS e verificação da alteração de métricas e estados visuais.
- **Acessibilidade do Modal:** Abertura, fechamento via botão e tecla `Escape`, com papéis ARIA corretos (`role="dialog"`).

---

## 🔒 3. Segurança, UX e Performance

### Auditoria de Dependências (`npm audit`)
- Execução do comando `npm audit` em todo o grafo de dependências:
- **Resultado:** `0 vulnerabilities` (nenhuma vulnerabilidade conhecida).

### Blindagem de Segurança (Edge Defense)
- **Anti-XSS:** Sanitização em profundidade removendo tags HTML (`<script>`, `<img>`, etc.), manipuladores de eventos (`onerror`, `onload`) e esquemas perigosos (`javascript:`).
- **Anti-SQLi:** Detecção e bloqueio de padrões como `UNION SELECT`, `DROP TABLE`, `INSERT INTO` e caracteres de quebra sintática.
- **Anti-DDoS / Rate Limiting:** Algoritmo *Token Bucket* ativo limitando rajadas anormais de requisições por segundo.
- **Circuit Breaker:** Proteção contra indisponibilidade de serviços externos e degradação da experiência do usuário.

### Acessibilidade e UX (Lighthouse Ready)
- Atributo `lang="pt-BR"` e meta descrição informativa adicionados ao `index.html`.
- Labels associados via `htmlFor` e `id` em todos os campos de formulário e filtros.
- Atributos semânticos `aria-label`, `aria-hidden` e `role="dialog"` para compatibilidade com leitores de tela.
- Estados vazios informativos (*Empty State*) na tabela de organizações.

---

## 📊 4. Cobertura e Resultados dos Testes

Execução da suíte completa com **Vitest** e relatório de cobertura via `@vitest/coverage-v8`:

```bash
npm run test:coverage
```

### Relatório de Cobertura de Código

| Módulo / Camada | % Statements | % Branch | % Functions | % Lines |
|---|:---:|:---:|:---:|:---:|
| **`src/security`** (Sanitizer, TokenBucket, CircuitBreaker) | **95.45%** | **93.75%** | **100%** | **95.45%** |
| **`src/utils`** (Cálculos, Filtros, KPIs, Agregações) | **100%** | **85.71%** | **100%** | **100%** |
| **`src/services`** (Feeds OSINT, SWR, Tolerância a Falhas) | **92.30%** | **78.57%** | **80.00%** | **97.87%** |
| **`src/data`** (Hierarquia Geo, Organizações, Baseline) | **100%** | **85.71%** | **100%** | **100%** |
| **`src/components`** (Componentes Visuais do Dashboard) | **86.66%** | **78.12%** | **86.36%** | **85.71%** |
| **MÉDIA GERAL DO PROJETO** | **87.71%** | **79.23%** | **89.70%** | **88.80%** |

### Resumo dos Testes Automatizados

```text
✓ src/test/security/tokenBucket.test.js     (7 testes)
✓ src/test/security/circuitBreaker.test.js (7 testes)
✓ src/test/security/sanitizer.test.js      (13 testes)
✓ src/test/utils/calculations.test.js      (14 testes)
✓ src/test/services/osintService.test.js   (4 testes)
✓ src/test/components/App.test.jsx         (5 testes)

Test Files  6 passed (6)
Tests       50 passed (50)
Duration    1.30s
```

---

## 🚀 5. Como Executar o Projeto

### Pré-requisitos
- **Node.js:** Versão 20+ ou 22+ (LTS)
- **npm:** Versão 9+

### Instalação das Dependências
```bash
npm install
```

### Executar os Testes Automatizados
```bash
# Execução única de todos os 50 testes
npm test

# Execução interativa (Watch Mode)
npm run test:watch

# Relatório completo de cobertura de testes
npm run test:coverage
```

### Executar a Aplicação em Modo de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação no navegador em `http://localhost:5173`.

### Gerar Build de Produção
```bash
npm run build
```
Os artefatos minificados e otimizados serão gerados na pasta `dist/`.
