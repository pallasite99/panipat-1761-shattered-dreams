import React, { useState, useEffect, useRef } from 'react';
import p5 from 'p5';
import { Sparkles, Trophy } from 'lucide-react';

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  fadeSpeed: number;
  sparkle: boolean;
}

interface CelebrationRocket {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
  exploded: boolean;
  trailLength: number;
}

interface FallingCoin {
  x: number;
  y: number;
  vy: number;
  speedX: number;
  angle: number;
  angleSpeed: number;
  size: number;
  isCoin: boolean; // coin or petal
}

interface DrumRipple {
  x: number;
  y: number;
  r: number;
  maxR: number;
  color: string;
  alpha: number;
}

export const PuneCelebrationVisual: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  // Synchronized metrics for React overlay
  const [drumStats, setDrumStats] = useState<number>(0);
  const [celebrationPower, setCelebrationPower] = useState<number>(100);

  // Shared ref triggers to push interactions straight to the p5 canvas context
  const onDrumBeatRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const sketch = (p: p5) => {
      let fireworks: CelebrationRocket[] = [];
      let fragments: FireworkParticle[] = [];
      let money: FallingCoin[] = [];
      let ripples: DrumRipple[] = [];

      // Elephant position & state
      let elephantX = 200;
      let elephantDir = 1;

      // Stars
      const stars: { x: number; y: number; s: number; offset: number }[] = [];

      p.setup = () => {
        const w = (containerRef.current?.clientWidth || 600);
        const h = Math.round(w * 0.5625); // 16:9 aspect ratio

        // Clean any existing canvases to prevent double rendering
        if (containerRef.current) {
          const canvases = containerRef.current.getElementsByTagName('canvas');
          for (let i = canvases.length - 1; i >= 0; i--) {
            canvases[i].remove();
          }
        }

        const canvas = p.createCanvas(w, h);
        canvas.parent(containerRef.current!);
        p.pixelDensity(1);

        // Pre-create twinkling stars
        for (let i = 0; i < 40; i++) {
          stars.push({
            x: p.random(w),
            y: p.random(h * 0.45),
            s: p.random(1, 3.2),
            offset: p.random(100)
          });
        }

        // Initialize coins & petals
        for (let i = 0; i < 25; i++) {
          money.push(createFallingItem(p.random(w), p.random(-100, 0)));
        }
      };

      p.draw = () => {
        const w = p.width;
        const h = p.height;
        const horizon = h * 0.52;

        p.noStroke();

        // 1. CELEBRATION TWILIGHT SKY GRADIENT
        const ctx = (p as any).drawingContext as CanvasRenderingContext2D;
        if (ctx && typeof ctx.createLinearGradient === 'function') {
          const grad = ctx.createLinearGradient(0, 0, 0, horizon);
          grad.addColorStop(0, '#090503');   // Midnight dark top
          grad.addColorStop(0.3, '#1d1007'); // Dark chocolate
          grad.addColorStop(0.7, '#501e05'); // Hot copper
          grad.addColorStop(1, '#853105');   // Rich saffron glow on ground
          p.push();
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, horizon);
          p.pop();
        } else {
          p.background('#1d1007');
        }

        // 2. STARS TWINKLING
        p.fill(255, 230, 180);
        stars.forEach(star => {
          const brightness = p.map(p.sin(p.frameCount * 0.04 + star.offset), -1, 1, 80, 255);
          p.fill(255, 240, 200, brightness);
          p.ellipse(star.x, star.y, star.s, star.s);
        });

        // 3. FAR DECCAN HILLS IN SILHOUETTE
        p.fill('#160e0a');
        p.beginShape();
        p.vertex(0, horizon);
        // Replace quadraticVertex with cubic bezierVertex
        (p as any).bezierVertex(w * 0.12, horizon - h * 0.08, w * 0.38, horizon - h * 0.05, w * 0.5, horizon - h * 0.02);
        (p as any).bezierVertex(w * 0.62, horizon - h * 0.02, w * 0.88, horizon - h * 0.09, w, horizon);
        p.vertex(w, h);
        p.vertex(0, h);
        p.endShape(p.CLOSE);

        p.fill('#22140d');
        p.beginShape();
        p.vertex(0, horizon);
        (p as any).bezierVertex(w * 0.18, horizon - h * 0.04, w * 0.48, horizon - h * 0.05, w * 0.68, horizon - h * 0.05);
        (p as any).bezierVertex(w * 0.78, horizon - h * 0.05, w * 0.9, horizon - h * 0.02, w, horizon - h * 0.03);
        p.vertex(w, h);
        p.vertex(0, h);
        p.endShape(p.CLOSE);

        // 4. LAUNCH ROCKETS & DRAW FIREWORKS PACKETS
        updateFireworksAndSparks(p, w, h);

        // 5. THE GREAT DELHI GATE OF SHANIWAR WADA (FORTRESS WALLS)
        const gateW = w * 0.44;
        const gateH = h * 0.42;
        const gateX = w * 0.5 - gateW * 0.5;
        const gateY = h - gateH;

        // Main defensive wall base
        p.fill('#281a12');
        p.stroke(p.color('#150d09'));
        p.strokeWeight(1.5);
        // Left Bastion
        p.rect(0, h - gateH * 1.15, gateX, gateH * 1.15);
        // Right Bastion
        p.rect(gateX + gateW, h - gateH * 1.15, w - (gateX + gateW), gateH * 1.15);

        // Main gatehouse building
        p.rect(gateX, gateY, gateW, gateH);

        // Draw fortress brick patterns efficiently
        p.stroke(p.color('rgba(92, 59, 41, 0.15)'));
        p.strokeWeight(1.2);
        const brickStepX = w * 0.06;
        const brickStepY = h * 0.035;
        for (let th = h - gateH * 1.15; th < h; th += brickStepY) {
          p.line(0, th, w, th);
        }
        for (let tx = 0; tx < w; tx += brickStepX) {
          p.line(tx, h - gateH * 1.15, tx, h);
        }

        // Beautiful gated stone archway
        p.ellipseMode(p.CENTER);
        p.noStroke();
        p.fill('#0d0705'); // dark inside of palace grounds
        p.rect(w * 0.5 - gateW * 0.22, h - gateH * 0.72, gateW * 0.44, gateH * 0.72);
        p.arc(w * 0.5, h - gateH * 0.72, gateW * 0.44, gateH * 0.55, p.PI, p.TWO_PI);

        // 6. MARCHING CEREMONIAL WHITE ELEPHANT (PARADE ROUTE)
        elephantX += 0.48 * elephantDir;
        if (elephantX > w * 0.5 + gateW * 0.12) {
          elephantDir = -1;
        } else if (elephantX < w * 0.5 - gateW * 0.12) {
          elephantDir = 1;
        }

        drawWhiteElephant(p, elephantX, h - 3, h * 0.09, elephantDir);

        // Decorative stone gate arches details
        p.noFill();
        p.stroke(p.color('#fbbf24'));
        p.strokeWeight(2);
        p.arc(w * 0.5, h - gateH * 0.72, gateW * 0.44, gateH * 0.55, p.PI, p.TWO_PI);
        p.line(w * 0.5 - gateW * 0.22, h - gateH * 0.72, w * 0.5 - gateW * 0.22, h);
        p.line(w * 0.5 + gateW * 0.22, h - gateH * 0.72, w * 0.5 + gateW * 0.22, h);

        // Balcony Nagar Khana on top of the arch
        const balconyW = gateW * 0.65;
        const balconyH = gateH * 0.28;
        const balconyY = gateY - balconyH * 0.85;

        p.fill('#422216');
        p.stroke(p.color('#150d09'));
        p.strokeWeight(2);
        p.rect(w * 0.5 - balconyW * 0.5, balconyY, balconyW, balconyH);
        
        // Balcony pillars and roof canopy
        p.stroke(p.color('#fbbf24'));
        p.strokeWeight(1.5);
        const colSpacing = balconyW / 6;
        for (let i = 0; i <= 6; i++) {
          p.line(w * 0.5 - balconyW * 0.5 + i * colSpacing, balconyY, w * 0.5 - balconyW * 0.5 + i * colSpacing, balconyY + balconyH);
        }
        p.fill('#703314');
        p.noStroke();
        p.triangle(w * 0.5 - balconyW * 0.58, balconyY, w * 0.5 + balconyW * 0.58, balconyY, w * 0.5, balconyY - balconyH * 0.8 / 1.5);

        // Spikes and hinges on the wooden gateway sheets
        p.fill('#331d14');
        p.stroke(p.color('#1a0f0a'));
        p.strokeWeight(1.2);
        p.rect(w * 0.5 - gateW * 0.22, h - gateH * 0.68, gateW * 0.04, gateH * 0.68);
        p.rect(w * 0.5 + gateW * 0.18, h - gateH * 0.68, gateW * 0.04, gateH * 0.68);

        // 7. MULTIPLE DRAPING SAFFRON STANDARDS AND ROYAL BANNERS FLUTTERING
        drawBannerFlag(p, gateX + 25, h - gateH * 0.7, h * 0.1, p.frameCount * 0.04);
        drawBannerFlag(p, gateX + gateW - 25, h - gateH * 0.7, h * 0.1, p.frameCount * 0.045);

        // 8. SOVEREIGN FALLING COINS & ROSE PETALS (PRECIOUS RAIN)
        updateFallingMoney(p, w, h);

        // 9. CROWD OF VICTORY CELEBRANTS WITH SWAYING SPEARS, SHIELDS & FLAGS
        drawCelebrativeCrowd(p, w, h);

        // 10. FLAMING CASTLE TORCHES WITH ACTIVE EMBER SHRINGARA
        drawCastleTorches(p, w, h);

        // 11. AUDIO VISUAL DRUM WAVE RIPPLES
        updateDrumRipples(p);

        // 12. DRAW CEREMONIAL DHOL-TASHA GRAND DRUMS (VISUALLY INTENSIFIED)
        drawCeremonialDrums(p, w, h);
      };

      // Mouse pressed launches client-side victory rocket
      p.mousePressed = () => {
        const mx = p.mouseX;
        const my = p.mouseY;
        if (mx > 0 && mx < p.width && my > 0 && my < p.height * 0.8) {
          triggerLaunch(mx, my);
        }
      };

      // Expose manual drum trigger to react ref context hook
      onDrumBeatRef.current = () => {
        setDrumStats(d => d + 1);
        setCelebrationPower(p => Math.min(200, p + 14));

        const w = p.width;
        const h = p.height;
        const drumY = h - h * 0.11;

        // Create shockwave effect from left and right drums
        ripples.push({
          x: w * 0.15,
          y: drumY,
          r: 5,
          maxR: Math.max(w, h) * 0.7,
          color: '#fbbf24',
          alpha: 255
        });

        ripples.push({
          x: w * 0.85,
          y: drumY,
          r: 5,
          maxR: Math.max(w, h) * 0.7,
          color: '#f97316',
          alpha: 255
        });

        // Launch a rapid burst of 2-3 colorful high-tier fireworks as response
        const colors = ['#e11d48', '#f59e0b', '#fb923c', '#10b981', '#fb7185', '#38bdf8'];
        for (let i = 0; i < 2; i++) {
          fireworks.push({
            x: p.random(w * 0.22, w * 0.78),
            y: h,
            targetY: p.random(h * 0.1, h * 0.38),
            vx: p.random(-1.8, 1.8),
            vy: p.random(-8.5, -6),
            color: p.random(colors),
            exploded: false,
            trailLength: Math.round(p.random(6, 12))
          });
        }
      };

      // Helper creators
      function createFallingItem(startX: number, startY: number): FallingCoin {
        const isCoin = p.random(1) > 0.45;
        return {
          x: startX,
          y: startY,
          vy: p.random(1.2, 3.2),
          speedX: p.random(-0.7, 0.7),
          angle: p.random(p.TWO_PI),
          angleSpeed: p.random(-0.08, 0.08),
          size: p.random(5, 9.5),
          isCoin
        };
      }

      function triggerLaunch(tx: number, ty: number) {
        const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#a855f7'];
        fireworks.push({
          x: p.random(p.width * 0.35, p.width * 0.65),
          y: p.height,
          targetY: ty,
          vx: (tx - p.width * 0.5) * 0.012,
          vy: p.random(-9, -6.5),
          color: p.random(colors),
          exploded: false,
          trailLength: 10
        });
        setCelebrationPower(p => Math.min(200, p + 6));
      }

      function updateFireworksAndSparks(p: p5, w: number, h: number) {
        // Update Rockets
        for (let i = fireworks.length - 1; i >= 0; i--) {
          const r = fireworks[i];
          r.x += r.vx;
          r.y += r.vy;

          // Draw upward rocket tail sparks
          p.fill(255, 200, 100, 160);
          p.ellipse(r.x, r.y, 3, 3);
          for (let s = 1; s <= 4; s++) {
            p.fill(255, 120, 30, 200 / s);
            p.ellipse(r.x - r.vx * s * 0.45, r.y - r.vy * s * 0.45, 4.5 - s * 0.7, 4.5 - s * 0.7);
          }

          // Check if rocket reached destination height
          if (r.vy >= 0 || r.y <= r.targetY) {
            r.exploded = true;
            // Create burst particles
            const sparkCount = p.random(28, 48);
            for (let s = 0; s < sparkCount; s++) {
              const speed = p.random(1, 4.5);
              const angle = p.random(p.TWO_PI);
              fragments.push({
                x: r.x,
                y: r.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: r.color,
                alpha: 255,
                size: p.random(2, 5),
                fadeSpeed: p.random(3.2, 5.5),
                sparkle: p.random(1) > 0.4
              });
            }
            fireworks.splice(i, 1);
          }
        }

        // Auto launch ambient fireworks randomly
        if (p.frameCount % 90 === 0 && fireworks.length < 3) {
          triggerLaunch(p.random(w * 0.15, w * 0.85), p.random(h * 0.08, h * 0.4));
        }

        // Draw and update active sparkling fragments
        for (let idx = fragments.length - 1; idx >= 0; idx--) {
          const f = fragments[idx];
          f.x += f.vx;
          f.y += f.vy;
          f.vy += 0.075; // Gravity
          f.vx *= 0.985; // Drag friction
          f.alpha -= f.fadeSpeed;

          if (f.alpha <= 0) {
            fragments.splice(idx, 1);
            continue;
          }

          let drawColor = p.color(f.color);
          if (f.sparkle && p.frameCount % 4 === 0) {
            drawColor = p.color('#ffffff'); // Twinkle sparkles
          }

          p.fill(p.red(drawColor), p.green(drawColor), p.blue(drawColor), f.alpha);
          p.ellipse(f.x, f.y, f.size, f.size);

          // Sparkle star-glow lines
          if (f.alpha > 200 && f.size > 3.8) {
            const strokeC = p.color(f.color);
            p.stroke(p.color(p.red(strokeC), p.green(strokeC), p.blue(strokeC), f.alpha * 0.2));
            p.strokeWeight(0.85);
            p.line(f.x - 4, f.y, f.x + 4, f.y);
            p.line(f.x, f.y - 4, f.x, f.y + 4);
            p.noStroke();
          }
        }
      }

      function updateFallingMoney(p: p5, w: number, h: number) {
        money.forEach(item => {
          item.y += item.vy;
          item.x += item.speedX + p.sin(p.frameCount * 0.03 + item.angle) * 0.35;
          item.angle += item.angleSpeed;

          p.push();
          p.translate(item.x, item.y);
          p.rotate(item.angle);

          if (item.isCoin) {
            // Shiny sovereign gold coin
            p.fill(245, 158, 11);
            p.stroke(p.color(254, 215, 170));
            p.strokeWeight(0.5);
            p.ellipse(0, 0, item.size * 0.9, item.size);
            p.fill('#7c2d12');
            p.noStroke();
            p.ellipse(0, 0, item.size * 0.25, item.size * 0.3); // center seal
          } else {
            // Saffron/rose petal
            p.fill(239, 68, 68, 210); // Red rose of Peshwa
            if (item.size < 7) p.fill(243, 114, 44, 210); // Saffron petal
            p.noStroke();
            p.beginShape();
            p.vertex(0, -item.size * 0.5);
            // Replace quadraticVertex with cubic bezierVertex
            (p as any).bezierVertex(item.size * 0.5, -item.size * 0.25, item.size * 0.5, -item.size * 0.25, 0, item.size * 0.5);
            (p as any).bezierVertex(-item.size * 0.5, -item.size * 0.25, -item.size * 0.5, -item.size * 0.25, 0, -item.size * 0.5);
            p.endShape(p.CLOSE);
          }
          p.pop();

          // Reset when falling beyond boundaries
          if (item.y > h) {
            item.y = -15;
            item.x = p.random(w);
            item.vy = p.random(1.2, 3);
          }
        });
      }

      function drawWhiteElephant(p: p5, x: number, y: number, sz: number, dir: number) {
        p.push();
        p.translate(x, y);
        p.scale(dir, 1); // Flip elephant horizontally based on direction

        // Walk loop bobbing
        const walkCycle = p.frameCount * 0.085;
        const bob = p.sin(walkCycle) * 1.5;

        p.noStroke();

        // 1. LEGS (Articulated swing based on direct walk cycles!)
        p.fill('#9ca3af'); // Dark white/royal gray grey elephant
        const legW = sz * 0.18;
        const legH = sz * 0.45;

        // Back left leg
        p.push();
        p.translate(-sz * 0.35, -sz * 0.2);
        p.rotate(p.sin(walkCycle) * 0.22);
        p.rect(-legW * 0.5, 0, legW, legH, 1.5);
        p.fill(250); p.rect(-legW * 0.5, legH - 2, legW, 2); // claws
        p.pop();

        // Front left leg
        p.push();
        p.fill('#9ca3af');
        p.translate(sz * 0.12, -sz * 0.2);
        p.rotate(p.sin(walkCycle) * 0.22);
        p.rect(-legW * 0.5, 0, legW, legH, 1.5);
        p.fill(250); p.rect(-legW * 0.5, legH - 2, legW, 2);
        p.pop();

        // Torso body base
        p.fill('#cbd5e1'); // Brilliant imperial creamy white elephant skin
        p.ellipse(-sz * 0.1, -sz * 0.42 + bob, sz * 0.85, sz * 0.55);

        // Back right leg
        p.push();
        p.fill('#cbd5e1');
        p.translate(-sz * 0.24, -sz * 0.2 + bob * 0.5);
        p.rotate(p.cos(walkCycle + p.PI) * 0.22);
        p.rect(-legW * 0.5, 0, legW, legH, 1.5);
        p.fill(255); p.rect(-legW * 0.5, legH - 2, legW, 2);
        p.pop();

        // Front right leg
        p.push();
        p.fill('#cbd5e1');
        p.translate(sz * 0.25, -sz * 0.2 + bob * 0.5);
        p.rotate(p.sin(walkCycle + p.PI) * 0.22);
        p.rect(-legW * 0.5, 0, legW, legH, 1.5);
        p.fill(255); p.rect(-legW * 0.5, legH - 2, legW, 2);
        p.pop();

        // Head
        p.ellipse(sz * 0.35, -sz * 0.58 + bob, sz * 0.42, sz * 0.42);

        // Ear (Sways smoothly)
        p.fill('#9ca3af');
        p.push();
        p.translate(sz * 0.25, -sz * 0.62 + bob);
        p.rotate(p.sin(p.frameCount * 0.05) * 0.08);
        p.ellipse(0, 0, sz * 0.18, sz * 0.26);
        p.fill(p.color('#f472b6')); // Pink inner ear flush
        p.ellipse(0, 0, sz * 0.09, sz * 0.15);
        p.pop();

        // Trunk curve
        p.fill('#cbd5e1');
        p.stroke(p.color('#94a3b8'));
        p.strokeWeight(1);
        p.strokeCap(p.ROUND);
        p.noFill();
        const trunkSwing = p.sin(p.frameCount * 0.04) * 8;
        p.beginShape();
        p.vertex(sz * 0.48, -sz * 0.56 + bob);
        // Replace quadraticVertex with cubic bezierVertex
        (p as any).bezierVertex(sz * 0.62, -sz * 0.48 + bob, sz * 0.62, -sz * 0.48 + bob, sz * 0.58 + trunkSwing * 0.3, -sz * 0.35 + trunkSwing + bob);
        (p as any).bezierVertex(sz * 0.64 + trunkSwing * 0.5, -sz * 0.3 + bob, sz * 0.64 + trunkSwing * 0.5, -sz * 0.3 + bob, sz * 0.68 + trunkSwing * 0.8, -sz * 0.36 + bob);
        p.endShape();
        p.noStroke();

        // Big Ivory tusks
        p.fill('#fef08a');
        p.triangle(sz * 0.42, -sz * 0.5 + bob, sz * 0.45, -sz * 0.52 + bob, sz * 0.56, -sz * 0.46 + bob);

        // Caparison tapestry cloth (Jhool - Rich Royal Magenta Saffron textile)
        p.fill('#b91c1c');
        p.rect(-sz * 0.38, -sz * 0.52 + bob, sz * 0.6, sz * 0.28, 4);
        p.fill(p.color('#fbbf24'));
        p.rect(-sz * 0.26, -sz * 0.48 + bob, sz * 0.36, sz * 0.18, 2); // inside gold
        // Little hanging tassels
        p.fill('#facc15');
        for (let tx = -sz * 0.35; tx < sz * 0.2; tx += sz * 0.085) {
          p.ellipse(tx, -sz * 0.24 + bob, 3, 3);
        }

        // 2. ROYAL HOWDAH CANOPY ON ELEPHANT
        const howdahX = -sz * 0.1;
        const howdahY = -sz * 0.72 + bob;
        p.fill('#92400e'); // rich teak wood structure
        p.stroke(p.color('#facc15'));
        p.strokeWeight(1.2);
        p.rect(howdahX - sz * 0.25, howdahY - sz * 0.1, sz * 0.5, sz * 0.14, 2);
        // gold posts
        p.line(howdahX - sz * 0.2, howdahY - sz * 0.1, howdahX - sz * 0.18, howdahY - sz * 0.35);
        p.line(howdahX + sz * 0.2, howdahY - sz * 0.1, howdahX + sz * 0.18, howdahY - sz * 0.35);
        // gold domed roof
        p.fill('#d97706');
        p.quad(
          howdahX - sz * 0.22, howdahY - sz * 0.35, 
          howdahX + sz * 0.22, howdahY - sz * 0.35,
          howdahX + sz * 0.16, howdahY - sz * 0.45,
          howdahX - sz * 0.16, howdahY - sz * 0.45
        );
        p.ellipse(howdahX, howdahY - sz * 0.47, 4, 4); // gold top tip

        // 3. IMPERIAL PESHWAS SAFFRON JARIPATKA BANNER FLYING ON HOWDAH
        p.stroke(p.color('#b45309'));
        p.strokeWeight(1.5);
        p.line(howdahX - sz * 0.22, howdahY - sz * 0.1, howdahX - sz * 0.25, howdahY - sz * 0.65);
        p.noStroke();

        // Fluttering flag polygon
        p.fill('#f97316');
        p.stroke(p.color('#fcd34d'));
        p.strokeWeight(0.5);
        const wave = p.sin(p.frameCount * 0.14) * 3;
        p.beginShape();
        p.vertex(howdahX - sz * 0.25, howdahY - sz * 0.65);
        p.vertex(howdahX - sz * 0.55, howdahY - sz * 0.62 + wave);
        p.vertex(howdahX - sz * 0.45, howdahY - sz * 0.56);
        p.vertex(howdahX - sz * 0.58, howdahY - sz * 0.5 - wave);
        p.vertex(howdahX - sz * 0.25, howdahY - sz * 0.48);
        p.endShape(p.CLOSE);

        p.pop();
      }

      function drawBannerFlag(p: p5, x: number, y: number, sz: number, angle: number) {
        p.push();
        p.translate(x, y);
        p.stroke(p.color('#78350f'));
        p.strokeWeight(2.5);
        p.line(0, 0, 0, -sz * 1.6); // pole

        p.noStroke();
        p.fill('#f97316'); // Saffron
        p.stroke(p.color('#f59e0b'));
        p.strokeWeight(0.5);
        const wave = p.sin(angle * 3.5) * 4;

        // Custom double-tipped triangular swallow flag shape
        p.beginShape();
        p.vertex(0, -sz * 1.6);
        p.vertex(sz * 1.1, -sz * 1.45 + wave);
        p.vertex(sz * 0.85, -sz * 1.3);
        p.vertex(sz * 1.15, -sz * 1.15 - wave);
        p.vertex(0, -sz * 1.0);
        p.endShape(p.CLOSE);

        p.pop();
      }

      function drawCelebrativeCrowd(p: p5, w: number, h: number) {
        // Base ground level soil covering the crowd roots
        p.noStroke();
        p.fill('#110b07');
        p.rect(0, h - h * 0.09, w, h * 0.09);

        // Drawing multiple waving silhouette lines with spears/sabers
        p.fill('#0b0704');
        p.stroke(p.color('#000000'));
        p.strokeWeight(0.5);

        const crowdBaseY = h - h * 0.06;
        const step = w / 35;

        // Foreground crowd waving weapons
        for (let x = 3; x < w; x += step) {
          const sway = p.sin(p.frameCount * 0.06 + x) * 2;
          const headY = crowdBaseY - h * 0.045 + sway;

          // Citizen silhouette head
          p.ellipse(x, headY, h * 0.038, h * 0.038);
          // Torso Shubh
          p.quad(
            x - h * 0.02, h, 
            x + h * 0.02, h, 
            x + h * 0.012, headY + h * 0.015,
            x - h * 0.012, headY + h * 0.015
          );

          // Random spear or sword waving high in the air
          if (x % 5 === 0) {
            p.stroke(p.color('#1c100b'));
            p.strokeWeight(1.5);
            // Spear shaft
            const spearX2 = x + p.cos(p.frameCount * 0.05 + x) * 9;
            const spearY2 = headY - h * 0.12 + p.sin(p.frameCount * 0.08 + x) * 5;
            p.line(x, headY, spearX2, spearY2);

            // Spear tip
            p.fill('#e2e8f0');
            p.noStroke();
            p.ellipse(spearX2, spearY2, 3, 7);
          } else if (x % 7 === 0) {
            // Swaying victory saffron banner
            p.stroke(p.color('#1c100b'));
            p.strokeWeight(1.5);
            const flagX2 = x - 5 + p.sin(p.frameCount * 0.04 + x) * 6;
            const flagY2 = headY - h * 0.15;
            p.line(x, headY, flagX2, flagY2);
            p.fill('#f97316');
            p.noStroke();
            p.triangle(flagX2, flagY2, flagX2 + h * 0.07, flagY2 + h * 0.02, flagX2, flagY2 + h * 0.045);
          }
          p.fill('#0b0704');
        }
      }

      function drawCastleTorches(p: p5, w: number, h: number) {
        // Position on left/right bastion railings
        const gateW = w * 0.44;
        const gateX = w * 0.5 - gateW * 0.5;
        const gateH = h * 0.42;

        const leftX = gateX - 25;
        const rightX = gateX + gateW + 25;
        const torchY = h - gateH * 1.15;

        [leftX, rightX].forEach((tx, idx) => {
          // torch stand
          p.stroke(p.color('#451a03'));
          p.strokeWeight(3);
          p.line(tx, torchY, tx, torchY - h * 0.04);
          
          p.noStroke();
          p.fill('#78350f');
          p.rect(tx - 3, torchY - h * 0.05, 6, 6, 1);

          // Sparklers flame dynamics
          for (let f = 0; f < 3; f++) {
            const fSize = p.map(p.sin(p.frameCount * 0.2 + idx * 10 + f * 5), -1, 1, 5, 12);
            p.fill(249, 115, 22, 140 - f * 35); // orange
            p.ellipse(tx, torchY - h * 0.058 - f * 3, fSize, fSize * 1.4);
            p.fill(250, 204, 21, 200 - f * 40); // yellow core
            p.ellipse(tx, torchY - h * 0.058, fSize * 0.5, fSize * 0.6);
          }

          // Ambient radial golden heat glows
          p.fill(251, 191, 36, 16);
          p.ellipse(tx, torchY - h * 0.06, 50, 50);
        });
      }

      function updateDrumRipples(p: p5) {
        for (let i = ripples.length - 1; i >= 0; i--) {
          const r = ripples[i];
          r.r += 6.5;
          r.alpha = p.map(r.r, 0, r.maxR, 255, 0);

          if (r.r >= r.maxR || r.alpha <= 0) {
            ripples.splice(i, 1);
            continue;
          }

          p.noFill();
          p.stroke(p.color(249, 115, 22, r.alpha));
          p.strokeWeight(3.5);
          p.ellipse(r.x, r.y, r.r, r.r * 0.65); // Elliptical ground spreads

          p.stroke(p.color(253, 186, 116, r.alpha * 0.5));
          p.strokeWeight(1.5);
          p.ellipse(r.x, r.y, r.r * 1.3, r.r * 1.3 * 0.65);
        }
        p.noStroke();
      }

      function drawCeremonialDrums(p: p5, w: number, h: number) {
        const drumY = h - h * 0.095;
        const leftDrumX = w * 0.15;
        const rightDrumX = w * 0.85;
        const dW = w * 0.14;
        const dH = h * 0.11;

        // Left Grand Dhol
        p.ellipseMode(p.CENTER);
        p.stroke(p.color('#1c1917'));
        p.strokeWeight(2.2);
        p.fill('#441505'); // deep rosewood barrel body
        p.rect(leftDrumX - dW * 0.5, drumY - dH * 0.5, dW, dH, 4);

        // golden tension cables
        p.stroke(p.color('#d97706'));
        p.strokeWeight(1.2);
        p.line(leftDrumX - dW * 0.45, drumY - dH * 0.42, leftDrumX + dW * 0.45, drumY + dH * 0.42);
        p.line(leftDrumX + dW * 0.45, drumY - dH * 0.42, leftDrumX - dW * 0.45, drumY + dH * 0.42);

        // Drum white leather skins
        p.noStroke();
        p.fill('#fef08a');
        p.ellipse(leftDrumX - dW * 0.5, drumY, dW * 0.22, dH * 1.02);
        p.ellipse(leftDrumX + dW * 0.5, drumY, dW * 0.22, dH * 1.02);
        p.fill('#78350f');
        p.ellipse(leftDrumX - dW * 0.5, drumY, dW * 0.05, dH * 0.3); // black focus point
        p.ellipse(leftDrumX + dW * 0.5, drumY, dW * 0.05, dH * 0.3);

        // Right Grand Dhol
        p.stroke(p.color('#1c1917'));
        p.strokeWeight(2.2);
        p.fill('#441505');
        p.rect(rightDrumX - dW * 0.5, drumY - dH * 0.5, dW, dH, 4);

        p.stroke(p.color('#d97706'));
        p.strokeWeight(1.2);
        p.line(rightDrumX - dW * 0.45, drumY - dH * 0.42, rightDrumX + dW * 0.45, drumY + dH * 0.42);
        p.line(rightDrumX + dW * 0.45, drumY - dH * 0.42, rightDrumX - dW * 0.45, drumY + dH * 0.42);

        p.noStroke();
        p.fill('#fef08a');
        p.ellipse(rightDrumX - dW * 0.5, drumY, dW * 0.22, dH * 1.02);
        p.ellipse(rightDrumX + dW * 0.5, drumY, dW * 0.22, dH * 1.02);
        p.fill('#78350f');
        p.ellipse(rightDrumX - dW * 0.5, drumY, dW * 0.05, dH * 0.3);
        p.ellipse(rightDrumX + dW * 0.5, drumY, dW * 0.05, dH * 0.3);
      }

      // Handle window responsive adjustments
      p.windowResized = () => {
        if (containerRef.current) {
          const w = containerRef.current.clientWidth;
          const h = Math.round(w * 0.5625);
          p.resizeCanvas(w, h);
        }
      };
    };

    // Instantiate p5.js inside Ref Container
    p5InstanceRef.current = new p5(sketch);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  const handleDrumBeat = () => {
    if (onDrumBeatRef.current) {
      onDrumBeatRef.current();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Visual Canvas Panel */}
      <div 
        id="pune-celebration-visual-card"
        className="relative w-full overflow-hidden rounded-xs border-2 border-amber-600/35 flex flex-col justify-end shadow-2xl bg-[#0b0806]"
      >
        {/* Sky Ambient Glow Gradient */}
        <div className="absolute inset-0 bg-radial-gradient from-amber-950/20 via-stone-950/80 to-black pointer-events-none" />
        
        {/* Interactive Sky Overlay message */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 text-[9px] font-mono uppercase tracking-[0.2em] bg-stone-950/95 border border-amber-800/40 text-amber-500 py-1 px-3.5 rounded-full pointer-events-none shadow-md">
          ✨ Click the sky to launch Victory Rockets!
        </div>

        {/* This div receives the p5 canvas */}
        <div ref={containerRef} className="w-full h-full relative z-10 cursor-crosshair overflow-hidden" />

        {/* Shaniwar Wada Signet overlay bottom left */}
        <div className="absolute bottom-3 left-3 z-20 bg-stone-950/90 border border-[#8B5E3C]/40 px-3 py-2 rounded-xs pointer-events-none">
          <span className="text-[7.5px] font-mono text-amber-500 block leading-none font-bold uppercase tracking-wider">
            DECCAN CONQUEST • CELEBRATION
          </span>
          <span className="text-[11px] text-white font-serif font-black block mt-0.5">
            ⚔️ SHANIWAR WADA FORTRESS
          </span>
        </div>

        {/* Celebration Multiplier Tracker bottom right */}
        <div className="absolute bottom-3 right-3 z-20 bg-gradient-to-r from-amber-950/95 to-red-950/95 border border-saffron/45 px-3 py-1.5 rounded-xs flex items-center gap-1.5 pointer-events-none animate-pulse">
          <Sparkles size={11} className="text-saffron shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[8px] font-mono text-stone-300">CELEBRATION INTENSITY:</span>
          <span className="text-[11px] font-mono font-black text-saffron">
            {celebrationPower}%
          </span>
        </div>
      </div>

      {/* Interactive Drum-Beater Button panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleDrumBeat}
          className="py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-stone-950 font-mono font-black text-[11px] uppercase tracking-widest border border-amber-400 rounded-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        >
          🥁 BEAT THE DHOL-TASHA GRAND DRUMS
          <span className="px-1.5 py-0.5 bg-amber-950 text-white font-mono text-[9px] rounded-xs">
            {drumStats}
          </span>
        </button>

        <div className="p-3 bg-stone-950 border border-stone-850 rounded-xs text-left flex gap-3.5 items-center">
          <div className="p-2 bg-saffron/10 rounded-xs">
            <Trophy className="text-saffron shrink-0" size={16} />
          </div>
          <div>
            <h5 className="text-[10.5px] font-sans font-black text-white uppercase tracking-wider">
              6,000,000 Rupee Tribute Secured
            </h5>
            <p className="text-[9.5px] font-sans text-stone-400 leading-tight mt-0.5">
              Securely hauled into Shaniwar Wada's state vaults. Fully finances Ibrahim Khan's heavy cannons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
