## ADDED Requirements

### Requirement: Centralized Design Tokens

The system SHALL define all visual design tokens (color palette, typography, spacing, shadow, border-radius, fallback assets) in a single source-of-truth module (CSS custom properties and Tailwind config), and all UI components SHALL consume tokens from this source rather than hardcoding values.

#### Scenario: Color palette is sourced from tokens

- **WHEN** any UI component renders a color
- **THEN** the color SHALL be derived from a named design token (e.g., `--color-surface-night`, `--color-school-vehicle`) rather than a literal hex value in the component file

#### Scenario: Updating a token propagates to all components

- **GIVEN** the design token for `--color-surface-night` is changed in the central tokens file
- **WHEN** the application is rebuilt
- **THEN** every component using that token SHALL render with the updated color without any per-component code change

### Requirement: Persona-5 + Yakuza Fusion Aesthetic

The system SHALL apply a visual style that combines the Persona 5 UI language (high contrast, angular cuts, sharp typography, bold accent colors) with Yakuza-style atmosphere (dark dominant background, neon accent highlights, photographic night-scene quality for backgrounds), across the home screen, play screen, combat screen, and codex screen.

#### Scenario: Dark surface dominates all primary screens

- **WHEN** any of the home, play, combat, or codex screens renders
- **THEN** the dominant background surface color SHALL be a dark token (lightness below 20%)

#### Scenario: Accent color is used for primary actions

- **WHEN** any primary call-to-action button is rendered
- **THEN** it SHALL use the high-saturation accent color token (Persona-style red or neon highlight)
- **AND** it SHALL use sharp (non-rounded or low-radius) edges consistent with the angular Persona 5 UI

### Requirement: Time-Axis Visual Component

The system SHALL render a visible time-axis component during a run that displays the in-game time progressing from 23:00 toward 05:00, with the visual emphasis (color, opacity, or animation) shifting as time advances to reinforce the deepening-night atmosphere.

#### Scenario: Time axis renders on play screen

- **WHEN** the play screen renders during a run
- **THEN** the time-axis component SHALL be visible and SHALL show the current in-game time

#### Scenario: Visual emphasis shifts at later hours

- **GIVEN** the in-game time is at or past 02:00
- **WHEN** the time-axis component is rendered
- **THEN** its visual treatment SHALL differ from its 23:00 treatment (via color shift, opacity shift, or active animation) as defined by the design tokens

### Requirement: Card Rendering with Scene-Vignette Illustration

The system SHALL render every card with its scene-vignette illustration (from `card-catalog`), the card name in dual-name format, the cost indicator, and the school's accent color, with a layout that matches the dimensions and visual hierarchy defined in the design tokens.

#### Scenario: Card displays illustration and metadata

- **WHEN** any card is rendered in the hand, in a reward selection, or in a catalog view
- **THEN** the card SHALL display its scene-vignette illustration, its dual-name, its cost indicator, and the school's accent color border or badge

#### Scenario: Card uses fallback when illustration fails

- **GIVEN** the card's illustration asset cannot be loaded
- **WHEN** the card is rendered
- **THEN** the system SHALL apply the design-token-defined fallback (school color block plus card name in large type) in place of the missing image

### Requirement: Motion Treatment for Key Interactions

The system SHALL apply animated transitions for exactly four key interaction moments: card entering the hand, card being played, node transition on the map, and dual-resource value change, using a motion library (Framer Motion) configured through the design tokens.

#### Scenario: Card entry animates into hand

- **WHEN** a card is added to the player's hand (draw, deal, or reward selection)
- **THEN** the card SHALL animate into its hand position rather than appearing instantly

#### Scenario: Resource change animates the bar

- **WHEN** the fuel or mind resource changes during play
- **THEN** the corresponding resource bar SHALL animate from the previous value to the new value rather than snapping
