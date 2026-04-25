# Tasks: Orquestrar Resposta Multimodal e Gerenciar Cache de Respostas

**Input**: Design documents from `/specs/003-multimodal-response-cache/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Incluidos (TDD) porque a especificacao e o quickstart exigem cobertura de unitario, integracao e e2e para as historias.

**Organization**: Tasks agrupadas por historia para permitir implementacao e validacao independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependencia de tarefa incompleta)
- **[Story]**: Mapeia para a historia (US1, US2, US3)
- Todas as tasks incluem caminho exato de arquivo

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar artefatos de contrato e esqueleto de codigo para a feature 003.

- [X] T001 Atualizar contrato publico de resposta em specs/003-multimodal-response-cache/contracts/chat-message-response.openapi.yaml
- [X] T002 [P] Atualizar contrato interno AI Engine em specs/003-multimodal-response-cache/contracts/ai-engine-response.openapi.yaml
- [X] T003 [P] Criar esqueleto de persistencia de leads em src/infrastructure/persistence/lead.repository.ts
- [X] T004 Ajustar exportacoes da feature em src/domain/index.ts, src/application/index.ts, src/infrastructure/index.ts e src/presentation/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fundacao de dominio e wiring que bloqueia as historias.

**⚠️ CRITICAL**: Nenhuma historia comeca antes desta fase.

- [X] T005 Criar entidade de resposta multimodal em src/domain/entities/chat-response-envelope.entity.ts
- [X] T006 [P] Criar entidade de lead em src/domain/entities/lead-record.entity.ts
- [X] T007 [P] Criar value object de diretiva de cache em src/domain/value-objects/cache-directive.ts
- [X] T008 [P] Criar value object de payload de audio em src/domain/value-objects/audio-payload.ts
- [X] T009 Criar porta de persistencia de lead em src/domain/ports/lead-repository.port.ts
- [X] T010 Atualizar porta de AI Engine para contrato de resposta multimodal em src/domain/ports/ai-engine.port.ts
- [X] T011 Atualizar indices de dominio para novos contratos em src/domain/entities/index.ts, src/domain/value-objects/index.ts e src/domain/ports/index.ts
- [X] T012 Registrar providers da persistencia de lead e adapters no container em src/app.module.ts

**Checkpoint**: Fundacao pronta para implementacao das historias.

---

## Phase 3: User Story 1 - Receber e devolver resposta multimodal integra (Priority: P1) 🎯 MVP

**Goal**: Entregar texto e audio vindos do AI Engine sem corrupcao para o frontend.

**Independent Test**: Requisicao valida retorna payload textual + audio reproduzivel, mantendo integridade em comparacao ao retorno do AI Engine.

### Tests for User Story 1 (TDD) ⚠️

- [X] T013 [P] [US1] Atualizar teste unitario do caso de uso para sucesso multimodal em test/integration/process-chat.use-case.spec.ts
- [X] T014 [P] [US1] Atualizar teste de integracao do adapter para mapear resposta multimodal em test/integration/ai-engine-http.adapter.spec.ts
- [X] T015 [US1] Atualizar e2e da rota de chat para retorno multimodal em test/chat-message.e2e-spec.ts

### Implementation for User Story 1

- [X] T016 [P] [US1] Atualizar DTO de resposta para texto + audio + metadados em src/application/dto/process-chat-response.dto.ts
- [X] T017 [P] [US1] Atualizar entidade de resultado de dispatch para resposta multimodal em src/domain/entities/chat-dispatch-result.entity.ts
- [X] T018 [US1] Implementar mapeamento de resposta multimodal no adapter HTTP em src/infrastructure/adapters/ai-engine-http.adapter.ts
- [X] T019 [US1] Implementar validacao de integridade e orquestracao de resposta no caso de uso em src/application/use-cases/process-chat.use-case.ts
- [X] T020 [US1] Atualizar controller para devolver envelope multimodal ao frontend em src/presentation/controllers/chat.controller.ts
- [X] T021 [US1] Ajustar exportacoes de DTO/use-case da feature em src/application/dto/index.ts e src/application/use-cases/index.ts

**Checkpoint**: US1 funcional e testavel isoladamente.

---

## Phase 4: User Story 2 - Reaproveitar respostas via cache do cliente durante a sessao (Priority: P2)

**Goal**: Habilitar cache privado de sessao no cliente com diretivas HTTP corretas.

**Independent Test**: Segunda consulta equivalente na sessao apresenta menor latencia e headers de cache coerentes com resposta elegivel.

### Tests for User Story 2 (TDD) ⚠️

- [X] T022 [P] [US2] Adicionar cenarios de cache-control no e2e da rota em test/chat-message.e2e-spec.ts
- [X] T023 [US2] Adicionar cenarios de cacheability no teste do caso de uso em test/integration/process-chat.use-case.spec.ts

### Implementation for User Story 2

- [X] T024 [P] [US2] Evoluir DTO de resposta com metadados de cache em src/application/dto/process-chat-response.dto.ts
- [X] T025 [P] [US2] Implementar regra de cacheability no entity de resposta em src/domain/entities/chat-response-envelope.entity.ts
- [X] T026 [US2] Implementar diretivas de cache no caso de uso em src/application/use-cases/process-chat.use-case.ts
- [X] T027 [US2] Aplicar headers Cache-Control condicionais no controller em src/presentation/controllers/chat.controller.ts
- [X] T028 [US2] Garantir no-store para erro/sensivel no filtro de throttling e resposta de erro em src/presentation/controllers/chat-throttler-exception.filter.ts

**Checkpoint**: US2 funcional e testavel sem depender de US3.

---

## Phase 5: User Story 3 - Capturar leads quando houver sinalizacao de contato (Priority: P3)

**Goal**: Persistir lead (nome/empresa) quando AI Engine sinalizar captura, sem bloquear o retorno de chat.

**Independent Test**: Com sinal de lead, registro e criado; com falha de persistencia, chat segue com sucesso e evento e observavel.

### Tests for User Story 3 (TDD) ⚠️

- [X] T029 [P] [US3] Adicionar cenarios de lead capture no teste unitario do caso de uso em test/integration/process-chat.use-case.spec.ts
- [X] T030 [P] [US3] Criar teste de integracao do repositorio de leads em test/integration/lead.repository.spec.ts
- [X] T031 [US3] Adicionar cenario e2e de retorno com lead sem impacto no chat em test/chat-message.e2e-spec.ts

### Implementation for User Story 3

- [X] T032 [P] [US3] Implementar repositorio de leads em infraestrutura em src/infrastructure/persistence/lead.repository.ts
- [X] T033 [P] [US3] Atualizar entidade de lead e invariantes de captura em src/domain/entities/lead-record.entity.ts
- [X] T034 [US3] Integrar persistencia de lead nao bloqueante no caso de uso em src/application/use-cases/process-chat.use-case.ts
- [X] T035 [US3] Atualizar wiring e tokens de injecao para lead repository em src/app.module.ts e src/infrastructure/persistence/index.ts
- [X] T036 [US3] Atualizar adapter para mapear sinal estruturado de lead em src/infrastructure/adapters/ai-engine-http.adapter.ts

**Checkpoint**: US3 funcional e testavel de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fechamento tecnico, qualidade e validacao final.

- [X] T037 [P] Atualizar documentacao tecnica da camada de DTO/GraphQL em src/application/dto/README.md e src/presentation/graphql/README.md
- [X] T038 Executar suite de testes da feature e ajustar regressao em test/integration/process-chat.use-case.spec.ts, test/integration/ai-engine-http.adapter.spec.ts e test/chat-message.e2e-spec.ts
- [X] T039 [P] Validar quickstart e comandos de execucao em specs/003-multimodal-response-cache/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: sem dependencias.
- **Phase 2 (Foundational)**: depende da Phase 1 e bloqueia todas as historias.
- **Phase 3 (US1)**: depende da Phase 2.
- **Phase 4 (US2)**: depende da Phase 2 e pode iniciar apos US1 estar minimamente integrada no endpoint.
- **Phase 5 (US3)**: depende da Phase 2 e integra com fluxo de resposta de US1.
- **Phase 6 (Polish)**: depende das historias selecionadas para entrega.

### User Story Dependencies

- **US1 (P1)**: sem dependencia de outras historias; define MVP.
- **US2 (P2)**: depende do envelope de resposta de US1 para aplicar cache headers.
- **US3 (P3)**: depende da resposta estruturada de US1 para consumir sinal de lead.

### Within Each User Story

- Testes primeiro (falhando) antes de implementar.
- Contratos/entidades antes de orquestracao.
- Caso de uso antes de controller.
- Controller e wiring antes de e2e final.

### Parallel Opportunities

- Setup: T001-T003 parcialmente paralelizaveis.
- Foundational: T006, T007, T008 em paralelo apos T005 iniciar.
- US1: T013, T014 e T016, T017 em paralelo.
- US2: T022 e T024/T025 em paralelo.
- US3: T029, T030, T032, T033 em paralelo.

---

## Parallel Example: User Story 1

```bash
# Testes em paralelo (TDD)
Task: "T013 [US1] Atualizar teste unitario do caso de uso em test/integration/process-chat.use-case.spec.ts"
Task: "T014 [US1] Atualizar teste de integracao do adapter em test/integration/ai-engine-http.adapter.spec.ts"

