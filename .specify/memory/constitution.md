<!--
Sync Impact Report
==================
Version change: (none) → 1.0.0
Rationale: Initial ratification of the project constitution. MAJOR baseline
establishing architectural, design, and integration principles for the
interasisai-bff orchestrator.

Modified principles: N/A (initial adoption)
Added sections:
  - Core Principles (I–V)
  - Technology Stack & Integration Constraints
  - Development Workflow & Quality Gates
  - Governance
Removed sections: none

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ reviewed (generic Constitution
    Check section; gates will be derived from these principles at /plan time)
  - .specify/templates/spec-template.md ✅ reviewed (no principle-specific
    references; no change required)
  - .specify/templates/tasks-template.md ✅ reviewed (no principle-specific
    references; no change required)
  - .specify/templates/checklist-template.md ✅ reviewed (no change required)

Follow-up TODOs: none
-->

# interasisai-bff Constitution

## Core Principles

### I. Clean Architecture & Layer Separation (NON-NEGOTIABLE)

Business rules MUST be independent of frameworks, databases, and external APIs.
The codebase MUST be organized into four layers with strictly unidirectional
dependencies pointing inward (Presentation → Application → Domain;
Infrastructure → Domain via interfaces):

- **Domain Layer**: Contains business Entities, Value Objects, and Contracts
  (Repository interfaces, external service ports). MUST NOT import from NestJS,
  TypeORM, GraphQL, HTTP clients, or any other framework/library beyond the
  language standard library and pure utility helpers.
- **Application Layer**: Contains Use Cases and orchestration logic. MAY depend
  on the Domain Layer only. MUST consume infrastructure through Domain
  interfaces (ports).
- **Infrastructure Layer**: Contains technical Adapters — TypeORM repositories,
  REST clients to the Python AI Engine, email providers, etc. Adapters MUST
  implement Domain interfaces.
- **Presentation Layer**: Contains GraphQL Resolvers and HTTP Controllers. Its
  sole responsibility is to receive input, invoke a Use Case, and return
  output. It MUST NOT contain business logic.

Rationale: Layer independence is the foundation of testability, replaceability
of infrastructure, and long-term maintainability of the BFF.

### II. SOLID Design Discipline

All classes and services MUST adhere to SOLID principles:

- **SRP**: Each class/service has exactly one reason to change. Use Cases
  represent a single business operation; Resolvers/Controllers represent a
  single entry point.
- **DIP**: High-level layers (Domain, Application) MUST NOT depend on
  low-level layers (Infrastructure). Dependencies MUST be declared against
  Domain interfaces and wired via NestJS native Dependency Injection.
- **ISP**: Interfaces MUST be segregated by consumer need. A service MUST NOT
  be forced to implement methods it does not use; split large contracts into
  focused ones.
- **OCP / LSP**: Extension is preferred over modification of stable contracts;
  implementations MUST be substitutable for their interfaces.
- **DRY & KISS**: Validation and orchestration logic MUST NOT be duplicated
  across layers. Favor the simplest implementation that satisfies the Use
  Case; avoid speculative abstractions.

Rationale: SOLID keeps the architectural boundaries enforceable in code, not
just on paper, and keeps cognitive load low as the system grows.

### III. Dependency Injection via NestJS (NON-NEGOTIABLE)

All cross-layer dependencies MUST be resolved through NestJS's native DI
container. Use Cases and Adapters MUST be registered as providers and
consumed via constructor injection against Domain interface tokens. Manual
instantiation (`new SomeRepository()`) of layer-crossing dependencies is
prohibited outside of tests and composition roots.

Rationale: Centralizing wiring in NestJS modules preserves DIP, enables
substitution for testing, and makes the composition graph explicit.

### IV. BFF Orchestration & AI Engine Separation

The NestJS service MUST act strictly as a BFF (Backend For Frontend):

- Exposes a **GraphQL** API to clients.
- Owns authentication, authorization, session context, and persistence of
  application data (via TypeORM through Infrastructure adapters).
- Orchestrates AI work by delegating to a separate **Python AI Engine**
  microservice built on **FastAPI**.
