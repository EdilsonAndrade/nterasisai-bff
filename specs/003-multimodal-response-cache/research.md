# Research: Orquestrar Resposta Multimodal e Gerenciar Cache de Respostas

## Decision 1: Resposta multimodal do BFF deve preservar integridade do audio vindo do AI Engine

- **Decision**: O BFF tratara o audio retornado pelo AI Engine como payload opaco (base64 no contrato JSON), validando apenas presenca/consistencia estrutural sem re-encodar o conteudo.
- **Rationale**: A EDI-27 exige entrega sem corrupcao. Reprocessar audio no BFF aumenta risco de truncamento, alteracao de frame e divergencia de reproducao no frontend.
- **Alternatives considered**:
  - Converter audio para outro codec no BFF: rejeitado por aumentar latencia e risco de perda.
  - Entregar audio por endpoint binario separado nesta iteracao: rejeitado por elevar complexidade de contrato sem necessidade imediata.

## Decision 2: Contrato interno precisa sinalizar cacheabilidade e captura de lead de forma estruturada

- **Decision**: O payload de resposta do AI Engine para o BFF incluirá campos explicitos `cacheControl` e `leadCapture` (quando aplicavel), evitando inferencias por texto livre.
- **Rationale**: O BFF e orquestrador, nao motor semantico. Sinalizacao estruturada reduz ambiguidade e mantem separacao entre IA e backend.
- **Alternatives considered**:
  - Inferir lead por regex no texto da resposta: rejeitado por violar separacao de responsabilidades e gerar falso positivo.
  - Tornar toda resposta cacheavel por padrao fixo no BFF: rejeitado por ignorar contexto de sensibilidade vindo da IA.

## Decision 3: Cache do cliente deve ser habilitado por headers HTTP privados de sessao

- **Decision**: O BFF emitira `Cache-Control` com diretivas privadas para respostas elegiveis e diretivas de nao-cache para erros/sensiveis.
- **Rationale**: Atende requisito de acelerar repeticoes na sessao sem permitir cache compartilhado em proxies/CDN.
- **Alternatives considered**:
  - Cache em memoria no proprio BFF nesta fase: rejeitado por escopo da EDI-27 (foco em headers para cache no frontend).
  - `public, max-age` para simplificar: rejeitado por risco de vazamento entre usuarios/intermediarios.

## Decision 4: Persistencia de lead deve ser side effect nao bloqueante

- **Decision**: A tentativa de persistencia de lead ocorre apos materializacao da resposta, em fluxo desacoplado do retorno principal ao cliente.
- **Rationale**: FR-010 exige que falha de lead nao interrompa nem degrade a entrega da resposta de chat.
- **Alternatives considered**:
  - Tornar persistencia transacional e obrigatoria antes da resposta: rejeitado por aumentar latencia e acoplar SLA do chat ao banco.
  - Ignorar persistencia nesta feature: rejeitado porque EDI-27 recomenda explicitamente preparar metadados para painel futuro.

## Decision 5: Erros de upstream e erros de side effect precisam contratos distintos

- **Decision**: Falha do AI Engine gera erro de chat ao cliente; falha de persistencia de lead gera observabilidade interna sem alterar sucesso do chat.
- **Rationale**: Preserva semantica operacional correta e facilita troubleshooting.
- **Alternatives considered**:
  - Mascarar falha de AI Engine como sucesso parcial: rejeitado por quebrar expectativa do frontend.
  - Propagar erro de persistencia de lead para cliente: rejeitado por vazar detalhe interno e prejudicar UX.

## Decision 6: Compatibilidade com streaming deve ser preservada sem ampliar escopo

- **Decision**: O contrato modela resposta completa desta iteracao, mas com campos e versionamento que permitam transicao para chunks/eventos em iteracao futura.
- **Rationale**: A constitution exige compatibilidade com streaming-first e nao bloqueio arquitetural.
- **Alternatives considered**:
  - Introduzir streaming completo agora: rejeitado por extrapolar escopo da EDI-27.
  - Ignorar consideracoes de streaming no contrato: rejeitado por criar divida arquitetural imediata.
