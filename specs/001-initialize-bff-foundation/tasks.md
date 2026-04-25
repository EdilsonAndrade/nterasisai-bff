# Tasks: Inicializar Fundacao do BFF

**Input**: Design documents from `/specs/001-initialize-bff-foundation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Esta feature pede validacao automatizada para subida do servico, endpoint de saude e guarda estrutural da arquitetura.

**Organization**: As tasks estao agrupadas por user story para permitir implementacao incremental e validacao independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode ser executada em paralelo quando nao compartilha arquivo nem dependencia incompleta.
- **[Story]**: Identifica a user story atendida pela task.
- Cada descricao inclui os caminhos exatos que devem ser alterados.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar o projeto base e preparar o repositorio para receber o primeiro slice funcional.

- [X] T001 Inicializar o projeto NestJS na raiz e gerar `package.json`, `package-lock.json`, `nest-cli.json`, `tsconfig.json`, `tsconfig.build.json`, `src/main.ts` e `src/app.module.ts`
- [X] T002 Ajustar scripts base de desenvolvimento, build e teste em `package.json`
- [X] T003 [P] Preparar a configuracao inicial de testes E2E em `test/jest-e2e.json` e `test/tsconfig.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Criar a base compartilhada que bloqueia todas as user stories ate ficar pronta.

**CRITICAL**: Nenhuma user story deve comecar antes da conclusao desta fase.

- [X] T004 Remover o boilerplate padrao que conflita com a arquitetura alvo em `src/app.controller.ts`, `src/app.service.ts` e `src/app.controller.spec.ts`
- [X] T005 [P] Criar a estrutura inicial de dominio e aplicacao em `src/domain/.gitkeep`, `src/domain/entities/.gitkeep`, `src/domain/value-objects/.gitkeep`, `src/domain/ports/.gitkeep`, `src/application/.gitkeep`, `src/application/use-cases/.gitkeep` e `src/application/dto/.gitkeep`
- [X] T006 [P] Criar a estrutura inicial de infraestrutura e apresentacao em `src/infrastructure/.gitkeep`, `src/infrastructure/adapters/.gitkeep`, `src/infrastructure/persistence/.gitkeep`, `src/infrastructure/config/.gitkeep`, `src/presentation/.gitkeep`, `src/presentation/controllers/.gitkeep` e `src/presentation/graphql/.gitkeep`
- [X] T007 Configurar o bootstrap HTTP com porta configuravel e fallback local em `src/main.ts`
- [X] T008 Preparar a composicao raiz do BFF sem logica de negocio em `src/app.module.ts`

**Checkpoint**: Base do projeto pronta para iniciar as user stories sem violar a constitution.

---

## Phase 3: User Story 1 - Subir o backend base com seguranca operacional (Priority: P1) 🎯 MVP

**Goal**: Permitir que o backend suba localmente e exponha um endpoint de saude confiavel.

**Independent Test**: Iniciar a aplicacao localmente e validar que `GET /health` responde `200` com `status` e `timestamp`.

### Tests for User Story 1

> Escreva estes testes antes da implementacao e confirme que falham inicialmente.

- [X] T009 [P] [US1] Criar o teste E2E de inicializacao da aplicacao em `test/app.e2e-spec.ts`
- [X] T010 [P] [US1] Criar o teste E2E do contrato `GET /health` em `test/health.e2e-spec.ts`

### Implementation for User Story 1

- [X] T011 [US1] Implementar o controller de saude com `status` e `timestamp` dinamico em `src/presentation/controllers/health.controller.ts`
- [X] T012 [US1] Registrar o `HealthController` na composicao principal em `src/app.module.ts`
- [X] T013 [US1] Ajustar o bootstrap para suportar os testes e a execucao local descrita em `src/main.ts`, `test/app.e2e-spec.ts` e `test/health.e2e-spec.ts`

**Checkpoint**: A aplicacao sobe e o endpoint `/health` fica funcional e testavel de forma independente.

---

## Phase 4: User Story 2 - Organizar a base conforme a constituicao arquitetural (Priority: P2)

**Goal**: Tornar explicitos os limites de camada para que as proximas features crescam sem misturar responsabilidades.

**Independent Test**: Verificar automaticamente que as quatro camadas existem em `src/` e que cada uma possui um ponto de entrada dedicado.

### Tests for User Story 2

- [X] T014 [US2] Criar o teste de guarda estrutural da arquitetura em `test/integration/architecture-foundation.spec.ts`

### Implementation for User Story 2

- [X] T015 [P] [US2] Criar os pontos de entrada da camada de dominio em `src/domain/index.ts`, `src/domain/entities/index.ts`, `src/domain/value-objects/index.ts` e `src/domain/ports/index.ts`
- [X] T016 [P] [US2] Criar os pontos de entrada da camada de aplicacao em `src/application/index.ts`, `src/application/use-cases/index.ts` e `src/application/dto/index.ts`
- [X] T017 [P] [US2] Criar os pontos de entrada da camada de infraestrutura em `src/infrastructure/index.ts`, `src/infrastructure/adapters/index.ts`, `src/infrastructure/persistence/index.ts` e `src/infrastructure/config/index.ts`
- [X] T018 [P] [US2] Criar os pontos de entrada da camada de apresentacao em `src/presentation/index.ts`, `src/presentation/controllers/index.ts` e `src/presentation/graphql/index.ts`

