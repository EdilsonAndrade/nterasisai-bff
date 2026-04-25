# Implementation Plan: Inicializar Fundacao do BFF

**Branch**: `[001-implement-edi-21]` | **Date**: 2026-04-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-initialize-bff-foundation/spec.md`

## Summary

Inicializar o BFF na raiz do repositorio com NestJS, remover o boilerplate que conflita com a arquitetura alvo, estabelecer a separacao em `domain`, `application`, `infrastructure` e `presentation`, instalar as dependencias base de GraphQL e validacao, e expor um endpoint de saude simples em apresentacao. O desenho preserva a constituicao ao manter a feature restrita ao bootstrap do servico, ao wiring via DI do NestJS e a uma superficie HTTP minima para verificacao operacional.

## Technical Context

**Language/Version**: TypeScript 5.x em Node.js 22 LTS  
**Primary Dependencies**: NestJS 11.x, `@nestjs/graphql`, `@nestjs/apollo`, `@apollo/server`, `graphql`, `class-validator`, `class-transformer`  
**Storage**: N/A nesta feature; persistencia futura sera introduzida via TypeORM em adaptadores de infraestrutura  
**Testing**: Jest para testes unitarios e de integracao leve, Supertest para validacao do endpoint de saude, teste e2e minimo para subida do servico  
**Target Platform**: Servico backend multiplataforma para desenvolvimento local em Windows/macOS/Linux e execucao principal em ambiente Linux  
**Project Type**: Web-service BFF orientado a GraphQL com endpoint HTTP auxiliar de saude  
**Performance Goals**: Aplicacao inicializando localmente sem erros bloqueantes e endpoint `/health` respondendo em menos de 200 ms p95 apos a subida  
**Constraints**: Inicializacao obrigatoria na raiz atual; separacao estrita de camadas; uso de DI nativo do NestJS; sem logica de negocio em apresentacao; sem buffering ou desenho de streaming porque a feature nao cobre chat  
**Scale/Scope**: Um servico BFF, quatro camadas arquiteturais, um endpoint de saude, preparacao para GraphQL e validacao de entrada nas proximas iteracoes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate

- **Clean Architecture & Layer Separation**: PASS. O plano cria `src/domain`, `src/application`, `src/infrastructure` e `src/presentation`, mantendo o health check na camada de apresentacao e evitando regras de negocio fora dos limites arquiteturais.
- **SOLID Design Discipline**: PASS. O slice inicial fica pequeno e com responsabilidade unica: bootstrap do servico, composicao principal e verificacao de saude.
- **Dependency Injection via NestJS**: PASS. Todo o wiring previsto ocorre em `app.module.ts` e providers do NestJS; nao ha instanciacao manual cross-layer planejada.
- **BFF Orchestration & AI Engine Separation**: PASS. A feature prepara o BFF, mas nao introduz chamada ao motor Python nem desloca regras de IA para o lado NestJS.
- **Streaming-First Chat Responses**: PASS. Nao aplicavel a esta entrega porque nao existe ainda operacao conversacional nem resposta generativa de longa duracao.

### Post-Phase 1 Re-Check

- **Layer boundaries remain enforceable**: PASS. O desenho detalhado limita o contrato externo ao endpoint de saude e reserva integrações futuras para adaptadores em infraestrutura.
- **DI remains the composition mechanism**: PASS. O quickstart e o contrato assumem registro do controller no `AppModule`, sem criacao manual de dependencias cross-layer.
- **BFF responsibilities remain separated from AI concerns**: PASS. Nenhum artefato de design adiciona acoplamento com o AI Engine nesta fase.
- **Streaming requirement remains respected**: PASS. A feature continua fora do escopo de streaming; nao cria caminho que inviabilize essa exigencia em features futuras.

## Project Structure

### Documentation (this feature)

```text
specs/001-initialize-bff-foundation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── health.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
package.json
nest-cli.json
tsconfig.json
tsconfig.build.json
src/
├── main.ts
├── app.module.ts
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── ports/
├── application/
│   ├── use-cases/
│   └── dto/
├── infrastructure/
│   ├── adapters/
│   ├── persistence/
│   └── config/
└── presentation/
    ├── controllers/
    └── graphql/
test/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Estrutura unica de backend na raiz do repositorio. O NestJS fornece o bootstrap e a composicao do servico, enquanto a arvore `src/` ja nasce organizada pelos limites da constituicao. O endpoint `/health` entra em `src/presentation/controllers/`, deixando `domain` e `application` livres de dependencias de framework desde a primeira entrega.

## Phase 0: Research Summary

- Registrar o bootstrap na raiz do repositorio evita a criacao de uma subpasta do projeto e satisfaz diretamente o criterio de aceite principal.
- Instalar GraphQL e validacao agora, mas adiar schema/resolvers, reduz retrabalho nas proximas iteracoes sem forcar uma API incompleta nesta entrega.
- Manter o health check como contrato HTTP minimo em apresentacao fornece validacao operacional imediata sem quebrar o papel do BFF.
- Adiar persistencia real e integracao com AI Engine evita desenho especulativo e preserva o principio KISS.

## Phase 1: Design Artifacts

- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **Quickstart**: [quickstart.md](./quickstart.md)
- **Contracts**: [contracts/health.openapi.yaml](./contracts/health.openapi.yaml)

## Phase 2: Implementation Strategy

1. Inicializar o projeto NestJS diretamente na raiz atual usando npm como gerenciador.
2. Remover controladores e servicos boilerplate que nao contribuem para a arquitetura definida.
3. Criar a estrutura de camadas em `src/` sem introduzir acoplamentos indevidos.
4. Instalar dependencias de GraphQL e validacao para preparar o terreno das proximas features.
5. Implementar o controller de saude em apresentacao com resposta simples e timestamp dinamico.
6. Registrar o controller no `AppModule` e garantir que a aplicacao sobe localmente.
7. Cobrir a entrega com um teste de endpoint de saude e uma validacao de inicializacao do servico.

## Complexity Tracking

Nenhuma violacao da constitution precisa de justificativa nesta fase.
