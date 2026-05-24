## ADDED Requirements

### Requirement: Narrative Event Structure

The system SHALL define each narrative event as a structured record containing an identifier, opening text (80-200 characters), and 2 to 3 choices, where each choice has a label and a declared outcome that modifies run state (resource change, card grant, transition to combat, or transition to next node).

#### Scenario: Event renders opening text and choices

- **GIVEN** the player enters a passenger-narrative (怪客) node carrying a defined event
- **WHEN** the event screen is rendered
- **THEN** the system SHALL display the event's opening text
- **AND** the system SHALL display all of the event's choices as selectable controls

#### Scenario: Selecting a choice applies its outcome

- **WHEN** the player selects a choice from a displayed event
- **THEN** the system SHALL apply the choice's declared outcome to the run state (resource delta, card grant, combat entry, or direct node completion)
- **AND** the system SHALL transition the run forward according to the outcome (to combat screen, next node, or ending)

### Requirement: Handwritten Event Pool

The system SHALL ship with at least 5 and at most 7 fully written narrative events in the friend-playtest phase, plus at least 2 boss-node events that introduce the boss combat.

#### Scenario: Event pool meets minimum count

- **WHEN** the build pipeline finishes for the friend-playtest release
- **THEN** the system SHALL contain at least 5 distinct passenger-narrative events
- **AND** the system SHALL contain at least 2 distinct boss-node events

#### Scenario: Each event has at least one combat-bearing choice path or one resource-modifying choice

- **GIVEN** any event in the pool
- **WHEN** its choices are inspected
- **THEN** at least one choice SHALL either enter combat or modify a resource (fuel or mind)

### Requirement: Ending Text Generation from Predefined Pool

The system SHALL produce the ending text by selecting one entry from the predefined text pool that matches the ending type (cleared, breakdown, or vanished), and SHALL store the selected text together with the ending type and timestamp as a new codex entry.

#### Scenario: Breakdown ending selects from breakdown pool

- **WHEN** the run reaches the breakdown ending state
- **THEN** the system SHALL select one text from the breakdown pool
- **AND** the system SHALL record a codex entry with `endingType: 'breakdown'`, the selected text, and the current timestamp

#### Scenario: Cleared ending selects from cleared pool

- **WHEN** the run reaches the cleared ending state
- **THEN** the system SHALL select one text from the cleared pool
- **AND** the system SHALL record a codex entry with `endingType: 'cleared'`, the selected text, and the current timestamp

### Requirement: Codex (車行紀事) View

The system SHALL provide a codex view at `/codex` that lists every recorded codex entry in reverse chronological order, displaying each entry's timestamp, ending type, and full ending text.

#### Scenario: Codex lists entries newest first

- **GIVEN** the codex contains 3 entries with timestamps T1 < T2 < T3
- **WHEN** the player opens `/codex`
- **THEN** the rendered list SHALL display entries in order: T3, T2, T1

#### Scenario: Codex displays full ending text for each entry

- **WHEN** the codex view renders an entry
- **THEN** the entry SHALL display its timestamp, its ending type label, and its full stored ending text without truncation

#### Scenario: Empty codex shows a placeholder

- **GIVEN** the player has never completed a run
- **WHEN** the player opens `/codex`
- **THEN** the view SHALL render a non-empty placeholder message indicating there are no entries yet

### Requirement: Player Report Button

The system SHALL display a report button at the end of every narrative event and every ending screen, allowing the player to flag the content; in the friend-playtest phase the report action SHALL be recorded to the browser console with the event or ending identifier and a timestamp.

#### Scenario: Report button is visible on event resolution

- **WHEN** a narrative event resolves and its outcome screen is shown
- **THEN** the system SHALL display a clearly labeled report button on that screen

#### Scenario: Clicking report logs the identifier

- **WHEN** the player clicks the report button on an event or ending screen
- **THEN** the system SHALL write a structured log entry to the browser console containing the event or ending identifier and a timestamp
- **AND** the system SHALL display a brief acknowledgement to the player
