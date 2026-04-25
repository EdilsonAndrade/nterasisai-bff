# Quickstart: Inicializar Fundacao do BFF

## Objetivo

Subir o primeiro slice funcional do BFF com bootstrap NestJS na raiz do repositorio, estrutura de camadas preparada e endpoint de saude disponivel.

## Pre-requisitos

- Node.js 22 LTS instalado.
- npm disponivel no ambiente.
- Workspace aberto em `c:/projects/interasisai-bff`.

## Passos de Implementacao

1. Inicialize o projeto NestJS diretamente na raiz atual com npm.
2. Remova os arquivos boilerplate gerados automaticamente que nao fazem parte da arquitetura planejada.
3. Crie as pastas `src/domain`, `src/application`, `src/infrastructure` e `src/presentation`.
4. Instale as dependencias base de GraphQL e validacao.
5. Crie o controller de saude na camada de apresentacao e registre-o no `AppModule`.

## Validacao Local

1. Execute `npm install` se necessario.
2. Inicie a aplicacao com `npm run start:dev`.
3. Consulte `http://localhost:3000/health` ou a porta efetiva configurada no ambiente.
4. Confirme uma resposta `200` com payload contendo `status` e `timestamp`.

## Validacao Automatizada Esperada

1. Um teste deve confirmar que a aplicacao inicia sem erro.
2. Um teste de endpoint deve confirmar retorno `200` em `GET /health`.
3. A revisao estrutural deve confirmar a existencia das quatro camadas arquiteturais em `src/`.

## Saida Esperada

- Projeto NestJS funcional na raiz do repositorio.
- Base arquitetural pronta para evolucao.
- Endpoint de saude operacional.
- Dependencias preparadas para futuras features GraphQL e validacao.