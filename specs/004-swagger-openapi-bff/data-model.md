# Data Model: Configurar Swagger/OpenAPI para Documentacao e Testes do BFF

## Entity: ApiDocumentationProfile

- **Description**: Configuracao de identidade do documento OpenAPI publicado pelo BFF.
- **Fields**:
  - `title`: titulo exibido na interface.
  - `description`: resumo funcional da API.
  - `version`: versao semanticamente identificavel para consumidores.
  - `docsPath`: rota de acesso da UI.
- **Validation Rules**:
  - `title`, `version` e `docsPath` sao obrigatorios.
  - `docsPath` deve iniciar com `/`.
  - `version` deve ser string nao vazia e estavel para rastreabilidade.

## Entity: EndpointTagGroup

- **Description**: Agrupador de operacoes por dominio funcional na documentacao.
- **Fields**:
  - `name`: nome da categoria (ex.: Health, Chat).
  - `description`: explicacao curta do objetivo do grupo.
  - `operations`: lista de operacoes vinculadas ao grupo.
- **Validation Rules**:
  - `name` e obrigatorio e unico por documento.
  - Cada operacao deve pertencer a pelo menos um grupo.

## Entity: TransportSchema

- **Description**: Definicao de contrato exibida para entrada e saida de endpoint.
- **Fields**:
  - `schemaName`: nome do schema na documentacao.
  - `properties`: campos expostos (nome, tipo, obrigatoriedade, exemplo).
  - `requiredFields`: conjunto de campos obrigatorios.
  - `samplePayload`: exemplo minimamente valido para testes interativos.
- **Validation Rules**:
  - Campos obrigatorios devem existir em `properties`.
  - `samplePayload` deve respeitar tipos e obrigatoriedade declarados.

## Entity: DocsAccessRunbook

- **Description**: Sequencia operacional para subir o projeto e acessar a URL correta do Swagger.
- **Fields**:
  - `installCommand`
  - `startCommand`
  - `portResolutionRule`
  - `docsUrlPattern`
  - `validationSteps`
- **Validation Rules**:
  - Deve incluir comandos de instalacao e inicializacao.
  - Deve explicitar comportamento para porta padrao e porta customizada.
  - Deve incluir ao menos um passo de troubleshooting.

## Entity Relationships Summary

- `ApiDocumentationProfile` referencia varios `EndpointTagGroup`.
- Cada `EndpointTagGroup` agrega operacoes que consomem/retornam `TransportSchema`.
- `DocsAccessRunbook` operacionaliza o uso do `ApiDocumentationProfile` para o time.
