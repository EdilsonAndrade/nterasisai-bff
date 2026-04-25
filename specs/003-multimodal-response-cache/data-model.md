# Data Model: Orquestrar Resposta Multimodal e Gerenciar Cache de Respostas

## Entity: ChatResponseEnvelope

- **Description**: Representa a resposta consolidada entregue pelo BFF ao frontend para uma pergunta de chat.
- **Fields**:
  - `responseId`: identificador unico da resposta.
  - `sessionId`: identificador da sessao de conversa.
  - `text`: resposta textual da IA.
  - `audioBase64`: audio sintetizado codificado, opcional.
  - `audioMimeType`: tipo de midia do audio retornado, opcional.
  - `cacheable`: indicador logico se a resposta pode ser cacheada no cliente.
  - `sensitive`: indicador de sensibilidade informado pela camada de IA.
  - `createdAt`: timestamp de geracao da resposta no orquestrador.
- **Validation Rules**:
  - `responseId` e `sessionId` sao obrigatorios.
  - Pelo menos um entre `text` e `audioBase64` deve existir.
  - Quando `audioBase64` existir, `audioMimeType` deve existir.
  - `cacheable` deve ser `false` quando `sensitive` for `true`.
- **State Transitions**:
  - `receivedFromEngine` -> `validated` -> `delivered`
  - `receivedFromEngine` -> `invalid` (em caso de payload corrompido)

## Value Object: AudioPayload

- **Description**: Encapsula o bloco de audio vindo do AI Engine preservando integridade para entrega ao frontend.
- **Fields**:
  - `contentBase64`
  - `mimeType`
  - `durationMs` (opcional)
- **Validation Rules**:
  - `contentBase64` deve ser string nao vazia codificada em base64 valida.
  - `mimeType` deve estar entre formatos suportados (ex.: `audio/wav`, `audio/mpeg`).
  - `durationMs`, quando presente, deve ser inteiro positivo.

## Entity: CacheDirective

- **Description**: Modelo interno para decisao dos cabeçalhos de cache devolvidos ao cliente.
- **Fields**:
  - `cacheable`
  - `scope` (privado/publico)
  - `maxAgeSeconds`
  - `mustRevalidate`
  - `reason` (motivo para no-store/no-cache quando nao elegivel)
- **Validation Rules**:
  - `scope` deve ser sempre `private` para respostas elegiveis nesta feature.
  - `maxAgeSeconds` deve ser > 0 quando `cacheable=true`.
  - Deve gerar `no-store` quando `cacheable=false` por erro/sensibilidade.

## Entity: LeadCaptureSignal

- **Description**: Sinal estruturado recebido do AI Engine indicando que houve coleta de dados de contato.
- **Fields**:
  - `captured` (boolean)
  - `name` (opcional)
  - `company` (opcional)
  - `sourceResponseId`
  - `capturedAt`
- **Validation Rules**:
  - Se `captured=true`, `sourceResponseId` e `capturedAt` sao obrigatorios.
  - Nome/empresa devem respeitar limites de tamanho definidos no contrato.

## Entity: LeadRecord

- **Description**: Registro persistente de lead para uso no painel administrativo futuro.
- **Fields**:
  - `id`
  - `sessionId`
  - `responseId`
  - `name`
  - `company`
  - `capturedAt`
  - `createdAt`
- **Validation Rules**:
  - `sessionId`, `responseId` e `capturedAt` sao obrigatorios.
  - Pelo menos um entre `name` e `company` deve ser informado para persistir lead.
  - Duplicidade por (`sessionId`, `responseId`) deve ser evitada.
- **State Transitions**:
  - `pendingPersist` -> `persisted`
  - `pendingPersist` -> `failed` (com registro observavel)

## Entity: OrchestrationOutcome

- **Description**: Resultado do use case para a camada de apresentacao, separando sucesso de chat e side effects.
- **Fields**:
  - `status` (`completed`, `failed`)
  - `response`: `ChatResponseEnvelope` (quando sucesso)
  - `errorReason` (quando falha)
  - `leadPersisted` (`true`, `false`, `not_attempted`)
  - `correlationId`
- **Validation Rules**:
  - `response` obrigatoria quando `status=completed`.
  - `errorReason` obrigatoria quando `status=failed`.

## Entity Relationships Summary

- `ChatResponseEnvelope` agrega `AudioPayload` e deriva `CacheDirective`.
- `LeadCaptureSignal` pode originar `LeadRecord` sem bloquear retorno de `ChatResponseEnvelope`.
- `OrchestrationOutcome` encapsula o retorno principal ao cliente e o resultado de persistencia de lead para observabilidade interna.
