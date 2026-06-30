# 📜 Shaniwar Wada Seminary (Student LMS)
## *Comprehensive Systems Integration & Pedagogical Blueprint*

This document provides a highly detailed systems planning blueprint, pedagogical structure, and implementation path for the **Shaniwar Wada Seminary (Student LMS)**, representing the academic engine of *Panipat 1761: Shattered Dreams*.

---

## 🏛️ 1. System Architecture Overview

The Seminary is engineered to decouple high-engagement video game mechanics from academic progress tracking and quantitative grading models. It utilizes an asynchronous event-driven state model to coordinate game state alerts with student learning goals.

```
                  ┌─────────────────────────────────────────┐
                  │          GAMEPLAY MINI-GAMES            │
                  │   (Artillery, Cavalry, Sword Duel)     │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼ Dispatch Event
                  ┌─────────────────────────────────────────┐
                  │             LMSEventBus.ts              │
                  │   (Coordinates gameplay milestones)     │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼ Listen & Update State
                  ┌─────────────────────────────────────────┐
                  │            LMSProvider.tsx              │
                  │       (Active Session context)          │
                  └──────────┬───────────────────┬──────────┘
                             │                   │
                             ▼ Commit Local      ▼ Sync Telemetry
  ┌─────────────────────────────────────────┐   ┌─────────────────────────────────────────┐
  │             LearnerStore.ts             │   │             Express Backend             │
  │     (Standard persistent client)        │   │          (API logs, diagnostics)        │
  └─────────────────────────────────────────┘   └─────────────────────────────────────────┘
```

### 🧱 Architectural Subsystems
1.  **Context Provider (`src/lms/LMSProvider.tsx`)**: The state machine representing the active learner's session, tracking active lessons, unlocked modules, sandbox setups, and quiz score matrices.
2.  **Event Broker (`src/lms/LMSEventBus.ts`)**: An asynchronous event channel allowing performance metrics from gameplay modules (e.g., scoring a perfect calculation in `ArtilleryCalibration.tsx` or executing a flawless flanking maneuver in the simulation canvas) to trigger lesson completions and unlock high-level scholar papers.
3.  **Local Storage Engine (`src/lms/LearnerStore.ts`)**: Client-side storage layer utilizing durable JSON configurations to persist the learner's track history, certificate credentials, and decision telemetry profiles.

---

## 📖 2. Dual-Pathway Interactive Syllabus

The seminary structures 10 comprehensive masterclasses split across two distinct academic profiles:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SHANIWAR WADA ACADEMY                            │
└──────────────────────┬──────────────────────────────┬───────────────────────┘
                       │                              │
                       ▼ [Pathway 1]                  ▼ [Pathway 2]
         ┌───────────────────────────┐  ┌───────────────────────────┐
         │       STUDENT TRACK       │  │       SCHOLAR TRACK       │
         │   (Chronicles & Tactics)  │  │  (Geopolitics & Letters)  │
         └─────────────┬─────────────┘  └─────────────┬─────────────┘
                       │                              │
                       ├─ Lesson 1: Maratha Hegemony  ├─ Lesson 6: Rohilla Alliances
                       ├─ Lesson 2: Mobilization      ├─ Lesson 7: Financial Attrition
                       ├─ Lesson 3: River Crossings   ├─ Lesson 8: Intercepted Letters
                       ├─ Lesson 4: Cannon Ballistics ├─ Lesson 9: Ibrahim Gardi Role
                       └─ Lesson 5: Jan 14 Collision  └─ Lesson 10: Aftermath & Legacy
