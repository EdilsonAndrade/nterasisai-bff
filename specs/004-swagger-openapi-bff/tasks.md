# Tasks: Configurar Swagger/OpenAPI para Documentacao e Testes do BFF

**Input**: Design documents from `/specs/004-swagger-openapi-bff/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Incluidos porque a especificacao e o plano exigem validacao automatizada dos endpoints documentados e confirmacao manual da rota de docs.

**Organization**: Tasks agrupadas por historia para permitir implementacao e validacao independentes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependencia de tarefa incompleta)
- **[Story]**: Mapeia para a historia (US1, US2, US3)
- Todas as tasks incluem caminho exato de arquivo

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar dependencias e artefatos de referencia para a documentacao OpenAPI da feature 004.

- [X]  Atualizar dependencias de documentacao OpenAPI em package.json
- [X]  [P] Refinar contrato de referencia da API em specs/004-swagger-openapi-bff/contracts/public-api.openapi.yaml
- [X]  [P] Preparar cenario base de bootstrap para validar a rota de docs em test/app.e2e-spec.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Estabelecer a fundacao tecnica da publicacao Swagger antes das historias.

**⚠️ CRITICAL**: Nenhuma historia comeca antes desta fase.

- [X]  Configurar geracao do documento OpenAPI e publicacao da UI em `/api/docs` no bootstrap em src/main.ts
- [X]  [P] Garantir consistencia do bootstrap e inicializacao da aplicacao para o fluxo de docs em src/main.ts e test/app.e2e-spec.ts
- [X]  [P] Confirmar que a porta ativa e o comportamento esperado de inicializacao permanecem documentados em specs/004-swagger-openapi-bff/quickstart.md

**Checkpoint**: Base de documentacao publicada e pronta para detalhamento por historia.

---

## Phase 3: User Story 1 - Consultar documentacao viva da API do BFF (Priority: P1) 🎯 MVP

**Goal**: Permitir acesso a uma interface Swagger funcional com metadados claros e endpoint de saude testavel.

**Independent Test**: Subir o BFF, acessar `/api/docs` e confirmar que a documentacao abre corretamente e que `/health` aparece com retorno JSON testavel no "Try it out".

### Tests for User Story 1 (TDD) ⚠️

- [X]  [P] [US1] Adicionar teste e2e para disponibilidade da rota de documentacao em test/app.e2e-spec.ts
- [X]  [P] [US1] Atualizar teste e2e de saude para proteger o contrato exposto ao Swagger em test/health.e2e-spec.ts

### Implementation for User Story 1

- [X]  [P] [US1] Configurar metadados do documento Swagger (titulo, descricao, versao) em src/main.ts
- [X]  [P] [US1] Decorar o controller de saude com tags e respostas documentadas em src/presentation/controllers/health.controller.ts
- [X]  [US1] Ajustar exportacoes da camada de apresentacao para refletir controladores documentados em src/presentation/controllers/index.ts
- [X]  [US1] Validar e alinhar o contrato de saude na referencia OpenAPI em specs/004-swagger-openapi-bff/contracts/public-api.openapi.yaml

**Checkpoint**: US1 funcional e testavel isoladamente com docs acessivel e endpoint de saude documentado.

---

## Phase 4: User Story 2 - Explorar contratos de chat para testes independentes (Priority: P2)

**Goal**: Exibir o endpoint de chat com schemas claros de entrada e saida, exemplos e suporte ao teste interativo.

**Independent Test**: Abrir a documentacao, localizar `/chat/message`, conferir os schemas de request/response e executar um payload minimo valido sem erro de contrato por falta de documentacao.

### Tests for User Story 2 (TDD) ⚠️

- [X]  [P] [US2] Adicionar cobertura e2e para garantir que o endpoint de chat permanece funcional apos as anotacoes de documentacao em test/chat-message.e2e-spec.ts
- [X]  [P] [US2] Adicionar validacao da exposicao do contrato de chat no documento OpenAPI em test/app.e2e-spec.ts

### Implementation for User Story 2

- [X]  [P] [US2] Decorar o DTO de entrada com propriedades, obrigatoriedade e exemplos em src/application/dto/process-chat-request.dto.ts
- [X]  [P] [US2] Decorar o DTO de resposta com propriedades e possiveis estados de retorno em src/application/dto/process-chat-response.dto.ts
- [X]  [US2] Atualizar exportacoes dos DTOs documentados em src/application/dto/index.ts
- [X]  [US2] Decorar o controller de chat com tag, consumo multipart/json e respostas documentadas em src/presentation/controllers/chat.controller.ts
- [X]  [US2] Refinar a referencia OpenAPI do endpoint de chat com schemas e respostas esperadas em specs/004-swagger-openapi-bff/contracts/public-api.openapi.yaml

**Checkpoint**: US2 funcional e testavel de forma independente, com schemas de chat claros e coerentes com o endpoint real.

---

## Phase 5: User Story 3 - Organizar navegacao por dominio funcional (Priority: P3)

**Goal**: Melhorar a navegacao na interface Swagger por meio de agrupamento consistente e nomenclatura clara entre Health e Chat.

**Independent Test**: Abrir a documentacao e confirmar que os endpoints aparecem agrupados em categorias funcionais coerentes, facilitando descoberta e navegacao.

### Tests for User Story 3 (TDD) ⚠️

- [X]  [P] [US3] Adicionar validacao e2e das tags funcionais presentes no documento OpenAPI em test/app.e2e-spec.ts
- [X]  [P] [US3] Garantir por teste que os endpoints de saude e chat seguem acessiveis apos a reorganizacao de tags em test/health.e2e-spec.ts e test/chat-message.e2e-spec.ts

### Implementation for User Story 3

- [X]  [P] [US3] Padronizar nomenclatura e descricoes das tags de saude em src/presentation/controllers/health.controller.ts
- [X]  [P] [US3] Padronizar nomenclatura e descricoes das tags de chat em src/presentation/controllers/chat.controller.ts
- [X]  [US3] Alinhar agrupamentos e descricoes funcionais na referencia OpenAPI em specs/004-swagger-openapi-bff/contracts/public-api.openapi.yaml
- [X]  [US3] Revisar o guia operacional para refletir o fluxo final de navegacao e troubleshooting em specs/004-swagger-openapi-bff/quickstart.md e specs/004-swagger-openapi-bff/spec.md

**Checkpoint**: Todas as historias entregam uma interface Swagger navegavel, coerente e pronta para uso do time.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fechamento tecnico, validacao final e garantia de aderencia aos artefatos de planejamento.

- [X]  [P] Executar e ajustar regressao da suite e2e relevante em test/app.e2e-spec.ts, test/health.e2e-spec.ts e test/chat-message.e2e-spec.ts
- [X]  [P] Validar aderencia final entre codigo e contrato de referencia em specs/004-swagger-openapi-bff/contracts/public-api.openapi.yaml
- [X]  Validar o quickstart ponta a ponta e confirmar o fluxo `npm install` -> `npm run start:dev` -> `/api/docs` em specs/004-swagger-openapi-bff/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: sem dependencias.
- **Phase 2 (Foundational)**: depende da Phase 1 e bloqueia todas as historias.
- **Phase 3 (US1)**: depende da Phase 2.
- **Phase 4 (US2)**: depende da Phase 2 e do documento Swagger ja publicado pela US1.
- **Phase 5 (US3)**: depende da publicacao da documentacao e da existencia das tags aplicadas nas historias anteriores.
- **Phase 6 (Polish)**: depende das historias que forem selecionadas para entrega.

### User Story Dependencies

- **US1 (P1)**: define o MVP da feature com a docs route e o endpoint de saude documentado.
- **US2 (P2)**: depende do Swagger publicado em US1 para documentar o contrato de chat.
- **US3 (P3)**: depende dos endpoints ja documentados em US1 e US2 para consolidar a navegacao por grupos funcionais.

### Within Each User Story

- Testes primeiro (falhando) antes de implementar.
- Bootstrap/documento antes do refinamento de controllers.
- DTOs antes das anotacoes completas do controller de chat.
- Contrato de referencia e quickstart por ultimo, apos o comportamento real estar estabilizado.

### Parallel Opportunities

- Setup: T002 e T003 podem ocorrer em paralelo apos T001.
- Foundational: T005 e T006 podem ocorrer em paralelo apos T004.
- US1: T007, T008, T009 e T010 podem avancar em paralelo por atuarem em arquivos distintos.
- US2: T013, T014, T015 e T016 podem ocorrer em paralelo.
- US3: T020, T022 e T023 podem ocorrer em paralelo.

---

## Parallel Example: User Story 2

```bash
# Testes em paralelo (TDD)
Task: "T013 [US2] Atualizar teste e2e de chat em test/chat-message.e2e-spec.ts"
Task: "T014 [US2] Validar contrato OpenAPI de chat em test/app.e2e-spec.ts"

