## ADDED Requirements

### Requirement: Four-School Card Catalog

The system SHALL define exactly 18 unique cards for the friend-playtest phase, distributed across four schools: vehicle-skill (車技, 5 cards), gear (行頭, 5 cards), route (路況, 4 cards), and dialogue (話術, 4 cards).

#### Scenario: Card catalog ships with exact counts per school

- **WHEN** the build pipeline finishes
- **THEN** the card catalog SHALL contain exactly 18 cards in total
- **AND** the distribution SHALL be exactly: 5 vehicle-skill, 5 gear, 4 route, 4 dialogue

##### Example: count validation table

| School         | Required Count |
| -------------- | -------------- |
| vehicle-skill  | 5              |
| gear           | 5              |
| route          | 4              |
| dialogue       | 4              |
| **Total**      | **18**         |

### Requirement: Card Definition Shape

The system SHALL represent each card as a typed record containing: `id` (string, unique), `name` (string, dual-name format "modern · martial-arts"), `school` (one of the four schools), `cost` (integer, 0-3, representing 神識), `effects` (declarative effect list), `flavorText` (string), and `artPath` (string, path to the card illustration asset).

#### Scenario: Every card has all required fields

- **WHEN** the catalog is loaded at runtime
- **THEN** every card record SHALL have non-null values for `id`, `name`, `school`, `cost`, `effects`, `flavorText`, and `artPath`

#### Scenario: Card identifiers are unique

- **WHEN** the catalog is loaded at runtime
- **THEN** no two cards in the catalog SHALL share the same `id` value

#### Scenario: Card name uses dual-name format

- **WHEN** any card's `name` is inspected
- **THEN** the name SHALL match the dual-name format (e.g., "急踩煞車・鎖喉式"), with both a modern term and a martial-arts term separated by `・`

### Requirement: Card Illustration Asset Per Card

The system SHALL provide one scene-vignette illustration asset for every card in the catalog, generated under the project's card prompt style guide, with each asset stored at the path declared by the card's `artPath` field.

#### Scenario: Illustration asset file exists for every card

- **GIVEN** a card with `artPath: '/cards/<id>.webp'` (or equivalent)
- **WHEN** the build verifies asset coverage
- **THEN** the file at that path SHALL exist in the repository's public assets

#### Scenario: Missing illustration falls back to school color block

- **GIVEN** a card's illustration fails to load at runtime
- **WHEN** the card is rendered in the UI
- **THEN** the system SHALL render a fallback consisting of the school's color block and the card name in large type, defined by the visual-system design tokens

### Requirement: Card Prompt Style Guide

The system SHALL include a documented card prompt style guide at the project documentation path that specifies the fixed prompt suffix, color palette keywords, composition keywords, negative prompt, and the chosen AI image generator (nanobanana2 or gpt-image-2) used to produce all 18 illustrations.

#### Scenario: Style guide enumerates required prompt elements

- **WHEN** the style guide document is read
- **THEN** it SHALL contain explicit sections for: fixed prompt suffix, color palette keywords, composition keywords, negative prompt, chosen image generator, and at least 3 reference card examples with their full prompts

#### Scenario: All 18 cards reference the same style guide

- **GIVEN** all 18 cards have been generated
- **WHEN** their generation records (committed alongside the assets) are inspected
- **THEN** every generation record SHALL reference the style guide's version and apply its fixed prompt suffix

### Requirement: Predefined Starting Deck

The system SHALL define a single starting deck composition of 12 cards drawn from the 18-card catalog, used at the beginning of every new run in the friend-playtest phase, with the composition spanning all four schools.

#### Scenario: Starting deck initializes new runs

- **WHEN** a new run starts
- **THEN** the player's deck SHALL contain exactly the 12 cards specified by the starting deck composition

#### Scenario: Starting deck contains all four schools

- **WHEN** the starting deck composition is inspected
- **THEN** it SHALL contain at least 1 card from each of the four schools
