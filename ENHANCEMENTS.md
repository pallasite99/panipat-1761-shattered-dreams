# Implementation Plan - Grand Expansion: Five Popular Strategy Features

We will implement all five requested features to transform **Panipat: 1761** into an extremely engaging, interactive, and high-visibility strategic experience.

---

## Proposed Changes

### 1. Dynamic AI Council Debates (Visual Novel Mode)
*   **Target File**: [WarCouncil.tsx](file:///c:/Users/salil/Downloads/panipat_-1761_updated/src/screens/WarCouncil.tsx)
*   **Implementation**:
    *   Create a **Parchment Debate Room** interface. 
    *   Integrate Gemini via the existing `@google/genai` environment settings. Send the current campaign stage, treasury resources, and army morale as a prompt.
    *   Instruct the model to generate a JSON response representing a debate. It will contain dialog lines from 3 different faction generals arguing opposite approaches (e.g., Aggressive charge vs. Defensive stand vs. Supply conservation).
    *   Render this in a visual novel layout: text writing animations, general portrait sigils, and action selection buttons.
    *   Siding with a general applies mechanical effects (e.g., siding with Gardi gives +20% artillery precision but costs 10,000 Gold Mohurs).

### 2. Interactive Canvas-Based Artillery Calibration
*   **Target File**: [ArtilleryCalibration.tsx](file:///c:/Users/salil/Downloads/panipat_-1761_updated/src/components/ArtilleryCalibration.tsx)
*   **Implementation**:
    *   Replace static slider math with a fully interactive **HTML5 `<canvas>` minigame**.
    *   Render a stylized 2D brass cannon on the left and a target fortification or regiment on the right.
    *   Include sliders for:
        *   **Angle / Elevation** (rotates the cannon barrel on the canvas).
        *   **Powder Charge** (initial velocity of the shot).
    *   Render a dynamic **Wind Indicator** arrow.
    *   When the player clicks "FIRE", draw a frame-by-frame physics trajectory of the cannonball subject to gravity and wind forces, culminating in an animated explosion. 
    *   Calculate hits, splash damage, and morale loss based on target proximity.

### 3. Timing-Based Reflex Sword Dueling
*   **Target File**: [SwordDuelArena.tsx](file:///c:/Users/salil/Downloads/panipat_-1761_updated/src/components/SwordDuelArena.tsx)
*   **Implementation**:
    *   Overhaul the cards-based duel into an active reflex-based combat system.
    *   Implement health, stamina, and stun bars for both player and opponent.
    *   Create three directional lanes (Left, Center, Right) for attacking and blocking.
    *   **Combat Loop**:
        *   The opponent winds up an attack in one direction, displaying a visual highlight.
        *   The player has a brief timer (e.g., 700ms–1000ms, depending on difficulty) to hit the corresponding directional Block button.
        *   A successful block parries the blow and stuns the opponent, creating an opening for the player to attack.
        *   Add flash animations, sword clash sparks, and screen shake effects.

### 4. Hall of Records: Leaderboard & Achievements
*   **Target Files**: [MainMenu.tsx](file:///c:/Users/salil/Downloads/panipat_-1761_updated/src/screens/MainMenu.tsx) and [Victory.tsx](file:///c:/Users/salil/Downloads/panipat_-1761_updated/src/screens/Victory.tsx)
*   **Implementation**:
    *   Add a **"Hall of Records"** button to the Main Menu.
    *   Create a tabbed interface containing:
        *   **Mock Global Leaderboard**: High-scoring historical profile runs (e.g., Peshwa's Expedition, Durrani Swift Strike) for a competitive feeling.
        *   **Local High Scores**: Track the player's best campaign records (highest treasury, fewest casualties, fastest completion).
        *   **Achievements Panel**: Track and display persistent milestones unlocked in `localStorage` (e.g., *Master Artillerist*, *Grand Coalition Maker*, *Against All Attrition*).

### 5. Multiplayer Lobby & Battle Simulator
*   **Target File**: [WarCouncil.tsx](file:///c:/Users/salil/Downloads/panipat_-1761_updated/src/screens/WarCouncil.tsx)
*   **Implementation**:
    *   Add an interactive **Multiplayer Battle Room** option.
    *   Build a simulated lobby interface displaying a lists of active multiplayer rooms, server regions, and live latencies (Ping).
    *   Include a simulated player chat panel and a "Ready Up" stage.
    *   Render a turn-based multiplayer battle card screen where the player deploys units and counters against a simulated remote player, providing detailed event log feedback (e.g., *"Opponent deployed Durrani Camel Corps"*).

### 6. Tension Ticker & Battle Audio FX
*   **Target Files**: [StrategicMap.tsx](file:///c:/Users/salil/Downloads/panipat_-1761_updated/src/screens/StrategicMap.tsx) and [audioSystem.ts](file:///c:/Users/salil/Downloads/panipat_-1761_updated/src/utils/audioSystem.ts)
*   **Implementation**:
    *   **Marquee Ticker**: Render a scrolling vintage newspaper/ticker style banner at the top of the Strategic Map screen. Feed it dynamic historical alerts based on the current campaign stage (e.g., *"Najib-ud-Daula builds bridge across the Yamuna..."*).
    *   **Audio Triggers**: Add military trumpet, war drums, and wind sound cues to the audio system. Play these sound effects when combat begins, when provisions drop, or when the council reaches a stalemate.

---

## Verification Plan

### Automated Tests
- Run `npm run lint` and `npm run build` after changes are complete to verify TypeScript type safety and compilation success.

### Manual Verification
- Test all five screens to ensure that:
  - The Artillery Canvas draws trajectories smoothly and calculates hits correctly.
  - The Sword Arena parry windows and strike states update properly.
  - The AI council visual novel retrieves, parses, and formats the debates correctly.
  - Leaderboards, achievements, and multiplayer simulators trigger and persist state accurately.
