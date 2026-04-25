# Implementation Plan: Configurar Swagger/OpenAPI para Documentacao e Testes do BFF

**Branch**: `[004-swagger-openapi-bff]` | **Date**: 2026-04-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-swagger-openapi-bff/spec.md`

## Summary

Habilitar documentacao viva da API do BFF com Swagger/OpenAPI para acelerar integracao e testes manuais dos endpoints de saude e chat. A implementacao concentra-se na configuracao de bootstrap da aplicacao, anotacoes de documentacao na camada de apresentacao e enriquecimento dos DTOs para refletir contratos reais na interface interativa, sem alterar regras de negocio nem quebrar os limites da Clean Architecture.

## Technical Context

**Language/Version**: TypeScript 5.7.x em Node.js 22 LTS  
**Primary Dependencies**: NestJS 11.x, `@nestjs/platform-express`, `@nestjs/swagger`, `class-validator`, `class-transformer`  
**Storage**: N/A (sem persistencia nova)  
**Testing**: Jest, Supertest, testes e2e para `/health` e `/chat/message`, validacao manual da rota de docs  
**Target Platform**: Servico backend NestJS executando localmente (Windows/macOS/Linux) e deploy Linux  
**Project Type**: Web-service BFF (NestJS)  
**Performance Goals**: Interface de documentacao acessivel em ate 2 minutos apos start do servico; execucao de testes interativos sem latencia adicional perceptivel em relacao aos endpoints diretos  
**Constraints**: Nao alterar comportamento funcional dos endpoints de negocio; manter separacao de camadas; evitar duplicacao de contratos entre codigo e documentacao  
**Scale/Scope**: 1 rota de documentacao (`/api/docs`), 2 controladores principais (`health`, `chat`) e DTOs associados ao chat

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate

- **Clean Architecture & Layer Separation**: PASS. Mudancas ficam em bootstrap de apresentacao (`main.ts`), controllers e DTOs; sem mover logica de negocio para fora de `application`/`domain`.
- **SOLID Design Discipline**: PASS. Responsabilidades mantidas: controllers continuam como adaptadores de entrada, DTOs como contrato de transporte e bootstrap como composicao tecnica.
- **Dependency Injection via NestJS**: PASS. Sem instanciacao manual cross-layer; wiring continua no container NestJS.
- **BFF Orchestration & AI Engine Separation**: PASS. Feature nao altera integracao com AI Engine; apenas documenta endpoints existentes do BFF.
- **Streaming-First Chat Responses**: PASS. Nao ha alteracao do fluxo de resposta de chat; a feature e de documentacao e nao introduz buffering adicional.

### Post-Phase 1 Re-Check

- **Layer boundaries remain enforceable**: PASS. Artefatos de design limitam alteracoes a transporte/documentacao.
- **DI remains the composition mechanism**: PASS. Nao ha novos acoplamentos por instanciacao manual.
- **BFF responsibilities remain separated from AI concerns**: PASS. Swagger documenta o BFF sem adicionar regra de IA.
- **Streaming requirement remains respected**: PASS. Sem impacto no contrato de propagacao de resposta.

## Project Structure

### Documentation (this feature)

```text
specs/004-swagger-openapi-bff/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── public-api.openapi.yaml
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── main.ts
├── app.module.ts
├── application/
│   └── dto/
├── domain/
├── infrastructure/
└── presentation/
    └── controllers/

test/
├── health.e2e-spec.ts
├── chat-message.e2e-spec.ts
└── integration/
```

**Structure Decision**: Estrutura unica de backend na raiz. A feature modifica somente pontos de borda para documentacao: bootstrap da aplicacao, controllers HTTP e DTOs do chat.

## Phase 0: Research Summary

- A rota de documentacao deve ser previsivel e estavel (`/api/docs`) para reduzir friccao de onboarding.
- A qualidade da interface depende da anotacao correta de tags em controllers e propriedades em DTOs.
- O guia operacional precisa cobrir do `npm install` ate acesso a URL final com porta dinamica.
- Teste interativo no Swagger deve ser suficiente para validar contratos de saude e chat sem leitura direta de codigo.
- Alteracoes nao devem introduzir dependencia de framework em `domain` e `application`.

## Phase 1: Design Artifacts

- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Contracts**: [contracts/public-api.openapi.yaml](./contracts/public-api.openapi.yaml)

## Phase 2: Implementation Strategy

1. Adicionar dependencias de documentacao OpenAPI no projeto e garantir compatibilidade com a versao do NestJS.
2. Configurar geracao do documento e publicacao da UI do Swagger no bootstrap (`main.ts`) com metadados da API.
3. Adicionar tags funcionais nos controllers de saude e chat para organizacao visual na interface.
4. Decorar DTOs de request/response com metadados de schema para exibir campos, obrigatoriedade e exemplos claros.
5. Validar que o endpoint `/health` responde no "Try it out" e que `/chat/message` exibe contrato completo de entrada/saida.
6. Atualizar/confirmar testes e2e para evitar regressao nos endpoints documentados.
7. Confirmar guia operacional com fluxo ponta a ponta: install, start, leitura da porta ativa e acesso a `/api/docs`.

## Complexity Tracking

Nenhuma violacao da constituicao identificada nesta fase.
