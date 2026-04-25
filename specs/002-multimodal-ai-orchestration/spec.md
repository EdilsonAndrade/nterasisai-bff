# Feature Specification: Receber Payload Multimodal e Orquestrar Chamada Segura para o AI Engine

**Feature Branch**: `[002-multimodal-ai-orchestration]`  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: User description: "leia no ticket EDI-23 DO LINEAR E CRIE UMA ESPECIFICACAO COERENTE PARA CHAMARMOS O BACKEND ENGINE"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enviar mensagem multimodal com protecao do orquestrador (Priority: P1)

Como aplicacao cliente autorizada, quero enviar uma mensagem com texto, audio ou ambos para o orquestrador para que ele valide a entrada e encaminhe a solicitacao com seguranca ao AI Engine.

**Why this priority**: Este e o fluxo central da feature. Sem ele, o BFF nao cumpre seu papel de barreira segura entre o frontend e o AI Engine.

**Independent Test**: Pode ser testada isoladamente ao enviar uma requisicao valida com pelo menos um tipo de conteudo suportado a partir de uma origem aprovada e verificar que a solicitacao e aceita e encaminhada ao servico interno confiavel.

**Acceptance Scenarios**:

1. **Given** uma aplicacao cliente aprovada e uma mensagem contendo texto, **When** a solicitacao e enviada ao orquestrador, **Then** o backend valida a entrada e encaminha a mensagem ao AI Engine por um canal interno confiavel.
2. **Given** uma aplicacao cliente aprovada e uma mensagem contendo audio, **When** a solicitacao e enviada ao orquestrador, **Then** o backend valida o anexo recebido e o encaminha ao AI Engine sem expor credenciais internas ao cliente.
3. **Given** uma aplicacao cliente aprovada e uma mensagem contendo texto e audio, **When** a solicitacao e enviada, **Then** o backend preserva ambos os tipos de entrada no encaminhamento e retorna um resultado coerente para a solicitacao.

---

### User Story 2 - Bloquear origens e trafego abusivo antes do AI Engine (Priority: P2)

Como responsavel pela seguranca da plataforma, quero que o orquestrador barre origens nao autorizadas e contenha excesso de chamadas para reduzir abuso e proteger o AI Engine.

**Why this priority**: O ticket posiciona o BFF como barreira de seguranca primaria. Isso precisa acontecer antes de qualquer encaminhamento interno para evitar exposicao desnecessaria do servico de IA.

**Independent Test**: Pode ser testada isoladamente ao tentar chamar a rota a partir de uma origem nao aprovada e ao exceder o limite permitido de envios, confirmando que ambos os casos sao rejeitados sem atingir o AI Engine.

**Acceptance Scenarios**:

1. **Given** uma requisicao originada de uma fonte nao aprovada, **When** ela tenta acessar a rota de mensagem, **Then** o orquestrador bloqueia a solicitacao antes de qualquer processamento interno.
2. **Given** um solicitante que excedeu o volume permitido de chamadas no intervalo definido, **When** uma nova mensagem e enviada, **Then** o orquestrador rejeita a solicitacao e informa que o limite operacional foi atingido.

---

### User Story 3 - Preservar a confianca entre BFF e AI Engine (Priority: P3)

Como time de plataforma, queremos que toda chamada interna ao AI Engine seja feita com uma credencial gerenciada pelo servidor para manter a separacao entre acesso externo e confianca interna.

**Why this priority**: A feature so e segura se o frontend nunca falar diretamente com o AI Engine nem controlar o mecanismo de confianca usado entre servicos internos.

**Independent Test**: Pode ser testada isoladamente ao inspecionar o encaminhamento gerado pelo orquestrador e confirmar que a credencial interna e anexada pelo servidor e nao e derivada da requisicao do cliente.

**Acceptance Scenarios**:

1. **Given** uma solicitacao valida aceita pelo orquestrador, **When** ela e encaminhada ao AI Engine, **Then** a chamada inclui a credencial interna gerenciada pelo backend.
2. **Given** uma tentativa de fornecer credenciais internas pelo cliente, **When** a mensagem e processada, **Then** o orquestrador ignora qualquer valor vindo da entrada externa e utiliza apenas a credencial sob seu controle.

### Edge Cases

