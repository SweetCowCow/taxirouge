## ADDED Requirements

### Requirement: Single Run Lifecycle

The system SHALL model a single play session ("run") as a state machine that begins at the start node (23:00 departure), traverses 5 to 6 intermediate nodes, ends with one boss node, and terminates in exactly one of three ending types: cleared, breakdown, or vanished.

#### Scenario: New run initializes from the start

- **WHEN** the player starts a new run from the home page
- **THEN** the system SHALL create a fresh `RunState` with `currentTime` set to 23:00, full fuel (100), full mind (50), and a generated map of 5 to 6 intermediate nodes followed by 1 boss node
- **AND** the system SHALL initialize the player's deck with the predefined starting deck composition

#### Scenario: Run reaches a terminal state on boss clear

- **GIVEN** the player has defeated the boss node enemy
- **WHEN** the post-boss flow completes
- **THEN** the system SHALL transition the run to the cleared ending and SHALL select a cleared-ending text from the predefined pool

#### Scenario: Run reaches breakdown ending on fuel depletion

- **WHEN** the player's fuel resource reaches 0 at any point during the run
- **THEN** the system SHALL transition the run to the breakdown ending state and SHALL select a breakdown-ending text from the predefined pool

#### Scenario: Run reaches vanished ending on mind depletion

- **WHEN** the player's mind resource reaches 0 at any point during the run
- **THEN** the system SHALL transition the run to the vanished ending state and SHALL select a vanished-ending text from the predefined pool

### Requirement: Node Map with Mixed Node Types

The system SHALL generate a linear node map of 5 to 6 intermediate nodes plus 1 boss node, where intermediate nodes SHALL be drawn from the types passenger-narrative (怪客), passenger-combat (惡客), passenger-mixed (熟客), and gas-station, with at least one gas-station node guaranteed per run.

#### Scenario: Map contains required node mix

- **WHEN** a new run's map is generated
- **THEN** the system SHALL produce a sequence of 5 to 6 intermediate nodes followed by exactly 1 boss node
- **AND** the sequence SHALL contain at least 1 gas-station node
- **AND** the sequence SHALL contain at least 2 combat-bearing nodes (passenger-combat, passenger-mixed, or boss)
- **AND** the sequence SHALL contain at least 2 narrative-bearing nodes (passenger-narrative or passenger-mixed)

##### Example: a valid 6-node map sequence

- **GIVEN** the generator produces a 6-node intermediate run
- **WHEN** the resulting node types are inspected in order
- **THEN** a valid output is: `[narrative, combat, gas-station, mixed, combat, narrative, boss]`

### Requirement: Time Axis Display

The system SHALL display the current in-game time on the play screen, advancing from 23:00 toward 05:00 at each node transition, and the display SHALL be visible at all times during a run (combat, narrative, map, and ending screens).

#### Scenario: Time advances on node completion

- **GIVEN** the current run time is 23:00 and the player completes the first node
- **WHEN** the system transitions to the next node
- **THEN** the system SHALL advance the displayed time by a fixed interval (between 30 and 60 minutes) and SHALL persist the new time in the run state

#### Scenario: Time display is visible during combat

- **GIVEN** the player is in a combat screen
- **WHEN** the screen is rendered
- **THEN** the current in-game time SHALL be visible in the UI

### Requirement: Dual Resources (Fuel and Mind)

The system SHALL maintain two independent player resources, fuel (油錶, max 100) and mind (精神, max 50), with each resource modifiable by node-specific effects (gas-station refills, narrative choices, combat damage) and clamped to the range [0, max].

#### Scenario: Gas-station node refills fuel

- **GIVEN** the player enters a gas-station node with fuel below maximum
- **WHEN** the player resolves the gas-station interaction
- **THEN** the system SHALL increase fuel by a node-defined amount, clamped to a maximum of 100
- **AND** the system SHALL allow the player to remove (delete) one card from the deck

#### Scenario: Mind resource is clamped at zero

- **GIVEN** a narrative choice reduces mind by 10
- **WHEN** the current mind value is 5
- **THEN** after applying the reduction the stored mind value SHALL be 0 (not -5)
- **AND** the system SHALL trigger the vanished-ending transition

##### Example: clamping table for boundary cases

| Current Value | Operation     | Resulting Value | Notes                         |
| ------------- | ------------- | --------------- | ----------------------------- |
| fuel=80       | refill +30    | fuel=100        | clamped to max 100            |
| fuel=15       | damage -25    | fuel=0          | clamped to 0, ends in breakdown |
| mind=10       | damage -3     | mind=7          | normal in-range subtraction   |
| mind=2        | damage -10    | mind=0          | clamped to 0, ends in vanished |

### Requirement: Resumable Run State

The system SHALL persist run state to local storage after each node completes, such that closing and reopening the browser tab resumes the run at the post-node-completion state of the most recently completed node.

#### Scenario: Resume after browser reload

- **GIVEN** the player has completed nodes 1 and 2 of a 6-node run
- **WHEN** the player closes the browser tab and reopens `/play` later
- **THEN** the system SHALL restore the run with all node-1 and node-2 outcomes applied
- **AND** the player SHALL begin from the entry point of node 3

#### Scenario: Mid-combat interruption does not corrupt the run

- **GIVEN** the player closes the tab in the middle of a combat (after entering a node but before finishing it)
- **WHEN** the player reopens `/play`
- **THEN** the system SHALL restart the interrupted node from its entry point (not from mid-combat) using the run state persisted at the previous node completion
