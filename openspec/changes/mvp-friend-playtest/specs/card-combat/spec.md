## ADDED Requirements

### Requirement: Turn-Based Combat Loop

The system SHALL implement a turn-based card combat loop where the player draws cards, spends energy (神識) to play cards, ends the turn, and the enemy then resolves its action according to a deterministic behavior pattern.

#### Scenario: Combat starts with a fresh hand and full energy

- **WHEN** combat begins for a node
- **THEN** the system SHALL draw 5 cards from the player's deck into the hand
- **AND** the system SHALL set the player's energy (神識) to 3

#### Scenario: Player plays a card and energy is deducted

- **GIVEN** the player has at least one card in hand whose cost does not exceed current energy
- **WHEN** the player plays that card
- **THEN** the system SHALL apply the card's declared effects to the combat state
- **AND** the system SHALL deduct the card's cost from current energy
- **AND** the system SHALL move the played card to the discard pile

#### Scenario: Player cannot play a card with insufficient energy

- **GIVEN** the player has a card in hand whose cost exceeds current energy
- **WHEN** the player attempts to play that card
- **THEN** the system SHALL reject the action and leave the combat state unchanged

#### Scenario: Ending the turn triggers enemy action

- **WHEN** the player ends the current turn
- **THEN** the system SHALL execute the enemy's next scripted action according to its behavior pattern
- **AND** the system SHALL discard the player's remaining hand
- **AND** the system SHALL refill the player's hand to 5 cards and reset energy to 3 for the next turn

### Requirement: Three Enemy Behavior Patterns

The system SHALL provide exactly three enemy behavior patterns for the friend-playtest phase: charging (deterministic damage to fuel), cursing (deterministic damage to mind), and dialoguing (vulnerable to dialogue-school cards, otherwise weak attacks).

#### Scenario: Charging enemy attacks fuel each turn

- **GIVEN** combat against a charging-pattern enemy
- **WHEN** the enemy's turn resolves
- **THEN** the system SHALL reduce the player's fuel resource by the enemy's declared attack value

#### Scenario: Cursing enemy attacks mind each turn

- **GIVEN** combat against a cursing-pattern enemy
- **WHEN** the enemy's turn resolves
- **THEN** the system SHALL reduce the player's mind resource by the enemy's declared attack value

#### Scenario: Dialoguing enemy can be subdued by dialogue-school cards

- **GIVEN** combat against a dialoguing-pattern enemy
- **WHEN** the player plays a dialogue-school (話術) card with subdue effect that meets the enemy's threshold
- **THEN** the system SHALL end combat with a non-damage victory outcome

### Requirement: Combat Termination Conditions

The system SHALL end combat when any of the following conditions occur: enemy HP reaches 0, player fuel reaches 0, player mind reaches 0, or a special non-damage victory effect resolves.

#### Scenario: Enemy defeat ends combat with victory

- **WHEN** an enemy's HP reaches 0 or below during combat resolution
- **THEN** the system SHALL end combat with a victory outcome
- **AND** the system SHALL present a reward selection screen

#### Scenario: Fuel depletion ends combat with breakdown

- **WHEN** the player's fuel resource reaches 0 or below
- **THEN** the system SHALL end combat immediately
- **AND** the system SHALL transition the run to the breakdown (失蹤) ending flow

#### Scenario: Mind depletion ends combat with breakdown

- **WHEN** the player's mind resource reaches 0 or below
- **THEN** the system SHALL end combat immediately
- **AND** the system SHALL transition the run to the vanished (瘋了) ending flow

### Requirement: Combat Reward Selection

After a victory, the system SHALL present the player with two card choices and a skip option that grants a non-card reward, and exactly one option SHALL be selected before returning to the node map.

#### Scenario: Two-card-choice reward after victory

- **WHEN** combat ends with a victory outcome
- **THEN** the system SHALL present exactly two randomly drawn card options
- **AND** the system SHALL present a skip option labeled to grant a non-card reward
- **AND** the player SHALL select exactly one of the three options before the system returns the player to the node map

#### Scenario: Selecting a card adds it to the deck

- **WHEN** the player selects one of the two offered cards
- **THEN** the system SHALL add the selected card to the player's deck
- **AND** the system SHALL persist the updated deck to the run state

### Requirement: Pure-Function Combat Reducer

The system SHALL implement combat state transitions as a pure reducer function `combatReducer(state, action) => newState` such that the same state and action input always produce the same new state output, with no side effects.

#### Scenario: Same input produces same output

- **GIVEN** any combat state S and any combat action A
- **WHEN** `combatReducer(S, A)` is invoked twice
- **THEN** both invocations SHALL return structurally equal new states
- **AND** neither invocation SHALL mutate the input state S

##### Example: idempotent reducer call

- **GIVEN** state `{ hp: 30, energy: 3, hand: [card1] }` and action `{ type: 'play-card', cardId: card1.id, cost: 1 }`
- **WHEN** `combatReducer` is called twice with the same arguments
- **THEN** both return values equal `{ hp: 30, energy: 2, hand: [], discard: [card1] }` (with card effects applied)
- **AND** the original state object retains `energy: 3` and `hand: [card1]`
