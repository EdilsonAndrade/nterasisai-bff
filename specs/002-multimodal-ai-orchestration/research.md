# Research: Receber Payload Multimodal e Orquestrar Chamada Segura para o AI Engine

## Decision 1: Expor um unico endpoint HTTP multimodal para intake do frontend

- **Decision**: A entrada publica sera um endpoint `POST /chat/message` capaz de aceitar texto, audio ou ambos em uma unica operacao.
- **Rationale**: O ticket pede um controller unico para receber conteudo textual ou arquivo de audio. Manter um so ponto de entrada reduz ambiguidade para o frontend e simplifica a protecao da borda.
- **Alternatives considered**:
  - Separar rotas para texto e audio: rejeitado porque duplica regras de seguranca e validacao.
  - Expor primeiro uma mutation GraphQL: rejeitado nesta feature porque o ticket explicita um controller HTTP e o upload multipart e mais direto nesse canal.

## Decision 2: Dividir validacao entre transporte e invariantes de caso de uso

- **Decision**: A camada de apresentacao validara formato e extracao do payload, enquanto o use case garantira a regra de presenca minima de conteudo e a normalizacao do comando encaminhado ao AI Engine.
- **Rationale**: Isso respeita a separacao entre preocupacoes de borda e regras do fluxo de negocio, evitando logica relevante no controller.
- **Alternatives considered**:
  - Validar tudo no controller: rejeitado porque concentra regra demais em `presentation`.
  - Validar tudo no adapter do AI Engine: rejeitado porque permitiria que entradas invalidas atravessassem camadas internas.

## Decision 3: Aplicar CORS e throttling na borda do BFF antes da orquestracao

- **Decision**: Allowlist de origem sera configurada no bootstrap e a politica inicial de trafego sera aplicada na rota de chat com limite basico por IP.
- **Rationale**: O BFF e a barreira primaria de seguranca. Essas politicas devem atuar antes de qualquer uso do caso de uso ou tentativa de contato com o AI Engine.
- **Alternatives considered**:
  - Implementar verificacao de origem dentro do controller: rejeitado porque deixa a protecao menos uniforme.
  - Adiar rate limiting para um gateway externo: rejeitado porque o ticket exige protecao ja no NestJS.

## Decision 4: Modelar o AI Engine por uma porta de dominio com adapter REST versionado

- **Decision**: O BFF usara uma interface de dominio para enviar a mensagem processada ao AI Engine, implementada por um adapter HTTP em infraestrutura com contrato versionado.
- **Rationale**: Esta decisao atende a constitution, protege a camada de aplicacao de detalhes de transporte e facilita trocar a forma de integracao sem reescrever o use case.
- **Alternatives considered**:
  - Chamar HTTP diretamente no use case: rejeitado porque viola DIP e mistura orquestracao com infraestrutura.
  - Permitir chamada direta do controller ao AI Engine: rejeitado porque fere a separacao entre apresentacao, aplicacao e integracao externa.

## Decision 5: Injetar o segredo interno exclusivamente no adapter de infraestrutura

- **Decision**: O segredo de confianca entre BFF e AI Engine sera lido da configuracao do backend e adicionado somente pelo adapter de infraestrutura em cada chamada interna.
- **Rationale**: O cliente externo nao deve conhecer nem influenciar esse valor. Centralizar a injecao do segredo no adapter reduz risco de vazamento e facilita testes.
- **Alternatives considered**:
  - Repassar segredo vindo do cliente: rejeitado por violar o requisito de confianca interna.
  - Deixar o use case construir cabecalhos de infraestrutura: rejeitado porque mistura regra de transporte com aplicacao.

## Decision 6: Tratar indisponibilidade do AI Engine com resposta operacional clara e segura

- **Decision**: Falhas de relay, timeout ou indisponibilidade do AI Engine serao mapeadas para um resultado de falha operacional sem expor segredos, URL interna ou detalhes sensiveis.
- **Rationale**: A spec exige que o cliente receba erro claro sem vazar informacoes internas.
- **Alternatives considered**:
  - Repassar erro bruto do servico Python: rejeitado porque aumenta acoplamento e risco de exposicao de detalhes internos.
  - Silenciar a falha com resposta generica de sucesso: rejeitado porque impediria diagnostico correto pelo cliente.

## Decision 7: Preservar compatibilidade arquitetural com streaming sem torna-lo obrigatorio neste slice

- **Decision**: O port do AI Engine e o contrato versionado serao definidos de forma a nao bloquear evolucao para resposta incremental, mas esta feature implementa apenas a entrada segura e o relay inicial.
- **Rationale**: O ticket foca protecao de borda e encaminhamento seguro. O desenho nao pode impedir a exigencia constitucional de streaming nas proximas iteracoes.
- **Alternatives considered**:
  - Ignorar streaming por completo no desenho: rejeitado porque criaria risco arquitetural futuro.
  - Expandir esta feature para entregar todo o fluxo streaming ponta a ponta: rejeitado porque extrapola o objetivo do ticket EDI-23.