# Quickstart: Receber Payload Multimodal e Orquestrar Chamada Segura para o AI Engine

## Objetivo

Implementar a primeira rota de chat multimodal do BFF com protecao de origem, limitacao de trafego e relay autenticado para o AI Engine.

## Pre-requisitos

- Node.js 22 LTS instalado.
- npm disponivel no ambiente.
- Variaveis de ambiente configuradas para a origem permitida do frontend, URL base do AI Engine e segredo interno de servico.
- Workspace aberto em `c:/projects/interasisai-bff`.

## Passos de Implementacao

1. Instale as dependencias de seguranca e integracao HTTP necessarias ao slice.
2. Configure a allowlist de origem no bootstrap da aplicacao.
3. Registre a politica inicial de throttling no `AppModule`.
4. Crie o controller HTTP de chat em `src/presentation/controllers` com suporte a payload textual e anexo de audio.
5. Defina o DTO de entrada e os objetos de valor necessarios para garantir que pelo menos um tipo de conteudo esteja presente.
6. Implemente o `ProcessChatUseCase` em `src/application/use-cases` para normalizar a mensagem e delegar ao port do AI Engine.
7. Defina o port do AI Engine em `src/domain/ports` e implemente o adapter REST em `src/infrastructure/adapters` com injecao do segredo interno.
8. Mapeie respostas de aceite, bloqueio e falha operacional para o contrato publico da rota.

## Validacao Local

1. Execute `npm install` caso as novas dependencias ainda nao estejam presentes.
2. Inicie a aplicacao com `npm run start:dev`.
3. Envie uma requisicao valida para `POST /chat/message` a partir de uma origem aprovada contendo texto, audio ou ambos.
4. Confirme que a solicitacao valida gera relay para o AI Engine com credencial interna adicionada pelo backend.
5. Repita o teste com origem nao aprovada e com excesso de chamadas para validar o bloqueio de borda.
6. Simule indisponibilidade do AI Engine para confirmar retorno de falha operacional sem vazamento de detalhes internos.

## Validacao Automatizada Esperada

1. Testes unitarios para o `ProcessChatUseCase` cobrindo mensagem valida, mensagem vazia e bloqueio por indisponibilidade de configuracao interna.
2. Testes de integracao para o adapter do AI Engine confirmando inclusao do segredo interno e mapeamento de falhas HTTP.
3. Teste e2e para `POST /chat/message` cobrindo aceite de texto, aceite de audio, bloqueio por politica de trafego e rejeicao por origem nao aprovada.

## Saida Esperada

- Rota HTTP publica de intake multimodal disponivel no BFF.
- Protecoes de origem e volume aplicadas antes da orquestracao.
- Relay interno versionado e autenticado entre BFF e AI Engine.
- Base pronta para evoluir para propagacao de streaming em iteracao adjacente.