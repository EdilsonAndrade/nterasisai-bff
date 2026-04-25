# Research: Configurar Swagger/OpenAPI para Documentacao e Testes do BFF

## Decision 1: Expor documentacao em rota fixa de desenvolvimento

- **Decision**: Publicar interface Swagger na rota `/api/docs` da instancia ativa do BFF.
- **Rationale**: A issue EDI-28 define esta rota como alvo principal de uso e reduz ambiguidades para o time.
- **Alternatives considered**:
  - Rota generica `/docs`: rejeitada por divergir do criterio de aceite.
  - URL externa separada: rejeitada por aumentar atrito operacional no fluxo local.

## Decision 2: Metadados de API devem ser declarados no bootstrap

- **Decision**: Definir titulo, descricao e versao do documento OpenAPI no bootstrap da aplicacao.
- **Rationale**: Garante contexto de negocio claro ao abrir a UI e padroniza identificacao da API entre ambientes.
- **Alternatives considered**:
  - Metadados minimos sem descricao: rejeitada por reduzir clareza para QA e frontend.
  - Configuracao distribuida por modulo: rejeitada por aumentar fragmentacao para um escopo pequeno.

## Decision 3: Organizacao por tags deve refletir dominios funcionais

- **Decision**: Categorizar endpoints em grupos funcionais de navegacao (Health e Chat).
- **Rationale**: Facilita descoberta e reduz tempo de busca na documentacao.
- **Alternatives considered**:
  - Sem tags: rejeitada por piorar navegabilidade quando a API crescer.
  - Tags excessivamente tecnicas: rejeitada por nao atender publico misto (dev + QA).

## Decision 4: DTOs sao fonte primaria de schemas exibidos

- **Decision**: Enriquecer DTOs de request/response com metadados explicitos de propriedades para gerar schemas completos.
- **Rationale**: Evita divergencia entre contrato aceito pela API e contrato exibido na documentacao.
- **Alternatives considered**:
  - Schemas escritos manualmente no OpenAPI: rejeitada por risco de drift com o codigo.
  - Expor apenas tipos inferidos: rejeitada por falta de exemplos e descricoes.

## Decision 5: Validacao de sucesso deve combinar teste automatizado e validacao manual

- **Decision**: Manter testes automatizados de endpoints e executar checklist manual no Swagger para confirmar usabilidade do "Try it out".
- **Rationale**: Testes automatizados garantem nao regressao; validacao manual confirma experiencia de uso da documentacao.
- **Alternatives considered**:
  - Somente teste manual: rejeitada por baixa repetibilidade.
  - Somente teste automatizado: rejeitada por nao validar legibilidade/navegacao da UI.