**Checkpoint**: A estrutura arquitetural fica verificavel e preparada para receber implementacoes futuras sem ambiguidade.

---

## Phase 5: User Story 3 - Preparar a fundacao para futuras integracoes de cliente e API (Priority: P3)

**Goal**: Deixar o projeto pronto para futuras evolucoes com GraphQL e validacao de entrada sem ampliar o escopo funcional desta entrega.

**Independent Test**: Confirmar que as dependencias essenciais estao declaradas e que a aplicacao continua iniciando sem regressao.

### Implementation for User Story 3

- [X] T019 [US3] Adicionar as dependencias de GraphQL e validacao em `package.json` e `package-lock.json`
- [X] T020 [P] [US3] Criar o placeholder da futura superficie GraphQL em `src/presentation/graphql/README.md`
- [X] T021 [P] [US3] Criar o placeholder de DTOs para validacao futura em `src/application/dto/README.md`
- [X] T022 [US3] Revisar a composicao futura do BFF sem ativar schema prematuro em `src/app.module.ts` e `src/presentation/index.ts`

**Checkpoint**: O baseline para GraphQL e validacao fica pronto sem comprometer o bootstrap atual.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Consolidar validacao final da entrega e garantir aderencia ao quickstart e ao contrato definido.

- [X] T023 Executar a validacao automatizada final da feature em `test/app.e2e-spec.ts`, `test/health.e2e-spec.ts` e `test/integration/architecture-foundation.spec.ts`
- [X] T024 Validar o fluxo manual descrito em `specs/001-initialize-bff-foundation/quickstart.md` a partir de `package.json`, `src/main.ts` e `src/presentation/controllers/health.controller.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1: Setup**: sem dependencias.
- **Phase 2: Foundational**: depende da conclusao do Setup e bloqueia todas as user stories.
- **Phase 3: User Story 1**: depende da conclusao da fase Foundational.
- **Phase 4: User Story 2**: depende da conclusao da fase Foundational.
- **Phase 5: User Story 3**: depende da conclusao da fase Foundational.
- **Phase 6: Polish**: depende das user stories que entrarem no escopo final da entrega.

### User Story Dependencies

- **US1 (P1)**: pode comecar assim que a fase Foundational terminar.
- **US2 (P2)**: pode comecar assim que a fase Foundational terminar.
- **US3 (P3)**: pode comecar assim que a fase Foundational terminar, mas deve evitar sobrescrever ajustes ativos em `src/app.module.ts` enquanto US1 estiver em andamento.

### Within Each User Story

- Os testes de US1 e US2 devem ser escritos antes da implementacao.
- O bootstrap e a composicao raiz precisam existir antes do controller de saude.
- A estrutura de camadas precisa existir antes dos pontos de entrada de cada camada.
- A instalacao de dependencias de GraphQL e validacao deve acontecer antes da revisao final do modulo raiz para futuras integracoes.

### Parallel Opportunities

- **Setup**: `T003` pode rodar em paralelo apos `T001`.
- **Foundational**: `T005` e `T006` podem rodar em paralelo apos `T004`.
- **US1**: `T009` e `T010` podem rodar em paralelo.
- **US2**: `T015`, `T016`, `T017` e `T018` podem rodar em paralelo apos `T014`.
- **US3**: `T020` e `T021` podem rodar em paralelo apos `T019`.

---

## Parallel Example: User Story 1

```bash
Task: "Criar o teste E2E de inicializacao da aplicacao em test/app.e2e-spec.ts"
Task: "Criar o teste E2E do contrato GET /health em test/health.e2e-spec.ts"
```

## Parallel Example: User Story 2

```bash
Task: "Criar os pontos de entrada da camada de dominio em src/domain/index.ts, src/domain/entities/index.ts, src/domain/value-objects/index.ts e src/domain/ports/index.ts"
Task: "Criar os pontos de entrada da camada de aplicacao em src/application/index.ts, src/application/use-cases/index.ts e src/application/dto/index.ts"
Task: "Criar os pontos de entrada da camada de infraestrutura em src/infrastructure/index.ts, src/infrastructure/adapters/index.ts, src/infrastructure/persistence/index.ts e src/infrastructure/config/index.ts"
Task: "Criar os pontos de entrada da camada de apresentacao em src/presentation/index.ts, src/presentation/controllers/index.ts e src/presentation/graphql/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1: Setup.
2. Concluir Phase 2: Foundational.
3. Concluir Phase 3: User Story 1.
4. Parar e validar a subida do app e o `GET /health`.

### Incremental Delivery

1. Entregar Setup + Foundational para fixar o alicerce.
2. Entregar US1 e validar o MVP operacional.
3. Entregar US2 para consolidar os limites arquiteturais.
4. Entregar US3 para preparar as proximas integracoes.
5. Fechar com a fase de Polish e a validacao do quickstart.

### Parallel Team Strategy

1. Uma pessoa conclui Setup e Foundational.
2. Depois disso:
   - Pessoa A trabalha em US1.
   - Pessoa B trabalha em US2.
   - Pessoa C trabalha em US3, coordenando qualquer mudanca em `src/app.module.ts`.

---

## Notes

- Todas as tasks seguem o formato de checklist com ID sequencial, marcador de paralelismo quando aplicavel, rotulo de user story e caminhos explicitos.
- O menor MVP desta feature e a conclusao de US1 apos Setup e Foundational.
- US2 e US3 adicionam valor incremental sem ampliar indevidamente o escopo funcional do bootstrap inicial.