- A solicitacao deve ser rejeitada quando nao contiver nenhum conteudo suportado para processamento.
- Se texto e audio forem enviados juntos, o encaminhamento deve preservar ambos sem descartar um deles silenciosamente.
- Se a origem da requisicao nao estiver aprovada, a chamada deve falhar antes de qualquer contato com o AI Engine.
- Se o limite operacional da rota for excedido, a chamada deve ser interrompida sem consumir processamento interno adicional.
- Se a credencial interna obrigatoria estiver indisponivel, o orquestrador deve falhar de forma segura e nao encaminhar a mensagem.
- Se o AI Engine estiver indisponivel ou retornar falha, o cliente deve receber um erro claro sem exposicao de segredos internos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST aceitar solicitacoes de mensagem oriundas apenas de canais cliente explicitamente aprovados para uso do produto.
- **FR-002**: O sistema MUST receber uma mensagem contendo texto, audio ou ambos, exigindo que pelo menos um tipo de conteudo valido esteja presente em cada solicitacao.
- **FR-003**: O sistema MUST validar a entrada recebida antes de iniciar qualquer encaminhamento ao AI Engine.
- **FR-004**: O sistema MUST bloquear solicitacoes vindas de origens nao autorizadas antes de qualquer processamento interno relevante.
- **FR-005**: O sistema MUST aplicar protecao contra excesso de chamadas na rota de mensagem para conter abuso e preservar a disponibilidade operacional.
- **FR-006**: O sistema MUST encaminhar apenas solicitacoes aprovadas e validadas ao AI Engine por meio de comunicacao interna controlada pelo BFF.
- **FR-007**: O sistema MUST anexar uma credencial interna gerenciada pelo servidor em toda chamada ao AI Engine.
- **FR-008**: O sistema MUST impedir que credenciais ou mecanismos de confianca internos sejam fornecidos, sobrescritos ou influenciados pela entrada do cliente.
- **FR-009**: O sistema MUST preservar no encaminhamento a distincao entre conteudo textual e anexo de audio recebidos na solicitacao.
- **FR-010**: O sistema MUST retornar ao cliente um resultado claro indicando se a solicitacao foi aceita para processamento, bloqueada por politica ou recusada por falha operacional.
- **FR-011**: O sistema MUST garantir que solicitacoes bloqueadas por politica, invalidas ou incompletas nao sejam encaminhadas ao AI Engine.
- **FR-012**: O sistema MUST manter o AI Engine inacessivel diretamente ao cliente final, usando o orquestrador como unica fronteira publica para este fluxo.

### Key Entities *(include if feature involves data)*

- **Solicitacao de Chat**: Representa a mensagem enviada pela aplicacao cliente para iniciar uma interacao com o AI Engine, contendo texto, audio ou ambos.
- **Origem Cliente**: Representa a identidade de origem da chamada externa usada para decidir se a solicitacao pode ser aceita pelo orquestrador.
- **Politica de Protecao de Trafego**: Representa as regras operacionais que limitam o volume de chamadas aceitas em um intervalo para reduzir abuso.
- **Credencial Interna de Servico**: Representa o segredo de confianca administrado pelo backend e utilizado apenas na comunicacao interna com o AI Engine.
- **Resultado de Encaminhamento**: Representa o desfecho observado pelo cliente apos a avaliacao da solicitacao, distinguindo aceite, bloqueio por politica e falha operacional.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das solicitacoes com origem nao aprovada sao rejeitadas antes de qualquer encaminhamento ao AI Engine durante os testes de aceite.
- **SC-002**: 100% das solicitacoes que excedem o limite operacional definido recebem bloqueio consistente sem gerar chamada interna adicional ao AI Engine.
- **SC-003**: Pelo menos 95% das solicitacoes validas com conteudo suportado recebem um resultado inicial do orquestrador em ate 2 segundos em ambiente padrao de homologacao.
- **SC-004**: 100% das chamadas internas originadas por solicitacoes aceitas incluem a credencial de confianca gerenciada pelo backend e nenhuma depende de segredo vindo do cliente.
- **SC-005**: O time consegue validar, em uma unica rodada de testes de integracao, o envio de texto, o envio de audio e o envio combinado sem ajustar o contrato funcional da rota.

## Assumptions

- A primeira versao desta feature atende uma mensagem por solicitacao, com um campo textual opcional e um anexo de audio opcional, desde que ao menos um deles esteja presente.
- O frontend oficial do produto possui um conjunto conhecido de origens aprovadas e esse conjunto sera mantido fora da entrada enviada pelo usuario final.
- A resposta desta feature cobre o aceite, o bloqueio ou a falha do encaminhamento, sem definir nesta etapa a experiencia completa de streaming da resposta generativa.
- O AI Engine permanece como servico interno confiavel e nao deve ser exposto diretamente ao usuario final em nenhum fluxo desta feature.
- O orquestrador continua responsavel por seguranca de borda e roteamento, enquanto as regras especificas de IA permanecem no AI Engine.