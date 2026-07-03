# Implementation Plan: Panipat 1761 Expansion

This document details the step-by-step phases to implement high-value historical strategy features in **Panipat 1761: Shattered Dreams**.

---

## Phase 1: Dynamic Weather & Seasonal Attrition Engine
*   **Logistics Seasonal Modifiers**: Implement weather and seasonal effects directly in `Logistics.tsx` (e.g. Winter Freeze, Monsoon Swell, Scorching Heat).
*   **Dynamic Attrition**: When active, these conditions apply gold or provision upkeep modifiers or reduce core morale unless the player purchases specialized "Winter Cloaks" or "Monsoon Tarps".
*   **3D Weather Filters**: Add animated rain, snow, and dust storm overlays inside `BattleScene.tsx` using modern CSS transitions and canvas modifiers to visually reflect selected conditions.

## Phase 2: Diplomatic Coalition & Secret Treaties (Darbar Council)
*   **The Darbar Council Screen**: Introduce a new diplomacy state or sub-screen simulating negotiations with key historical allies (e.g., Shuja-ud-Daula of Awadh, Suraj Mal of the Jats).
*   **Interactive Treaty Grid**: Present diplomatic cards where the player can negotiate alliances using gold, territorial compromises, or military pledges.
*   **Fuzzy Alliance Logic**: Dynamic results determined by a combination of current treasury strength and active choice paths.

## Phase 3: Grand Academy: Flintlock Barracks Drill Simulator
*   **Flintlock Drill Game**: A rhythm-based timing minigame in `LMS.tsx` under a new **"🎯 Barracks Drill"** tab. Mimics 18th-century flintlock rank-fire. Correctly timed space/click releases boost player "Drill Proficiency" and combat modifiers.
*   **Artillery Calibration**: A mathematical slider puzzle to align mortar fire angles based on varying winds and distances, permanently boosting Ibrahim Gardi's battery impact in real tactical battles.

## Phase 4: Historical Chronicles & Battle Replay Analyzer
*   **Peshwa's Despatch Book**: Implement a scrollable chronological timeline chronicling choices, battles won, and resources spent across the campaign.
*   **Interactive Sandbox Battle Analyzer**: A vector map replay display mapping past tactical sandbox outcomes to guide strategic foresight.

---

## Phase 5: Royal Intelligence: Harkara Spy Networks & Cipher Decryption Deck
*   **Harkara Strategic Spies**: Recruited scouts positioned at 4 historical gateways (Yamuna Bed, Sonepat Plains, Delhi Highway, Panipat Saltmarshes). Positioning spies costs Gold, unlocking vital regional intel reports and strategic combat multipliers.
*   **Decryption Scriptorium**: An interactive Caesar-shift key decryption deck parsing secret correspondence from Najib-ud-Daula, Ahmad Shah, and Rohilla leaders. Solving shifts confers extensive treasury rewards and morale surges.

---

## Status Ledger
- [x] Phase 1: Dynamic Weather & Seasonal Attrition Engine (Completed)
- [x] Phase 2: Diplomatic Coalition & Secret Treaties (Completed)
- [x] Phase 3: Grand Academy: Flintlock Barracks Drill Simulator (Completed)
- [x] Phase 4: Historical Chronicles & Battle Replay Analyzer (Completed)
- [x] Phase 5: Royal Intelligence: Harkara Spy Networks & Cipher Decryption Deck (Completed)
