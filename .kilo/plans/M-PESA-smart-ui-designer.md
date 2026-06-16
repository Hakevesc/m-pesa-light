# M-PESA Smart UI Designer — Plan

## Goal

Create a **Next.js Smart UI Designer** beside the existing HTML/CSS M-PESA Lehulum project without breaking the current app.

The new system should become the central place for:

- design tokens
- theme switching
- design system documentation
- component library documentation
- phone preview / presentation page
- flow navigation
- scenario and validation testing
- export options for Figma-related handoff
- gradual migration of existing screens into Next.js

The current HTML/CSS project should remain available until the Next.js version is stable.

---

## Current Project Summary

### Current technology

- Static HTML/CSS project
- Vite-based local development
- Express API server for AI screen generation
- Gemini API integration
- Figma export helper scripts
- Component catalog stored as JSON
- Existing design token CSS
- Existing component HTML snippets and CSS files

### Current visible files and areas

- `index.html` — app hub / presentation shell using sidebar + iframe
- `Lehulum Home.html` — home screen built from component templates
- `component-library.html` — component showcase page
- `studio.html` — AI screen builder UI
- `components/component-catalog.json` — current component catalog
- `styles/design-tokens.css` — current CSS custom property tokens
- `figma-export.js` — export current screen or all screens to Figma JSON
- `server.js` — Express API server
- `api/gemini-client.js` — Gemini screen/component generation
- `screens/ai-generated/` — generated AI screen outputs

---

## Current Feature Inventory

### 1. App hub / presentation shell

Located in `index.html`.

Current features:

- sidebar with grouped pages
- category collapse
- iframe-based screen preview
- page title/path toolbar
- mobile sidebar toggle
- global test scenario FAB
- test scenario panel that injects popups into the iframe
- page registry with categories:
  - Home
  - Bill Payment
  - Merchant Payment
  - Transactions
  - Auth
  - Account
  - Popup & Other

### 2. Existing screen groups

#### Home

- First Visit
- Lehulum Home
- App Walkthrough
- My QR Code
- Scan QR
- Verify Receipt

#### Bill Payment

- Pay Bill Menu
- Select Biller
- Enter Account
- Enter Amount
- Enter PIN
- Confirmation

#### Merchant Payment

- Pay Merchant Menu
- Enter Amount
- Enter PIN
- Confirmation

#### Transactions

- Send Money Menu
- Select Bank
- Enter Amount
- Enter PIN
- Confirmation
- Transaction Receipt
- Transaction Statement
- Transaction History
- Manage Statement
- Manage Statement Empty
- Statement PDF

#### Auth

- Signup
- Signup Home
- Sign Up Legacy
- Login
- Confirm Profile
- OTP Verification
- Create PIN
- Re-enter PIN
- PIN Locked
- Verify Birth Year
- Forgot PIN
- Forgot PIN Security Question
- SignUp Confirmation
- Fingerprint Setup

#### Account

- Account
- Account Detail
- Add Favourites
- Manage Favourites
- Favourites Empty
- Notification Center
- Notifications Empty
- Link Fayda SignUp
- Fayda Steps

#### Popup & Other

- Fayda Activation
- Fayda Activation Forced
- Enable Fingerprint
- SignUp PIN Popup
- Toast Message
- Update Notice PopUp
- Update Notice ToolTip
- Update Request Optional

---

### 3. Lehulum Home components

Located in `Lehulum Home.html` and `components/`.

Current reusable pieces:

- phone frame
- status bar
- welcome app bar
- balance card
- quick actions
- banner slider
- recent transactions
- QR speed-dial FAB

Interactive features:

- balance visibility toggle
- banner auto-slide
- banner dot navigation
- swipe navigation
- QR FAB speed-dial
- QR FAB navigation to My QR Code, Scan QR, Verify Receipt

### 4. Component library

Located in `component-library.html`.

Current documented components include:

- buttons
- QR speed-dial FAB
- status bar
- welcome app bar
- balance card
- quick actions
- banner slider
- recent transactions
- Fayda popup
- numeric keypad
- app bar variants
- avatar
- profile header
- profile info card
- text field
- toast variants
- tooltip
- icon + text buttons
- transaction confirmation card
- date picker
- auth header
- PIN input
- OTP input
- footer links
- empty state
- carousel dots
- statement/PDF row
- amount input
- phone input
- search box
- bank selector
- dropdown/select
- toggle/switch
- checkbox
- radio
- tabs
- transaction history row
- notification card
- favourites quick-send
- frequent contact
- account menu list
- account tier
- status pill
- dark toast

### 5. Design tokens

Located in `styles/design-tokens.css`.

Current tokens include:

- primary red
- primary container
- on-primary
- on-surface
- on-surface-low
- surface container
- gray
- success
- M-PESA red palette
- M-PESA red gradient
- body background
- font family
- font weights
- line height

### 6. Figma export

Located in `figma-export.js`.

Current capabilities:

- export current screen
- export all screens
- serialize DOM to Figma-compatible JSON
- include screenshots
- include color tokens
- detect components by `data-component`
- detect button/input/toggle/check/pill variants
- parse gradients
- parse shadows
- parse auto-layout from flexbox
- rasterize SVGs and images
- admin auth before export

Current limitation:

- It exports a Figma-ready JSON/spec file and screenshot.
- Real Figma sync requires a Figma plugin or Figma API integration.

### 7. AI Studio

Located in `studio.html`, `server.js`, `api/gemini-client.js`.

Current capabilities:

- chat-based screen generation
- Gemini API integration
- component-catalog-based generation
- missing component generation
- screen rendering
- save generated screens
- preview in phone frame

---

## Guiding Strategy

Do **not** rewrite the current HTML/CSS app in place.

Instead:

1. duplicate or create a new Next.js project beside the current project
2. build the design system foundation first
3. build the presentation/designer shell
4. build the component library page
5. migrate screens one by one
6. add APIs and business logic after the UI foundation is stable

Recommended Next.js mode for the first migration:

- **Pages Router** first, because it maps cleanly to the current file/page structure.
- Later, if needed, move to App Router.

---

## Phase 1 — Duplicate / Create Next.js Project

### Objective

Create a safe Next.js workspace without touching the current working HTML/CSS app.

### Proposed structure

```txt
M-PESA Lehulum/
  current-html/              # optional copy or keep current root as-is
  next-smart-ui-designer/    # new Next.js project
```

If not copying the whole project, the new Next.js project should reference or import:

- assets
- images
- logos
- avatars
- icons
- design token data
- screen/flow metadata

### Initial dependencies

Recommended:

- `next`
- `react`
- `react-dom`
- `typescript` optional but strongly recommended
- `next-themes`
- `lucide-react`
- `zustand` or React Context for designer state
- `zod` for validating token/component/flow JSON
- `html-to-image` or similar for PNG export
- `file-saver` optional for downloads

---

## Phase 2 — Design Token System

### Objective

Create one source of truth for visual variables.

### Token categories

#### Color

- primary
- primary dark
- primary darker
- primary container
- on-primary
- on-primary-container
- surface
- surface container
- background
- on-background
- on-surface
- on-surface-low
- success
- warning
- error
- info
- stroke
- overlay

#### Typography

- font families
- display
- title
- h1
- h2
- h3
- body large
- body
- body small
- caption
- label
- line height
- letter spacing
- font weight

#### Spacing

- 4px grid
- xs
- sm
- md
- lg
- xl
- 2xl

#### Radius

- none
- xs
- sm
- md
- lg
- xl
- full
- phone frame radius

#### Shadow

- none
- soft
- medium
- strong
- modal
- FAB

#### Blur

- none
- light
- medium
- strong

#### Stroke

- hairline
- default
- strong
- focus

#### Icon system

- icon size tokens
- icon stroke width
- icon library registry
- icon naming convention

#### Avatar system