# Modelagem em paralelo
Task: "T016 [US1] Atualizar DTO em src/application/dto/process-chat-response.dto.ts"
Task: "T017 [US1] Atualizar entidade em src/domain/entities/chat-dispatch-result.entity.ts"
```

---

## Implementation Strategy

### MVP First (US1)

1. Concluir Phase 1 e Phase 2.
2. Entregar Phase 3 (US1) completa.
3. Validar testes de US1 e e2e de integridade de audio.
4. Publicar MVP com resposta multimodal integra.

### Incremental Delivery

1. MVP com US1.
2. Acrescentar US2 para ganho de performance via cache no cliente.
3. Acrescentar US3 para captura de valor de negocio via leads.
4. Fechar com Phase 6 para robustez e validacao final.

### Parallel Team Strategy

1. Dev A: contrato + adapter AI Engine.
2. Dev B: caso de uso + entidades/value objects.
3. Dev C: controller/e2e e persistencia de lead.
4. Integracao final em pair review na Phase 6.

---

## Notes

- Tasks com [P] evitam conflito de arquivo e podem ser executadas simultaneamente.
- Cada fase de historia entrega incremento testavel de forma independente.
- Manter commits pequenos por task ou grupo logico.
- Em caso de bloqueio, priorizar desbloqueio da cadeia critica: Phase 2 -> US1 -> US2/US3.
