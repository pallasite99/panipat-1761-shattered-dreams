# Implementation Plan: Replacing 2D P5 Combat with Godot 3D Engine

This document details the approved implementation plan to replace the traditional 2D P5 tactical canvas with the high-fidelity, WebAssembly-compiled **Godot Engine 3D Simulation** as the primary, default battlefield mode.

---

## 1. Objective
To deliver an immersive, high-performance tactical battlefield experience. By transitioning the default active viewport from the flat 2D P5 vector renderer to the 3D GLES3 Godot simulation, players interact with a physical 3D grid featuring rigid-body colliders, true projectile trajectories, and stylized low-poly Indian military assets.

---

## 2. Transition Plan & Phase Alignment

### Phase 1: High-Priority Defaults & State Management
- **Action**: Change the default React state initializer for `viewportMode` from `'p5'` to `'godot'`.
- **Outcome**: Players immediately boot into the **3D Immersive (Godot)** mode upon starting a campaign battle stage, without requiring manual menu clicks.
- **Verification**: Ensure successful TypeScript compilation and Hot Module replacement checks.

### Phase 2: Enhanced Prop & Event Hookups
- **Action**: Fully connect core battle scene modifiers to the 3D WebGL context:
  - **Dynamic Weather Presets**: Align `rain`, `dust_storm`, `fog`, and `extreme_heat` across the Godot component so the GLES3 canvas shaders dynamically react to temperature/wind/dust metrics.
  - **Cohesion and Morale Feedback**: Bind `onModifyCohesion` callbacks to the centralized React state, ensuring active collision alerts subtract or restore brigade morale instantly.
  - **Artillery Splashes**: Map 3D coordinate projectile impacts directly back to the active sector's fort/wall integrity or infantry health.

### Phase 3: Retroactive Fallback Preservation
- **Action**: Retain the **2D Tactical (P5)** button as an optional, secondary tab toggle.
- **Outcome**: Ensures maximum compatibility and device accessibility for low-powered mobile browsers that may fail to register high WebGL heap allocations.

---

## 3. Communication Channel Layout

```
         React tactical App (Main Thread)
                        │
                        ▼ (dispatches events)
            window.JavaScriptBridge
                        │
                        ▼ (JSON payload)
             Godot WebAssembly Engine
                        │
         (solves physical collision/impacts)
                        │
                        ▼ (triggers callback)
           handleGodotModifyCohesion()
                        │
                        ▼ (updates stats)
             React Central Morale State
```

---

## 4. Current Status
- [x] **Primary Default Shift**: The state initializer inside `src/screens/BattleScene.tsx` has been successfully updated to `"godot"`.
- [x] **Dual-Directional Event Handlers**: Bidirectional hooks for cohesion, coordinate-to-drag interpolation, and command triggers are fully active.
- [x] **Verification**: Applet compiled, and linter validated successfully.