# Modelagem/documentacao em paralelo
Task: "T015 [US2] Decorar DTO de entrada em src/application/dto/process-chat-request.dto.ts"
Task: "T016 [US2] Decorar DTO de resposta em src/application/dto/process-chat-response.dto.ts"
```

---

## Implementation Strategy

### MVP First (US1)

1. Concluir Phase 1 e Phase 2.
2. Entregar Phase 3 completa.
3. Validar acesso a `/api/docs` e execucao do endpoint `/health`.
4. Publicar/demonstrar o MVP da documentacao viva.

### Incremental Delivery

1. MVP com US1 para disponibilizar Swagger funcional.
2. Acrescentar US2 para tornar o endpoint de chat autoexplicativo e testavel.
3. Acrescentar US3 para consolidar navegacao e usabilidade.
4. Fechar com Phase 6 para regressao e validacao operacional final.

### Parallel Team Strategy

1. Dev A: bootstrap Swagger + smoke tests da docs route.
2. Dev B: DTOs e controller de chat.
3. Dev C: health controller, contrato de referencia e quickstart.
4. Integracao final e revisao conjunta na Phase 6.

---

## Notes

- Tasks com [P] evitam conflito de arquivo e podem ser executadas em paralelo.
- Cada historia entrega valor observavel e pode ser validada de forma independente.
- O contrato de referencia em contracts/ apoia a revisao, mas a fonte primaria do schema exibido deve continuar sendo o codigo anotado.
- Priorizar sempre consistencia entre DTOs, controllers, docs route e quickstart.