- image avatar
- initials avatar
- size variants
- border radius
- fallback behavior

#### Image / logo system

- M-PESA logo
- Fayda logo
- bank logos
- placeholder handling
- image fallback

#### Effects

- hover
- active
- pressed
- disabled
- focus ring
- elevation
- backdrop blur

### Token file format

Use JSON or TypeScript.

Example:

```ts
export type DesignTheme = {
  id: 'light' | 'dark';
  label: string;
  colors: Record<string, string>;
  typography: Record<string, TypographyToken>;
  spacing: Record<string, string>;
  radius: Record<string, string>;
  shadow: Record<string, string>;
  blur: Record<string, string>;
  stroke: Record<string, string>;
};
```

### CSS variable output

Tokens should generate CSS variables:

```css
[data-theme='light'] {
  --color-primary: #FE353D;
  --color-on-primary: #FFF1F2;
  --color-surface: #FFFFFF;
}

[data-theme='dark'] {
  --color-primary: #FF5A62;
  --color-on-primary: #2B0003;
  --color-surface: #121212;
}
```

---

## Phase 3 — Theme Switcher

### Objective

Allow global switching between light and dark mode.

### Requirements

- light/dark theme toggle
- persisted theme in `localStorage`
- JSON-based token import/export
- ability to override tokens
- optional reset to default
- optional export token JSON for design handoff

### Implementation options

Recommended:

- use `next-themes` for simple theme switching
- use CSS variables for all token values
- store custom token overrides in JSON
- validate token JSON with `zod`

### Theme switcher UI

Should include:

- theme name
- preview swatch
- active theme indicator
- export tokens button
- import tokens button
- reset theme button

---

## Phase 4 — Design System Page

### Objective

Create the main source-of-truth page for all design variables.

### Required sections

#### 1. Colors

- primary palette
- semantic colors
- surface/background colors
- feedback colors
- stroke colors
- copyable hex values
- light/dark comparison

#### 2. Typography

- display
- title
- h1
- h2
- h3
- body
- body small
- caption
- label
- editable sample text
- font size/weight/line-height preview

#### 3. Icons

- icon registry
- icon size variants
- icon stroke width
- searchable icon list
- icon copy/export

#### 4. Avatars

- image avatar
- initials avatar
- size variants
- fallback behavior

#### 5. Images / Logos

- M-PESA logo
- Fayda logo
- bank logos
- image placeholder behavior
- logo size variants

#### 6. Effects

- shadows
- blur
- overlays
- focus rings
- hover/active states

#### 7. Stroke Style

- hairline
- default
- strong
- focus ring
- divider style

#### 8. Token Editor

- edit token values
- live preview
- save/import/export JSON
- reset to defaults

---

## Phase 5 — Presentation Page

### Objective

Create the smart preview/designer page that replaces the current `index.html` presentation shell.

### Layout

#### Left sidebar

Tabs/categories:

- Home
- Design System
- Component Library
- Flows
- Screens
- Popups
- AI Studio
- Exports

#### Center

Phone preview element:

- 360px/390px mobile frame
- phone chrome
- selected screen rendered inside
- responsive container
- optional desktop preview mode

#### Top right

Controls:

- export dropdown
- flow chooser dropdown
- screen search
- theme toggle
- fullscreen preview

#### Bottom right

Scenario / validation button:

- floating action button
- opens scenario panel
- choose scenario
- run scenario on current page

### Export dropdown options

Initial options:

- Export current screen JSON
- Export current screen PNG
- Export tokens JSON
- Export component spec
- Export Figma-compatible JSON

Important note:

- Actual Figma sync requires Figma API or plugin integration.
- The first version should focus on JSON/PNG/spec export.

### Flow chooser behavior

A flow is a sequence of screens.

Example:

```ts
{
  id: 'send-money',
  label: 'Send Money',
  icon: 'send',
  screens: [
    { id: 'send-money-menu', path: '/flows/send-money/menu' },
    { id: 'select-recipient', path: '/flows/send-money/select-recipient' },
    { id: 'enter-amount', path: '/flows/send-money/enter-amount' },
    { id: 'confirm-transaction', path: '/flows/send-money/confirm' },
    { id: 'transaction-success', path: '/flows/send-money/success' }
  ]
}
```

When a flow is selected:

1. load the first screen of that flow
2. update sidebar state
3. show flow breadcrumbs
4. allow next/previous screen navigation

### Scenario / validation runner

The scenario runner should allow testing UI states on the current screen.

Example scenarios:

- Update Notice Popup
- Update Notice Tooltip
- Fayda Activation
- Fayda Activation Forced
- Enable Fingerprint
- SignUp PIN Popup
- Transaction Success
- Toast Success
- Toast Error
- Empty State
- Loading State
- Validation Error
- Network Error
- PIN Locked
- Low Balance

Implementation model:

```ts
type Scenario = {
  id: string;
  name: string;
  description: string;
  targetScreens?: string[];
  run: () => void;
};
```

The scenario runner should:

- open from bottom-right FAB
- list scenarios
- run selected scenario
- show modal/popup/toast/overlay
- allow closing scenario UI
- optionally validate expected state

---

## Phase 6 — Component Library Page

### Objective

Create a Storybook-like component library inside the Next.js app.

### Requirements

Each component should show:

- name
- description
- props
- variants
- states
- token dependencies
- live preview
- code usage example
- Figma export metadata

### Button component requirements

Button variants:

- normal
- half rectangle
- circle
- text button
- link button
- icon button
- full width
- ghost
- danger
- success

Button states:

- default
- hover
- active
- disabled
- inactive
- loading
- selected
- focused

Button props:

- label
- icon
- iconPosition
- variant
- size
- shape
- fullWidth
- disabled
- loading
- href
- onClick

### Component categories

- actions
  - button
  - icon button
  - FAB
  - quick action
- forms
  - text field
  - amount input
  - phone input
  - PIN input
  - OTP input
  - keypad
  - checkbox
  - radio
  - toggle
  - select/dropdown
  - date picker
- navigation
  - header nav
  - app bar
  - tabs
  - sidebar
  - bottom navigation
- cards
  - balance card
  - transaction card
  - receiver card
  - profile card
  - notification card
  - statement/PDF row
- feedback
  - modal
  - toast
  - tooltip
  - empty state
  - loading state
- media
  - avatar
  - image
  - logo
  - banner
- overlay
  - modal
  - popup
  - drawer
  - bottom sheet
- layout
  - phone frame
  - screen shell
  - section
  - divider
  - grid

---

## Phase 7 — Flow and Screen Registry

### Objective

Create structured data for all screens and flows.

### Screen registry

Each screen should have:

```ts
type Screen = {
  id: string;
  title: string;
  path: string;
  group: string;
  icon: string;
  tags?: string[];
  status: 'legacy-html' | 'next-component' | 'design-system';
  sourceFile?: string;
};
```

### Flow registry

Each flow should have:

```ts
type Flow = {
  id: string;
  label: string;
  description: string;
  icon: string;
  firstScreenId: string;
  screens: string[];
};
```

### Initial flows

- First Visit / Onboarding
- Login
- Sign Up
- PIN Setup
- Forgot PIN
- Lehulum Home
- Send Money
- Transfer to Bank
- Merchant Payment
- Bill Payment
- QR Actions
- Verify Receipt
- Account Settings
- Favourites
- Notifications
- Statements
- Fayda Link
- Fingerprint Setup

---

## Phase 8 — Migrate Existing Screens to Next.js

### Objective

Move current HTML/CSS pages into Next.js one at a time.

### Migration order

Recommended order:

1. design system page
2. presentation page
3. component library page
4. Lehulum Home
5. auth screens
6. account screens
7. transaction flows
8. payment flows
9. popup/overlay screens
10. statement/PDF screens
11. AI Studio

### Migration approach

For each screen:

1. identify repeated HTML blocks
2. convert them into React components
3. move CSS into token/component styles
4. replace inline handlers with React handlers
5. replace `window.location.href` with Next.js routing
6. preserve assets paths
7. add screen metadata
8. test in presentation page
9. mark screen as migrated

### Important

Do not migrate all screens at once.

The old HTML app should remain usable until each screen is replaced.

---

## Phase 9 — API and System Building

### Objective

After the UI foundation is stable, add real system behavior.

### Future API areas

#### Auth

- login
- logout
- signup
- OTP verification
- PIN creation
- PIN re-entry
- forgot PIN
- fingerprint setup

#### Account

- profile
- account detail
- favourites
- notifications
- language
- security
- statement settings

#### Transactions

- send money
- transfer to bank
- merchant payment
- bill payment
- transaction confirmation
- receipt generation
- transaction history
- statement PDF

#### QR

- my QR code
- scan QR
- verify receipt

#### Fayda

- link Fayda
- Fayda steps
- Fayda activation
- forced activation

#### Notifications

- notification center
- update notice
- forced update
- optional update
- toast messages

### API implementation options

- Next.js API routes
- Express backend
- separate backend service
- mock API first, real API later

Recommended:

- start with mock/local API
- define clear request/response types
- move to real API when flows are stable

---

## Implementation Requirements

### Files/data to create

```txt
next-smart-ui-designer/
  app/ or pages/
  components/
    ui/
    design-system/
    presentation/
    scenarios/
    flows/
  data/
    themes.json
    tokens.json
    components.json
    screens.json
    flows.json
    scenarios.json
  lib/
    tokens.ts
    themes.ts
    flows.ts
    scenarios.ts
    exports.ts
  styles/
    globals.css
    tokens.css
```

### Required data models

- `DesignToken`
- `DesignTheme`
- `ComponentDefinition`
- `ComponentVariant`
- `ComponentState`
- `ScreenDefinition`
- `FlowDefinition`
- `ScenarioDefinition`
- `ExportDefinition`

### Required UI pages

- `/design-system`
- `/presentation`
- `/component-library`
- `/flows/[flowId]/[screenId]`
- `/screens/[screenId]`
- `/exports`
- `/ai-studio` later

### Required utilities

- token import/export
- theme persistence
- screen renderer
- flow navigator
- scenario runner
- export JSON/PNG
- component metadata builder

---

## Acceptance Criteria

### Design system page

- shows all colors
- shows typography scale
- shows icons
- shows avatars
- shows images/logos
- shows shadows/blur/stroke effects
- allows theme switching
- allows token JSON import/export
- updates live when tokens change

### Presentation page

- has phone preview
- has sidebar tabs/categories
- has screen links
- has flow chooser
- selects first screen when flow is chosen
- has export dropdown
- has bottom-right scenario button
- can run scenario on current screen

### Component library page

- shows all components
- shows props
- shows variants
- shows states
- shows token dependencies
- documents button variants and states
- documents all major component categories

### Migration

- existing HTML app still works
- Next.js app runs independently
- at least core pages are migrated first
- no screen is migrated before design system foundation is ready

---

## Risks and Notes

### Figma export

The current project can export Figma-compatible JSON and screenshots.

For real Figma sync, additional work is required:

- Figma plugin
- Figma REST API
- authentication
- file/page creation
- node insertion
- component master creation

### Figma import plugin output

Figma-generated HTML/CSS may be messy.

Do not blindly convert it into React.

Instead:

- use it as visual reference
- rebuild clean React components
- keep design tokens as the source of truth

### Current component library

The existing `component-library.html` already has strong structure.

The Next.js version should preserve:

- component cards
- phone-width preview
- component index
- export-ready metadata
- Figma-related data attributes

### Best first milestone

The first milestone should not be full app migration.

The first milestone should be:

1. Next.js project
2. token system
3. theme switcher
4. design system page
5. presentation page
6. component library page

After that, migrate screens one by one.
