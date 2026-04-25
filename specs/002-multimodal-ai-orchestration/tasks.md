# Tasks: Receber Payload Multimodal e Orquestrar Chamada Segura para o AI Engine

**Input**: Design documents from `/specs/002-multimodal-ai-orchestration/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: A especificacao e o plano pedem testes unitarios, de integracao e e2e; por isso as tasks de teste foram incluidas e devem falhar antes da implementacao correspondente.

**Organization**: Tasks agrupadas por historia de usuario para permitir entrega incremental e validacao independente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependencia direta)
- **[Story]**: Historia associada (`US1`, `US2`, `US3`)
- Todas as descricoes incluem caminhos exatos de arquivo

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar dependencias e pontos de extensao do slice multimodal

- [X] T001 Atualizar `package.json` com as dependencias `@nestjs/throttler` e `@nestjs/axios`
- [X] T002 Atualizar exports de `src/presentation/controllers/index.ts`, `src/application/dto/index.ts`, `src/application/use-cases/index.ts`, `src/domain/ports/index.ts`, `src/domain/entities/index.ts`, `src/domain/value-objects/index.ts`, `src/infrastructure/adapters/index.ts` e `src/infrastructure/config/index.ts` para acomodar o novo slice

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Configuracoes e contratos obrigatorios que bloqueiam qualquer historia

**CRITICAL**: Nenhuma historia deve comecar antes desta fase

- [X] T003 Definir configuracao tipada do AI Engine e allowlist de origem em `src/infrastructure/config/ai-engine.config.ts`
- [X] T004 [P] Definir a porta de dominio de relay em `src/domain/ports/ai-engine.port.ts`
- [X] T005 [P] Modelar o objeto de valor `MessageContent` em `src/domain/value-objects/message-content.ts`
- [X] T006 [P] Modelar as entidades `ChatMessageRequest`, `AIEngineDispatchRequest` e `ChatDispatchResult` em `src/domain/entities/chat-message-request.entity.ts`, `src/domain/entities/ai-engine-dispatch-request.entity.ts` e `src/domain/entities/chat-dispatch-result.entity.ts`
- [X] T007 Configurar `main.ts` para aplicar CORS com allowlist orientada por ambiente
- [X] T008 Configurar `src/app.module.ts` com `HttpModule`, `ThrottlerModule` e providers base do slice de chat

**Checkpoint**: Fundacao pronta para implementar as historias com DI, configuracao e contratos internos definidos

---

## Phase 3: User Story 1 - Enviar mensagem multimodal com protecao do orquestrador (Priority: P1) MVP

**Goal**: Receber texto, audio ou ambos no BFF, validar o payload e encaminhar a solicitacao ao AI Engine via caso de uso

**Independent Test**: Enviar requisicoes validas para `POST /chat/message` com texto, com audio e com ambos, confirmando aceite e relay interno

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T009 [P] [US1] Criar teste unitario do objeto de valor em `test/integration/message-content.spec.ts` cobrindo mensagem vazia, texto valido, audio valido e payload combinado
- [X] T010 [P] [US1] Criar teste unitario do caso de uso em `test/integration/process-chat.use-case.spec.ts` cobrindo normalizacao do comando e relay de payload valido
- [X] T011 [P] [US1] Criar teste e2e de aceite da rota em `test/chat-message.e2e-spec.ts` cobrindo envio com texto, envio com audio e envio combinado

### Implementation for User Story 1

- [X] T012 [P] [US1] Criar DTO de entrada multimodal em `src/application/dto/process-chat-request.dto.ts`
- [X] T013 [P] [US1] Criar DTO de resposta publica em `src/application/dto/process-chat-response.dto.ts`
- [X] T014 [US1] Implementar o caso de uso `ProcessChatUseCase` em `src/application/use-cases/process-chat.use-case.ts`
- [X] T015 [US1] Implementar o adapter REST do AI Engine em `src/infrastructure/adapters/ai-engine-http.adapter.ts`
- [X] T016 [US1] Implementar o controller HTTP em `src/presentation/controllers/chat.controller.ts`
- [X] T017 [US1] Registrar controller, use case e adapter em `src/app.module.ts` e atualizar barrel files relacionados
- [X] T018 [US1] Ajustar `test/app.e2e-spec.ts` ou bootstrap de testes para incluir o modulo de chat no arranjo e2e atual

**Checkpoint**: User Story 1 funcional com intake multimodal, validacao minima e relay autenticado via porta de dominio

---

## Phase 4: User Story 2 - Bloquear origens e trafego abusivo antes do AI Engine (Priority: P2)

**Goal**: Impedir que origens nao aprovadas ou chamadas acima do limite atinjam o fluxo interno do AI Engine

**Independent Test**: Chamar `POST /chat/message` com origem nao aprovada e com taxa acima do limite, confirmando bloqueio sem relay interno

### Tests for User Story 2

- [X] T019 [P] [US2] Estender `test/chat-message.e2e-spec.ts` com caso de origem nao aprovada validando retorno `403`
- [X] T020 [P] [US2] Estender `test/chat-message.e2e-spec.ts` com caso de throttling validando retorno `429`

### Implementation for User Story 2

- [X] T021 [US2] Implementar a configuracao de politica de trafego para a rota de chat em `src/app.module.ts`
- [X] T022 [US2] Aplicar decoradores ou guardas de throttling em `src/presentation/controllers/chat.controller.ts`
- [X] T023 [US2] Refinar a validacao de allowlist e comportamento de bloqueio no bootstrap de `src/main.ts`
- [X] T024 [US2] Garantir resposta padronizada para bloqueio por politica de origem e limite em `src/presentation/controllers/chat.controller.ts`

**Checkpoint**: User Story 2 funcional com protecoes de borda impedindo chamadas indevidas antes da orquestracao

---

## Phase 5: User Story 3 - Preservar a confianca entre BFF e AI Engine (Priority: P3)

**Goal**: Garantir que toda chamada interna ao AI Engine use apenas o segredo gerenciado pelo backend e trate falhas com seguranca

**Independent Test**: Inspecionar o relay do adapter para confirmar inclusao do segredo interno do servidor e tratamento de falhas sem vazamento de detalhes

### Tests for User Story 3

- [X] T025 [P] [US3] Criar teste de integracao do adapter em `test/integration/ai-engine-http.adapter.spec.ts` cobrindo inclusao do header interno e payload versionado
- [X] T026 [P] [US3] Estender `test/integration/process-chat.use-case.spec.ts` com caso que ignora segredo vindo da entrada externa e falha por indisponibilidade do AI Engine
- [X] T027 [P] [US3] Estender `test/chat-message.e2e-spec.ts` com caso de falha operacional do AI Engine validando retorno `502`

### Implementation for User Story 3

- [X] T028 [US3] Garantir que `src/infrastructure/adapters/ai-engine-http.adapter.ts` injete `X-Internal-Secret` apenas a partir da configuracao interna
- [X] T029 [US3] Implementar mapeamento de falhas do relay para `ChatDispatchResult` em `src/application/use-cases/process-chat.use-case.ts`
- [X] T030 [US3] Impedir qualquer influencia de segredo externo no DTO e no controller em `src/application/dto/process-chat-request.dto.ts` e `src/presentation/controllers/chat.controller.ts`

**Checkpoint**: User Story 3 funcional com relay confiavel, credencial interna protegida e falhas operacionais tratadas com seguranca

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Consolidar a feature e validar o fluxo descrito no quickstart

- [X] T031 [P] Atualizar `README.md` com variaveis de ambiente e fluxo basico de uso da rota de chat
- [X] T032 [P] Revisar contratos em `specs/002-multimodal-ai-orchestration/contracts/chat-message.openapi.yaml` e `specs/002-multimodal-ai-orchestration/contracts/ai-engine-message.openapi.yaml` para refletir a implementacao final
- [X] T033 Executar a validacao descrita em `specs/002-multimodal-ai-orchestration/quickstart.md` e ajustar discrepancias encontradas

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependencias
- **Foundational (Phase 2)**: depende da Setup e bloqueia todas as historias
- **User Stories (Phase 3+)**: dependem da conclusao da fase Foundational
- **Polish (Phase 6)**: depende das historias desejadas estarem concluidas

### User Story Dependencies

- **User Story 1 (P1)**: comeca apos a fase Foundational e entrega o MVP funcional da rota
- **User Story 2 (P2)**: depende de US1 existir porque protege a rota publica criada no MVP
- **User Story 3 (P3)**: depende de US1 existir porque reforca o relay interno e o tratamento seguro do adapter

### Within Each User Story

- Os testes de cada historia devem ser escritos antes da implementacao correspondente
- DTOs e modelos de dominio precedem o caso de uso
- Caso de uso precede controller e adaptadores expostos ao fluxo final
- A historia deve estar validada antes de abrir ajuste cross-cutting

### Parallel Opportunities

- `T004`, `T005` e `T006` podem rodar em paralelo na fase Foundational
- `T009`, `T010` e `T011` podem ser preparados em paralelo para US1
- `T012` e `T013` podem rodar em paralelo antes de `T014`
- `T019` e `T020` podem rodar em paralelo em US2
- `T025`, `T026` e `T027` podem rodar em paralelo em US3
- `T031` e `T032` podem rodar em paralelo na fase final

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Concluir Phase 1: Setup
2. Concluir Phase 2: Foundational
3. Concluir Phase 3: User Story 1
4. Validar `POST /chat/message` com texto, audio e payload combinado
5. Demonstrar o MVP do intake multimodal protegido

### Incremental Delivery

1. Setup + Foundational deixam os contratos, configuracao e DI prontos
2. US1 entrega a rota funcional e o relay interno do BFF
3. US2 endurece a borda com bloqueio por origem e trafego
4. US3 fecha a confianca inter-servicos e o tratamento de falhas
5. Polish consolida documentacao, contratos e validacao do quickstart

## Notes

- `[P]` indica tarefas em arquivos diferentes e sem dependencia direta
- Cada historia permanece rastreavel por `US1`, `US2` e `US3`
- Evite mover validacao de transporte para `domain` ou detalhes HTTP para `application`
- O adapter do AI Engine deve continuar compativel com uma futura evolucao para streaming