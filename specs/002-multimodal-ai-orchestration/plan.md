# Implementation Plan: Receber Payload Multimodal e Orquestrar Chamada Segura para o AI Engine

**Branch**: `[002-multimodal-ai-orchestration]` | **Date**: 2026-04-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-multimodal-ai-orchestration/spec.md`

## Summary

Adicionar a primeira rota de entrada conversacional do BFF para receber payload multimodal do frontend, aplicar validacoes de borda e politicas de seguranca, e encaminhar a solicitacao ao AI Engine por meio de um adapter HTTP protegido por segredo interno. O desenho preserva a Clean Architecture ao concentrar transporte em `presentation`, orquestracao em `application`, contrato de integracao em `domain` e comunicacao REST com o motor Python em `infrastructure`.

## Technical Context

**Language/Version**: TypeScript 5.7.x em Node.js 22 LTS  
**Primary Dependencies**: NestJS 11.x, `@nestjs/platform-express`, `class-validator`, `class-transformer`, `@nestjs/throttler`, `@nestjs/axios`, `rxjs`  
**Storage**: N/A nesta feature; nenhum estado persistente novo sera introduzido  
**Testing**: Jest, Supertest, testes unitarios para use case e validacao, testes de integracao para adapter HTTP e e2e para a rota `/chat/message`  
**Target Platform**: Servico backend NestJS executando localmente em Windows/macOS/Linux e com destino principal em ambiente Linux  
**Project Type**: Web-service BFF orientado a GraphQL com endpoint HTTP auxiliar para intake multimodal  
**Performance Goals**: Responder o aceite ou bloqueio inicial da rota em ate 2 segundos para pelo menos 95% das requisicoes validas em homologacao; bloquear chamadas invalidas sem acionar o AI Engine  
**Constraints**: Allowlist explicita de origem, limite inicial de 10 requisicoes por minuto por IP na rota de chat, segredo interno obrigatorio para a chamada ao AI Engine, nenhuma logica de IA no BFF, desenho compativel com evolucao para streaming end-to-end  
**Scale/Scope**: Uma rota publica de chat multimodal, um use case de orquestracao, um port de dominio para o AI Engine, um adapter REST, uma policy inicial de trafego e contratos versionados para frontend e AI Engine

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate

- **Clean Architecture & Layer Separation**: PASS. O plano separa controller HTTP em `presentation`, use case em `application`, contratos e invariantes em `domain` e client REST em `infrastructure`.
- **SOLID Design Discipline**: PASS. O slice fica dividido em responsabilidades unicas: entrada de payload, orquestracao, politica de seguranca e integracao externa.
- **Dependency Injection via NestJS**: PASS. O use case e o adapter do AI Engine serao registrados via providers do NestJS e consumidos por injecao de dependencia.
- **BFF Orchestration & AI Engine Separation**: PASS. O BFF apenas valida, protege e encaminha; a logica de IA continua exclusiva do servico Python e sera acessada por porta de dominio.
- **Streaming-First Chat Responses**: PASS. Embora esta feature foque no intake seguro e no relay inicial, o contrato do port e do adapter sera mantido compativel com propagacao futura de streaming, sem introduzir buffering como decisao arquitetural obrigatoria.

### Post-Phase 1 Re-Check

- **Layer boundaries remain enforceable**: PASS. Os artefatos de design limitam validacao de transporte ao controller e invariantes de negocio ao use case e aos value objects.
- **DI remains the composition mechanism**: PASS. O quickstart e os contratos assumem wiring pelo `AppModule`, sem instanciacao manual cross-layer.
- **BFF responsibilities remain separated from AI concerns**: PASS. O contrato interno modela apenas encaminhamento autenticado e tratamento de falha, sem mover regras de IA para o NestJS.
- **Streaming requirement remains respected**: PASS. O contrato inter-servicos foi versionado de forma a nao bloquear uma resposta incremental em iteracao seguinte.

## Project Structure

### Documentation (this feature)

```text
specs/002-multimodal-ai-orchestration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── chat-message.openapi.yaml
│   └── ai-engine-message.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── main.ts
├── app.module.ts
├── application/
│   ├── dto/
│   └── use-cases/
├── domain/
│   ├── entities/
│   ├── ports/
│   └── value-objects/
├── infrastructure/
│   ├── adapters/
│   └── config/
└── presentation/
    ├── controllers/
    └── graphql/

test/
├── integration/
├── app.e2e-spec.ts
└── health.e2e-spec.ts
```

**Structure Decision**: Estrutura unica de backend na raiz do repositorio. Esta feature expande a fundacao existente sem criar novos modulos de produto, adicionando a porta publica HTTP em `src/presentation/controllers`, o caso de uso em `src/application/use-cases`, a porta de dominio para o AI Engine em `src/domain/ports` e o adapter REST em `src/infrastructure/adapters`.

## Phase 0: Research Summary

- A entrada multimodal deve usar um unico endpoint HTTP capaz de aceitar texto, audio ou ambos, mantendo o contrato externo simples para o frontend.
- Validacoes de formato e presenca minima devem falhar antes do relay para impedir carga inutil no AI Engine.
- CORS e throttling precisam ser aplicados na borda do BFF, nao dentro do use case, para proteger a rota antes da orquestracao.
- A comunicacao com o AI Engine deve ser encapsulada por uma porta de dominio e por um adapter HTTP que injeta segredo interno a partir de configuracao de ambiente.
- O contrato interno deve ser versionado desde o inicio para preservar a separacao entre BFF e AI Engine e permitir evolucao posterior para streaming.

## Phase 1: Design Artifacts

- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Contracts**: [contracts/chat-message.openapi.yaml](./contracts/chat-message.openapi.yaml), [contracts/ai-engine-message.openapi.yaml](./contracts/ai-engine-message.openapi.yaml)

## Phase 2: Implementation Strategy

1. Configurar seguranca de borda em `main.ts` e `AppModule` com allowlist de origem e throttling inicial para a rota de chat.
2. Definir DTOs e objetos de valor necessarios para aceitar texto, audio ou ambos com validacao de presenca minima.
3. Implementar `ChatController` na camada de apresentacao para extrair o payload multimodal e delegar o processamento.
4. Criar o `ProcessChatUseCase` na camada de aplicacao para aplicar invariantes, montar o comando interno e chamar a porta do AI Engine.
5. Definir uma porta de dominio para o AI Engine e implementar um adapter REST em infraestrutura com injecao do segredo interno.
6. Mapear falhas de politica, validacao e indisponibilidade do AI Engine para respostas claras sem vazamento de segredos.
7. Cobrir o slice com testes unitarios do use case, integracao do adapter e e2e da rota protegida.

## Complexity Tracking

Nenhuma violacao da constitution precisa de justificativa nesta fase.
