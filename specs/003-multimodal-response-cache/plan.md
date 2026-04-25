# Implementation Plan: Orquestrar Resposta Multimodal e Gerenciar Cache de Respostas

**Branch**: `[003-multimodal-response-cache]` | **Date**: 2026-04-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-multimodal-response-cache/spec.md`

## Summary

Evoluir o fluxo de orquestracao de chat do BFF para consumir a resposta multimodal do AI Engine (texto + audio codificado), repassar ao frontend sem corrupcao, aplicar politica de cache no cliente via headers HTTP e capturar leads quando houver sinalizacao estruturada de dados de contato. A implementacao mantera Clean Architecture: controlador de transporte em `presentation`, regra de orquestracao em `application`, contratos e invariantes em `domain`, e integracoes de rede/persistencia em `infrastructure`.

## Technical Context

**Language/Version**: TypeScript 5.7.x em Node.js 22 LTS  
**Primary Dependencies**: NestJS 11.x, `@nestjs/platform-express`, `@nestjs/throttler`, `@nestjs/axios`, `class-validator`, `class-transformer`, `rxjs`  
**Storage**: Persistencia de leads no backend via camada de infraestrutura (detalhe de tecnologia definido no projeto existente)  
**Testing**: Jest + Supertest (unitarios no use case e value objects; integracao para adapters; e2e para rota de chat)  
**Target Platform**: Servico backend NestJS em Linux (deploy alvo) e desenvolvimento local em Windows/macOS/Linux  
**Project Type**: Web-service BFF orientado a GraphQL com endpoint HTTP de chat  
**Performance Goals**: Reduzir em >= 70% o tempo percebido para respostas repetidas em sessao; manter p95 de resposta inicial abaixo de 2s para payloads validos sem cache em homologacao  
**Constraints**: Integridade de payload de audio sem re-encoding destrutivo; cache apenas privado de sessao no cliente; sem logica de IA no BFF; resiliencia para que falha de lead nao quebre entrega do chat  
**Scale/Scope**: Um slice evolutivo do endpoint de chat existente, um use case central de orquestracao, adapter de AI Engine, adapter de persistencia de leads, e contratos HTTP versionados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate

- **Clean Architecture & Layer Separation**: PASS. O plano separa transporte HTTP/cache headers em `presentation`, orquestracao em `application`, contratos/entidades em `domain` e chamadas externas/persistencia em `infrastructure`.
- **SOLID Design Discipline**: PASS. Cada componente tem responsabilidade unica: parse de entrada/saida, decisao de fluxo, relay com AI Engine e persistencia opcional de lead.
- **Dependency Injection via NestJS**: PASS. Dependencias cross-layer serao resolvidas por providers e tokens de porta de dominio, sem instanciacao manual.
- **BFF Orchestration & AI Engine Separation**: PASS. Toda decisao de conteudo continua no AI Engine; o BFF apenas valida, encaminha e adapta contratos.
- **Streaming-First Chat Responses**: PASS. A feature nao implementa streaming ponta a ponta, mas o contrato interno/externo permanece compativel com evolucao incremental sem obrigar buffering de resposta completa para iteracoes futuras.

### Post-Phase 1 Re-Check

- **Layer boundaries remain enforceable**: PASS. `data-model.md` e contratos mantem regras de negocio fora da camada de apresentacao.
- **DI remains the composition mechanism**: PASS. Quickstart e desenho assumem somente wiring via NestJS Module providers.
- **BFF responsibilities remain separated from AI concerns**: PASS. O BFF nao interpreta conteudo de IA alem da sinalizacao estruturada necessaria para capturar lead.
- **Streaming requirement remains respected**: PASS. Nenhum artefato de design bloqueia adocao posterior de resposta incremental.

## Project Structure

### Documentation (this feature)

```text
specs/003-multimodal-response-cache/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── chat-message-response.openapi.yaml
│   └── ai-engine-response.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── app.module.ts
├── main.ts
├── application/
│   ├── dto/
│   └── use-cases/
├── domain/
│   ├── entities/
│   ├── ports/
│   └── value-objects/
├── infrastructure/
│   ├── adapters/
│   ├── config/
│   └── persistence/
└── presentation/
    ├── controllers/
    └── graphql/

test/
├── integration/
├── app.e2e-spec.ts
├── chat-message.e2e-spec.ts
└── health.e2e-spec.ts
```

**Structure Decision**: Manter estrutura unica do backend na raiz, estendendo o fluxo de chat ja existente. As mudancas desta feature ficam concentradas no caso de uso de processamento de chat, portas/entidades de dominio para resposta multimodal e lead, adapters de AI Engine/persistencia e ajustes de controller para headers de cache.

## Phase 0: Research Summary

- A propagacao de audio deve preservar bytes significativos do payload para evitar corrupcao audivel no cliente.
- O contrato entre BFF e AI Engine deve incluir sinalizacao estruturada de `cacheable` e `leadCapture` para evitar heuristica textual no BFF.
- Cache para frontend deve usar cabecalhos `Cache-Control` privados de sessao e impedir armazenamento por intermediarios compartilhados.
- Persistencia de lead deve ser caminho lateral nao-bloqueante para nao degradar SLA de resposta do chat.
- Falhas de upstream (AI Engine) e falhas de persistencia de lead devem ter tratamento separado para manter resiliencia funcional.

## Phase 1: Design Artifacts

- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Contracts**: [contracts/chat-message-response.openapi.yaml](./contracts/chat-message-response.openapi.yaml), [contracts/ai-engine-response.openapi.yaml](./contracts/ai-engine-response.openapi.yaml)

## Phase 2: Implementation Strategy

1. Evoluir o contrato interno do AI Engine para retornar resposta multimodal com metadados de cache e lead.
2. Atualizar o `ProcessChatUseCase` para orquestrar resposta de sucesso/erro, mapear cacheabilidade e encaminhar tentativa de persistencia de lead sem bloquear entrega.
3. Introduzir porta de dominio para persistencia de lead e implementar adapter de infraestrutura correspondente.
4. Atualizar controller de chat para responder payload multimodal ao frontend com headers `Cache-Control` adequados ao estado da resposta.
5. Adicionar observabilidade para falhas de persistencia de lead sem vazar detalhes ao cliente.
6. Cobrir com testes unitarios (use case), integracao (adapter AI Engine + persistencia lead) e e2e (integridade de resposta e headers de cache).

## Complexity Tracking

Nenhuma violacao de principio constitucional identificada nesta fase.
