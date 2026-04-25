# Quickstart: Orquestrar Resposta Multimodal e Gerenciar Cache de Respostas

## Objetivo

Evoluir o BFF para consumir a resposta multimodal do AI Engine, repassar ao frontend com integridade, aplicar headers de cache de sessao e persistir leads quando sinalizados.

## Pre-requisitos

- Node.js 22 LTS e npm instalados.
- Workspace em `c:/projects/interasisai-bff`.
- Variaveis de ambiente ja configuradas para comunicacao com AI Engine e politicas de seguranca de borda.
- Ambiente de banco disponivel para persistencia de leads (quando habilitado no projeto).

## Passos de Implementacao

1. Evoluir os DTOs/entidades de resposta para suportar texto + audio + metadados de cache e lead.
2. Atualizar o adapter HTTP do AI Engine para consumir o contrato interno de resposta multimodal versionado.
3. Atualizar o `ProcessChatUseCase` para:
   - validar consistencia do payload de resposta,
   - montar diretivas de cache,
   - tentar persistir lead em fluxo lateral sem bloquear a resposta.
4. Adicionar/ajustar porta de dominio para persistencia de leads e implementar adapter em infraestrutura.
5. Atualizar `ChatController` para devolver payload ao frontend com `Cache-Control` apropriado conforme elegibilidade da resposta.
6. Garantir que erros do AI Engine resultem em falha de chat ao cliente, e que erros de persistencia de lead sejam apenas observaveis internamente.

## Validacao Manual

1. Inicie a API com `npm run start:dev`.
2. Envie uma mensagem de chat e valide retorno textual + audio reproduzivel no cliente.
3. Repita a mesma pergunta na mesma sessao e valide melhora de latencia percebida via cache local do frontend.
4. Simule resposta com sinal de lead e valide criacao do registro no backend.
5. Simule falha de persistencia de lead e confirme que o chat ainda retorna sucesso para o cliente.
6. Simule erro do AI Engine e confirme resposta de falha padronizada sem cache habilitado.

## Testes Automatizados Esperados

1. Unitarios do use case cobrindo:
   - sucesso com resposta multimodal,
   - resposta invalida/corrompida,
   - sinalizacao de lead com persistencia bem-sucedida,
   - falha de persistencia de lead sem quebrar o retorno principal.
2. Integracao do adapter AI Engine para mapeamento de payload/erros do contrato interno.
3. Integracao do adapter de lead para regras de persistencia e deduplicacao.
4. E2E da rota de chat para validar payload de resposta, headers de cache e comportamento de erro.

## Saida Esperada

- Frontend recebe resposta multimodal sem corrupcao de audio.
- Respostas elegiveis permitem cache privado de sessao no cliente.
- Leads sinalizados sao persistidos para o painel futuro sem afetar o fluxo principal de chat.