```

### 📘 The Student Track (Core History & Military Strategy)
Focused on chronological events, troop formations, and key tactical milestones of the campaign:
*   **Lesson 1: The Maratha Hegemony (1758-1760)**
    *   *Syllabus Content*: The Peshwatva's expansion to the Indus River, the capture of Attock, and the political friction with the Durrani empire.
    *   *Gameplay Integration*: Traversal of early-stage campaign locations on the Strategic Map.
*   **Lesson 2: The Pune Mobilization & Logistics**
    *   *Syllabus Content*: Gathering of the Huzurat elite cavalry, Ibrahim Khan Gardi’s French-disciplined musketeer corps, and the massive logistical train of camp followers.
    *   *Gameplay Integration*: Interactive allocation of Mohurs inside `CampSupplyTycoon.tsx`.
*   **Lesson 3: The Northern Rivers Barrier**
    *   *Syllabus Content*: Crossing of the Yamuna, Shinde's sacrificial rear-guard action, and the physical isolation of the Maratha vanguard north of Delhi.
    *   *Gameplay Integration*: Complete Stage VI of the campaign map.
*   **Lesson 4: Eighteenth-Century Artillery Ballistics**
    *   *Syllabus Content*: The transition from heavy brass field guns to swift camel-mounted Zamburaks; the physics of windage, powder ratio, and temperature in smoothbore guns.
    *   *Gameplay Integration*: Achieving >85% accuracy on the interactive math sandbox `ArtilleryCalibration.tsx`.
*   **Lesson 5: January 14, 1761: The Final Collision**
    *   *Syllabus Content*: Hour-by-hour operational breakdown of the battle: Ibrahim Khan’s early success, the tragic cavalry charge of the Bhonsle and Scindia wings, and Abdali’s deployment of elite military reserves.
    *   *Gameplay Integration*: Direct command of the `BattleCanvas.tsx` in final campaign skirmishes.

### 📜 The Scholar Track (Geopolitics & Archival Analysis)
Focused on political economy, primary source transcription, and the administrative letters of the period:
*   **Lesson 6: The Rohilla and Awadh Diplomacy**
    *   *Syllabus Content*: The high-stakes diplomatic contest for the alliance of Nawab Shuja-ud-Daula of Awadh.
    *   *Gameplay Integration*: Aligning Faction Trust meters to "Allied" with Northern powers in `DiplomacyDarbar.tsx`.
*   **Lesson 7: Economics of War: Bullion and Grain Attrition**
    *   *Syllabus Content*: The collapse of the Maratha financial credit in Delhi, currency debasement, and how the loss of local grain supplies triggered physical starvation.
    *   *Gameplay Integration*: Surviving 5 consecutive turns with zero food supplies in the `Logistics` dashboard.
*   **Lesson 8: The Intercepted Letters (Primary Source Analysis)**
    *   *Syllabus Content*: Detailed transcription, translation, and analysis of intercepted letters, including the iconic "two pearls dissolved" message.
    *   *Gameplay Integration*: Intercepting and decoding cipher puzzle minigames.
*   **Lesson 9: Ibrahim Khan Gardi: Secular Military Professionalism**
    *   *Syllabus Content*: An exploration of religion, identity, and absolute military professionalism in 18th-century Hindusthan through Ibrahim Khan's loyalty.
    *   *Gameplay Integration*: Visual-novel debates in the `AIDebateRoom.tsx` validating secular army integration.
*   **Lesson 10: Aftermath, Geopolitical Vacuum, and the Rise of the East India Company**
    *   *Syllabus Content*: Analyzing the severe Maratha and Afghan losses, the exhaustion of the Durrani empire, and the resulting administrative vacuum that allowed the British East India Company to consolidate Bengal and Oudh.
    *   *Gameplay Integration*: Post-game scenario analysis on the visual timeline.

---

## 🕸️ 3. D3.js Force-Directed Knowledge Network

The Seminary features a magnificent, mathematically modeled force-directed constellation of actors, treaties, and geographic vectors built on `d3-force`.

```
        (Ahmad Shah Durrani) <───[Treaty of Awadh]───> (Shuja-ud-Daula)
                │                                           │
                ▼                                           ▼
      (Battle of Kunjpura)                       (Najib-ud-Daula)
                ▲                                           ▲
                │                                           │
         [Yamuna Crossing] <───────[Alliance]────────> [Peshwa Court]
                │                                           │
                ▼                                           ▼
       (Sadashivrao Bhau) <────[Gardi Brigade]───> (Ibrahim Khan Gardi)
