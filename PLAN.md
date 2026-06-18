# Triumphant Path: Panipat Military Academy (LMS) Grand Expansion Plan

This document outlines the architectural specifications, interactive modules, and implementation phases to elevate the **Panipat: 1761** Learning Management System into a highly comprehensive, educational, and mechanical simulation experience.

---

## 🎨 1. Academic Scope & Visual Themes

The expansion of the Learning Management System (LMS) transitions it from a basic educational page into the **Panipat Military Academy (Shaniwar Wada Court Seminary)**. The visual architecture pairs:
*   **Golden Parchment Aesthetic**: Rounded corners, thin double-line borders (`border-[#8B5E3C]/30`), dark-sepia paper overlays, and antique seal stamps.
*   **Academic Progression Markers**: Visible military ranks, badges, dynamic ribbon-track progress bars, and personalized signed certificates.

---

## 🛠️ 2. Comprehensive Module Breakdowns

### 📖 Module A: Multi-Track Progressive Syllabus (10 Lessons)
We will double the size and content of the narrative course catalogs.

```
                  [MILITARY ACADEMY ENTRY]
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       👶 STUDENT TRACK              📜 SCHOLAR TRACK
     (Simple Stories & Gear)       (Finance, Geo-politics)
              │                             │
    • Lesson 1: Great Gathering   • Lesson 1: Geopolitical Chessboard
    • Lesson 2: Musket vs Camel   • Lesson 2: French Phalanx Artillery
    • Lesson 3: The Hunger Siege  • Lesson 3: Logistical Underfooting
    • Lesson 4: Mawala Jungle     • Lesson 4: Imperial Debt Ledger      <-- NEW
    • Lesson 5: Flags of Iron     • Lesson 5: Shadows of Empire         <-- NEW
```

#### New Chapter Specifications
1.  **Student L4: "Mawala Jungle Combat"**
    *   *Brief*: Learn how light cavalry and infantry used India's natural hills, forests, and winding rivers to ambush large armies.
    *   *Key Fact*: Mawala units traveled light; carrying only parched flatbread and water, they could track enemy scout movements invisibly without horses.
2.  **Student L5: "Flags of Iron & Saffron"**
    *   *Brief*: Discover the symbols, colors, and battle-songs that kept desperate soldiers marching together under freezing winters.
    *   *Key Fact*: Standard-bearer elephants were the most targeted beasts in battle; if their royal flag collapsed, the entire army assumed defeat!
3.  **Scholar L4: "The Imperial Debt Ledger"**
    *   *Brief*: Dive deep into double-entry accounting, state promissory notes (Hundis), and the heavy financial deficit of the Deccan.
    *   *Key Fact*: Sadashivrao Bhau was a brilliant civil tax treasurer who calculated that a single day's delay at Panipat bankrupted the state of 30,000 mohurs in interest alone.
4.  **Scholar L5: "Shadows of Empire: Post-1761 Fallout"**
    *   *Brief*: Trace how the mutual destruction of Maratha central authority and Durrani's financial exhaustion paved a direct red carpet for the British East India Company.
    *   *Key Fact*: Within less than five years of Panipat, the British secured the Diwani (tax extraction rights) of Bengal, utilizing the exact vacuum created by the battlefield losses of western forces.

---

### 🛡️ Module B: The Interactive Tactical Playbook Sandbox
Convert the read-only formations list into a **Drag-and-Drop Formations Simulator**.

```
+------------------------------------------------------------------------+
|                      TACTICAL PLAYBOOK SIMULATOR                       |
+------------------------------------------------------------------------+
|  [ Attacker Regiments Panel ]      |    [ Sandbox Placement Grid ]     |
|   (B1) Ibrahim Gardi Artillery      |    +--------------------------+   |
|   (B2) Mawala Raider Horse          |    | T1 Swivel | T3 Cav       |   |
|   (B3) Afghan Camel Zamburaks       |    +-----------+--------------+   |
|   (B4) Rohilla Heavies              |    | T2 Gardi  | T4 Rohilla   |   |
|                                    |    +--------------------------+   |
+------------------------------------+-----------------------------------+
|  [ Environment: Sunny / Winter Sandstorm / Floods ]   [ RUN TACTICAL ] |
+------------------------------------------------------------------------+
|  [ BATTLE COMMANDER LOG CONSOLE ]                                      |
|  * Ibrahim Gardi artillery executes barrage... Target morale drops -30%|
|  * Sandstorm debuff active: Attacking musket firing rate penalized 1.5x|
+------------------------------------------------------------------------+
```

