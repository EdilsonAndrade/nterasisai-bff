# Data Model: Inicializar Fundacao do BFF

## Entity: BackendWorkspace

- **Description**: Representa o estado estrutural do workspace onde o BFF sera inicializado.
- **Fields**:
  - `rootPath`: caminho absoluto da raiz do projeto.
  - `scaffoldedAtRoot`: indicador de que a aplicacao foi criada diretamente na raiz do repositorio.
  - `bootstrapFiles`: conjunto de arquivos essenciais para subida do servico, incluindo bootstrap e composicao principal.
  - `removedBoilerplate`: lista dos artefatos padrao removidos por nao se alinharem ao desenho arquitetural.
- **Validation Rules**:
  - `scaffoldedAtRoot` deve ser `true` para que a feature seja considerada concluida.
  - `bootstrapFiles` deve incluir os arquivos necessarios para iniciar a aplicacao.
- **State Transitions**:
  - `planned` -> `scaffolded` -> `validated`

## Entity: ArchitecturalFoundation

- **Description**: Define a estrutura minima de camadas exigida pela constituicao para o BFF.
- **Fields**:
  - `domainLayerPresent`
  - `applicationLayerPresent`
  - `infrastructureLayerPresent`
  - `presentationLayerPresent`
  - `layerBoundariesDocumented`
- **Validation Rules**:
  - Todos os indicadores de camada devem estar presentes e verdadeiros antes da feature ser aceita.
  - `layerBoundariesDocumented` deve refletir a intencao de uso de cada camada para evitar ambiguidade no crescimento do projeto.
- **Relationships**:
  - Depende de `BackendWorkspace` estar em estado `scaffolded`.
- **State Transitions**:
  - `planned` -> `provisioned` -> `verified`

## Entity: ServiceHealthSnapshot

- **Description**: Representa a resposta publica de saude usada para confirmar disponibilidade operacional do backend.
- **Fields**:
  - `status`: texto fixo de confirmacao operacional.
  - `timestamp`: instante da consulta de saude em formato temporal padronizado.
- **Validation Rules**:
  - `status` nao pode ser vazio.
  - `timestamp` deve ser gerado a cada consulta e refletir um valor temporal valido.
- **Relationships**:
  - E exposto pela camada de apresentacao apos `BackendWorkspace` atingir estado `validated`.

## Entity Relationships Summary

- `BackendWorkspace` sustenta a existencia de `ArchitecturalFoundation`.
- `ArchitecturalFoundation` garante que `ServiceHealthSnapshot` seja exposto sem violar a separacao de responsabilidades.
- `ServiceHealthSnapshot` e o artefato funcional minimo que demonstra que o bootstrap do workspace foi bem-sucedido.