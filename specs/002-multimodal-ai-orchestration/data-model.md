# Data Model: Receber Payload Multimodal e Orquestrar Chamada Segura para o AI Engine

## Entity: ChatMessageRequest

- **Description**: Representa a solicitacao recebida pelo BFF a partir do frontend para iniciar o processamento conversacional.
- **Fields**:
  - `text`: conteudo textual opcional enviado pelo cliente.
  - `audioFile`: anexo de audio opcional enviado pelo cliente.
  - `origin`: origem identificada da chamada externa usada nas politicas de seguranca.
  - `receivedAt`: instante em que o payload foi recebido pelo orquestrador.
- **Validation Rules**:
  - Pelo menos um entre `text` e `audioFile` deve estar presente.
  - `origin` deve corresponder a uma origem permitida para a rota.
  - `audioFile`, quando presente, deve obedecer ao formato e tamanho aceitos pela API publica.
- **State Transitions**:
  - `received` -> `validated` -> `forwarded` ou `rejected`

## Value Object: MessageContent

- **Description**: Encapsula a combinacao valida de texto e audio usada pelo caso de uso.
- **Fields**:
  - `hasText`
  - `hasAudio`
  - `textValue`
  - `audioMetadata`
- **Validation Rules**:
  - Nao pode representar uma mensagem vazia.
  - Deve preservar a distincao entre conteudo textual e anexo binario.

## Entity: TrafficProtectionPolicy

- **Description**: Representa a politica operacional aplicada para conter abuso na rota de chat.
- **Fields**:
  - `windowSeconds`: intervalo observado para contagem de requisicoes.
  - `maxRequestsPerWindow`: volume maximo permitido no intervalo.
  - `scopeKey`: identificador usado para agrupar chamadas, inicialmente por IP.
- **Validation Rules**:
  - Os limites devem ser positivos.
  - A politica deve ser aplicada antes do encaminhamento ao AI Engine.

## Entity: AIEngineDispatchRequest

- **Description**: Representa a mensagem interna normalizada enviada do BFF para o AI Engine.
- **Fields**:
  - `text`: conteudo textual normalizado quando presente.
  - `audioPayload`: representacao do anexo de audio quando presente.
  - `requestId`: identificador correlacionavel do processamento.
  - `internalCredential`: credencial de servico anexada pelo backend.
  - `requestedAt`: instante de disparo da chamada interna.
- **Validation Rules**:
  - Deve conter o segredo interno apenas quando a chamada for emitida pelo adapter.
  - Nao pode ser criado a partir de dados invalidos ou de requisicoes bloqueadas.

## Entity: ChatDispatchResult

- **Description**: Representa o desfecho observado pelo cliente apos validacao, politica de borda e tentativa de relay.
- **Fields**:
  - `status`: aceite, bloqueio por politica, rejeicao por invalidacao ou falha operacional.
  - `reason`: motivo legivel para o desfecho quando aplicavel.
  - `correlationId`: identificador para rastreamento do fluxo.
  - `engineResponse`: carga retornada pelo AI Engine quando houver resposta compativel com este slice.
- **Validation Rules**:
  - `engineResponse` so pode existir em solicitacoes aceitas e processadas.
  - `reason` deve ser preenchido em bloqueios e falhas.

## Entity Relationships Summary

- `ChatMessageRequest` e a entrada da camada de apresentacao.
- `MessageContent` deriva de `ChatMessageRequest` e e consumido pelo use case para garantir presenca minima de conteudo.
- `TrafficProtectionPolicy` atua sobre `ChatMessageRequest` antes de qualquer relay.
- `AIEngineDispatchRequest` e produzido pelo caso de uso quando `ChatMessageRequest` atinge estado `validated`.
- `ChatDispatchResult` representa o retorno final do slice para o cliente apos a tentativa de orquestracao.