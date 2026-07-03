import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, RotateCcw, AlertCircle, Cpu, Wifi, Code2, 
  Terminal, ShieldAlert, CheckCircle2, ChevronRight, HelpCircle, 
  RefreshCw, Layers, ArrowUpRight, Zap, UploadCloud, FileCode,
  AlertTriangle, Settings2, Sliders, Send, Sparkles, Plus, Trash2, Eye,
  Activity, Target
} from 'lucide-react';

interface GodotBridgeProps {
  onEnemyHit?: (damage: number, label?: string, isAutonomous?: boolean) => void;
  onLootSuccess?: () => void;
  onCommanderShout?: (speaker: string, role: string, avatar: string, text: string, faction: 'maratha' | 'durrani') => void;
  weather?: 'clear' | 'rain' | 'dust_storm' | 'fog' | 'extreme_heat';
  timeOfDay?: 'dawn' | 'noon' | 'dusk' | 'midnight';
  onSlayEnemyDivision?: (count: number) => void;
  onModifyCohesion?: (amount: number, faction: 'maratha' | 'durrani') => void;
}

// 3D vector representation
interface Vec3 {
  id: string;
  x: number;
  y: number;
  z: number;
  label: string;
  type: 'cavalry' | 'infantry' | 'artillery' | 'fort';
  faction: 'maratha' | 'durrani';
  size: number;
  isCustom?: boolean;
}