```

### ⚙️ Mathematical Engine Configurations
*   **Link Distance**: Calculated dynamically to separate unrelated events while keeping tightly clustered concepts (e.g., Ibrahim Khan Gardi and his French-trained Gardi infantry) grouped closely.
*   **Collision Detection**: Utilizes `d3.forceCollide().radius(d => d.size * 1.5)` to ensure labels never overlap, maintaining standard web accessibility guidelines.
*   **Focus Zoom Mechanics**: Clicking on any historical node smoothly centers the camera using interpolators, opening an interactive side drawer containing deep biographies, primary source manuscripts, and authentic portraits.

---

## ♟️ 4. Formations Playbook Sandbox

An interactive sandbox playground where students arrange troop formations and simulate outcomes based on physical, geopolitical, and weather parameters.

### 🌡️ Environmental Modifiers
The simulation incorporates an environmental physics calculator configured with real historic weather parameters:

| Weather Setting | Troop Movement Speed | Ranged Accuracy | Morale Decay Rate | Attrition Multiplier | Historical Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Clear Sun** | 100% | 100% | Normal | 1.0x | Ideal early campaign conditions. |
| **Winter Frost** | 75% | 90% | Rapid (+20%) | 1.5x | Late December blockade at Panipat. |
| **Dust Storm** | 50% | 40% | Severe (+45%) | 1.2x | Sudden afternoon choking winds of Haryana. |
| **Monsoon Rain** | 60% | 50% (Damp Powder) | Normal | 1.1x | Pre-campaign flooding at Yamuna crossings. |

### 📈 Combat Calculation Matrix
$$\text{Troop Advantage Score} = (\text{Base Combat Strength} \times \text{Cohesion Factor}) + (\text{Flanking Bonus} \times \text{Elevation}) - \text{Weather Attrition}$$

Where:
*   **Cohesion Factor**: Calculated dynamically based on how close same-faction regiments are to each other on the battlefield grid.
*   **Flanking Bonus**: Awarded if cavalry units bypass infantry blockades to engage ranged archers or artillery batteries from the side.

---

## ⚖️ 5. Unified Decision Chronicles

Throughout the campaign, students confront five major ethical and tactical historical forks. Each selection adjusts their overall strategic profile across two core polar metrics:

1.  **Guerrilla Vanguard (Ganimi Kava)**: High-speed raider tactics, river flankings, scorched-earth, and logistical evasions (aligned with Malharrao Holkar's historical perspective).
2.  **Consolidated Imperialist (Grand Array)**: Massive synchronized artillery lines, fortified camp structures, heavy direct siege, and formal European-style maneuvers (aligned with Sadashivrao Bhau and Ibrahim Khan Gardi's operational doctrines).

### ⚔️ The Historic Forks
*   **Decision 1: The Yamuna River crossing strategy.**
    *   *Option A (Ganimi Kava)*: Flank north through deep marshes to execute hit-and-run raids on Durrani supply hubs.
    *   *Option B (Grand Array)*: Erect solid pontoons and transport heavy brass field guns to maintain a cohesive front.
*   **Decision 2: Liquidation of Delhi Palace Bullion.**
    *   *Option A (Pragmatic Survival)*: Melt down the silver ceiling of the Red Fort Diwan-i-Khas to pay starving mercenaries.
    *   *Option B (Imperial Prestige)*: Maintain architectural heritage and enforce rationing, risking camp follower mutiny.
*   **Decision 3: Tactical integration of Ibrahim Gardi's brigade.**
    *   *Option A (Dispersed Infantry)*: Break up Gardi musketeers to shield traditional light cavalry charges.
    *   *Option B (Consolidated Bastion)*: Deploy them as a unified heavy cannon-shield vanguard to execute devastating synchronized volleys.

---

## 🏆 6. Dynamic Certification Engine

At the conclusion of the tracks, students enter the **Basalt Examination Hall** to complete a randomized challenge pull from an academic question pool.

```
       🚩 SHANIWAR WADA ACADEMIC COUNCIL 🚩
  ────────────────────────────────────────────────
   Candidate: Student Salil Apte
   Track: Scholar Geopolitical Path
   Score: 10/10 (100% Mastery)
  ────────────────────────────────────────────────
   Result: AWARD MASTER SCHOLAR CERTIFICATE
   
        [ Peshwa Grand Saffron Seal ]
```

### 📜 Printable Diploma Output
Students scoring $\ge 80\%$ on the dynamic exam receive a high-fidelity printable **Seminary Graduate Diploma**:
*   **Aesthetics**: Styled with rich royal saffron borders, delicate faded basalt textures, and a custom high-contrast digital watermark of the Peshwa's Saffron Banner (*Zari Patka*).
*   **Print Configuration**: Built using standard CSS print styles (`@media print`) that automatically hide the dashboard HUD, browser margins, and UI buttons to deliver a pristine, ready-to-frame physical paper layout.
