import React, { useState, useEffect, useRef } from 'react';
import p5 from 'p5';
import { Sparkles, Trophy, RotateCcw, Drum } from 'lucide-react';

interface FireworkRocket3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  targetY: number;
  color: string;
}

interface SparkParticle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
  size: number;
  fadeSpeed: number;
}

interface SkyLantern3D {
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
  phase: number;
}

interface RoyalDebris3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  speedRotate: number;
  size: number;
  isCoin: boolean;
}

export const PuneCelebrationVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  // States to sync interactive numbers with React overlay
  const [drumBeats, setDrumBeats] = useState<number>(0);
  const [celebrationPower, setCelebrationPower] = useState<number>(100);

  // Communication refs between React button clicks and p5 loop
  const triggerDrumLeftRef = useRef<(() => void) | null>(null);
  const triggerDrumRightRef = useRef<(() => void) | null>(null);
  const triggerSkyLaunchRef = useRef<((tx: number, ty: number) => void) | null>(null);

  useEffect(() => {
    const sketch = (p: p5) => {
      // 3D Element Pools
      let rockets: FireworkRocket3D[] = [];
      let sparks: SparkParticle3D[] = [];
      let lanterns: SkyLantern3D[] = [];
      let fallingDebris: RoyalDebris3D[] = [];

      // Interactivity States
      let drumPulseL = 0;
      let drumPulseR = 0;
      let drumBeatTotal = 0;

      // Viewing Angle Orbit Angles (Auto-cinematic unless user drags)
      let rotY = 0;
      let rotX = -0.12;
      let isUserDragging = false;
      let targetRotY = 0;
      let targetRotX = -0.12;

      p.setup = () => {
        const w = (containerRef.current?.clientWidth || 600);
        const h = Math.round(w * 0.5625); // 16:9 ratio

        // Clean out any historical canvases
        if (containerRef.current) {
          const canvases = containerRef.current.getElementsByTagName('canvas');
          for (let i = canvases.length - 1; i >= 0; i--) {
            canvases[i].remove();
          }
        }

        const canvas = p.createCanvas(w, h, (p as any).WEBGL);
        canvas.parent(containerRef.current!);
        
        // Disable default page context menu on right click to accommodate panning
        const canvasEl = canvas.elt;
        canvasEl.oncontextmenu = (e: any) => e.preventDefault();

        // 1. Initialize 18 Floating 3D Celestial Lanterns of Pune
        for (let i = 0; i < 18; i++) {
          lanterns.push({
            x: p.random(-450, 450),
            y: p.random(-250, 150),
            z: p.random(-380, -100),
            speed: p.random(0.5, 1.2),
            size: p.random(7, 13),
            phase: p.random(p.TWO_PI)
          });
        }

        // 2. Initialize 30 Falling Royal Assets (Gold coins & Crimson Rose petals)
        for (let i = 0; i < 30; i++) {
          fallingDebris.push(createFallingAsset(true, p.random(-200, 200)));
        }
      };

      p.draw = () => {
        p.background('#0b0604'); // Intensely dark night canvas
        
        // 3D Lights Settings
        p.ambientLight(25, 18, 14);
        
        // Distribute warm fire and lantern light sources
        p.directionalLight(255, 180, 100, 0, 0.5, -0.6);
        p.pointLight(251, 140, 30, -130, 20, 50); // Left bastion torch glow
        p.pointLight(249, 115, 22, 130, 20, 50);  // Right bastion torch glow

        // Cinematic Camera Pan (slow horizontal sweep)
        if (!isUserDragging) {
          targetRotY = p.sin(p.frameCount * 0.003) * 0.22;
          targetRotX = -0.12 + p.cos(p.frameCount * 0.002) * 0.05;
        }

        // Smoothen out camera rotations
        rotY = p.lerp(rotY, targetRotY, 0.08);
        rotX = p.lerp(rotX, targetRotX, 0.08);

        p.push();
        p.rotateX(rotX);
        p.rotateY(rotY);

        // 1. DRAW COZY BACKGROUND SKIES & STARS
        p.push();
        p.translate(0, 0, -500);
        p.fill('#180802');
        p.noStroke();
        p.plane(1600, 1100);
        
        // Small Twinkling Sky Glitter Box Elements (distant Stars)
        p.fill(255, 225, 180, 180);
        p.randomSeed(44);
        for (let i = 0; i < 45; i++) {
          const starX = p.random(-600, 600);
          const starY = p.random(-350, 150);
          const starS = p.random(1.5, 3.8);
          p.push();
          p.translate(starX, starY, 0);
          p.box(starS);
          p.pop();
        }
        p.pop();

        // 2. CELESTIAL SKY LANTERNS FLYING IN 3D SPACE
        updateAndDrawLanterns();

        // 3. SHANIWARWADA FORTRESS MAJOR WALLS & BASTIONS BUILD
        drawShaniwarWada3D();

        // 4. ACTIVE TORCHES FLICKER & POINT FIRE PARTICLE SYSTEMS
        drawTorchesAndFires();

        // 5. UPDATE AND GRAPH 3D FIREWORKS & TRIAL EXPLOSIONS
        updateAndDrawFireworks();

        // 6. UPDATE AND RENDER GOLD COINS & PETALS SHOWER
        updateAndDrawDebris();

        // 7. RENDER PULSING IMPERIAL DHOL-TASHA GRAND DRUMS
        drawCourtyardDrums();

        p.pop();

        // Decay drum tap pulses over time
        drumPulseL *= 0.88;
        drumPulseR *= 0.88;

        // Auto-pilot Fireworks launching program
        if (p.frameCount % 80 === 0 && rockets.length < 3) {
          triggerLaunch3D(p.random(-250, 250), p.random(-220, -120), p.random(-200, 50));
        }
      };

      // Drag to manually orbit Shaniwarwada in 3D
      p.mousePressed = () => {
        isUserDragging = true;
      };

      p.mouseReleased = () => {
        isUserDragging = false;
      };

      p.mouseDragged = () => {
        targetRotY += (p.mouseX - p.pmouseX) * 0.005;
        targetRotX += (p.mouseY - p.pmouseY) * 0.005;
        targetRotX = p.constrain(targetRotX, -0.6, 0.1); // Prevent flipping upside down
      };

      // 3D Drum strike animation triggers
      triggerDrumLeftRef.current = () => {
        drumPulseL = 1.0;
        executeDrumClickBonus();
      };

      triggerDrumRightRef.current = () => {
        drumPulseR = 1.0;
        executeDrumClickBonus();
      };

      triggerSkyLaunchRef.current = (tx: number, ty: number) => {
        triggerLaunch3D(tx, ty, p.random(-100, 50));
      };

      function executeDrumClickBonus() {
        drumBeatTotal++;
        setDrumBeats(drumBeatTotal);
        setCelebrationPower(prev => Math.min(250, prev + 12));

        // Direct high-tier sparkly rocket triggers right over the Wada on a drum beat
        const colors = ['#f59e0b', '#fb923c', '#e11d48', '#10b981', '#38bdf8', '#c084fc'];
        const targetColor = p.random(colors);
        
        rockets.push({
          x: p.random(-120, 120),
          y: 200,
          z: p.random(-150, 20),
          vx: p.random(-2.5, 2.5),
          vy: p.random(-9, -7),
          vz: p.random(-2, 25),
          targetY: p.random(-240, -140),
          color: targetColor
        });
      }

      function createFallingAsset(initRandomY: boolean, xPos?: number): RoyalDebris3D {
        const isCoin = p.random(1) > 0.45;
        return {
          x: xPos !== undefined ? xPos : p.random(-380, 380),
          y: initRandomY ? p.random(-400, 150) : -300,
          z: p.random(-220, 120),
          vx: p.random(-1.2, 1.2),
          vy: p.random(1.5, 4.2),
          vz: p.random(-0.7, 0.7),
          rx: p.random(p.TWO_PI),
          ry: p.random(p.TWO_PI),
          rz: p.random(p.TWO_PI),
          speedRotate: p.random(0.04, 0.12),
          size: isCoin ? p.random(4, 8) : p.random(6, 12),
          isCoin
        };
      }

      function triggerLaunch3D(tx: number, ty: number, tz: number) {
        const colors = ['#facc15', '#fb923c', '#ef4444', '#10b981', '#2563eb', '#a855f7', '#ec4899'];
        rockets.push({
          x: p.random(-80, 80),
          y: 200,
          z: p.random(-80, 50),
          vx: (tx) * 0.015,
          vy: p.random(-10, -7.5),
          vz: (tz) * 0.01,
          targetY: ty,
          color: p.random(colors)
        });
        setCelebrationPower(prev => Math.min(250, prev + 5));
      }

      function updateAndDrawLanterns() {
        lanterns.forEach(lan => {
          lan.y -= lan.speed;
          // Sway coordinates gently
          lan.x += p.sin(p.frameCount * 0.02 + lan.phase) * 0.28;
          lan.z += p.cos(p.frameCount * 0.015 + lan.phase) * 0.15;

          // Recycle lanterns that rise off screen
          if (lan.y < -380) {
            lan.y = 220;
            lan.x = p.random(-450, 450);
            lan.z = p.random(-380, -100);
            lan.speed = p.random(0.5, 1.2);
          }

          p.push();
          p.translate(lan.x, lan.y, lan.z);
          p.rotateY(p.frameCount * 0.012 + lan.phase);

          // Luminous saffron paper box
          p.noStroke();
          const baseColor = p.color('#f97316'); // Saffron
          const brightCo = p.color('#fcd34d'); // Warm yellow
          const mixCol = p.lerpColor(baseColor, brightCo, p.map(p.sin(p.frameCount * 0.06 + lan.phase), -1, 1, 0.1, 0.9));
          
          p.fill(mixCol);
          p.cylinder(lan.size, lan.size * 1.5, 5); // 5-sided box for custom rustic geometry

          // Gold bottom candle flare
          p.translate(0, lan.size * 0.75, 0);
          p.fill('#ea580c');
          p.cylinder(lan.size * 0.4, 2, 5);
          p.pop();
        });
      }

      function drawShaniwarWada3D() {
        // Deep charcoal/basalt stone walls
        const wallMainCol = p.color('#221b16');
        const wallHighlight = p.color('#16100c');

        // Flat ground courtyard sand plane representation
        p.push();
        p.translate(0, 105, -30);
        p.rotateX(p.HALF_PI);
        p.noStroke();
        p.fill('#18110b');
        p.plane(1000, 1000);
        p.pop();

        // 1. MAIN DELHI GATEHOUSE CENTRAL SLAB
        p.push();
        p.translate(0, 40, -100);
        p.fill(wallMainCol);
        p.stroke(wallHighlight);
        p.strokeWeight(1.5);
        p.box(230, 120, 45); // Core structure width, height, thickness
        p.pop();

        // 2. MONUMENTAL LEFT BASTION (OCTAGONAL COLUMN)
        p.push();
        p.translate(-142, 30, -90);
        p.fill('#2e251e');
        p.stroke(wallHighlight);
        p.strokeWeight(1.5);
        p.cylinder(38, 140, 8); // Flanking defense bastion with octagonal cuts (detailX=8)
        p.pop();

        // 3. MONUMENTAL RIGHT BASTION
        p.push();
        p.translate(142, 30, -90);
        p.fill('#2e251e');
        p.stroke(wallHighlight);
        p.strokeWeight(1.5);
        p.cylinder(38, 140, 8);
        p.pop();

        // 4. WOODEN DELHI GATE ARROW SPAWN DOORS (Angled open in victory celebration!)
        // Left Door leaf
        p.push();
        p.translate(-26, 62, -76);
        p.rotateY(p.QUARTER_PI * 1.4);
        p.fill('#422d20'); // deep timbers
        p.stroke('#1c1109');
        p.strokeWeight(1.2);
        p.box(28, 76, 4);
        p.pop();

        // Right Door leaf
        p.push();
        p.translate(26, 62, -76);
        p.rotateY(-p.QUARTER_PI * 1.4);
        p.fill('#422d20');
        p.stroke('#1c1109');
        p.strokeWeight(1.2);
        p.box(28, 76, 4);
        p.pop();

        // 5. INNER DARK RECESS OF SHANIWARWADA CHAMBERS
        p.push();
        p.translate(0, 62, -80);
        p.fill('#090403');
        p.noStroke();
        p.box(58, 80, 2);
        p.pop();

        // Arch trim stone crown
        p.push();
        p.translate(0, 54, -77);
        p.fill('#33261d');
        p.box(70, 94, 6);
        p.pop();

        // 6. NAGARKHANA BALCONY STRUCTURE ON TOP OF MAIN GATEHOUSE
        // Platform
        p.push();
        p.translate(0, -30, -92);
        p.fill('#3e2e25');
        p.stroke(wallHighlight);
        p.strokeWeight(1);
        p.box(140, 16, 44);
        p.pop();

        // Balcony decorative Pillars
        const pillarsOffset = [-50, -25, 0, 25, 50];
        pillarsOffset.forEach(off => {
          p.push();
          p.translate(off, -48, -85);
          p.fill('#d97706'); // Glistering turmeric gold
          p.noStroke();
          p.cylinder(2.2, 20);
          p.pop();
        });

        // Royal canopy roof (Saffron/Rust cover)
        p.push();
        p.translate(0, -66, -92);
        p.fill('#ea580c');
        p.stroke('#9a3412');
        p.strokeWeight(1);
        p.box(150, 16, 50);
        p.pop();

        // Pavilion cone cap tip
        p.push();
        p.translate(0, -80, -92);
        p.fill('#f97316');
        p.noStroke();
        p.cone(32, 14, 4);
        p.pop();

        // 7. LIT PALACE WINDOWS (Warm fire glowing inside deep rooms)
        // Draw 3D glowing amber boxes on bastions to represent illuminated palace alcoves
        for (let side of [-1, 1]) {
          p.push();
          p.translate(side * 142, -15, -60);
          p.fill('#f59e0b'); // Lit lantern panels
          p.noStroke();
          p.box(10, 16, 2);
          p.pop();

          p.push();
          p.translate(side * 142, 15, -60);
          p.fill('#f59e0b');
          p.noStroke();
          p.box(10, 16, 2);
          p.pop();
        }

        // 8. LUXURIOUS FLUTTERING SAFFRON VICTORY BANNERS
        // Left Bastion Pole
        p.push();
        p.translate(-142, -62, -90);
        p.fill(85, 60, 45);
        p.noStroke();
        p.cylinder(2, 60);
        p.pop();

        // Left fluttering royal ribbon fabric
        p.push();
        p.translate(-142, -76, -90);
        p.fill('#f97316');
        p.noStroke();
        for (let i = 0; i < 8; i++) {
          const waveZ = p.sin(p.frameCount * 0.14 - i * 0.55) * 11;
          p.push();
          p.translate(i * 6, -3, waveZ);
          p.box(6, 22 - i * 1.8, 1.8);
          p.pop();
        }
        p.pop();

        // Right Bastion Pole
        p.push();
        p.translate(142, -62, -90);
        p.fill(85, 60, 45);
        p.noStroke();
        p.cylinder(2, 60);
        p.pop();

        // Right waving banner ribbons
        p.push();
        p.translate(142, -76, -90);
        p.fill('#f97316');
        p.noStroke();
        for (let i = 0; i < 8; i++) {
          const waveZ = p.sin(p.frameCount * 0.14 - i * 0.55 + 1.2) * 11;
          p.push();
          p.translate(i * 6, -3, waveZ);
          p.box(6, 22 - i * 1.8, 1.8);
          p.pop();
        }
        p.pop();
      }

      function drawTorchesAndFires() {
        // Double lit guard torch brackets beside the main archway
        const torchXBase = [-42, 42];
        torchXBase.forEach(tx => {
          p.push();
          p.translate(tx, 50, -78);
          p.fill('#1e1b18'); // dark cast iron bracket
          p.noStroke();
          p.box(4, 18, 4);
          p.pop();

          // Active particle fire flame bobbing
          p.push();
          p.translate(tx, 38 - p.random(0, 3.5), -78);
          const fSize = 8.5 + p.sin(p.frameCount * 0.22 + tx) * 2.5;
          p.noStroke();
          p.fill(p.color(249, 115, 22, 190));
          p.sphere(fSize);
          p.fill('#fef08a'); // central bright focus
          p.sphere(fSize * 0.45);
          p.pop();
        });
      }

      function updateAndDrawFireworks() {
        // Update firing rocket shells
        for (let i = rockets.length - 1; i >= 0; i--) {
          const r = rockets[i];
          r.x += r.vx;
          r.y += r.vy;
          r.z += r.vz;

          // Animate continuous tail trail sparks
          p.push();
          p.translate(r.x, r.y, r.z);
          p.noStroke();
          p.fill('#fed7aa');
          p.sphere(3.5);
          p.pop();

          // Detonation triggers at target height apex
          if (r.vy >= 0 || r.y <= r.targetY) {
            // Generate a dazzling 3D spherical constellation shell burst
            const parsedColor = p.color(r.color);
            const redC = p.red(parsedColor);
            const greC = p.green(parsedColor);
            const bluC = p.blue(parsedColor);

            const sparkCount = p.random(32, 52);
            for (let s = 0; s < sparkCount; s++) {
              const theta1 = p.random(p.TWO_PI);
              const theta2 = p.random(p.PI);
              const speed = p.random(2.5, 6.8);

              // 3D spherical distribution kinematics
              const vx = Math.sin(theta2) * Math.cos(theta1) * speed;
              const vy = Math.sin(theta2) * Math.sin(theta1) * speed;
              const vz = Math.cos(theta2) * speed;

              sparks.push({
                x: r.x,
                y: r.y,
                z: r.z,
                vx,
                vy,
                vz,
                r: redC,
                g: greC,
                b: bluC,
                alpha: 255,
                size: p.random(2, 4.8),
                fadeSpeed: p.random(4, 7)
              });
            }

            rockets.splice(i, 1);
          }
        }

        // Draw active twinkling spark entities
        for (let idx = sparks.length - 1; idx >= 0; idx--) {
          const s = sparks[idx];
          s.x += s.vx;
          s.y += s.vy;
          s.z += s.vz;

          s.vy += 0.08; // Gravity downwards
          s.vx *= 0.98;  // Medium air drag
          s.vy *= 0.98;
          s.vz *= 0.98;
          s.alpha -= s.fadeSpeed;

          if (s.alpha <= 0) {
            sparks.splice(idx, 1);
            continue;
          }

          p.push();
          p.translate(s.x, s.y, s.z);
          p.noStroke();
          p.fill(s.r, s.g, s.b, s.alpha);
          p.box(s.size);
          p.pop();
        }
      }

      function updateAndDrawDebris() {
        fallingDebris.forEach(deb => {
          deb.y += deb.vy;
          deb.x += deb.vx + p.sin(p.frameCount * 0.03 + deb.rx) * 0.4;
          deb.z += deb.vz;

          deb.rx += deb.speedRotate;
          deb.ry += deb.speedRotate * 0.8;

          p.push();
          p.translate(deb.x, deb.y, deb.z);
          p.rotateX(deb.rx);
          p.rotateY(deb.ry);

          if (deb.isCoin) {
            // Gold Mohur Coin (yellow glowing thin cylinder)
            p.fill('#f59e0b');
            p.stroke('#fef08a');
            p.strokeWeight(0.5);
            p.cylinder(deb.size, 1.2, 7);
          } else {
            // Saffron/Crimson red banner rose petal
            p.fill('#ef4444');
            p.noStroke();
            p.box(deb.size, deb.size * 0.6, 1);
          }
          p.pop();

          // Reset debris that fall beneath the ground
          if (deb.y > 110) {
            const recycled = createFallingAsset(false);
            deb.x = recycled.x;
            deb.y = recycled.y;
            deb.z = recycled.z;
            deb.vx = recycled.vx;
            deb.vy = recycled.vy;
            deb.vz = recycled.vz;
            deb.rx = recycled.rx;
            deb.ry = recycled.ry;
            deb.size = recycled.size;
            deb.isCoin = recycled.isCoin;
          }
        });
      }

      function drawCourtyardDrums() {
        // Place Left and Right Grand Dhols in the foreground to anchor 3D layout
        const leftDrumX = -170;
        const rightDrumX = 170;
        const dY = 95;
        const dZ = 40;

        // --- Left drum ---
        p.push();
        p.translate(leftDrumX, dY, dZ);
        p.rotateZ(0.22);
        p.rotateY(0.4);
        
        // Scale bulge on hit
        const sL = 1.0 + drumPulseL * 0.26;
        p.scale(sL, sL, sL);

        p.fill('#78350f'); // mahogany cask
        p.stroke('#271309');
        p.strokeWeight(1.2);
        p.cylinder(22, 38, 12); // detailX=12 for a rounded barrel

        // Cream leather drum skins
        p.translate(0, -19.2, 0);
        p.fill('#fef08a');
        p.noStroke();
        p.cylinder(23, 1.8, 12);
        p.pop();

        // --- Left Drumstick hits dynamically ---
        p.push();
        p.translate(leftDrumX + 10, dY - 25, dZ + 5);
        p.rotateZ(-0.4 - drumPulseL * 0.7); // hits down on spike
        p.fill('#e2e8f0');
        p.noStroke();
        p.cylinder(2, 22);
        p.pop();


        // --- Right drum ---
        p.push();
        p.translate(rightDrumX, dY, dZ);
        p.rotateZ(-0.22);
        p.rotateY(-0.4);

        const sR = 1.0 + drumPulseR * 0.26;
        p.scale(sR, sR, sR);

        p.fill('#78350f');
        p.stroke('#271309');
        p.strokeWeight(1.2);
        p.cylinder(22, 38, 12);

        p.translate(0, -19.2, 0);
        p.fill('#fef08a');
        p.noStroke();
        p.cylinder(23, 1.8, 12);
        p.pop();

        // --- Right Drumstick ---
        p.push();
        p.translate(rightDrumX - 10, dY - 25, dZ + 5);
        p.rotateZ(0.4 + drumPulseR * 0.7);
        p.fill('#e2e8f0');
        p.noStroke();
        p.cylinder(2, 22);
        p.pop();
      }

      p.windowResized = () => {
        if (containerRef.current) {
          const w = containerRef.current.clientWidth;
          const h = Math.round(w * 0.5625);
          p.resizeCanvas(w, h);
        }
      };
    };

    p5InstanceRef.current = new p5(sketch);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  const handleDrumLeftTap = () => {
    if (triggerDrumLeftRef.current) {
      triggerDrumLeftRef.current();
    }
  };

  const handleDrumRightTap = () => {
    if (triggerDrumRightRef.current) {
      triggerDrumRightRef.current();
    }
  };

  // Automated auto-tap interval so it beats grandly occasionally in backgrounds
  useEffect(() => {
    const dInterval = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.5) {
        handleDrumLeftTap();
      } else {
        handleDrumRightTap();
      }
    }, 2800);

    return () => clearInterval(dInterval);
  }, []);

  const registerClickOnScreen = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !triggerSkyLaunchRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left - rect.width / 2;
    const clickY = e.clientY - rect.top - rect.height / 2;
    triggerSkyLaunchRef.current(clickX * 1.5, clickY * 1.2 - 80);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 3D Visual Box Container */}
      <div 
        id="pune-celebration-visual-card"
        className="relative w-full overflow-hidden rounded-xs border-2 border-amber-600/35 flex flex-col justify-end shadow-2xl bg-[#080403] select-none"
      >
        {/* Glow vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-stone-950/40 to-stone-950/80 pointer-events-none z-10" />

        {/* Action instruction Overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 text-[9px] font-mono uppercase tracking-[0.22em] bg-stone-950/95 border border-amber-800/50 text-amber-500 py-1.5 px-4 rounded-full pointer-events-none shadow-xl flex items-center gap-1.5 animate-pulse">
          <Sparkles size={10} className="text-saffron animate-spin" />
          <span>Click/Drag to Orbit Wada in 3D • Click Sky to blast fireworks!</span>
        </div>

        {/* p5 3D WebGL Canvas mount */}
        <div 
          ref={containerRef}
          onClick={registerClickOnScreen}
          className="w-full relative z-0 cursor-grab active:cursor-grabbing overflow-hidden" 
        />

        {/* Shaniwar Wada stamp label bottom left */}
        <div className="absolute bottom-4 left-4 z-20 bg-stone-950/95 border border-[#8B5E3C]/45 px-3.5 py-2.5 rounded-xs shadow-md">
          <span className="text-[7px] font-mono text-saffron block leading-none font-black uppercase tracking-widest text-[#fbbf24]">
            DECCAN CONQUEST • CELEBRATION
          </span>
          <span className="text-[12px] text-white font-serif font-black block mt-1 uppercase tracking-wide">
            🏰 Shaniwar Wada 3D Citadel
          </span>
        </div>

        {/* Celebration Power Meter bottom right */}
        <div className="absolute bottom-4 right-4 z-20 bg-gradient-to-r from-amber-950/95 to-stone-950/95 border border-saffron/45 px-3.5 py-2 rounded-xs flex items-center gap-2 shadow-md">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[8px] font-mono text-stone-300">ENERGY BAR:</span>
          <span className="text-[12px] font-mono font-black text-saffron">
            {celebrationPower}%
          </span>
        </div>
      </div>

      {/* Dhol Beater buttons and interactive widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDrumLeftTap}
            className="flex-1 py-3 px-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-mono font-black text-[10.5px] uppercase tracking-wider border border-amber-400 rounded-xs transition-all hover:shadow-amber-900/30 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Drum size={13} className="shrink-0" />
            BEAT LEFT DHOL
          </button>
          
          <button
            type="button"
            onClick={handleDrumRightTap}
            className="flex-1 py-3 px-3.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-stone-950 font-mono font-black text-[10.5px] uppercase tracking-wider border border-orange-400 rounded-xs transition-all hover:shadow-orange-900/30 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Drum size={13} className="shrink-0" />
            BEAT RIGHT DHOL
          </button>
        </div>

        {/* Secure tribute info card */}
        <div className="p-3 bg-stone-950/90 border border-stone-850 rounded-xs text-left flex gap-3.5 items-center shadow-lg">
          <div className="p-2 bg-saffron/15 rounded-xs border border-saffron/30">
            <Trophy className="text-saffron shrink-0" size={15} />
          </div>
          <div>
            <div className="flex justify-between items-center pr-1">
              <h5 className="text-[10px] font-mono font-black text-white uppercase tracking-wider">
                👑 DHOL STRIKES RECORDED
              </h5>
              <span className="text-[11px] font-mono text-saffron font-bold bg-amber-950/50 px-2 py-0.5 rounded-xs border border-amber-800/30">
                {drumBeats} BPM
              </span>
            </div>
            <p className="text-[9px] font-sans text-stone-400 leading-tight mt-1">
              Courtyard echoes with heavy thundering waves! Imperial troops morale boosted to historical threshold.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
