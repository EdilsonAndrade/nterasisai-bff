# Feature Specification: Configurar Swagger/OpenAPI para Documentacao e Testes do BFF

**Feature Branch**: `004-swagger-openapi-bff`  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: User description: "leia a atividade EDI-28 NO LINEAR e gere a especificacao contendo no final da especificacao detalhes de como executar o swagger com todos os detalhes para q seja facil de execucao, desde o inicio start do projeto ao acessar a url correta"  
**Source Activity**: [Linear EDI-28 — Configurar Swagger/OpenAPI para Documentacao e Testes do BFF](https://linear.app/edilsonandrade/issue/EDI-28/configurar-swaggeropenapi-para-documentacao-e-testes-do-bff)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar documentacao viva da API do BFF (Priority: P1)

Como pessoa desenvolvedora frontend ou backend, quero acessar uma interface de documentacao navegavel da API do BFF para entender rapidamente os endpoints disponiveis, os contratos de entrada e saida e validar exemplos antes da integracao.

**Why this priority**: Sem documentacao viva acessivel, as equipes dependem de leitura direta de codigo e de testes manuais dispersos, aumentando risco de integracao incorreta. Esta e a fatia de maior valor imediato.

**Independent Test**: Subir o BFF em ambiente local e acessar a rota de documentacao; validar que os endpoints principais aparecem com descricoes e esquemas de requisicao/resposta.

**Acceptance Scenarios**:

1. **Given** o BFF esta em execucao local, **When** a pessoa acessa a rota oficial de documentacao, **Then** a interface de API abre sem erro e lista os endpoints publicos suportados pela feature.
2. **Given** um endpoint de saude esta documentado, **When** a pessoa executa um teste interativo na interface, **Then** recebe retorno JSON compativel com o contrato esperado.

---

### User Story 2 - Explorar contratos de chat para testes independentes (Priority: P2)

Como pessoa QA ou desenvolvedora, quero visualizar os esquemas do endpoint de chat com campos de entrada e saida bem descritos para montar cenarios de teste independentes sem depender de conhecimento interno da implementacao.

**Why this priority**: O endpoint de chat e mais sensivel para regressao de contrato. Deixar os esquemas claros reduz erros de payload e acelera validacao funcional.

**Independent Test**: Abrir a documentacao, localizar a secao de chat, inspecionar modelo de requisicao/resposta e executar um request de teste com payload valido.

**Acceptance Scenarios**:

1. **Given** a documentacao da API esta publicada, **When** a pessoa abre o endpoint de chat, **Then** visualiza o esquema de entrada com campos e exemplos compreensiveis.
2. **Given** um payload minimo valido para chat, **When** a pessoa usa o recurso de execucao interativa, **Then** o endpoint responde sem erro de contrato causado por falta de documentacao.

---

### User Story 3 - Organizar navegacao por dominio funcional (Priority: P3)

Como pessoa integrante do time, quero endpoints agrupados por categorias funcionais para navegar com rapidez na documentacao e localizar os recursos de saude e chat sem ambiguidade.

**Why this priority**: A categorizacao melhora usabilidade e reduz tempo de descoberta, mas depende da documentacao ja estar disponivel, por isso prioridade menor.

**Independent Test**: Abrir a interface de documentacao e verificar se os endpoints aparecem separados por grupos funcionais relevantes, com nomenclatura coerente.

**Acceptance Scenarios**:

1. **Given** a documentacao carregada, **When** a pessoa visualiza a lista de operacoes, **Then** encontra agrupamentos distintos para saude e chat.
2. **Given** multiplos endpoints no BFF, **When** novos endpoints sao adicionados seguindo o padrao, **Then** eles podem ser organizados em categorias sem quebrar a navegacao existente.

---

### Edge Cases

- A aplicacao inicia em porta diferente da padrao local: a documentacao deve continuar acessivel na rota de docs da mesma instancia ativa.
- O endpoint de chat exige payload obrigatorio: a documentacao deve deixar claro o payload minimo para evitar erros de validacao durante "Try it out".
- Ambiente local sem dependencias instaladas: a equipe precisa de orientacao objetiva para instalar, iniciar e acessar a rota de docs sem suposicoes.
- Mudancas em DTOs sem reflexo na documentacao: o fluxo da feature deve exigir que contratos exibidos sejam atualizados junto dos modelos de entrada e saida.
- Erro de inicializacao da API: a falha nao deve ser interpretada como indisponibilidade do Swagger; o guia precisa orientar verificacao da inicializacao antes do acesso.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE disponibilizar uma interface de documentacao OpenAPI acessivel por rota HTTP dedicada em ambiente local de desenvolvimento.
- **FR-002**: O sistema DEVE apresentar metadados claros da API (titulo, descricao funcional e versao) para identificar o contexto do BFF documentado.
- **FR-003**: O sistema DEVE incluir os endpoints de saude e chat na documentacao publicada.
- **FR-004**: O sistema DEVE agrupar endpoints por categorias funcionais para facilitar navegacao e descoberta.
- **FR-005**: O sistema DEVE exibir os modelos de entrada e saida dos endpoints documentados, incluindo campos obrigatorios e formatos esperados.
- **FR-006**: O sistema DEVE permitir execucao interativa de requisicoes documentadas para validacao independente de contrato.
- **FR-007**: O sistema DEVE manter consistencia entre contratos exibidos na documentacao e contratos efetivos aceitos/retornados pelos endpoints.
- **FR-008**: O sistema DEVE oferecer orientacao operacional para que qualquer integrante do time consiga iniciar o projeto localmente e acessar a documentacao sem conhecimento previo do ambiente.
- **FR-009**: O sistema DEVE manter a rota de documentacao como recurso de suporte ao desenvolvimento e testes sem alterar o comportamento funcional dos endpoints de negocio.

### Key Entities *(include if feature involves data)*

- **Documento de API**: Representacao navegavel da API do BFF com metadados de identificacao, grupos de endpoints e detalhes de operacoes.
- **Grupo Funcional de Endpoint**: Categoria de navegacao que organiza operacoes relacionadas a um dominio (ex.: saude, chat).
- **Esquema de Contrato**: Definicao dos campos de entrada e saida de uma operacao, incluindo obrigatoriedade e formato esperado para testes.
- **Guia Operacional de Acesso**: Sequencia de passos para preparar ambiente local, iniciar o servico e acessar a URL correta da documentacao.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das pessoas desenvolvedoras e QA do time conseguem localizar a documentacao da API em ambiente local em ate 2 minutos apos iniciar o servico.
- **SC-002**: Pelo menos 95% dos testes manuais iniciais de endpoints de saude e chat conseguem ser executados via interface documentada sem consulta adicional ao codigo-fonte.
- **SC-003**: O tempo medio para validar o contrato de um endpoint de chat em teste exploratorio e reduzido em pelo menos 40% em comparacao ao fluxo sem documentacao viva.
- **SC-004**: Em auditoria de regressao de contrato, 100% dos endpoints cobertos pela feature exibem estrutura de request/response aderente ao comportamento observado em execucao.

## Assumptions

- O time executa o BFF localmente com dependencias de projeto instaladas e acesso ao terminal de desenvolvimento.
- A prioridade desta feature e habilitar documentacao e testes de endpoints ja existentes, sem criar novos fluxos de negocio.
- A rota de documentacao sera usada principalmente em desenvolvimento e homologacao para acelerar integracao e QA.
- O endpoint de saude fornece resposta JSON de disponibilidade e permanece apto para teste rapido via interface documentada.
- O endpoint de chat exige payload minimo valido e pode depender de configuracoes de ambiente previamente definidas para resposta completa.

## Guia Operacional: Executar Projeto e Acessar Swagger

1. Abra o terminal na raiz do projeto e confirme que o diretorio atual e o repositorio do BFF.
2. Instale as dependencias do projeto com o comando `npm install`.
3. Inicie a aplicacao em modo de desenvolvimento com `npm run start:dev`.
4. Aguarde o log de inicializacao indicando que o servidor HTTP esta ativo.
5. Identifique a porta ativa da aplicacao:
   - Se nenhuma porta personalizada foi definida, use a porta padrao `4000`.
   - Se houver configuracao de porta no ambiente, use a porta efetivamente exibida no log de start.
6. Acesse a documentacao no navegador usando a rota padrao de docs:
   - URL padrao: `http://localhost:4000/api/docs`
   - URL parametrizada por porta: `http://localhost:{PORTA_ATIVA}/api/docs`
7. Na interface aberta, valide primeiro a tag de saude e execute "Try it out" para confirmar retorno JSON.
8. Em seguida, abra a tag de chat, preencha um payload minimo valido e execute "Try it out" para validar contrato.
9. Se a pagina de docs nao abrir:
   - Verifique se o processo do BFF segue em execucao.
   - Verifique se a porta usada na URL corresponde a porta exibida no log.
   - Verifique se nao ha conflito de porta com outro servico local.

### Resultado Esperado

- A interface de documentacao abre sem erro na rota `/api/docs`.
- Endpoints de saude e chat aparecem categorizados e prontos para teste interativo.
- O time consegue testar contratos basicos sem depender de ferramentas externas adicionais.