export const GodotBridge: React.FC<GodotBridgeProps> = ({
  onEnemyHit,
  onModifyCohesion,
  onCommanderShout,
  weather = 'clear',
  timeOfDay = 'noon'
}) => {
  // Engine states
  const [engineState, setEngineState] = useState<'BOOTING' | 'LOADING_WASM' | 'COMPILING_SHADERS' | 'ENGINE_READY'>('BOOTING');
  const [loadProgress, setLoadProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'viewport' | 'gdscript' | 'pck_loader' | 'telemetry' | 'integration_doc'>('viewport');
  
  // Camera variables
  const [camYaw, setCamYaw] = useState<number>(0.6); // Radians around Y axis
  const [camPitch, setCamPitch] = useState<number>(0.5); // Radians from horizon
  const [camZoom, setCamZoom] = useState<number>(18);
  const [isOrbiting, setIsOrbiting] = useState<boolean>(true);
  
  // Render Settings
  const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [resolutionScale, setResolutionScale] = useState<number>(1.0); // 0.5 to 1.5
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);

  // COOP / COEP Diagnostics
  const [coopActive, setCoopActive] = useState<boolean>(false);
  const [coepActive, setCoepActive] = useState<boolean>(false);
  const [sabSupported, setSabSupported] = useState<boolean>(false);

  // PCK Upload State
  const [pckFileName, setPckFileName] = useState<string>('');
  const [pckFileSize, setPckFileSize] = useState<string>('');
  const [isDraggingPck, setIsDraggingPck] = useState<boolean>(false);
  const [pckCompileState, setPckCompileState] = useState<'none' | 'loading' | 'active'>('none');

  // Custom event trigger fields
  const [customEventName, setCustomEventName] = useState<string>('custom_combat_maneuver');
  const [customEventPayload, setCustomEventPayload] = useState<string>('{\n  "maneuver": "Flank Charge",\n  "cohesion_damage": 30,\n  "maratha_bonus_morale": 15\n}');

  // Dynamic Scene Graph Nodes
  const [sceneEntities, setSceneEntities] = useState<Vec3[]>([
    // Maratha Faction (Greenish/Golden glow)
    { id: 'm1', x: -5, y: 0, z: -2, type: 'fort', size: 1.8, faction: 'maratha', label: "Ibrahim Gardi Artillery Battery" },
    { id: 'm2', x: -3, y: 0, z: 2, type: 'cavalry', size: 1.0, faction: 'maratha', label: "Maratha Cavalry Division" },
    { id: 'm3', x: -4, y: 0, z: -1, type: 'infantry', size: 0.8, faction: 'maratha', label: "Huzurat Guard Divisions" },
    
    // Durrani Faction (Reddish glow)
    { id: 'd1', x: 4, y: 0, z: 1, type: 'infantry', size: 0.8, faction: 'durrani', label: "Durrani Gardi Guard" },
    { id: 'd2', x: 5, y: 0, z: -2, type: 'cavalry', size: 1.0, faction: 'durrani', label: "Rohilla Heavy Spear Division" },
    { id: 'd3', x: 3, y: 0, z: 3, type: 'infantry', size: 0.8, faction: 'durrani', label: "Oudh Militia Regiment" },
  ]);

  // Node Spawn Fields
  const [spawnType, setSpawnType] = useState<'cavalry' | 'infantry' | 'artillery'>('cavalry');
  const [spawnFaction, setSpawnFaction] = useState<'maratha' | 'durrani'>('maratha');
  const [spawnName, setSpawnName] = useState<string>('Huzurat Charioteer Unit');

  // Phase 3 States
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>('m1');
  const [cannonAngle, setCannonAngle] = useState<number>(42);
  const [cannonVelocity, setCannonVelocity] = useState<number>(24);
  const [isLaunchingProjectile, setIsLaunchingProjectile] = useState<boolean>(false);
  const [projectileT, setProjectileT] = useState<number>(0);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('d1');
  const [collisionWarning, setCollisionWarning] = useState<string | null>(null);
  const [skirmishActive, setSkirmishActive] = useState<boolean>(false);
  const [draggedEntityId, setDraggedEntityId] = useState<string | null>(null);
  
  // High performance projection coordinates and explosion state refs
  const entityProjectionsRef = useRef<{ [id: string]: { x: number; y: number } }>({});
  const explosionRef = useRef<{ x: number, y: number, z: number, progress: number, radius: number } | null>(null);
  const sceneEntitiesRef = useRef<Vec3[]>(sceneEntities);

  useEffect(() => {
    sceneEntitiesRef.current = sceneEntities;
  }, [sceneEntities]);

  // Simulated packets
  const [packetLogs, setPacketLogs] = useState<{
    id: string;
    timestamp: string;
    direction: 'REACT_TO_GODOT' | 'GODOT_TO_REACT';
    payload: string;
    type: string;
  }[]>([]);
  
  // Code editor state
  const [gdScript, setGdScript] = useState<string>(`extends CharacterBody3D

@export var speed: float = 6.5
@export var faction: String = "Maratha"
@export var squad_cohesion: float = 100.0

# Embedded JavaScriptBridge Hook to React context
var js_bridge = null

func _ready():
    # Attempt connection to React window host
    if OS.has_feature("web"):
        js_bridge = JavaScriptBridge.get_interface("godotBridge")
        if js_bridge:
            print("Successfully bound Godot Assembly to React Parent.")
            js_bridge.sendEvent("godot_ready", {"status": "fully_assembled"})

func _physics_process(delta: float):
    # standard movement looping
    var direction = Vector3.ZERO
    if Input.is_action_pressed("ui_right"): direction.x += 1
    if Input.is_action_pressed("ui_left"): direction.x -= 1
    
    if direction != Vector3.ZERO:
        velocity = direction.normalized() * speed
    else:
        velocity = velocity.move_toward(Vector3.ZERO, 0.45)
    move_and_slide()
`);

  const [compileStatus, setCompileStatus] = useState<'idle' | 'compiling' | 'success'>('idle');

  // Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Add initial log helper
  const addTerminalLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setTerminalLogs(prev => [...prev.slice(-35), `[${time}] ${msg}`]);
  };

  // Add bridge packets helper
  const addPacketLog = (direction: 'REACT_TO_GODOT' | 'GODOT_TO_REACT', type: string, data: any) => {
    const payloadStr = JSON.stringify(data);
    setPacketLogs(prev => [
      {
        id: Math.random().toString(36).substring(3, 9),
        timestamp: new Date().toLocaleTimeString() + '.' + String(Date.now() % 1000).padStart(3, '0'),
        direction,
        type,
        payload: payloadStr
      },
      ...prev.slice(0, 39)
    ]);
  };

  // Check browser capability for multi-threaded Godot assemblies
  useEffect(() => {
    // Check SharedArrayBuffer support (required for Godot Web Multi-threading)
    const sabOk = typeof window.SharedArrayBuffer !== 'undefined';
    setSabSupported(sabOk);

    // Read response headers simulated check
    // In Vite local, they require specific headers
    setCoopActive(true); // default safe simulation
    setCoepActive(true);

    addTerminalLog("Diagnostics: Checking browser compatibility for Godot WebAssembly multi-threading...");
    addTerminalLog(`SharedArrayBuffer support detected: ${sabOk ? 'ENABLED' : 'UNAVAILABLE (Single-thread fallback mode used)'}`);
  }, []);

  // Mock booting cycle
  useEffect(() => {
    addTerminalLog("Initializing WebGL 2.0 viewport context...");
    addTerminalLog("Establishing virtual HTML5 canvas bindings...");
    
    let currentProgress = 0;
    let localState: 'BOOTING' | 'LOADING_WASM' | 'COMPILING_SHADERS' | 'ENGINE_READY' = 'BOOTING';

    const interval = setInterval(() => {
      if (localState === 'BOOTING') {
        localState = 'LOADING_WASM';
        setEngineState('LOADING_WASM');
        addTerminalLog("Requesting WebAssembly payload 'godot_battle_engine.wasm' (24.8 MB)...");
      } else if (localState === 'LOADING_WASM') {
        currentProgress += Math.floor(Math.random() * 20) + 12;
        if (currentProgress >= 100) {
          currentProgress = 100;
          localState = 'COMPILING_SHADERS';
          setEngineState('COMPILING_SHADERS');
          addTerminalLog("WASM loaded. Compiling GLES3 shaders and pre-assembling materials...");
        }
        setLoadProgress(currentProgress);
      } else if (localState === 'COMPILING_SHADERS') {
        localState = 'ENGINE_READY';
        setEngineState('ENGINE_READY');
        addTerminalLog("Godot 4.2 GLES3 Web Engine successfully bound! Canvas active.");
        addTerminalLog("Listening on window.godotBridge...");
        
        // Setup global hook simulation
        (window as any).godotBridge = {
          sendEvent: (type: string, data: any) => {
            handleIncomingGodotEvent(type, data);
          }
        };

        // Create initial packets
        addPacketLog('GODOT_TO_REACT', 'godot_ready', { status: "fully_assembled", timestamp: Date.now() });
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      delete (window as any).godotBridge;
    };
  }, []);

  // Sync React properties with Godot through the simulated React->Godot stream
  useEffect(() => {
    if (engineState === 'ENGINE_READY') {
      addPacketLog('REACT_TO_GODOT', 'sync_environmental_data', {
        weather_condition: weather,
        time_of_day: timeOfDay,
        wind_resistance: weather === 'dust_storm' ? 75 : 12,
        visibility_rating: weather === 'fog' ? 0.35 : 1.0,
        temp_factor: weather === 'extreme_heat' ? 48.0 : 25.0
      });
      addTerminalLog(`WASM Hot-Update: Synced weather presets: [${weather}] with 3D terrain environment.`);
    }
  }, [weather, timeOfDay, engineState]);

  // Handle packets sent from Godot to React
  const handleIncomingGodotEvent = (type: string, data: any) => {
    addPacketLog('GODOT_TO_REACT', type, data);
    addTerminalLog(`Bridge Signal Recv: '${type}' -> Intercepted by React Router.`);
    
    // Wire up to the actual parent callback handlers
    if (type === 'artillery_impact' && onEnemyHit) {
      onEnemyHit(data.damage || 20, "artillery", true);
      if (onCommanderShout) {
        onCommanderShout(
          "Ibrahim Khan Gardi", 
          "Artillery Commander", 
          "IK", 
          `Godot WebGL Raycast: Direct hit on Durrani flank! Splinter damage calculated at ${data.damage} HP!`, 
          'maratha'
        );
      }
    } else if (type === 'cavalry_charge' && onModifyCohesion) {
      onModifyCohesion(15, 'maratha'); // Restore cohesion
      onModifyCohesion(-25, 'durrani'); // Break opponent
      if (onCommanderShout) {
        onCommanderShout(
          "Sadashivrao Bhau", 
          "Commander in Chief", 
          "SB", 
          "The Godot 3D physics engine registers a crushing cavalry lunge! Afghan wings are falling back!", 
          'maratha'
        );
      }
    } else if (type === 'cohesion_drain' && onModifyCohesion) {
      onModifyCohesion(data.amount || -10, data.faction || 'durrani');
    } else if (type === 'custom_event' && onModifyCohesion) {
      if (data.cohesion_damage) {
        onModifyCohesion(-data.cohesion_damage, 'durrani');
      }
      if (data.maratha_bonus_morale) {
        onModifyCohesion(data.maratha_bonus_morale, 'maratha');
      }
      if (onCommanderShout) {
        onCommanderShout(
          "Baji Hari Pintri",
          "Sardar Commander",
          "SB",
          `Custom Event Received: Maneuver "${data.maneuver || 'Attack'}" executed through custom bridge deck callback!`,
          'maratha'
        );
      }
    }
  };

  // Compile code editor simulation
  const handleCompileGDScript = () => {
    setCompileStatus('compiling');
    addTerminalLog("Scanning script syntax rules...");
    setTimeout(() => {
      setCompileStatus('success');
      addTerminalLog("Successfully parsed GDScript bytecode. Re-bound active CharacterBody3D node.");
      addPacketLog('REACT_TO_GODOT', 'recompile_assembly', {
        class: "CharacterBody3D",
        script_byte_size: gdScript.length,
        status: "compilation_green"
      });
    }, 1200);
  };

  // Simulating sending packets to Godot
  const sendPacketToGodot = (type: string, data: any) => {
    addPacketLog('REACT_TO_GODOT', type, data);
    addTerminalLog(`Bridge Signal Sent: '${type}' dispatched successfully to Godot thread.`);
  };

  // Drag-and-drop simulated handlers for custom PCK files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPck(true);
  };

  const handleDragLeave = () => {
    setIsDraggingPck(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPck(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.pck') || file.name.endsWith('.zip')) {
        loadCustomPck(file.name, (file.size / (1024 * 1024)).toFixed(2) + ' MB');
      } else {
        addTerminalLog("File Rejected: Only .pck or .zip Godot package binaries are accepted!");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      loadCustomPck(file.name, (file.size / (1024 * 1024)).toFixed(2) + ' MB');
    }
  };

  const loadCustomPck = (name: string, size: string) => {
    setPckFileName(name);
    setPckFileSize(size);
    setPckCompileState('loading');
    addTerminalLog(`Mounting custom PCK file: ${name} (${size}) into virtual game directory...`);
    
    setTimeout(() => {
      setPckCompileState('active');
      addTerminalLog(`Mount Success: Bound package "${name}" onto GLES3 filesytem layer! Reloaded main scene.`);
      addPacketLog('REACT_TO_GODOT', 'mount_custom_pck', {
        file_name: name,
        file_size: size,
        mount_success: true,
        root_nodes: ["TerrainMesh3D", "AtmosphericController", "MarathaRig", "DurraniRig"]
      });
    }, 1500);
  };

  // ==========================================
  // PHASE 3: REAL-TIME PHYSICS SOLVER EFFECTS
  // ==========================================

  // 1. Rigid Body Separation and damage tick solver (20Hz)
  useEffect(() => {
    if (engineState !== 'ENGINE_READY') return;
    
    const timer = setInterval(() => {
      const current = sceneEntitiesRef.current;
      const next = current.map(ent => ({ ...ent }));
      let hasChanged = false;
      let warningMsg: string | null = null;
      let marathaCohesionDmg = 0;
      let durraniCohesionDmg = 0;
      
      for (let i = 0; i < next.length; i++) {
        const entA = next[i];
        for (let j = i + 1; j < next.length; j++) {
          const entB = next[j];
          
          const dx = entA.x - entB.x;
          const dz = entA.z - entB.z;
          const dist = Math.sqrt(dx*dx + dz*dz);
          const radLimit = (entA.size + entB.size) * 0.75;
          
          if (dist < radLimit) {
            // Rigid Body separation vector
            const overlap = radLimit - dist;
            const angle = Math.atan2(dz, dx);
            const moveX = Math.cos(angle) * overlap * 0.51;
            const moveZ = Math.sin(angle) * overlap * 0.51;
            
            // Push them apart
            entA.x += moveX;
            entA.z += moveZ;
            entB.x -= moveX;
            entB.z -= moveZ;
            
            // Clamp to bounds
            entA.x = Math.max(-8, Math.min(8, entA.x));
            entA.z = Math.max(-8, Math.min(8, entA.z));
            entB.x = Math.max(-8, Math.min(8, entB.x));
            entB.z = Math.max(-8, Math.min(8, entB.z));
            
            hasChanged = true;
            
            if (entA.faction !== entB.faction) {
              warningMsg = `💥 CLASH DETECTED: ${entA.label} colliding with ${entB.label}! Melee damage applied!`;
              
              // Accumulate cohesion damage
              marathaCohesionDmg += 0.3;
              durraniCohesionDmg += 0.4;
            }
          }
        }
      }

      if (hasChanged) {
        setSceneEntities(next);
      }
      
      // Execute parent callback state modifiers safely outside any rendering or state setter paths
      if (marathaCohesionDmg > 0 && onModifyCohesion) {
        onModifyCohesion(-marathaCohesionDmg, 'maratha');
      }
      if (durraniCohesionDmg > 0 && onModifyCohesion) {
        onModifyCohesion(-durraniCohesionDmg, 'durrani');
      }
      
      setCollisionWarning(warningMsg);
    }, 50);

    return () => clearInterval(timer);
  }, [engineState, onModifyCohesion]);

  // 2. Skirmish Auto-Walker interval (10Hz)
  useEffect(() => {
    if (!skirmishActive || engineState !== 'ENGINE_READY') return;
    
    const timer = setInterval(() => {
      setSceneEntities(prev => {
        return prev.map(ent => {
          // Find closest enemy unit
          const enemies = prev.filter(e => e.faction !== ent.faction);
          if (enemies.length === 0) return ent;
          
          let closestEnemy = enemies[0];
          let minDist = Infinity;
          enemies.forEach(enemy => {
            const d = Math.sqrt((ent.x - enemy.x)**2 + (ent.z - enemy.z)**2);
            if (d < minDist) {
              minDist = d;
              closestEnemy = enemy;
            }
          });
          
          const dx = closestEnemy.x - ent.x;
          const dz = closestEnemy.z - ent.z;
          const dist = Math.sqrt(dx*dx + dz*dz);
          
          if (dist > 0.8) {
            const speed = ent.type === 'cavalry' ? 0.08 : ent.type === 'artillery' ? 0.02 : 0.05;
            return {
              ...ent,
              x: ent.x + (dx / dist) * speed,
              z: ent.z + (dz / dist) * speed
            };
          }
          return ent;
        });
      });
    }, 100);

    return () => clearInterval(timer);
  }, [skirmishActive, engineState]);

  // 3. Parabolic Projectile Timers & Launch actions
  useEffect(() => {
    if (!isLaunchingProjectile) return;
    let lastTime = Date.now();
    let animFrame: number;
    const tick = () => {
      const now = Date.now();
      const elapsed = (now - lastTime) / 1000;
      lastTime = now;
      
      let completed = false;
      setProjectileT(prev => {
        const next = prev + elapsed * 0.95;
        if (next >= 1.0) {
          completed = true;
          return 1.0;
        }
        return next;
      });

      if (completed) {
        setIsLaunchingProjectile(false);
        handleProjectileImpact();
      } else {
        animFrame = requestAnimationFrame(tick);
      }
    };
    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [isLaunchingProjectile, selectedTargetId]);

  const handleFireBallisticShell = () => {
    if (isLaunchingProjectile) return;
    
    const launcher = sceneEntities.find(ent => ent.id === 'm1') || sceneEntities[0];
    const target = sceneEntities.find(ent => ent.id === selectedTargetId) || sceneEntities[3];
    
    if (!launcher || !target) {
      addTerminalLog("Launch Error: No valid launcher or target entities registered!");
      return;
    }
    
    setProjectileT(0);
    setIsLaunchingProjectile(true);
    
    addTerminalLog(`Ballistics: Fired physical 3D artillery projectile! Launch Angle: ${cannonAngle}°, Launch Velocity: ${cannonVelocity} m/s`);
    addPacketLog('REACT_TO_GODOT', 'launch_artillery_shell', {
      origin_node: launcher.id,
      target_node: target.id,
      origin: [launcher.x, launcher.y, launcher.z],
      target: [target.x, target.y, target.z],
      angle: cannonAngle,
      initial_velocity: cannonVelocity,
      gravity: 9.8
    });
  };

  const handleProjectileImpact = () => {
    const target = sceneEntities.find(ent => ent.id === selectedTargetId);
    if (!target) return;
    
    explosionRef.current = {
      x: target.x,
      y: target.y,
      z: target.z,
      progress: 0,
      radius: 3.5
    };
    
    const enemies = sceneEntities.filter(ent => ent.faction === 'durrani');
    let hitsList: { label: string, damage: number }[] = [];
    
    enemies.forEach(ent => {
      const dist = Math.sqrt((ent.x - target.x)**2 + (ent.z - target.z)**2);
      if (dist < 3.2) {
        const damage = Math.round(Math.max(5, (1 - dist / 3.2) * 35));
        hitsList.push({ label: ent.label, damage });
        onModifyCohesion(-damage, 'durrani');
      }
    });

    addPacketLog('GODOT_TO_REACT', 'artillery_impact', {
      impact_coordinates: [target.x.toFixed(2), 0.0, target.z.toFixed(2)],
      splash_radius: 3.2,
      impacted_entities: hitsList.map(h => ({ name: h.label, damage_taken: h.damage })),
      primary_target_hit: true
    });

    addTerminalLog(`Ballistics Impact: Shell exploded at Vector3(${target.x.toFixed(1)}, 0, ${target.z.toFixed(1)})! Splinter hits: ${hitsList.map(h => `${h.label} (-${h.damage} Cohesion)`).join(', ')}`);
    
    if (onCommanderShout) {
      onCommanderShout(
        "Ibrahim Khan Gardi", 
        "Artillery Commander", 
        "IK", 
        `DIRECT IMPACT! Parabolic shell exploded on Durrani sector coordinates! Dynamic splinter damages subtracted from enemy cohesion indexes!`, 
        'maratha'
      );
    }
    
    if (onEnemyHit && hitsList.length > 0) {
      const totalDmg = hitsList.reduce((sum, h) => sum + h.damage, 0);
      onEnemyHit(totalDmg, "artillery", true);
    }
  };

  // Custom node management
  const handleAddNode = () => {
    const id = 'custom_' + Math.random().toString(36).substring(2, 7);
    const sideFactor = spawnFaction === 'maratha' ? -1 : 1;
    const newNode: Vec3 = {
      id,
      x: sideFactor * (Math.random() * 4 + 2),
      y: 0,
      z: Math.random() * 6 - 3,
      type: spawnType,
      size: spawnType === 'artillery' ? 1.4 : spawnType === 'cavalry' ? 1.0 : 0.8,
      faction: spawnFaction,
      label: `${spawnName} (${spawnFaction === 'maratha' ? 'M' : 'D'})`,
      isCustom: true
    };

    setSceneEntities(prev => [...prev, newNode]);
    addTerminalLog(`Scene Graph: Created Node "${newNode.label}" at custom coordinate Vector3(${newNode.x.toFixed(1)}, 0, ${newNode.z.toFixed(1)})`);
    addPacketLog('REACT_TO_GODOT', 'instantiate_node', {
      node_id: id,
      type: spawnType,
      faction: spawnFaction,
      label: spawnName,
      coordinates: [newNode.x, newNode.y, newNode.z]
    });
  };

  const handleDeleteNode = (id: string, label: string) => {
    setSceneEntities(prev => prev.filter(ent => ent.id !== id));
    addTerminalLog(`Scene Graph: Deleted custom node "${label}"`);
    addPacketLog('REACT_TO_GODOT', 'free_node', {
      node_id: id
    });
  };

  // Dynamic Camera Auto-Orbit animation effect
  useEffect(() => {
    if (!isOrbiting) return;
    let frame: number;
    const animate = () => {
      setCamYaw(prev => (prev + 0.002) % (Math.PI * 2));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isOrbiting]);

  // Dynamic Event broadcast trigger
  const handleSendCustomEvent = () => {
    try {
      const parsed = JSON.parse(customEventPayload);
      handleIncomingGodotEvent('custom_event', parsed);
    } catch (e) {
      addTerminalLog("Payload Error: JSON structure is invalid. Please format properly.");
    }
  };

  // Viewport Render Loop using custom 3D projection mathematical coordinates!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || engineState !== 'ENGINE_READY') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const render = () => {
      const parentW = canvas.parentElement?.clientWidth || 700;
      const parentH = canvas.parentElement?.clientHeight || 450;
      
      // Calculate resolution scaling
      const w = canvas.width = parentW * resolutionScale;
      const h = canvas.height = parentH * resolutionScale;
      
      // Skybox background/atmospheric gradient depending on time of day
      let skyTop = '#0284c7';
      let skyBottom = '#e0f2fe';
      let groundColor = '#4d7c0f'; // Grass green
      let sideColor = '#451a03'; // Solid core soil
      let sunDir = { x: 0.1, y: 1.0, z: -0.1 };
      let sunColor = '#ffffff';

      if (timeOfDay === 'dawn') {
        skyTop = '#1e1b4b'; // Deep indigo
        skyBottom = '#ff7e5f'; // Warm sunrise orange
        groundColor = '#854d0e'; // Golden/brown soil
        sideColor = '#451a03';
        sunDir = { x: -1.0, y: 0.4, z: 0.2 };
        sunColor = '#fdbb74';
      } else if (timeOfDay === 'noon') {
        skyTop = '#0284c7'; // Vivid azure
        skyBottom = '#bae6fd'; // Light horizon sky
        groundColor = '#3f6212'; // Vibrant green meadow
        sideColor = '#27170c';
        sunDir = { x: 0.1, y: 1.1, z: -0.1 };
        sunColor = '#ffffff';
      } else if (timeOfDay === 'dusk') {
        skyTop = '#311432'; // Deep plum
        skyBottom = '#ea580c'; // Vibrant dust orange
        groundColor = '#78350f'; // Scorched ochre soil
        sideColor = '#311411';
        sunDir = { x: 1.0, y: 0.35, z: -0.3 };
        sunColor = '#fb7185';
      } else if (timeOfDay === 'midnight') {
        skyTop = '#09090b'; // Starry black
        skyBottom = '#1e1b4b'; // Dark blue twilight
        groundColor = '#14532d'; // Pale moonlit field
        sideColor = '#0b1c10';
        sunDir = { x: 0.6, y: 0.8, z: -0.6 };
        sunColor = '#93c5fd';
      }

      if (weather === 'dust_storm') {
        groundColor = '#b45309'; // Sand brown
        skyTop = '#78350f';
        skyBottom = '#ca8a04';
      } else if (weather === 'rain') {
        groundColor = '#1e2912'; // Damp dark moss green
      }

      // Draw backdrop gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, skyTop);
      skyGrad.addColorStop(0.45, skyBottom);
      skyGrad.addColorStop(0.45, '#121315'); // Viewport borders
      skyGrad.addColorStop(1, '#0e0f11');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Starry Sky for midnight conditions
      if (timeOfDay === 'midnight') {
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 35; i++) {
          const starX = (Math.sin(i * 45.3) * 0.5 + 0.5) * w;
          const starY = (Math.cos(i * 12.8) * 0.5 + 0.5) * (h * 0.4);
          const starSize = Math.max(0.5, (Math.sin(Date.now() * 0.003 + i) * 0.5 + 0.5) * 2) * resolutionScale;
          ctx.fillRect(starX, starY, starSize, starSize);
        }
        // Crescent Moon
        const moonX = w * 0.85;
        const moonY = h * 0.12;
        ctx.beginPath();
        ctx.arc(moonX, moonY, 15 * resolutionScale, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(moonX - 5 * resolutionScale, moonY, 13 * resolutionScale, 0, Math.PI * 2);
        ctx.fillStyle = skyTop;
        ctx.fill();
      }

      // Camera projection formulas (Isometric/3D perspective conversion)
      // Rotates point (x, y, z) according to camYaw & camPitch
      const project = (v: { x: number; y: number; z: number }) => {
        let x = v.x;
        let y = v.y;
        let z = v.z;

        // Apply Yaw (around Y axis)
        const cosY = Math.cos(camYaw);
        const sinY = Math.sin(camYaw);
        const rx = x * cosY - z * sinY;
        const rz = x * sinY + z * cosY;

        // Apply Pitch (around X axis)
        const cosP = Math.cos(camPitch);
        const sinP = Math.sin(camPitch);
        const ry = y * cosP - rz * sinP;
        const finalZ = y * sinP + rz * cosP;

        // Perspective division
        const distance = 16 + finalZ;
        const scale = (camZoom * 22 * resolutionScale) / Math.max(0.1, distance);

        return {
          x: w / 2 + rx * scale,
          y: h / 2 - ry * scale + 20 * resolutionScale,
          depth: finalZ
        };
      };

      // Shaded flat colors based on face normals (Lambertian reflection)
      const getShadedColor = (baseColor: string, nx: number, ny: number, nz: number) => {
        const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
        const snx = len > 0 ? nx / len : 0;
        const sny = len > 0 ? ny / len : 1;
        const snz = len > 0 ? nz / len : 0;

        const slen = Math.sqrt(sunDir.x*sunDir.x + sunDir.y*sunDir.y + sunDir.z*sunDir.z);
        const slx = slen > 0 ? sunDir.x / slen : 0;
        const sly = slen > 0 ? sunDir.y / slen : 1;
        const slz = slen > 0 ? sunDir.z / slen : 0;

        const dot = snx * slx + sny * sly + snz * slz;
        const intensity = 0.55 + 0.45 * Math.max(-0.2, Math.min(1.0, dot));

        // Hex parsing to rgb
        let hex = baseColor.replace('#', '');
        if (hex.length === 3) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        const r = parseInt(hex.substring(0, 2), 16) || 0;
        const g = parseInt(hex.substring(2, 4), 16) || 0;
        const b = parseInt(hex.substring(4, 6), 16) || 0;

        const finalR = Math.min(255, Math.round(r * intensity));
        const finalG = Math.min(255, Math.round(g * intensity));
        const finalB = Math.min(255, Math.round(b * intensity));

        return `rgb(${finalR}, ${finalG}, ${finalB})`;
      };

      const draw3DFace = (points: { x: number; y: number; z: number }[], baseColor: string, normal: { x: number; y: number; z: number }) => {
        if (points.length < 3) return;
        const projPoints = points.map(p => project(p));
        
        ctx.beginPath();
        ctx.moveTo(projPoints[0].x, projPoints[0].y);
        for (let i = 1; i < projPoints.length; i++) {
          ctx.lineTo(projPoints[i].x, projPoints[i].y);
        }
        ctx.closePath();

        const shaded = getShadedColor(baseColor, normal.x, normal.y, normal.z);
        ctx.fillStyle = shaded;
        ctx.fill();

        // High fidelity geometric edges
        ctx.strokeStyle = getShadedColor(baseColor, normal.x + 0.1, normal.y + 0.1, normal.z + 0.1);
        ctx.lineWidth = 0.75 * resolutionScale;
        ctx.stroke();
      };

      // Painter's Algorithm: Create a sorted 3D draw queue
      const drawQueue: { depth: number; render: () => void }[] = [];

      // 1. DIORAMA TABLETOP SLAB BASE
      const slabY = -1.5;
      const vTop = [
        { x: -8, y: 0, z: -8 },
        { x: 8, y: 0, z: -8 },
        { x: 8, y: 0, z: 8 },
        { x: -8, y: 0, z: 8 }
      ];
      const vBottom = [
        { x: -8, y: slabY, z: -8 },
        { x: 8, y: slabY, z: -8 },
        { x: 8, y: slabY, z: 8 },
        { x: -8, y: slabY, z: 8 }
      ];

      const topDepth = vTop.reduce((sum, p) => sum + project(p).depth, 0) / 4;
      
      // Top ground face
      drawQueue.push({
        depth: topDepth + 1.2, // Back-most base layer
        render: () => {
          draw3DFace(vTop, groundColor, { x: 0, y: 1, z: 0 });

          // Interactive tactical grid overlays on slab top
          ctx.strokeStyle = timeOfDay === 'midnight' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.1)';
          ctx.lineWidth = 1;
          for (let x = -8; x <= 8; x += 2) {
            ctx.beginPath();
            const start = project({ x, y: 0.01, z: -8 });
            const end = project({ x, y: 0.01, z: 8 });
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }
          for (let z = -8; z <= 8; z += 2) {
            ctx.beginPath();
            const start = project({ x: -8, y: 0.01, z });
            const end = project({ x: 8, y: 0.01, z });
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }
        }
      });

      // Side 1: Front facing side of slab
      const fFront = [vTop[3], vTop[2], vBottom[2], vBottom[3]];
      const frontDepth = fFront.reduce((sum, p) => sum + project(p).depth, 0) / 4;
      drawQueue.push({
        depth: frontDepth + 1.0,
        render: () => {
          draw3DFace(fFront, sideColor, { x: 0, y: 0, z: 1 });
          // Striped clay deposits texture
          ctx.strokeStyle = '#1e1108';
          ctx.lineWidth = 2 * resolutionScale;
          for (let layerY = -0.3; layerY >= slabY; layerY -= 0.4) {
            ctx.beginPath();
            const pL = project({ x: -8, y: layerY, z: 8 });
            const pR = project({ x: 8, y: layerY, z: 8 });
            ctx.moveTo(pL.x, pL.y);
            ctx.lineTo(pR.x, pR.y);
            ctx.stroke();
          }
        }
      });

      // Side 2: Right facing side of slab
      const fRight = [vTop[2], vTop[1], vBottom[1], vBottom[2]];
      const rightDepth = fRight.reduce((sum, p) => sum + project(p).depth, 0) / 4;
      drawQueue.push({
        depth: rightDepth + 1.0,
        render: () => {
          draw3DFace(fRight, sideColor, { x: 1, y: 0, z: 0 });
          ctx.strokeStyle = '#1e1108';
          ctx.lineWidth = 2 * resolutionScale;
          for (let layerY = -0.3; layerY >= slabY; layerY -= 0.4) {
            ctx.beginPath();
            const pL = project({ x: 8, y: layerY, z: 8 });
            const pR = project({ x: 8, y: layerY, z: -8 });
            ctx.moveTo(pL.x, pL.y);
            ctx.lineTo(pR.x, pR.y);
            ctx.stroke();
          }
        }
      });

      // Side 3: Back facing side of slab
      const fBack = [vTop[1], vTop[0], vBottom[0], vBottom[1]];
      const backDepth = fBack.reduce((sum, p) => sum + project(p).depth, 0) / 4;
      drawQueue.push({
        depth: backDepth + 1.0,
        render: () => {
          draw3DFace(fBack, sideColor, { x: 0, y: 0, z: -1 });
        }
      });

      // Side 4: Left facing side of slab
      const fLeft = [vTop[0], vTop[3], vBottom[3], vBottom[0]];
      const leftDepth = fLeft.reduce((sum, p) => sum + project(p).depth, 0) / 4;
      drawQueue.push({
        depth: leftDepth + 1.0,
        render: () => {
          draw3DFace(fLeft, sideColor, { x: -1, y: 0, z: 0 });
          ctx.strokeStyle = '#1e1108';
          ctx.lineWidth = 2 * resolutionScale;
          for (let layerY = -0.3; layerY >= slabY; layerY -= 0.4) {
            ctx.beginPath();
            const pL = project({ x: -8, y: layerY, z: -8 });
            const pR = project({ x: -8, y: layerY, z: 8 });
            ctx.moveTo(pL.x, pL.y);
            ctx.lineTo(pR.x, pR.y);
            ctx.stroke();
          }
        }
      });

      // 2. STATIC SCENERY AND PROP ASSETS
      const STATIC_TREES = [
        { x: -6.8, z: -6.0, size: 1.15 },
        { x: -5.2, z: -7.2, size: 0.9 },
        { x: 6.8, z: -6.8, size: 1.25 },
        { x: 7.2, z: -4.8, size: 1.0 },
        { x: -7.2, z: 5.5, size: 0.95 },
        { x: 6.5, z: 6.5, size: 1.15 }
      ];

      STATIC_TREES.forEach(tree => {
        const depth = project({ x: tree.x, y: 0, z: tree.z }).depth;
        drawQueue.push({
          depth: depth + 0.1,
          render: () => {
            const s = tree.size;
            // 3D trunk (brown cube block)
            const tBottom = [
              { x: tree.x - 0.15*s, y: 0, z: tree.z - 0.15*s },
              { x: tree.x + 0.15*s, y: 0, z: tree.z - 0.15*s },
              { x: tree.x + 0.15*s, y: 0, z: tree.z + 0.15*s },
              { x: tree.x - 0.15*s, y: 0, z: tree.z + 0.15*s }
            ];
            const tTop = tBottom.map(p => ({ ...p, y: 0.75*s }));
            
            draw3DFace([tBottom[0], tBottom[1], tTop[1], tTop[0]], '#451a03', { x: 0, y: 0, z: -1 });
            draw3DFace([tBottom[1], tBottom[2], tTop[2], tTop[1]], '#451a03', { x: 1, y: 0, z: 0 });
            draw3DFace([tBottom[2], tBottom[3], tTop[3], tTop[2]], '#5c2d12', { x: 0, y: 0, z: 1 });
            draw3DFace([tBottom[3], tBottom[0], tTop[0], tTop[3]], '#5c2d12', { x: -1, y: 0, z: 0 });

            // Foliage low-poly cone 1
            const fTip1 = { x: tree.x, y: 1.6*s, z: tree.z };
            const fBase1 = [
              { x: tree.x - 0.65*s, y: 0.55*s, z: tree.z - 0.65*s },
              { x: tree.x + 0.65*s, y: 0.55*s, z: tree.z - 0.65*s },
              { x: tree.x + 0.65*s, y: 0.55*s, z: tree.z + 0.65*s },
              { x: tree.x - 0.65*s, y: 0.55*s, z: tree.z + 0.65*s }
            ];
            draw3DFace([fBase1[0], fBase1[1], fTip1], '#166534', { x: 0, y: 0.7, z: -0.7 });
            draw3DFace([fBase1[1], fBase1[2], fTip1], '#15803d', { x: 0.7, y: 0.7, z: 0 });
            draw3DFace([fBase1[2], fBase1[3], fTip1], '#166534', { x: 0, y: 0.7, z: 0.7 });
            draw3DFace([fBase1[3], fBase1[0], fTip1], '#15803d', { x: -0.7, y: 0.7, z: 0 });

            // Foliage low-poly cone 2 (Upper deck)
            const fTip2 = { x: tree.x, y: 2.3*s, z: tree.z };
            const fBase2 = [
              { x: tree.x - 0.48*s, y: 1.25*s, z: tree.z - 0.48*s },
              { x: tree.x + 0.48*s, y: 1.25*s, z: tree.z - 0.48*s },
              { x: tree.x + 0.48*s, y: 1.25*s, z: tree.z + 0.48*s },
              { x: tree.x - 0.48*s, y: 1.25*s, z: tree.z + 0.48*s }
            ];
            draw3DFace([fBase2[0], fBase2[1], fTip2], '#14532d', { x: 0, y: 0.7, z: -0.7 });
            draw3DFace([fBase2[1], fBase2[2], fTip2], '#166534', { x: 0.7, y: 0.7, z: 0 });
            draw3DFace([fBase2[2], fBase2[3], fTip2], '#14532d', { x: 0, y: 0.7, z: 0.7 });
            draw3DFace([fBase2[3], fBase2[0], fTip2], '#166534', { x: -0.7, y: 0.7, z: 0 });
          }
        });
      });

      const STATIC_ROCKS = [
        { x: -3.8, z: -5.2, size: 0.45 },
        { x: 3.8, z: -6.2, size: 0.55 },
        { x: -2.2, z: 6.8, size: 0.38 },
        { x: 4.8, z: 5.8, size: 0.48 }
      ];

      STATIC_ROCKS.forEach(rock => {
        const depth = project({ x: rock.x, y: 0, z: rock.z }).depth;
        drawQueue.push({
          depth: depth + 0.1,
          render: () => {
            const s = rock.size;
            const top = { x: rock.x, y: s * 0.85, z: rock.z };
            const base = [
              { x: rock.x - s, y: 0, z: rock.z - s },
              { x: rock.x + s, y: 0, z: rock.z - s },
              { x: rock.x + s, y: 0, z: rock.z + s },
              { x: rock.x - s, y: 0, z: rock.z + s }
            ];
            draw3DFace([base[0], base[1], top], '#57534e', { x: 0, y: 0.7, z: -0.7 });
            draw3DFace([base[1], base[2], top], '#78716c', { x: 0.7, y: 0.7, z: 0 });
            draw3DFace([base[2], base[3], top], '#57534e', { x: 0, y: 0.7, z: 0.7 });
            draw3DFace([base[3], base[0], top], '#78716c', { x: -0.7, y: 0.7, z: 0 });
          }
        });
      });

      // Military Camp Yurts/Tents
      const MILITARY_TENTS = [
        { x: -6.5, z: -2.2, faction: 'maratha' },
        { x: -7.0, z: 1.8, faction: 'maratha' },
        { x: 6.5, z: -1.2, faction: 'durrani' },
        { x: 7.0, z: 1.8, faction: 'durrani' }
      ];

      MILITARY_TENTS.forEach(tent => {
        const depth = project({ x: tent.x, y: 0, z: tent.z }).depth;
        const color = tent.faction === 'maratha' ? '#f97316' : '#ef4444';
        
        drawQueue.push({
          depth: depth + 0.1,
          render: () => {
            const s = 0.65;
            const peak = { x: tent.x, y: 1.2, z: tent.z };
            const base = [
              { x: tent.x - s, y: 0, z: tent.z - s },
              { x: tent.x + s, y: 0, z: tent.z - s },
              { x: tent.x + s, y: 0, z: tent.z + s },
              { x: tent.x - s, y: 0, z: tent.z + s }
            ];
            
            draw3DFace([base[0], base[1], peak], color, { x: 0, y: 0.7, z: -0.7 });
            draw3DFace([base[1], base[2], peak], '#fafafa', { x: 0.7, y: 0.7, z: 0 });
            draw3DFace([base[2], base[3], peak], color, { x: 0, y: 0.7, z: 0.7 });
            draw3DFace([base[3], base[0], peak], '#fafafa', { x: -0.7, y: 0.7, z: 0 });

            // Banner flags waving on top of the tents
            const pPeak = project(peak);
            ctx.beginPath();
            ctx.moveTo(pPeak.x, pPeak.y);
            ctx.lineTo(pPeak.x, pPeak.y - 14 * resolutionScale);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            const w = Math.sin(Date.now() * 0.007 + tent.x) * 3;
            ctx.beginPath();
            ctx.moveTo(pPeak.x, pPeak.y - 14 * resolutionScale);
            ctx.lineTo(pPeak.x + 9 * resolutionScale + w, pPeak.y - 11 * resolutionScale);
            ctx.lineTo(pPeak.x, pPeak.y - 8 * resolutionScale);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
          }
        });
      });

      // HQ waving banners
      const HQ_FLAGS = [
        { x: -6, z: 3.8, faction: 'maratha', color: '#f97316' },
        { x: 6, z: 3.8, faction: 'durrani', color: '#16a34a' } // Green banner
      ];

      HQ_FLAGS.forEach(flag => {
        const depth = project({ x: flag.x, y: 0, z: flag.z }).depth;
        drawQueue.push({
          depth: depth + 0.1,
          render: () => {
            const pBase = project({ x: flag.x, y: 0, z: flag.z });
            const pTop = project({ x: flag.x, y: 4.2, z: flag.z });

            // Draw flag pole
            ctx.beginPath();
            ctx.moveTo(pBase.x, pBase.y);
            ctx.lineTo(pTop.x, pTop.y);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 3 * resolutionScale;
            ctx.stroke();

            // Pole gold tip
            ctx.beginPath();
            ctx.arc(pTop.x, pTop.y, 4 * resolutionScale, 0, Math.PI * 2);
            ctx.fillStyle = '#fde047';
            ctx.fill();

            // Wave multiplier
            ctx.beginPath();
            ctx.moveTo(pTop.x, pTop.y);
            
            // Draw fluttering flag segments
            const steps = 10;
            for (let step = 0; step <= steps; step++) {
              const r = step / steps;
              const wx = flag.x + r * 1.6;
              const wy = 4.2 + Math.sin(Date.now() * 0.007 - step * 0.45) * 0.15;
              const p = project({ x: wx, y: wy, z: flag.z });
              ctx.lineTo(p.x, p.y);
            }

            const returnY = 4.2 - 0.75 + Math.sin(Date.now() * 0.007 - steps * 0.45) * 0.15;
            const pReturn = project({ x: flag.x + 1.6, y: returnY, z: flag.z });
            ctx.lineTo(pReturn.x, pReturn.y);

            for (let step = steps; step >= 0; step--) {
              const r = step / steps;
              const wx = flag.x + r * 1.6;
              const wy = 4.2 - 0.75 + Math.sin(Date.now() * 0.007 - step * 0.45) * 0.15;
              const p = project({ x: wx, y: wy, z: flag.z });
              ctx.lineTo(p.x, p.y);
            }
            ctx.closePath();
            ctx.fillStyle = flag.color;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.5;
            ctx.stroke();

            if (flag.faction === 'maratha') {
              // Saffron tail cuts
              ctx.beginPath();
              const pTailMid = project({ x: flag.x + 1.6, y: 4.2 - 0.37 + Math.sin(Date.now() * 0.007 - steps * 0.45) * 0.15, z: flag.z });
              const pTailTop = project({ x: flag.x + 2.5, y: 4.2 + Math.sin(Date.now() * 0.007 - 14 * 0.45) * 0.15, z: flag.z });
              const pTailBottom = project({ x: flag.x + 2.5, y: 4.2 - 0.75 + Math.sin(Date.now() * 0.007 - 14 * 0.45) * 0.15, z: flag.z });
              ctx.moveTo(pReturn.x, pReturn.y);
              ctx.lineTo(pTailBottom.x, pTailBottom.y);
              ctx.lineTo(pTailMid.x, pTailMid.y);
              ctx.lineTo(pTailTop.x, pTailTop.y);
              ctx.closePath();
              ctx.fillStyle = flag.color;
              ctx.fill();
            }
          }
        });
      });

      // Defensive Stakes (Palisades / Stockades)
      const PALISADE_STAKES = [
        { x: -5.0, z: -3.4 },
        { x: -4.6, z: -3.4 },
        { x: -4.2, z: -3.4 },
        { x: -3.8, z: -3.4 },
        { x: -3.4, z: -3.4 }
      ];

      PALISADE_STAKES.forEach(stake => {
        const depth = project({ x: stake.x, y: 0, z: stake.z }).depth;
        drawQueue.push({
          depth: depth + 0.1,
          render: () => {
            const base = [
              { x: stake.x - 0.1, y: 0, z: stake.z - 0.1 },
              { x: stake.x + 0.1, y: 0, z: stake.z - 0.1 },
              { x: stake.x + 0.1, y: 0, z: stake.z + 0.1 },
              { x: stake.x - 0.1, y: 0, z: stake.z + 0.1 }
            ];
            const tip = { x: stake.x, y: 0.7, z: stake.z + 0.28 }; // driven in slightly forward

            draw3DFace([base[0], base[1], tip], '#78350f', { x: 0, y: 0.7, z: -0.7 });
            draw3DFace([base[1], base[2], tip], '#78350f', { x: 0.7, y: 0.7, z: 0 });
            draw3DFace([base[2], base[3], tip], '#9a3412', { x: 0, y: 0.7, z: 0.7 });
            draw3DFace([base[3], base[0], tip], '#9a3412', { x: -0.7, y: 0.7, z: 0 });
          }
        });
      });

      // 3. TROOP NODE ENTITIES
      sceneEntities.forEach(ent => {
        const proj = project(ent);
        const depth = proj.depth;
        const isMaratha = ent.faction === 'maratha';
        const factionColor = isMaratha ? '#f97316' : '#ef4444';
        
        // Cache screen-space coordinates for dragging/hit testing
        entityProjectionsRef.current[ent.id] = { x: proj.x, y: proj.y };

        drawQueue.push({
          depth: depth,
          render: () => {
            const baseProj = project({ ...ent, y: 0 });
            
            // Ground shadow ring
            ctx.beginPath();
            ctx.ellipse(baseProj.x, baseProj.y, 14 * ent.size * resolutionScale, 6 * ent.size * resolutionScale, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
            ctx.fill();

            // Neon faction selector circles
            ctx.strokeStyle = selectedEntityId === ent.id ? '#06b6d4' : factionColor;
            ctx.lineWidth = selectedEntityId === ent.id ? 2.5 * resolutionScale : 1 * resolutionScale;
            ctx.stroke();

            // Active/Selection dashed halo
            if (selectedEntityId === ent.id) {
              ctx.beginPath();
              ctx.ellipse(baseProj.x, baseProj.y, 22 * ent.size * resolutionScale, 10 * ent.size * resolutionScale, 0, 0, Math.PI * 2);
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
              ctx.setLineDash([3, 3]);
              ctx.stroke();
              ctx.setLineDash([]);
            }

            // Draw 3D solid low-poly meshes
            if (wireframeMode) {
              ctx.strokeStyle = factionColor;
              ctx.lineWidth = 1.25 * resolutionScale;
              ctx.beginPath();
              const topProj = project({ ...ent, y: ent.type === 'fort' ? 1.6 : ent.type === 'cavalry' ? 1.0 : 0.8 });
              ctx.moveTo(baseProj.x - 12 * resolutionScale, baseProj.y);
              ctx.lineTo(topProj.x - 12 * resolutionScale, topProj.y);
              ctx.lineTo(topProj.x + 12 * resolutionScale, topProj.y);
              ctx.lineTo(baseProj.x + 12 * resolutionScale, baseProj.y);
              ctx.closePath();
              ctx.stroke();
            } else if (ent.type === 'fort') {
              // 3D Octagonal defensive fort/battery keep
              const height = 1.65 * ent.size;
              const rBase = 0.65 * ent.size;
              const rTop = 0.58 * ent.size;
              const sides = 8;
              
              const basePts = [];
              const topPts = [];
              for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                basePts.push({ x: ent.x + Math.cos(angle)*rBase, y: 0, z: ent.z + Math.sin(angle)*rBase });
                topPts.push({ x: ent.x + Math.cos(angle)*rTop, y: height, z: ent.z + Math.sin(angle)*rTop });
              }

              const stoneColor = isMaratha ? '#78716c' : '#57534e';
              for (let i = 0; i < sides; i++) {
                const next = (i + 1) % sides;
                const normalX = Math.cos((i + 0.5) / sides * Math.PI * 2);
                const normalZ = Math.sin((i + 0.5) / sides * Math.PI * 2);
                draw3DFace([basePts[i], basePts[next], topPts[next], topPts[i]], stoneColor, { x: normalX, y: 0.1, z: normalZ });
              }

              // Deck face
              draw3DFace(topPts, '#44403c', { x: 0, y: 1, z: 0 });

              // Battlements atop fort
              for (let i = 0; i < sides; i++) {
                if (i % 2 === 0) {
                  const next = (i + 1) % sides;
                  const crenBase = [topPts[i], topPts[next]];
                  const crenTop = crenBase.map(p => ({ ...p, y: p.y + 0.28 }));
                  draw3DFace([crenBase[0], crenBase[1], crenTop[1], crenTop[0]], '#57534e', { x: Math.cos(i/sides*Math.PI*2), y: 0, z: Math.sin(i/sides*Math.PI*2) });
                }
              }

              // Heavy wooden doors
              const doorAngle = Math.PI * 1.25;
              const pDoorL = { x: ent.x + Math.cos(doorAngle - 0.22)*rBase, y: 0, z: ent.z + Math.sin(doorAngle - 0.22)*rBase };
              const pDoorR = { x: ent.x + Math.cos(doorAngle + 0.22)*rBase, y: 0, z: ent.z + Math.sin(doorAngle + 0.22)*rBase };
              const pDoorTL = { ...pDoorL, y: 0.45 };
              const pDoorTR = { ...pDoorR, y: 0.45 };
              draw3DFace([pDoorL, pDoorR, pDoorTR, pDoorTL], '#451a03', { x: Math.cos(doorAngle), y: 0, z: Math.sin(doorAngle) });

              // Fort crest banner
              const pFlagBase = project({ x: ent.x, y: height, z: ent.z });
              const pFlagTop = project({ x: ent.x, y: height + 0.75, z: ent.z });
              ctx.beginPath();
              ctx.moveTo(pFlagBase.x, pFlagBase.y);
              ctx.lineTo(pFlagTop.x, pFlagTop.y);
              ctx.strokeStyle = '#cbd5e1';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              const w = Math.sin(Date.now() * 0.007 + ent.x) * 4;
              ctx.beginPath();
              ctx.moveTo(pFlagTop.x, pFlagTop.y);
              ctx.lineTo(pFlagTop.x + 13 * resolutionScale + w, pFlagTop.y + 2);
              ctx.lineTo(pFlagTop.x, pFlagTop.y + 7 * resolutionScale);
              ctx.closePath();
              ctx.fillStyle = factionColor;
              ctx.fill();

            } else if (ent.type === 'artillery') {
              // 3D Brass cannon tube & wooden carriage wheel base
              const scale = ent.size;
              let targetDir = { x: isMaratha ? 1 : -1, z: 0 };
              const target = sceneEntities.find(t => t.id === selectedTargetId);
              if (target) {
                const dx = target.x - ent.x;
                const dz = target.z - ent.z;
                const len = Math.sqrt(dx*dx + dz*dz);
                if (len > 0) {
                  targetDir = { x: dx / len, z: dz / len };
                }
              }

              const wheelDir = { x: -targetDir.z, z: targetDir.x };

              // Wheels
              const drawWheel = (offsetSign: number) => {
                const wx = ent.x + wheelDir.x * 0.45 * offsetSign;
                const wz = ent.z + wheelDir.z * 0.45 * offsetSign;
                const wProj = project({ x: wx, y: 0.35, z: wz });
                
                ctx.beginPath();
                ctx.ellipse(wProj.x, wProj.y, 11 * scale * resolutionScale, 11 * scale * resolutionScale, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#1e1b4b'; // dark composite rim
                ctx.fill();
                ctx.strokeStyle = '#854d0e'; // bronze rim banding
                ctx.lineWidth = 2.5 * resolutionScale;
                ctx.stroke();

                ctx.beginPath();
                ctx.ellipse(wProj.x, wProj.y, 8 * scale * resolutionScale, 8 * scale * resolutionScale, 0, 0, Math.PI * 2);
                ctx.fillStyle = '#78350f';
                ctx.fill();
                ctx.strokeStyle = '#b45309';
                ctx.lineWidth = 1;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(wProj.x, wProj.y, 2.5 * resolutionScale, 0, Math.PI * 2);
                ctx.fillStyle = '#94a3b8';
                ctx.fill();
              };

              const camDotWheel = wheelDir.x * Math.cos(camYaw) + wheelDir.z * Math.sin(camYaw);
              if (camDotWheel > 0) {
                drawWheel(-1);
                drawWheel(1);
              } else {
                drawWheel(1);
                drawWheel(-1);
              }

              // Carriage box
              const mBase = [
                { x: ent.x - targetDir.x*0.4 - wheelDir.x*0.2, y: 0.15, z: ent.z - targetDir.z*0.4 - wheelDir.z*0.2 },
                { x: ent.x - targetDir.x*0.4 + wheelDir.x*0.2, y: 0.15, z: ent.z - targetDir.z*0.4 + wheelDir.z*0.2 },
                { x: ent.x + targetDir.x*0.35 + wheelDir.x*0.2, y: 0.25, z: ent.z + targetDir.z*0.35 + wheelDir.z*0.2 },
                { x: ent.x + targetDir.x*0.35 - wheelDir.x*0.2, y: 0.25, z: ent.z + targetDir.z*0.35 - wheelDir.z*0.2 }
              ];
              const mTop = mBase.map(p => ({ ...p, y: p.y + 0.2 }));
              draw3DFace([mBase[0], mBase[1], mTop[1], mTop[0]], '#451a03', { x: -targetDir.x, y: 0, z: -targetDir.z });
              draw3DFace([mBase[1], mBase[2], mTop[2], mTop[1]], '#451a03', { x: wheelDir.x, y: 0, z: wheelDir.z });
              draw3DFace([mBase[2], mBase[3], mTop[3], mTop[2]], '#78350f', { x: targetDir.x, y: 0, z: targetDir.z });
              draw3DFace([mBase[3], mBase[0], mTop[0], mTop[3]], '#78350f', { x: -wheelDir.x, y: 0, z: -wheelDir.z });
              draw3DFace(mTop, '#b45309', { x: 0, y: 1, z: 0 });

              // Barrel cylinder vector
              const bStart = { x: ent.x - targetDir.x * 0.52, y: 0.45, z: ent.z - targetDir.z * 0.52 };
              const bEnd = { x: ent.x + targetDir.x * 0.68, y: 0.45 + Math.sin(cannonAngle * Math.PI / 180)*0.25, z: ent.z + targetDir.z * 0.68 };
              const pBStart = project(bStart);
              const pBEnd = project(bEnd);

              ctx.beginPath();
              ctx.moveTo(pBStart.x, pBStart.y);
              ctx.lineTo(pBEnd.x, pBEnd.y);
              ctx.strokeStyle = isMaratha ? '#ca8a04' : '#4b5563'; // Brass vs Cast Iron
              ctx.lineWidth = 8 * scale * resolutionScale;
              ctx.lineCap = 'round';
              ctx.stroke();

              // Hollow cannon muzzle black tip
              ctx.beginPath();
              ctx.arc(pBEnd.x, pBEnd.y, 2.5 * scale * resolutionScale, 0, Math.PI * 2);
              ctx.fillStyle = '#09090b';
              ctx.fill();

              // Cannonballs pile
              const ballOffset = wheelDir;
              const bx = ent.x - ballOffset.x * 0.58;
              const bz = ent.z - ballOffset.z * 0.58;
              const pBall = project({ x: bx, y: 0.08, z: bz });
              ctx.beginPath();
              ctx.arc(pBall.x, pBall.y, 5 * scale * resolutionScale, 0, Math.PI * 2);
              ctx.fillStyle = '#27272a';
              ctx.fill();
              ctx.strokeStyle = '#52525b';
              ctx.lineWidth = 1;
              ctx.stroke();

            } else if (ent.type === 'cavalry') {
              // 3D horse anatomy with rider
              const hTorso = [
                { x: ent.x - 0.38, y: 0.28, z: ent.z - 0.16 },
                { x: ent.x + 0.38, y: 0.28, z: ent.z - 0.16 },
                { x: ent.x + 0.38, y: 0.28, z: ent.z + 0.16 },
                { x: ent.x - 0.38, y: 0.28, z: ent.z + 0.16 }
              ];
              const hTorsoTop = hTorso.map(p => ({ ...p, y: 0.62 }));
              const horseColor = isMaratha ? '#7c2d12' : '#57534e';
              
              draw3DFace([hTorso[0], hTorso[1], hTorsoTop[1], hTorsoTop[0]], horseColor, { x: 0, y: 0, z: -1 });
              draw3DFace([hTorso[1], hTorso[2], hTorsoTop[2], hTorsoTop[1]], horseColor, { x: 1, y: 0, z: 0 });
              draw3DFace([hTorso[2], hTorso[3], hTorsoTop[3], hTorsoTop[2]], horseColor, { x: 0, y: 0, z: 1 });
              draw3DFace([hTorso[3], hTorso[0], hTorsoTop[0], hTorsoTop[3]], horseColor, { x: -1, y: 0, z: 0 });
              draw3DFace(hTorsoTop, factionColor, { x: 0, y: 1, z: 0 }); // saddle cloth

              // Horse head & neck block
              const dir = isMaratha ? -1 : 1;
              const pNeckB = project({ x: ent.x + 0.26*dir, y: 0.52, z: ent.z });
              const pNeckT = project({ x: ent.x + 0.46*dir, y: 0.9, z: ent.z });
              ctx.beginPath();
              ctx.moveTo(pNeckB.x, pNeckB.y);
              ctx.lineTo(pNeckT.x, pNeckT.y);
              ctx.strokeStyle = horseColor;
              ctx.lineWidth = 7.5 * resolutionScale;
              ctx.lineCap = 'round';
              ctx.stroke();

              // Legs
              const drawLeg = (lx: number, lz: number) => {
                const pLTop = project({ x: ent.x + lx, y: 0.35, z: ent.z + lz });
                const pLBot = project({ x: ent.x + lx, y: 0, z: ent.z + lz });
                ctx.beginPath();
                ctx.moveTo(pLTop.x, pLTop.y);
                ctx.lineTo(pLBot.x, pLBot.y);
                ctx.strokeStyle = horseColor;
                ctx.lineWidth = 2.5 * resolutionScale;
                ctx.stroke();
              };
              drawLeg(-0.25, -0.12);
              drawLeg(-0.25, 0.12);
              drawLeg(0.25, -0.12);
              drawLeg(0.25, 0.12);

              // Rider sitting at Y = 0.62
              const pRiderB = project({ x: ent.x, y: 0.62, z: ent.z });
              const pRiderH = project({ x: ent.x, y: 1.18, z: ent.z });
              ctx.beginPath();
              ctx.moveTo(pRiderB.x, pRiderB.y);
              ctx.lineTo(pRiderH.x, pRiderH.y);
              ctx.strokeStyle = isMaratha ? '#fed7aa' : '#cbd5e1'; // skin tone
              ctx.lineWidth = 9.5 * resolutionScale;
              ctx.lineCap = 'round';
              ctx.stroke();

              // Rider turban/helmet
              ctx.beginPath();
              ctx.arc(pRiderH.x, pRiderH.y - 2 * resolutionScale, 5 * resolutionScale, 0, Math.PI * 2);
              ctx.fillStyle = isMaratha ? '#ea580c' : '#991b1b';
              ctx.fill();

              // Spear banner
              const pSpearS = project({ x: ent.x + 0.1, y: 0.5, z: ent.z + 0.16 });
              const pSpearE = project({ x: ent.x + 0.2*dir, y: 1.65, z: ent.z + 0.28 });
              ctx.beginPath();
              ctx.moveTo(pSpearS.x, pSpearS.y);
              ctx.lineTo(pSpearE.x, pSpearE.y);
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 1.5 * resolutionScale;
              ctx.stroke();

              // Tip
              ctx.beginPath();
              ctx.arc(pSpearE.x, pSpearE.y, 2 * resolutionScale, 0, Math.PI * 2);
              ctx.fillStyle = '#cbd5e1';
              ctx.fill();

              // Lance banner cloth
              ctx.beginPath();
              ctx.moveTo(pSpearE.x, pSpearE.y + 2);
              ctx.lineTo(pSpearE.x - 12*dir*resolutionScale, pSpearE.y + 6*resolutionScale);
              ctx.lineTo(pSpearE.x, pSpearE.y + 11 * resolutionScale);
              ctx.closePath();
              ctx.fillStyle = factionColor;
              ctx.fill();

            } else {
              // 3D armored infantry capsule with shield and talwar!
              const rBase = 0.3;
              const height = 0.9;
              const infBody = [
                { x: ent.x - rBase, y: 0, z: ent.z - rBase },
                { x: ent.x + rBase, y: 0, z: ent.z - rBase },
                { x: ent.x + rBase, y: 0, z: ent.z + rBase },
                { x: ent.x - rBase, y: 0, z: ent.z + rBase }
              ];
              const infTop = infBody.map(p => ({ ...p, y: height }));
              const coatColor = isMaratha ? '#ea580c' : '#be123c';

              draw3DFace([infBody[0], infBody[1], infTop[1], infTop[0]], coatColor, { x: 0, y: 0, z: -1 });
              draw3DFace([infBody[1], infBody[2], infTop[2], infTop[1]], coatColor, { x: 1, y: 0, z: 0 });
              draw3DFace([infBody[2], infBody[3], infTop[3], infTop[2]], coatColor, { x: 0, y: 0, z: 1 });
              draw3DFace([infBody[3], infBody[0], infTop[0], infTop[3]], coatColor, { x: -1, y: 0, z: 0 });
              draw3DFace(infTop, '#ca8a04', { x: 0, y: 1, z: 0 }); // gold epaulets

              // Soldier Head
              const pHead = project({ x: ent.x, y: height + 0.16, z: ent.z });
              ctx.beginPath();
              ctx.arc(pHead.x, pHead.y, 7 * resolutionScale, 0, Math.PI * 2);
              ctx.fillStyle = '#fed7aa';
              ctx.fill();

              // Turban wrapping
              ctx.beginPath();
              ctx.arc(pHead.x, pHead.y - 3 * resolutionScale, 5.5 * resolutionScale, 0, Math.PI * 2);
              ctx.fillStyle = isMaratha ? '#f97316' : '#991b1b';
              ctx.fill();

              // Round Dhal shield
              const pShield = project({ x: ent.x - 0.3, y: height * 0.58, z: ent.z + 0.16 });
              ctx.beginPath();
              ctx.arc(pShield.x, pShield.y, 9 * resolutionScale, 0, Math.PI * 2);
              ctx.fillStyle = '#1e293b'; // black rhinoceros hide shield
              ctx.fill();
              ctx.strokeStyle = '#ca8a04'; // gold trim
              ctx.lineWidth = 1.5 * resolutionScale;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(pShield.x, pShield.y, 1.5 * resolutionScale, 0, Math.PI * 2);
              ctx.fillStyle = '#fde047';
              ctx.fill();

              // Sword swing
              const swingAngle = Math.sin(Date.now() * 0.009 + ent.x) * 0.45;
              const swordTip = { 
                x: ent.x + 0.36 + Math.cos(swingAngle)*0.32, 
                y: height * 0.68 + Math.sin(swingAngle)*0.32, 
                z: ent.z - 0.1 
              };
              const swordHand = { x: ent.x + 0.3, y: height * 0.52, z: ent.z - 0.1 };
              const pHand = project(swordHand);
              const pTip = project(swordTip);

              ctx.beginPath();
              ctx.moveTo(pHand.x, pHand.y);
              ctx.lineTo(pTip.x, pTip.y);
              ctx.strokeStyle = '#e2e8f0'; // bright steel
              ctx.lineWidth = 2 * resolutionScale;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(pHand.x, pHand.y, 2 * resolutionScale, 0, Math.PI * 2);
              ctx.fillStyle = '#ca8a04'; // gold hilt
              ctx.fill();
            }

            // Display node tag overlay
            ctx.fillStyle = selectedEntityId === ent.id ? '#06b6d4' : '#ffffff';
            ctx.font = `bold ${8.5 * resolutionScale}px monospace`;
            ctx.fillText(ent.label || '', baseProj.x - 45 * resolutionScale, baseProj.y - (ent.type === 'fort' ? 52 : 36) * resolutionScale);
            
            // Dynamic node vector tracking label
            ctx.fillStyle = 'rgba(156, 163, 175, 0.85)';
            ctx.font = `${7 * resolutionScale}px monospace`;
            ctx.fillText(`Vector3(${ent.x.toFixed(1)}, ${ent.y.toFixed(1)}, ${ent.z.toFixed(1)})`, baseProj.x - 30 * resolutionScale, baseProj.y + 14 * resolutionScale);
          }
        });
      });

      // 4. BALISTIC PROJECTILES & EXPLOSIONS
      if (isLaunchingProjectile) {
        const launcher = sceneEntities.find(ent => ent.id === 'm1') || sceneEntities[0];
        const target = sceneEntities.find(ent => ent.id === selectedTargetId) || sceneEntities[3];

        if (launcher && target) {
          const s = projectileT;
          const bX = launcher.x + (target.x - launcher.x) * s;
          const bZ = launcher.z + (target.z - launcher.z) * s;
          
          const dist = Math.sqrt((target.x - launcher.x)**2 + (target.z - launcher.z)**2);
          const angleRad = (cannonAngle * Math.PI) / 180;
          const maxHeight = dist * Math.tan(angleRad) * 0.25;
          const bY = Math.sin(s * Math.PI) * Math.max(1.0, maxHeight);
          
          const bProj = project({ x: bX, y: bY, z: bZ });
          const bShadowProj = project({ x: bX, y: 0, z: bZ });

          // Shadow
          drawQueue.push({
            depth: bShadowProj.depth + 0.1,
            render: () => {
              ctx.beginPath();
              ctx.ellipse(bShadowProj.x, bShadowProj.y, 6 * resolutionScale, 3 * resolutionScale, 0, 0, Math.PI * 2);
              ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
              ctx.fill();
            }
          });

          // Flying Cannonball
          drawQueue.push({
            depth: bProj.depth - 0.2,
            render: () => {
              // Ballistic tracer line
              ctx.beginPath();
              ctx.strokeStyle = 'rgba(234, 88, 12, 0.65)';
              ctx.setLineDash([4, 4]);
              const steps = 15;
              for (let step = 0; step <= steps; step++) {
                const ts = step / steps;
                const px = launcher.x + (target.x - launcher.x) * ts;
                const pz = launcher.z + (target.z - launcher.z) * ts;
                const py = Math.sin(ts * Math.PI) * Math.max(1.0, maxHeight);
                const p = project({ x: px, y: py, z: pz });
                if (step === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
              }
              ctx.stroke();
              ctx.setLineDash([]);

              ctx.beginPath();
              ctx.arc(bProj.x, bProj.y, 5 * resolutionScale, 0, Math.PI * 2);
              ctx.fillStyle = '#f97316';
              ctx.fill();
              ctx.strokeStyle = '#fde047';
              ctx.lineWidth = 1.5 * resolutionScale;
              ctx.stroke();
            }
          });
        }
      }

      if (explosionRef.current) {
        const exp = explosionRef.current;
        const expProj = project({ x: exp.x, y: exp.y, z: exp.z });
        
        drawQueue.push({
          depth: expProj.depth - 0.5,
          render: () => {
            exp.progress += 0.04;
            
            // Blast ring expansion
            ctx.beginPath();
            ctx.arc(expProj.x, expProj.y, exp.radius * exp.progress * 15 * resolutionScale, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(239, 68, 68, ${1 - exp.progress})`;
            ctx.lineWidth = 3.5 * resolutionScale;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(expProj.x, expProj.y, exp.radius * exp.progress * 7 * resolutionScale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(251, 146, 60, ${(1 - exp.progress) * 0.5})`;
            ctx.fill();

            // sparks
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 12; i++) {
              const angle = (i / 12) * Math.PI * 2 + exp.progress;
              const length = 20 * exp.progress;
              const startDist = 8 * exp.progress;
              ctx.beginPath();
              ctx.moveTo(expProj.x + Math.cos(angle) * startDist * resolutionScale, expProj.y + Math.sin(angle) * startDist * resolutionScale);
              ctx.lineTo(expProj.x + Math.cos(angle) * (startDist + length) * resolutionScale, expProj.y + Math.sin(angle) * (startDist + length) * resolutionScale);
              ctx.stroke();
            }

            if (exp.progress >= 1.0) {
              explosionRef.current = null;
            }
          }
        });
      }

      // 5. LIVE MELEE CLASH EFFECTS
      for (let i = 0; i < sceneEntities.length; i++) {
        const entA = sceneEntities[i];
        for (let j = i + 1; j < sceneEntities.length; j++) {
          const entB = sceneEntities[j];
          if (entA.faction !== entB.faction) {
            const dx = entA.x - entB.x;
            const dz = entA.z - entB.z;
            const dist = Math.sqrt(dx*dx + dz*dz);
            const radLimit = (entA.size + entB.size) * 0.75;
            
            if (dist < radLimit) {
              const midX = (entA.x + entB.x) * 0.5;
              const midZ = (entA.z + entB.z) * 0.5;
              const midProj = project({ x: midX, y: 0.2, z: midZ });
              
              drawQueue.push({
                depth: midProj.depth - 0.2,
                render: () => {
                  ctx.beginPath();
                  ctx.arc(midProj.x, midProj.y, (13 + Math.sin(Date.now() * 0.02) * 4) * resolutionScale, 0, Math.PI * 2);
                  ctx.strokeStyle = '#ef4444';
                  ctx.lineWidth = 2 * resolutionScale;
                  ctx.stroke();

                  ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
                  ctx.fill();

                  // comic bursts sparks
                  ctx.strokeStyle = '#fbbf24';
                  ctx.lineWidth = 1.5;
                  for (let s = 0; s < 6; s++) {
                    const ang = s / 6 * Math.PI * 2 + Date.now()*0.01;
                    ctx.beginPath();
                    ctx.moveTo(midProj.x + Math.cos(ang)*4, midProj.y + Math.sin(ang)*4);
                    ctx.lineTo(midProj.x + Math.cos(ang)*16, midProj.y + Math.sin(ang)*16);
                    ctx.stroke();
                  }

                  ctx.fillStyle = '#fde047';
                  ctx.font = `bold ${8 * resolutionScale}px monospace`;
                  ctx.fillText("💥 CLASHING", midProj.x - 26 * resolutionScale, midProj.y - 12 * resolutionScale);
                }
              });
            }
          }
        }
      }

      // 6. ATMOSPHERIC DRIFTING CLOUDS
      const CLOUDS = [
        { x: -5, y: 5.5, z: -4 },
        { x: 1, y: 4.8, z: -5.5 },
        { x: 4.5, y: 6.2, z: 2 }
      ];

      CLOUDS.forEach((cloud, idx) => {
        const cx = cloud.x + Math.sin(Date.now() * 0.0003 + idx) * 2;
        const cProj = project({ x: cx, y: cloud.y, z: cloud.z });
        
        drawQueue.push({
          depth: cProj.depth + 2.0, // Clouds float highest
          render: () => {
            ctx.beginPath();
            ctx.ellipse(cProj.x, cProj.y, 45 * resolutionScale, 18 * resolutionScale, 0, 0, Math.PI * 2);
            ctx.ellipse(cProj.x - 20 * resolutionScale, cProj.y + 4, 30 * resolutionScale, 15 * resolutionScale, 0, 0, Math.PI * 2);
            ctx.ellipse(cProj.x + 20 * resolutionScale, cProj.y + 4, 30 * resolutionScale, 15 * resolutionScale, 0, 0, Math.PI * 2);
            ctx.fillStyle = timeOfDay === 'midnight' ? 'rgba(30, 41, 59, 0.28)' : 'rgba(255, 255, 255, 0.25)';
            ctx.fill();
          }
        });
      });

      // SORT DRAW QUEUE BY DEPTH DESCENDING AND EXECUTE PAINTERS ALGORITHM DRAW PASS
      drawQueue.sort((a, b) => b.depth - a.depth);
      drawQueue.forEach(item => item.render());

      // 7. AMBIENT PARTICULATE WEATHER FILTER SCREEN OVERLAYS
      if (weather === 'dust_storm') {
        ctx.fillStyle = 'rgba(217, 119, 6, 0.12)';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
        const count = renderQuality === 'low' ? 6 : renderQuality === 'medium' ? 14 : 28;
        for (let k = 0; k < count; k++) {
          const px = (Math.random() * w + Date.now() * 0.5) % w;
          const py = Math.random() * h;
          ctx.fillRect(px, py, 3 * resolutionScale, 1 * resolutionScale);
        }
      } else if (weather === 'rain') {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        const count = renderQuality === 'low' ? 8 : renderQuality === 'medium' ? 18 : 35;
        for (let k = 0; k < count; k++) {
          const px = Math.random() * w;
          const py = Math.random() * h;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - 6 * resolutionScale, py + 18 * resolutionScale);
          ctx.stroke();
        }
      } else if (weather === 'fog') {
        const fogGrad = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w/2);
        fogGrad.addColorStop(0, 'rgba(203, 213, 225, 0.12)');
        fogGrad.addColorStop(1, 'rgba(148, 163, 184, 0.28)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, w, h);
      } else if (weather === 'extreme_heat') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.04)';
        ctx.fillRect(0, 0, w, h);
        // Wave ripple haze
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.16)';
        ctx.lineWidth = 1;
        const count = renderQuality === 'low' ? 2 : renderQuality === 'medium' ? 5 : 8;
        for (let m = 0; m < count; m++) {
          const ry = h / 2 + m * 30 + Math.sin(Date.now() * 0.005 + m) * 10;
          ctx.beginPath();
          ctx.moveTo(0, ry);
          for (let rx = 0; rx < w; rx += 20) {
            ctx.lineTo(rx, ry + Math.sin(rx * 0.025 + Date.now() * 0.012) * 3);
          }
          ctx.stroke();
        }
      }

      // 3D Viewport Title & Metadata overlay watermarking
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.font = `${8.5 * resolutionScale}px monospace`;
      ctx.fillText(`[GODOT PERSPECTIVE CAMERA] Pitch: ${camPitch.toFixed(2)} Yaw: ${camYaw.toFixed(2)} Zoom: ${camZoom}x`, 12, h - 14);
      ctx.fillStyle = 'rgba(234, 88, 12, 0.85)';
      ctx.fillText(`GODOT ENGINE PORTAL GLES3 - RESOLUTION: ${(resolutionScale*100).toFixed(0)}%`, 12, 22);

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [engineState, camYaw, camPitch, camZoom, weather, sceneEntities, resolutionScale, renderQuality, wireframeMode, selectedEntityId, isLaunchingProjectile, projectileT, selectedTargetId, cannonAngle, timeOfDay]);

  // Handle Dragging to rotate Godot camera or translate selected entities (Phase 3)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) * resolutionScale;
    const mouseY = (e.clientY - rect.top) * resolutionScale;

    // Check if we clicked on an entity (Hit test)
    let clickedEntityId: string | null = null;
    let minDistance = 25 * resolutionScale; // 25 pixels hitbox
    for (const id of Object.keys(entityProjectionsRef.current)) {
      const proj = entityProjectionsRef.current[id];
      if (!proj) continue;
      const dx = mouseX - proj.x;
      const dy = mouseY - proj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        clickedEntityId = id;
        minDistance = dist;
      }
    }

    if (clickedEntityId) {
      setDraggedEntityId(clickedEntityId);
      setSelectedEntityId(clickedEntityId);
      setIsOrbiting(false); // Disable camera rotation while dragging
      addTerminalLog(`Physics Rig: Selected node "${sceneEntities.find(ent => ent.id === clickedEntityId)?.label}" for coordinate translation.`);
    } else {
      setDraggedEntityId(null);
      isDraggingRef.current = true;
      setIsOrbiting(false); // Stop auto rotate on click
    }

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    if (draggedEntityId) {
      // Rotate translation inputs by camera yaw to align dragging with viewer angle
      const cosY = Math.cos(camYaw);
      const sinY = Math.sin(camYaw);
      const scaleFactor = 0.03 * (25 / camZoom);

      const worldDX = (deltaX * cosY + deltaY * sinY) * scaleFactor;
      const worldDZ = (-deltaX * sinY + deltaY * cosY) * scaleFactor;

      setSceneEntities(prev => prev.map(ent => {
        if (ent.id === draggedEntityId) {
          const newX = Math.max(-8, Math.min(8, ent.x + worldDX));
          const newZ = Math.max(-8, Math.min(8, ent.z + worldDZ));
          return { ...ent, x: newX, z: newZ };
        }
        return ent;
      }));

      // Throttle packet logs to prevent flood
      if (Math.random() < 0.15) {
        const entObj = sceneEntities.find(ent => ent.id === draggedEntityId);
        if (entObj) {
          addPacketLog('REACT_TO_GODOT', 'translate_coordinates', {
            node_id: draggedEntityId,
            coordinates: [entObj.x.toFixed(2), 0.0, entObj.z.toFixed(2)]
          });
        }
      }
    } else if (isDraggingRef.current) {
      setCamYaw(prev => prev - deltaX * 0.007);
      setCamPitch(prev => Math.max(0.1, Math.min(Math.PI / 2.1, prev - deltaY * 0.007)));
    }

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    if (draggedEntityId) {
      const entObj = sceneEntities.find(ent => ent.id === draggedEntityId);
      if (entObj) {
        addTerminalLog(`Physics Rig: Placed node "${entObj.label}" at Vector3(${entObj.x.toFixed(1)}, 0, ${entObj.z.toFixed(1)})`);
        addPacketLog('REACT_TO_GODOT', 'coordinate_placed', {
          node_id: draggedEntityId,
          coordinates: [entObj.x, 0.0, entObj.z]
        });
      }
      setDraggedEntityId(null);
    }
  };

  return (
    <div id="godot-bridge-root" className="flex flex-col h-[700px] bg-[#16171a] border border-stone-800 rounded-xs overflow-hidden select-none relative shadow-2xl">
      
      {/* Top Header Bar / Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-[#1f2024] border-b border-stone-900 px-4 py-2 gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#313f56] rounded-xs flex items-center justify-center border border-stone-800 shrink-0">
            <Cpu className="h-3 w-3 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] font-mono font-black tracking-widest text-stone-200 uppercase">GODOT BATTLE PORTAL</span>
              <span className={`h-1.5 w-1.5 rounded-full ${engineState === 'ENGINE_READY' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
            </div>
            <span className="text-[7px] font-mono text-stone-400 uppercase tracking-widest block mt-0.5">
              Phase 2 Compiled PCK Assembly Loader & COOP Diagnostics
            </span>
          </div>
        </div>

        {/* View Selection Controls */}
        <div className="flex items-center gap-0.5 overflow-x-auto self-start sm:self-auto py-1 sm:py-0">
          <button 
            type="button"
            onClick={() => setActiveTab('viewport')}
            className={`px-2 py-1 text-[8px] font-mono font-black uppercase rounded-xs transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'viewport' ? 'bg-[#3c4a5c] text-white border-b-2 border-sky-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Viewport (3D)
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('gdscript')}
            className={`px-2 py-1 text-[8px] font-mono font-black uppercase rounded-xs transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gdscript' ? 'bg-[#3c4a5c] text-white border-b-2 border-sky-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            GDScript Editor
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('pck_loader')}
            className={`px-2 py-1 text-[8px] font-mono font-black uppercase rounded-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'pck_loader' ? 'bg-[#3c4a5c] text-white border-b-2 border-sky-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <UploadCloud className="h-2.5 w-2.5 text-sky-400" /> PCK Drop-in
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-2 py-1 text-[8px] font-mono font-black uppercase rounded-xs transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'telemetry' ? 'bg-[#3c4a5c] text-white border-b-2 border-sky-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Bridge Deck ({packetLogs.length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('integration_doc')}
            className={`px-2 py-1 text-[8px] font-mono font-black uppercase rounded-xs transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'integration_doc' ? 'bg-[#3c4a5c] text-white border-b-2 border-sky-400' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Blueprint
          </button>
        </div>
      </div>

      {/* Loading Cover Layer */}
      {engineState !== 'ENGINE_READY' && (
        <div className="absolute inset-0 bg-[#16171a] z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-4 flex items-center justify-center">
            <RefreshCw className="h-10 w-10 text-sky-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-black text-white">
              {loadProgress}%
            </div>
          </div>
          <h3 className="text-sm font-serif font-black text-white tracking-widest uppercase">
            {engineState === 'BOOTING' ? 'Booting Godot core subsystem...' : 
             engineState === 'LOADING_WASM' ? 'Acquiring Assembly WASM payload...' : 'Compiling GLES3 shaders...'}
          </h3>
          <p className="text-[10px] text-stone-500 font-mono tracking-widest uppercase mt-1 max-w-sm">
            Evaluating GLES3 / WebAssembly interface nodes. Do not disconnect stream.
          </p>

          <div className="w-56 h-1.5 bg-stone-900 border border-stone-850 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${loadProgress}%` }} />
          </div>

          <div className="w-full max-w-md bg-stone-950 p-3 rounded border border-stone-900 text-left font-mono text-[7px] text-stone-500 mt-6 h-28 overflow-y-auto">
            {terminalLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Main Body Columns */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        
        {/* Left Column Viewport - tab based */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-stone-950">
          
          {/* TAB 1: 3D PERSPECTIVE VIEWPORT */}
          {activeTab === 'viewport' && (
            <div className="flex-1 flex flex-col relative min-h-0">
              {/* Canvas Container */}
              <div className="relative flex-1 min-h-[320px] bg-stone-950">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="w-full h-full block cursor-grab active:cursor-grabbing"
                />

                {/* Viewport Settings overlay */}
                <div className="absolute top-3 left-3 z-10 bg-stone-950/90 p-2 text-left rounded border border-stone-850 flex flex-col gap-1 max-w-[190px]">
                  <span className="text-[8px] font-mono font-black text-stone-500 uppercase tracking-wider flex items-center gap-1">
                    <Settings2 className="h-3 w-3 text-sky-400" /> WebGL render options
                  </span>

                  {/* Resolution scale slider */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[7px] font-mono text-stone-400">
                      <span>Resolution:</span>
                      <span className="text-sky-400 font-bold">{resolutionScale.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      value={resolutionScale}
                      onChange={(e) => setResolutionScale(Number(e.target.value))}
                      className="w-full h-1 bg-stone-800 accent-sky-400 rounded cursor-pointer"
                    />
                  </div>

                  {/* Quality presets */}
                  <div className="flex gap-1">
                    {(['low', 'medium', 'high'] as const).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setRenderQuality(q)}
                        className={`flex-1 py-0.5 rounded text-[7px] font-mono font-black uppercase cursor-pointer border ${
                          renderQuality === q 
                            ? 'bg-sky-500 text-white border-sky-500' 
                            : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Wireframe Toggle */}
                  <button
                    type="button"
                    onClick={() => setWireframeMode(!wireframeMode)}
                    className={`py-0.5 px-2 rounded text-[7px] font-mono font-black uppercase cursor-pointer border text-center ${
                      wireframeMode ? 'bg-amber-950/80 text-amber-400 border-amber-900' : 'bg-stone-900 text-stone-400 border-stone-800'
                    }`}
                  >
                    {wireframeMode ? 'Wireframe mesh: on' : 'Solid mesh render'}
                  </button>
                </div>

                {/* Float Controls Orbit Camera Overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-10 bg-stone-950/80 p-2 rounded border border-stone-900 font-mono text-[8px] text-stone-300 flex-col sm:flex-row">
                  <div className="flex items-center gap-1">
                    <span>Orbit:</span>
                    <button 
                      type="button"
                      onClick={() => setIsOrbiting(!isOrbiting)}
                      className={`px-1.5 py-0.5 rounded text-[7px] cursor-pointer ${isOrbiting ? 'bg-sky-550 text-white' : 'bg-stone-800 text-stone-400'}`}
                    >
                      {isOrbiting ? "ON" : "OFF"}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Zoom:</span>
                    <input 
                      type="range" 
                      min="8" 
                      max="35" 
                      value={camZoom} 
                      onChange={(e) => setCamZoom(Number(e.target.value))}
                      className="w-14 h-1 accent-sky-400 bg-stone-800 rounded-xs cursor-pointer"
                    />
                  </div>
                </div>

                {/* Direct drag instruction */}
                <div className="absolute bottom-3 left-3 bg-stone-900/90 border border-stone-800 px-2 py-1 rounded text-[7.5px] text-stone-400 font-mono flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
                  <span>💡 Drag any 3D node to sync new coordinates instantly with React states</span>
                </div>
              </div>

              {/* Phase 3 Physics Solver & Ballistic Trajectory Control Deck */}
              <div className="h-[250px] bg-[#1a1b1e] border-t border-stone-900 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-stone-900 shrink-0 select-text overflow-y-auto">
                
                {/* SECTION 1: Scene Graph & Rigging Coordinates */}
                <div className="flex-1 p-3.5 flex flex-col justify-between text-left min-h-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-mono font-black text-sky-400 uppercase tracking-widest flex items-center gap-1">
                        <Cpu className="h-3 w-3" /> GLES3 Scene Nodes
                      </span>
                      <span className="text-[7.5px] bg-[#224466] text-sky-200 border border-sky-900 px-1.5 rounded font-mono">RIG: RIG_OK</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[8px] font-mono text-stone-400 uppercase">Select Target Rig Node:</label>
                      <select
                        value={selectedEntityId || ''}
                        onChange={(e) => setSelectedEntityId(e.target.value || null)}
                        className="w-full bg-stone-950 border border-stone-800 text-[9px] font-mono text-stone-200 p-1 rounded focus:outline-none focus:border-sky-500"
                      >
                        {sceneEntities.map(ent => (
                          <option key={ent.id} value={ent.id}>
                            {ent.faction === 'maratha' ? '🟢' : '🔴'} {ent.label} (Vector3)
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedEntityId && (() => {
                      const selectedEntity = sceneEntities.find(ent => ent.id === selectedEntityId);
                      if (!selectedEntity) return null;
                      return (
                        <div className="bg-stone-950 p-2 rounded border border-stone-900 space-y-1 text-stone-300">
                          <div className="flex justify-between text-[8px] font-mono">
                            <span>Vector3.X coord:</span>
                            <span className="text-emerald-400 font-bold">{selectedEntity.x.toFixed(2)}m</span>
                          </div>
                          <div className="flex justify-between text-[8px] font-mono">
                            <span>Vector3.Z coord:</span>
                            <span className="text-emerald-400 font-bold">{selectedEntity.z.toFixed(2)}m</span>
                          </div>
                          <div className="flex justify-between text-[8px] font-mono">
                            <span>Rig Size limit:</span>
                            <span className="text-orange-400 font-bold">{(selectedEntity.size * 2).toFixed(1)}m Collider</span>
                          </div>
                          <div className="pt-1.5 flex gap-1 justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSceneEntities(prev => prev.map(ent => ent.id === selectedEntityId ? { ...ent, x: Math.max(-8, ent.x - 0.5) } : ent));
                                addTerminalLog(`Physics Rig: Shifted ${selectedEntity.label} X offset`);
                              }}
                              className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 text-[8px] text-stone-400 hover:text-white rounded cursor-pointer"
                            >
                              ⬅ X-
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSceneEntities(prev => prev.map(ent => ent.id === selectedEntityId ? { ...ent, x: Math.min(8, ent.x + 0.5) } : ent));
                                addTerminalLog(`Physics Rig: Shifted ${selectedEntity.label} X offset`);
                              }}
                              className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 text-[8px] text-stone-400 hover:text-white rounded cursor-pointer"
                            >
                              X+ ➡
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSceneEntities(prev => prev.map(ent => ent.id === selectedEntityId ? { ...ent, z: Math.max(-8, ent.z - 0.5) } : ent));
                                addTerminalLog(`Physics Rig: Shifted ${selectedEntity.label} Z offset`);
                              }}
                              className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 text-[8px] text-stone-400 hover:text-white rounded cursor-pointer"
                            >
                              ⬆ Z-
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSceneEntities(prev => prev.map(ent => ent.id === selectedEntityId ? { ...ent, z: Math.min(8, ent.z + 0.5) } : ent));
                                addTerminalLog(`Physics Rig: Shifted ${selectedEntity.label} Z offset`);
                              }}
                              className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 text-[8px] text-stone-400 hover:text-white rounded cursor-pointer"
                            >
                              Z+ ⬇
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <span className="text-[7.5px] font-mono text-stone-500 uppercase tracking-widest block mt-2">
                    * Drag directly in the 3D grid area for custom translation
                  </span>
                </div>

                {/* SECTION 2: Phase 3 Ballistic Artillery Launcher */}
                <div className="flex-1 p-3.5 flex flex-col justify-between text-left min-h-0">
                  <div className="space-y-2">
                    <span className="text-[9.5px] font-mono font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                      <Target className="h-3 w-3 text-amber-500" /> Ballistic Launcher
                    </span>

                    <div className="space-y-1">
                      <label className="block text-[8px] font-mono text-stone-400 uppercase">Target Enemy Sector:</label>
                      <select
                        value={selectedTargetId}
                        onChange={(e) => setSelectedTargetId(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-[9.5px] font-mono text-orange-200 p-1 rounded focus:outline-none"
                      >
                        {sceneEntities.filter(ent => ent.faction === 'durrani').map(ent => (
                          <option key={ent.id} value={ent.id}>
                            {ent.label} [Vector3({ent.x.toFixed(1)}, 0, {ent.z.toFixed(1)})]
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[7px] font-mono text-stone-400">
                          <span>Angle:</span>
                          <span className="text-amber-400 font-bold">{cannonAngle}°</span>
                        </div>
                        <input 
                          type="range"
                          min="15"
                          max="80"
                          value={cannonAngle}
                          onChange={(e) => setCannonAngle(Number(e.target.value))}
                          className="w-full h-1 bg-stone-800 accent-amber-500 rounded cursor-pointer"
                        />
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[7px] font-mono text-stone-400">
                          <span>Velocity:</span>
                          <span className="text-amber-400 font-bold">{cannonVelocity} m/s</span>
                        </div>
                        <input 
                          type="range"
                          min="10"
                          max="45"
                          value={cannonVelocity}
                          onChange={(e) => setCannonVelocity(Number(e.target.value))}
                          className="w-full h-1 bg-stone-800 accent-amber-500 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFireBallisticShell}
                    disabled={isLaunchingProjectile}
                    className="w-full mt-2 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-stone-800 disabled:to-stone-800 text-white text-[9.5px] font-mono font-black uppercase rounded shadow-lg border border-amber-500 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isLaunchingProjectile ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 text-white animate-spin" />
                        <span>Projectile in Flight...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                        <span>Fire Ballistic Shell</span>
                      </>
                    )}
                  </button>
                </div>

                {/* SECTION 3: Live Collision Solver & Skirmish Core */}
                <div className="flex-1 p-3.5 flex flex-col justify-between text-left min-h-0">
                  <div className="space-y-2">
                    <span className="text-[9.5px] font-mono font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Live Collision Solver
                    </span>

                    {/* Collision alerts */}
                    <div className="min-h-[64px] bg-stone-950 p-2 rounded border border-stone-900 flex flex-col justify-center">
                      {collisionWarning ? (
                        <div className="text-[8px] font-mono text-rose-400 leading-tight flex items-start gap-1">
                          <span className="shrink-0">⚠️</span>
                          <span>{collisionWarning}</span>
                        </div>
                      ) : (
                        <div className="text-[8px] font-mono text-emerald-400 leading-tight flex items-center gap-1.5 justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>ALL rigid bounding colliders stable (GLES3). No active mesh overlaps.</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[8px] font-mono text-stone-400">
                      <span>Melee Walker Engines:</span>
                      <span className={skirmishActive ? "text-emerald-400 font-bold animate-pulse" : "text-stone-500 font-bold"}>
                        {skirmishActive ? "ENGAGED" : "HALTED"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSkirmishActive(!skirmishActive);
                      addTerminalLog(`Physics Core: Melee Skirmish core ${!skirmishActive ? 'ENGAGED' : 'HALTED'}. Autonomous pathfinders ${!skirmishActive ? 'dispatched' : 'halted'}.`);
                    }}
                    className={`w-full py-2 border rounded text-[9.5px] font-mono font-black uppercase cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                      skirmishActive
                        ? 'bg-rose-950/60 text-rose-400 border-rose-900 hover:bg-rose-900 hover:text-white'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white hover:bg-stone-850'
                    }`}
                  >
                    <Zap className={`h-3 w-3 ${skirmishActive ? 'animate-bounce text-yellow-400' : ''}`} />
                    {skirmishActive ? 'Halt Melee Skirmish' : 'Engage Melee Skirmish'}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: GDSCRIPT CODE PLAYGROUND */}
          {activeTab === 'gdscript' && (
            <div className="flex-1 flex flex-col p-4 font-mono text-left overflow-y-auto">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-orange-400" />
                  active node.gd script (GDScript 2.0 compiler)
                </span>
                <span className="text-[7px] text-emerald-400 bg-emerald-950/60 border border-emerald-900/50 px-1.5 py-0.5 rounded font-black">
                  LIVE INTEROP HOOK
                </span>
              </div>

              {/* GDScript Editor Area */}
              <div className="flex-1 flex flex-col bg-[#111215] border border-stone-900 rounded overflow-hidden min-h-[140px]">
                <textarea
                  value={gdScript}
                  onChange={(e) => setGdScript(e.target.value)}
                  className="flex-1 p-3 bg-stone-950 text-emerald-400 text-[10px] font-mono leading-relaxed outline-none border-0 resize-none overflow-y-auto"
                />
              </div>

              <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-[7.5px]">
                  <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    compileStatus === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' :
                    compileStatus === 'compiling' ? 'bg-orange-950 text-orange-400 border border-orange-900' : 'bg-stone-900 text-stone-400'
                  }`}>
                    {compileStatus === 'success' ? '✔ COMPILATION GREEN' :
                     compileStatus === 'compiling' ? '⚙ ASSEMBLING...' : '● SCRIPT UNMODIFIED'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCompileGDScript}
                  disabled={compileStatus === 'compiling'}
                  className="px-3 py-1 text-[8px] font-black uppercase bg-[#2e4057] text-white rounded border border-sky-400 hover:bg-sky-500 hover:shadow-lg cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {compileStatus === 'compiling' ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                  Hot-Compile GDScript byte
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PCK DROP-IN PACKAGE LOADER */}
          {activeTab === 'pck_loader' && (
            <div className="flex-1 p-4 font-mono text-left overflow-y-auto flex flex-col gap-4">
              <div>
                <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                  <UploadCloud className="h-3.5 w-3.5 text-sky-400 animate-bounce" />
                  PHASE 2: PCK FILE DRAG-AND-DROP ASSEMBLY MOUNT
                </span>
                <p className="text-[8px] text-stone-500 uppercase tracking-wider block mt-0.5">
                  Drop custom compiled .pck, .zip, or .wasm bundles to mount custom 3D scene modules
                </p>
              </div>

              {/* Drag zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 min-h-[140px] border-2 border-dashed rounded flex flex-col items-center justify-center p-6 text-center transition-all relative ${
                  isDraggingPck 
                    ? 'border-sky-400 bg-sky-950/10' 
                    : 'border-stone-800 bg-stone-900/20 hover:border-stone-700'
                }`}
              >
                <input 
                  type="file" 
                  accept=".pck,.zip"
                  onChange={handleFileSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />

                <UploadCloud className={`h-10 w-10 mb-2 transition-all ${isDraggingPck ? 'text-sky-400 scale-110' : 'text-stone-500'}`} />
                <span className="text-[9.5px] font-bold text-stone-200">
                  Drag and drop compiled <code className="text-amber-400">.pck</code> pack bundle here
                </span>
                <span className="text-[7.5px] text-stone-500 mt-1 uppercase">
                  Or click this box to browse local disk storage (Max 150 MB)
                </span>

                {pckCompileState !== 'none' && (
                  <div className="mt-4 p-2 bg-stone-950 rounded border border-stone-900 max-w-sm w-full text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-black text-white truncate max-w-[180px]">{pckFileName}</span>
                      <span className="text-[7.5px] text-stone-400">{pckFileSize}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[7.5px]">
                      {pckCompileState === 'loading' ? (
                        <>
                          <RefreshCw className="h-3 w-3 text-sky-400 animate-spin" />
                          <span className="text-sky-400 font-bold uppercase">Mounting virtual pack file...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold uppercase">Active & Bound GLES3 Scene Graph</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Diagnostics Box */}
              <div className="bg-[#121315] p-3 rounded border border-stone-900 space-y-2">
                <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest block flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3 text-orange-400" /> GLES3 SharedArrayBuffer Diagnostics Checklist
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="bg-stone-950 p-1.5 rounded border border-stone-900">
                    <span className="text-[7px] text-stone-500 uppercase block leading-none">SharedArrayBuffer</span>
                    <span className={`text-[8.5px] font-bold block mt-1 ${sabSupported ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {sabSupported ? 'SUPPORTED (Multi-Thread)' : 'UNAVAILABLE (Single-Thread Fallback)'}
                    </span>
                  </div>

                  <div className="bg-stone-950 p-1.5 rounded border border-stone-900">
                    <span className="text-[7px] text-stone-500 uppercase block leading-none">COOP Header</span>
                    <span className={`text-[8.5px] font-bold block mt-1 ${coopActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {coopActive ? 'COOP ACTIVE (Same-Origin)' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="bg-stone-950 p-1.5 rounded border border-stone-900">
                    <span className="text-[7px] text-stone-500 uppercase block leading-none">COEP Header</span>
                    <span className={`text-[8.5px] font-bold block mt-1 ${coepActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {coepActive ? 'COEP ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>

                <p className="text-[7.5px] text-stone-400 leading-snug">
                  <span className="text-amber-400 font-black">Note:</span> Godot HTML5 multi-threaded games strictly require COOP/COEP HTTP headers. In modern browsers, they enable high-performance GLES3 textures and audio synthesis threading. If not enabled, the game compiles under the fallback WebGL 2.0 driver.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TELEMETRY SIGNAL DECK LOGS */}
          {activeTab === 'telemetry' && (
            <div className="flex-1 flex flex-col p-4 font-mono text-left overflow-hidden">
              <div className="flex justify-between items-center border-b border-stone-900 pb-2 mb-2 shrink-0">
                <span className="text-[9.5px] font-black text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Wifi className="h-3.5 w-3.5 text-sky-400" />
                  bidirectional js bridge packet trace logs
                </span>
                <button
                  type="button"
                  onClick={() => setPacketLogs([])}
                  className="text-[7.5px] text-stone-500 hover:text-stone-300 font-bold uppercase cursor-pointer"
                >
                  Clear logs
                </button>
              </div>

              {/* Event payload broadcaster */}
              <div className="bg-stone-900/60 p-2.5 rounded border border-stone-900 mb-3 shrink-0 flex flex-col sm:flex-row gap-2">
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[7.5px] text-stone-400 uppercase font-bold">Inject Event:</span>
                    <span className="text-[7.5px] text-stone-500 font-mono">React → Godot assembly</span>
                  </div>
                  <input
                    type="text"
                    value={customEventName}
                    onChange={(e) => setCustomEventName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 text-[8px] font-mono p-1 rounded text-orange-400 focus:border-orange-500 outline-none"
                    placeholder="Event Name"
                  />
                  <textarea
                    value={customEventPayload}
                    onChange={(e) => setCustomEventPayload(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 text-[7.5px] font-mono p-1 rounded text-emerald-400 h-10 resize-none outline-none focus:border-emerald-500"
                    placeholder="JSON Payload"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCustomEvent}
                  className="px-3 py-1.5 bg-orange-950/80 text-orange-400 border border-orange-900 rounded-sm hover:bg-orange-900 hover:text-white cursor-pointer flex items-center justify-center gap-1 text-[8.5px] font-mono uppercase self-end transition-all"
                >
                  <Send className="h-3 w-3" /> Broadcast RPC
                </button>
              </div>

              <div className="flex-1 bg-stone-950 rounded border border-stone-900 overflow-y-auto p-2 space-y-1.5 min-h-0">
                {packetLogs.length === 0 ? (
                  <div className="text-[9.5px] text-stone-500 text-center py-12">
                    ● No packets trace logged yet. Dispatch triggers to fire.
                  </div>
                ) : (
                  packetLogs.map((log) => (
                    <div key={log.id} className="text-[8px] leading-relaxed p-1.5 rounded bg-stone-900/50 hover:bg-stone-900 border border-stone-950 transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`px-1 rounded font-black ${
                          log.direction === 'REACT_TO_GODOT' 
                            ? 'bg-blue-950 text-blue-400 border border-blue-900' 
                            : 'bg-orange-950 text-orange-400 border border-orange-900'
                        }`}>
                          {log.direction}
                        </span>
                        <span className="text-stone-500">{log.timestamp}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-stone-400 font-bold uppercase">Event:</span>
                        <span className="text-white font-black">{log.type}</span>
                      </div>
                      <div className="mt-1 font-sans text-[8px] text-emerald-400 break-all bg-black/40 p-1 rounded-xs">
                        {log.payload}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: INTEGRATION DOCS */}
          {activeTab === 'integration_doc' && (
            <div className="flex-1 p-4 text-left overflow-y-auto font-sans leading-relaxed text-xs text-stone-300">
              <div className="border-b border-stone-800 pb-2 mb-3">
                <h4 className="text-[10.5px] font-mono font-black text-saffron uppercase tracking-widest flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-saffron" />
                  GODOT WASM INTEGRATION BLUEPRINT
                </h4>
                <p className="text-[8px] font-mono text-stone-400 uppercase tracking-wider block mt-0.5">
                  Three-Phase Implementation roadmap for custom engine builds
                </p>
              </div>

              <div className="space-y-4">
                {/* Phase 1 */}
                <div className="bg-[#1c1d22] p-3 rounded border border-stone-800">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-5 w-5 rounded-full bg-sky-500/10 text-sky-400 font-mono text-[9px] font-black flex items-center justify-center border border-sky-900">
                      I
                    </span>
                    <span className="text-[9.5px] font-mono font-black text-white uppercase tracking-wider">
                      PHASE 1: WebAssembly Portal & Bidirectional JS Bridge
                    </span>
                  </div>
                  <p className="text-[9px] text-stone-400 pl-7 leading-relaxed">
                    Set up the main React container, layout viewports, and declare the global <code className="text-amber-400">window.godotBridge</code> hook layer to allow safe interop communication without page reloads. This validates visual layouts and handles telemetry.
                  </p>
                </div>

                {/* Phase 2 */}
                <div className="bg-[#1c1d22] p-3 rounded border border-stone-800">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-5 w-5 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[9px] font-black flex items-center justify-center border border-amber-900">
                      II
                    </span>
                    <span className="text-[9.5px] font-mono font-black text-white uppercase tracking-wider">
                      PHASE 2: compiled WebAssembly Package Drop-in (Active)
                    </span>
                  </div>
                  <p className="text-[9px] text-stone-400 pl-7 leading-relaxed font-sans">
                    Compile the Godot project into a <code className="text-white">Web HTML5</code> target in the Godot Editor. This generates <code className="text-emerald-400">.wasm, .pck, .js</code> bundle assets. Drop these into the React app's <code className="text-white">public/godot/</code> folder and load them into an iframe or parent canvas. Use drag-and-drop to live-test local modifications!
                  </p>
                  <div className="bg-black p-2 rounded-xs text-[7.5px] font-mono text-orange-400 mt-2 ml-7 overflow-x-auto leading-relaxed">
                    {`# GDScript code to intercept React Events
func listen_to_react_events(event_name: String, callback: Callable):
    if OS.has_feature("web"):
        var js_context = JavaScriptBridge.get_interface("godotBridge")
        # register callback listeners...`}
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="bg-[#1c1d22] p-3 rounded border border-stone-800">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-black flex items-center justify-center border border-emerald-900">
                      III
                    </span>
                    <span className="text-[9.5px] font-mono font-black text-white uppercase tracking-wider">
                      PHASE 3: Full State Sync, Collisions & Damage Feeds
                    </span>
                  </div>
                  <p className="text-[9px] text-stone-400 pl-7 leading-relaxed">
                    Sync unit coordinates and states. Godot computes 3D mesh collisions, ragdoll physics, and projectile bullet arc trajectories, then sends damage packets back to React to subtract troop cohesion indices dynamically.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>



      </div>
    </div>
  );
};
