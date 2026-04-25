# Research: Inicializar Fundacao do BFF

## Decision 1: Inicializar o projeto NestJS diretamente na raiz do repositorio

- **Decision**: O bootstrap do backend sera executado na raiz atual do workspace, mantendo `package.json` e configuracoes principais no topo do repositorio.
- **Rationale**: Esse formato atende diretamente ao criterio de aceite que proibe a criacao de uma subpasta adicional e simplifica o fluxo de desenvolvimento local.
- **Alternatives considered**:
  - Criar uma subpasta `backend/`: rejeitado porque conflita com o requisito da task e adiciona uma camada estrutural desnecessaria neste momento.
  - Inicializacao manual sem Nest CLI: rejeitado porque aumenta risco de omissoes no bootstrap inicial e reduz padronizacao.

## Decision 2: Adotar Node.js 22 LTS com TypeScript 5.x como baseline local

- **Decision**: O plano assume Node.js 22 LTS e TypeScript 5.x como baseline operacional para o bootstrap.
- **Rationale**: Essa combinacao oferece suporte moderno, alinhamento com o ecossistema NestJS atual e boa longevidade para as proximas iteracoes.
- **Alternatives considered**:
  - Node.js 20 LTS: viavel, mas menos alinhado ao baseline mais novo para um projeto que esta nascendo agora.
  - Travar versoes mais antigas: rejeitado porque reduziria a vida util do baseline sem beneficio funcional para a feature.

## Decision 3: Instalar GraphQL e validacao agora, mas adiar schema e resolvers

- **Decision**: As dependencias de GraphQL e validacao entram nesta feature apenas como preparacao da fundacao, sem exigir schema ou resolvers operacionais ainda.
- **Rationale**: A task pede preparacao do ambiente para futuras conexoes GraphQL do frontend. Instalar essas dependencias agora elimina retrabalho sem empurrar a feature para um escopo maior que o necessario.
- **Alternatives considered**:
  - Entregar GraphQL funcional nesta mesma feature: rejeitado porque extrapola o escopo da EDI-21.
  - Postergar completamente as dependencias: rejeitado porque deixaria a fundacao incompleta para a proxima iteracao.

## Decision 4: Tratar o health check como contrato HTTP minimo de apresentacao

- **Decision**: O endpoint `GET /health` sera exposto na camada de apresentacao com resposta de status textual e timestamp dinamico.
- **Rationale**: Esse contrato permite validar bootstrap e disponibilidade sem introduzir logica de negocio nas camadas internas.
- **Alternatives considered**:
  - Colocar a logica de saude em service generico de app boilerplate: rejeitado porque reintroduz o modelo que a task quer remover.
  - Expor saude via GraphQL: rejeitado porque a superficie minima de operacao e mais simples e mais universal em HTTP.

## Decision 5: Manter persistencia e integracao com AI Engine fora do slice inicial

- **Decision**: Nenhum banco, adapter TypeORM ou cliente do AI Engine sera implementado nesta entrega.
- **Rationale**: A constituicao exige essas integracoes por meio de adaptadores e contratos, mas a EDI-21 so precisa da fundacao arquitetural. Adiar essas pecas evita desenho especulativo.
- **Alternatives considered**:
  - Configurar TypeORM ja no bootstrap: rejeitado porque adiciona complexidade sem requisito funcional imediato.
  - Mockar o AI Engine: rejeitado porque nao agrega validacao real para esta feature.

## Decision 6: Validar a feature com testes de subida e saude

- **Decision**: A entrega sera validada com teste automatizado do endpoint de saude e com verificacao de inicializacao local do servico.
- **Rationale**: Essa cobertura atende os criterios de aceite e estabelece uma base de qualidade desde a primeira iteracao.
- **Alternatives considered**:
  - Validacao somente manual: rejeitado porque fragiliza regressao e reduz confianca no bootstrap.
  - Testes profundos de dominio ou streaming: rejeitado porque ainda nao ha dominio implementado nem fluxo conversacional nesta fase.