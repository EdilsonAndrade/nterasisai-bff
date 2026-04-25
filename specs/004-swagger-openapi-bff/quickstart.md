# Quickstart: Configurar Swagger/OpenAPI para Documentacao e Testes do BFF

## Objetivo

Habilitar a interface Swagger para documentar e testar endpoints de saude e chat do BFF de forma independente, com contratos claros e navegacao por tags funcionais.

## Pre-requisitos

- Node.js 22 LTS instalado.
- npm instalado.
- Workspace aberto em `c:/projects/interasisai-bff`.
- Variaveis de ambiente basicas do BFF configuradas (quando aplicavel).

## Passos de Implementacao

1. Instalar dependencia oficial de documentacao OpenAPI para NestJS.
2. Configurar no bootstrap da aplicacao:
   - metadados do documento (titulo, descricao e versao),
   - publicacao da UI de docs em `/api/docs`.
3. Adicionar tags nos controllers de saude e chat para agrupamento funcional.
4. Enriquecer DTOs de request/response de chat com metadados de schema (campos, obrigatoriedade, exemplos).
5. Garantir que o endpoint de saude e o endpoint de chat aparecam na interface gerada.

## Validacao Manual

1. Executar `npm install` na raiz do projeto.
2. Executar `npm run start:dev`.
3. Confirmar no log a porta em uso:
   - default esperada: `4000`;
   - se houver override, usar a porta exibida.
4. Abrir no navegador:
   - `http://localhost:4000/api/docs`, ou
   - `http://localhost:{PORTA_ATIVA}/api/docs`.
5. Validar interface:
   - tag `Health` visivel,
   - tag `Chat` visivel,
   - schemas de request/response exibidos.
6. Executar "Try it out" em `/health` e validar retorno JSON.
7. Executar "Try it out" em `/chat/message` com payload minimo valido e validar resposta contratual.

## Testes Automatizados Esperados

1. E2E de saude continua passando sem regressao.
2. E2E de chat continua passando sem regressao.
3. (Opcional) Teste de inicializacao pode validar que a rota `/api/docs` responde com status de sucesso em ambiente de teste.

## Saida Esperada

- Swagger acessivel em `/api/docs` na porta ativa da aplicacao.
- Endpoints de saude e chat organizados por tags.
- Contratos de transporte visiveis e alinhados com os DTOs reais do BFF.