#### Mechanics & State Data Structures
*   `attackerLanes` and `defenderLanes` state arrays holding unit objects.
*   **Environment Toggle**:
    *   *Sunny*: Normal combat rates.
    *   *Winter Frost*: Decreases Maratha speed and cavalry charge power.
    *   *Dust Storm*: Reduces long-range musket/cannon precision, buffing hand-to-hand combatants.
*   **Simulation Combat Engine**: Resolves simple type interactions programmatically, appending descriptions step-by-step into a scrolling simulator console.

---

### ⚖️ Module C: Decision Chronicles (5 Operational Milestones)
Expand the scenario chronicles from 2 to **5 high-stakes checkpoints**, charting path forks.

#### Added Scenario Details
1.  **Dilemma 3: Red Fort Silver Desecration (August 1760)**
    *   *Dilemma*: Starving troops mutiny for wages. Do you strip the ancient silver ceiling from Delhi’s Diwan-i-Khas to mint coins, sacrificing cultural honor, or protect historical art but risk general commander desertion?
2.  **Dilemma 4: Najib’s Double-Agent Threat (October 1760)**
    *   *Dilemma*: Intercepted scrolls reveal Rohilla correspondence offering regional alliances. Do you execute Najib’s envoys to show absolute resolve, or run a secret coin counter-offer?
3.  **Dilemma 5: Kunjpura Storage Splitting (November 1760)**
    *   *Dilemma*: Keep your entire army consolidated at Panipat, or dispatch Govind Pant’s light horse division to forage northern grain, splitting physical defensive force?

---

### 🏅 Module D: Randomized Quiz & Multi-Tier Diploma Center
A comprehensive suite of test and certification mechanics to incentivize historical mastery.

*   **Randomized 12-Question Database**: Each quiz attempt pulls 6 questions dynamically using a deterministic index shuffle.
*   **Historical Alignment System**: Track whether the student's historical decisions lean towards Maratha Deccan concepts or Afghan Pashtun coalition principles.
*   **The Royal Scriptorium Diploma Screen**:
    *   A high-contrast parchment diploma framed in amber-gold banners.
    *   Displays the user's name, their total cumulative scholar score, and seals.
    *   A custom handwritten **Wax Stamp Signet** of the Peshwa or Abdali that floats on the document.

```
       +-------------------------------------------------------------+
       |   📜============= THE MILITARY ROYAL ACADEMY =============📜  |
       |                                                             |
       |                   This Parchment Testifies That             |
       |                          [ USERNAME ]                       |
       |                                                             |
       |            has mastered the Operational Logistics &         |
       |              Tactics of the Third Battle of Panipat         |
       |                                                             |
       |        Title Bestowed:  GRAND STRATEGIC LOGISTICIAN         |
       |                                                             |
       |           [PEHWA COURT SEAL]          [AFGHAN CITADEL SEAL] |
       |          __Sadashivrao Bhau__           __Ahmad Shah__      |
       +-------------------------------------------------------------+
```

---

### 📜 Module E: Genuine Primary Sources Archives Room
Introduce an academic **"Manuscript Room"** allowing users to read actual translations of historic letters.

*   *Source 1: The Kashiraj Pandit Diaries* - Eyewitness reports of the morning charge and the dry winter air of January 14.
*   *Source 2: Sadashivrao Bhau’s Final Letter* - The famous code message sent to Pune: *"Two pearls have been dissolved, 27 gold mohurs lost, and of silver and copper the total cannot be cast."*
*   *Source 3: Najib-ud-Daulah's Oaths* - Original treaties sworn upon the Quran to back the Afghan invaders against western incursions.

---

## 🗂️ 3. Execution & File Impact Registry

To finalize these plans safely:
1.  **`src/types.ts`**: Declare new interfaces for Sandbox units, archives, and randomized quizzes.
2.  **`src/screens/LMS.tsx`**: Update this main screen file to render the complete interactive multi-tab layout, state selectors, physics simulators, and parchment seals.
3.  **`metadata.json`**: Make sure standard requirements are unchanged.
4.  **Verification**: Execute `lint_applet` and `compile_applet` to guarantee error-free runtime compiling.

---