- Communication between NestJS and the Python AI Engine MUST be over **REST
  (HTTP/JSON)**. AI-specific business rules (prompt engineering, model
  selection, embeddings, etc.) MUST live in the Python service, not the BFF.
- The NestJS side MUST access the AI Engine only through a Domain-defined
  port implemented by an Infrastructure adapter; Resolvers MUST NOT call the
  AI Engine directly.

Rationale: Separating the specialized AI runtime from the BFF keeps each
service focused, independently scalable, and replaceable.

### V. Streaming-First Chat Responses

Chat and other long-form AI responses MUST support native streaming
end-to-end to minimize perceived latency:

- The Python AI Engine MUST expose streaming endpoints (e.g., chunked HTTP
  or SSE) for generative responses.
- The NestJS BFF MUST propagate streams to the client (e.g., GraphQL
  subscriptions or equivalent streaming transport) without buffering the
  full response.
- Non-streaming fallbacks are permitted only when a client explicitly opts
  out or the underlying operation is inherently non-incremental.

Rationale: Streaming is a user-experience requirement for conversational AI;
buffering breaks the product promise and cannot be retrofitted cheaply.

## Technology Stack & Integration Constraints

- **BFF runtime**: NestJS (TypeScript) exposing GraphQL.
- **Persistence**: TypeORM, accessed exclusively through Infrastructure
  repository adapters that implement Domain repository interfaces.
- **AI Engine**: Python service on FastAPI, communicated with over REST.
- **Inter-service contract**: REST endpoints between NestJS and the AI Engine
  MUST be versioned and documented (OpenAPI); breaking changes require a new
  version path.
- **External APIs (AI providers, email, etc.)**: MUST be reached only through
  Infrastructure adapters behind Domain ports; no direct SDK usage from
  Application, Domain, or Presentation layers.
- **Authentication & authorization**: Handled in the BFF; the AI Engine MUST
  treat the BFF as a trusted caller and MUST NOT be exposed directly to end
  users.

## Development Workflow & Quality Gates

- **Constitution Check**: Every `/plan` MUST include a Constitution Check
  that verifies layer boundaries, DI usage, BFF/AI Engine separation, and
  streaming support for applicable features.
- **Code review**: PRs MUST be rejected when they introduce framework,
  database, or HTTP concerns into the Domain or Application layers, or
  business logic into Presentation.
- **Testing discipline**:
  - Domain and Application layers MUST be covered by unit tests that do not
    require NestJS, TypeORM, HTTP, or network access.
  - Infrastructure adapters MUST have integration tests against real or
    faithfully-emulated dependencies.
  - Streaming paths MUST have at least one end-to-end test validating
    incremental delivery.
- **Justification for complexity**: Any deviation from these principles MUST
  be documented in the plan's Complexity Tracking section with a concrete
  rationale and the simpler alternative that was rejected.

## Governance

This constitution supersedes ad-hoc practices and prior conventions. It
applies to all code in the interasisai-bff repository and to the contract
between the BFF and the Python AI Engine.

- **Amendments** require a pull request that updates this document, bumps
  the version per the policy below, updates the Sync Impact Report, and, if
  applicable, migrates affected templates and code.
- **Versioning policy** (semantic):
  - **MAJOR**: Backward-incompatible removal or redefinition of a principle
    or governance rule.
  - **MINOR**: Addition of a new principle/section or materially expanded
    guidance.
  - **PATCH**: Clarifications, wording, and non-semantic refinements.
- **Compliance reviews**: Every PR and design review MUST verify compliance
  with the Core Principles. Reviewers MUST block merges that violate
  NON-NEGOTIABLE principles until resolved or explicitly justified.
- **Runtime guidance**: Agent-facing guidance (e.g.,
  `.github/copilot-instructions.md` and Spec Kit templates) MUST remain
  consistent with this constitution; discrepancies MUST be reconciled in the
  same amendment that introduces them.

**Version**: 1.0.0 | **Ratified**: 2026-04-22 | **Last Amended**: 2026-04-22
