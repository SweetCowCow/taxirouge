## ADDED Requirements

### Requirement: Next.js App Skeleton

The system SHALL provide a Next.js (App Router) application skeleton with TypeScript, Tailwind CSS, and three primary routes: `/` (home), `/play` (single run), and `/codex` (story archive).

#### Scenario: Home page loads successfully

- **WHEN** a user navigates to `/`
- **THEN** the system SHALL render a landing screen with a clearly visible call to action to start a new run
- **AND** the page SHALL NOT throw any console errors

#### Scenario: Play page is reachable from home

- **WHEN** a user clicks the start-run call to action on the home page
- **THEN** the system SHALL navigate to `/play` and begin (or resume) a single run

#### Scenario: Codex page is reachable from home

- **WHEN** a user navigates to `/codex` directly or via a home page link
- **THEN** the system SHALL render the story archive (codex) view

### Requirement: Local Save Persistence via IndexedDB

The system SHALL persist all game state (current run, codex entries) in IndexedDB through a single storage abstraction module that exposes high-level operations (load run, save run, list codex, append codex entry) and hides IndexedDB API details from game logic.

#### Scenario: Run state is saved after each node completion

- **WHEN** the player completes any node (event resolved or combat ended)
- **THEN** the system SHALL persist the current `RunState` snapshot to IndexedDB before transitioning to the next node

#### Scenario: Run state is restored on page reload

- **GIVEN** a player has completed at least one node in the current run and reloaded the browser tab
- **WHEN** the player navigates to `/play`
- **THEN** the system SHALL restore the most recent persisted `RunState` and resume from the point after the last completed node

#### Scenario: Codex entry is appended on run completion

- **WHEN** any run reaches a terminal state (cleared, breakdown, or vanished)
- **THEN** the system SHALL append a new codex entry containing the ending text, ending type, and timestamp to IndexedDB

#### Scenario: Storage failure is surfaced but non-blocking

- **WHEN** IndexedDB write fails (e.g., private browsing mode, quota exceeded)
- **THEN** the system SHALL display a visible warning to the player that progress will not be saved
- **AND** the system SHALL allow the player to continue the current run in memory

### Requirement: LLM Client Wrapper Reserved for Future Use

The system SHALL include an OpenAI-compatible LLM client wrapper module that reads base URL, API key, and model name from environment variables, and SHALL prevent any real LLM API call from executing in the friend-playtest phase by throwing a `NotEnabledError` if invoked.

#### Scenario: Wrapper exposes a single completion function

- **WHEN** application code imports the LLM client module
- **THEN** the module SHALL export a `llmComplete({ system, messages, model? })` function with a documented `Promise<string>` return type

#### Scenario: Calling the wrapper throws in friend-playtest phase

- **WHEN** any code path invokes `llmComplete(...)` during friend-playtest phase
- **THEN** the function SHALL throw a `NotEnabledError` synchronously or via the returned promise
- **AND** the system SHALL NOT make any network request

### Requirement: Zeabur Deployment Compatibility

The system SHALL build and deploy successfully on Zeabur using Zeabur's zero-config Next.js support, without requiring a custom `Dockerfile` for the friend-playtest phase.

#### Scenario: Production build succeeds locally

- **WHEN** a developer runs the project's production build command (`pnpm build` or `npm run build`)
- **THEN** the build SHALL complete with exit code 0
- **AND** the build SHALL NOT report any TypeScript errors

#### Scenario: Zeabur deployment serves the application

- **GIVEN** the repository is connected to a Zeabur Next.js service
- **WHEN** Zeabur runs its zero-config build and deploy pipeline
- **THEN** the deployed URL SHALL serve the home page successfully on first request
