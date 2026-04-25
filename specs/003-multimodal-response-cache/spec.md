# Feature Specification: Orquestrar Resposta Multimodal e Gerenciar Cache de Respostas

**Feature Branch**: `003-multimodal-response-cache`  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: User description: "leia a atividade NO LINEAR EDI-27 E GERE A ESPECIFICAÇÃO"  
**Source Activity**: [Linear EDI-27 — Orquestrar Resposta Multimodal e Gerenciar Cache de Respostas](https://linear.app/edilsonandrade/issue/EDI-27/orquestrar-resposta-multimodal-e-gerenciar-cache-de-respostas)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Receber e devolver resposta multimodal íntegra (Priority: P1)

Um usuário final do chatbot envia uma mensagem (texto ou áudio) e espera receber, no frontend, a resposta gerada pelo motor de IA contendo o texto e o áudio sintetizado. O BFF precisa consumir a resposta produzida pelo AI Engine, transportá-la sem perda nem corrupção, e entregá-la ao frontend em um formato consumível diretamente pelo player de áudio e pela área de mensagens.

**Why this priority**: Sem essa entrega íntegra a feature não existe; é a fatia mínima que devolve valor ao usuário final do chat. Todos os demais comportamentos (cache, leads) só agregam valor quando esta etapa funciona.

**Independent Test**: Enviar uma requisição de chat válida ao BFF e verificar que o frontend recebe a resposta com o componente de áudio reproduzível e o texto exibível, idênticos ao que foi gerado pelo AI Engine, sem dependência de cache nem de captura de leads.

**Acceptance Scenarios**:

1. **Given** o AI Engine retorna ao BFF uma resposta contendo texto e áudio sintetizado, **When** o BFF responde a requisição do frontend, **Then** o frontend recebe o mesmo conteúdo textual e um áudio reproduzível sem distorção audível e com mesma duração da origem.
2. **Given** o AI Engine retorna apenas texto (sem áudio), **When** o BFF responde, **Then** o frontend recebe a resposta textual com indicação clara de ausência de áudio, sem campos vazios mal formados.
3. **Given** o AI Engine retorna áudio em formato suportado pelo contrato, **When** a resposta atravessa o BFF, **Then** nenhum byte é perdido, truncado ou re-encodado de forma a alterar o conteúdo original.

---

### User Story 2 - Reaproveitar respostas via cache do cliente durante a sessão (Priority: P2)

Quando o usuário repete dentro da mesma sessão uma pergunta cuja resposta já foi entregue, o frontend deve poder reaproveitar a resposta anterior sem nova chamada cara ao motor de IA. O BFF é responsável por sinalizar, por meio de cabeçalhos HTTP de cache, que a resposta pode ser mantida em memória pelo cliente durante a sessão.

**Why this priority**: Reduz latência percebida e custo de inferência para perguntas repetidas, melhorando experiência sem mudar contrato funcional. Depende da User Story 1 mas pode ser entregue independentemente como uma melhoria observável de performance.

**Independent Test**: Solicitar duas vezes a mesma resposta dentro da sessão; observar que a segunda exibição no frontend ocorre a partir do cache local validado pelos cabeçalhos enviados pelo BFF, sem novo processamento de LLM, e medir redução significativa do tempo total até a resposta visível.

**Acceptance Scenarios**:

1. **Given** o BFF responde com sucesso a uma pergunta, **When** o cliente recebe a resposta, **Then** os cabeçalhos de cache permitem retenção privada da resposta pelo cliente durante a janela da sessão.
2. **Given** uma resposta válida já está em cache do cliente dentro da janela permitida, **When** o usuário dispara a mesma pergunta, **Then** a resposta é exibida em tempo perceptivelmente menor do que a primeira execução, sem nova invocação de LLM.
3. **Given** uma resposta marcada como não cacheável (ex.: erro, conteúdo sensível identificado), **When** entregue ao cliente, **Then** os cabeçalhos impedem o reaproveitamento e o cliente refaz a requisição na próxima necessidade.

---

### User Story 3 - Capturar leads quando o usuário fornece dados de contato (Priority: P3)

Quando, no curso da conversa, o usuário fornecer dados de contato (por exemplo, nome e empresa) e a resposta produzida pelo motor de IA sinalizar que esses dados foram capturados, o BFF deve persistir esses dados como um lead, viabilizando o futuro painel administrativo de leads gerados pelo chatbot.

**Why this priority**: Marcado como opcional/recomendado na atividade. Agrega valor de negócio (geração de leads) mas é independente do funcionamento do chat e do cache; pode ser entregue por último sem afetar a experiência do usuário final.

**Independent Test**: Simular uma resposta do AI Engine sinalizando captura de lead com nome e empresa; verificar que um novo registro é persistido com os campos esperados e que o fluxo de chat segue normal independentemente do resultado da persistência.

**Acceptance Scenarios**:

1. **Given** a resposta do AI Engine sinaliza captura de lead com nome e empresa, **When** o BFF processa essa resposta, **Then** um registro de lead é persistido contendo nome, empresa, momento da captura e identificador da sessão de origem.
2. **Given** a resposta do AI Engine não contém sinalização de lead, **When** o BFF processa a resposta, **Then** nenhum lead é criado e a resposta ao frontend não é afetada.
3. **Given** a persistência de lead falha por motivo transitório, **When** o BFF processa a resposta, **Then** a resposta multimodal continua sendo entregue ao frontend e a falha de persistência é registrada para retentativa ou observabilidade, sem interromper a conversa.

---

### Edge Cases

- O AI Engine devolve áudio em formato ou codificação não previstos pelo contrato → o BFF deve rejeitar a propagação ao cliente com erro claro em vez de entregar mídia corrompida.
- O AI Engine devolve resposta extremamente grande (acima do limite suportado pelo contrato) → o BFF deve recusar e sinalizar erro padronizado, sem truncar silenciosamente.
- O frontend reaproveita uma resposta cacheada após o usuário invalidar a sessão (logout ou expiração) → o cache não deve sobreviver à sessão.
- Resposta sinaliza dados de contato incompletos (apenas nome, sem empresa, ou vice-versa) → o sistema precisa decidir entre persistir parcial, descartar ou registrar como lead incompleto, e essa decisão deve estar explicitada e ser observável.
- O AI Engine não responde dentro do tempo aceitável → o BFF responde com erro padronizado ao frontend e nenhuma resposta parcial é cacheada.
- Conteúdo da resposta é classificado como sensível pelo AI Engine → o BFF não deve emitir cabeçalhos que permitam cache no cliente.
- A persistência do lead viola unicidade ou validação → a falha não pode quebrar a entrega da resposta de chat ao usuário.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O BFF DEVE consumir a resposta produzida pelo AI Engine e entregá-la ao frontend preservando integralmente o conteúdo textual e o conteúdo de áudio sintetizado.
- **FR-002**: O BFF DEVE expor a resposta multimodal ao frontend em um único contrato de resposta capaz de transportar texto, áudio sintetizado e metadados associados (ex.: identificador da resposta, indicação de origem em cache).
- **FR-003**: O BFF NÃO DEVE re-codificar, comprimir ou modificar o áudio recebido do AI Engine de forma a alterar seu conteúdo perceptível ou seus bytes significativos.
- **FR-004**: O BFF DEVE responder com erro padronizado e sem entregar mídia parcial quando o áudio recebido do AI Engine estiver incompleto, corrompido ou em formato fora do contrato.
- **FR-005**: O BFF DEVE incluir em cada resposta de chat cabeçalhos de cache que permitam ao cliente reter a resposta em memória durante a sessão e impeçam o cache em intermediários públicos.
- **FR-006**: O BFF DEVE marcar como não cacheáveis as respostas que representem erro, falha de upstream ou conteúdo sinalizado como sensível pelo AI Engine.
- **FR-007**: O BFF DEVE permitir que o frontend reutilize uma resposta cacheada localmente sem nova chamada ao endpoint quando os cabeçalhos enviados ainda forem válidos para a sessão.
- **FR-008**: O BFF DEVE detectar, a partir de sinalização estruturada presente na resposta do AI Engine, quando a interação capturou dados de contato do usuário (nome, empresa).
- **FR-009**: O BFF DEVE persistir cada lead capturado com, no mínimo, nome, empresa, momento da captura e identificador da sessão de origem, de modo a alimentar o futuro painel administrativo.
- **FR-010**: A persistência de leads NÃO DEVE bloquear, atrasar de forma perceptível, nem causar falha na entrega da resposta de chat ao frontend.
- **FR-011**: O BFF DEVE registrar falhas de persistência de leads de forma observável para análise posterior, sem expor detalhes internos ao cliente.
- **FR-012**: O contrato de resposta entregue ao frontend DEVE incluir um identificador único da resposta para que o cliente consiga associar resposta cacheada à pergunta correspondente.
- **FR-013**: O BFF DEVE preservar as proteções de borda já estabelecidas (allowlist de origem, throttling, segredo interno para o AI Engine) sem regressão decorrente desta feature.
- **FR-014**: A feature NÃO DEVE introduzir lógica de inferência, síntese de voz ou geração de conteúdo no BFF; toda decisão de conteúdo permanece no AI Engine.

### Key Entities *(include if feature involves data)*

- **Resposta de Chat Multimodal**: Unidade de resposta entregue pelo BFF ao frontend, composta por conteúdo textual, conteúdo de áudio sintetizado opcional, identificador único da resposta, identificador da sessão de origem, indicação de cacheabilidade e metadados auxiliares (ex.: marcações de sensibilidade).
- **Lead Capturado**: Registro de contato gerado a partir de uma interação do chat. Atributos mínimos: nome, empresa, momento da captura, identificador da sessão de origem e referência à resposta que originou a captura.
- **Sessão de Conversa**: Janela lógica em que o usuário interage com o chatbot e dentro da qual respostas podem ser reaproveitadas em cache no cliente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em pelo menos 99% das respostas entregues, o áudio reproduzido no frontend tem mesma duração e mesmo conteúdo audível da resposta gerada pelo AI Engine, validado por verificação de integridade do conteúdo entregue.
- **SC-002**: Para perguntas repetidas dentro da mesma sessão, o tempo até a resposta percebida pelo usuário é reduzido em pelo menos 70% em relação à primeira execução equivalente.
- **SC-003**: Nenhuma falha de captura ou persistência de leads causa indisponibilidade ou erro visível na entrega da resposta de chat ao usuário, medido por taxa de sucesso da entrega de chat mantida igual à observada antes da feature.
- **SC-004**: 100% das respostas marcadas como sensíveis ou de erro são entregues sem permissão de cache no cliente, validado por inspeção dos cabeçalhos em cenários de teste representativos.
- **SC-005**: Para cada lead capturado a partir de uma interação que sinalizou dados de contato, existe um registro persistido recuperável posteriormente, com taxa de captura efetiva de no mínimo 95% das sinalizações elegíveis.

## Assumptions

- O AI Engine é a fonte autoritativa do conteúdo da resposta (texto e áudio) e do sinal de captura de lead; o BFF não infere nem adivinha esses conteúdos.
- O áudio sintetizado é entregue ao BFF em uma codificação textual transportável dentro do contrato HTTP/JSON existente entre BFF e AI Engine, sem necessidade de canal binário separado nesta iteração.
- A janela de sessão para fins de cache no cliente é a janela em que o frontend mantém o usuário ativo na conversa, podendo ser tratada como cache privado de curto prazo.
- O frontend é o responsável por armazenar e consultar o cache local da resposta a partir dos cabeçalhos enviados pelo BFF; o BFF não mantém cache em memória nesta iteração.
- A captura de lead é desencadeada exclusivamente por sinal estruturado vindo do AI Engine, não por análise textual no BFF, mantendo a separação entre orquestração e inteligência.
- A persistência de leads usa um repositório próprio do BFF, dedicado ao painel administrativo futuro, e é tratada como caminho lateral assíncrono em relação à entrega da resposta.
- Esta feature evolui o caso de uso de orquestração já existente; não introduz uma nova rota pública nem altera a política de borda já consolidada.
- Métricas de tempo de resposta e integridade serão observadas em ambiente de homologação representativo, com payloads compatíveis com os do uso real.
