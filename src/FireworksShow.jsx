import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";


// ─── Constantes ───────────────────────────────────────────────────────────────
const HEARTS        = ["❤️","💖","💕","💗","💞","💘","💝","🩷"];
const PETALS        = ["🌹","🥀","❤️","💕","💖","🌸","🌺","💗"];
const SPARKLE_COLORS = [0xff6ba9,0xffd1e3,0xffffff,0xff9ecd,0xffb347,0xffe4b5,0xc084fc,0xf9a8d4];

const rnd = (a, b) => Math.random() * (b - a) + a;

function heartEquation(t, scale) {
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t);
  return { x: x * scale, y: -y * scale };
}

// Puntos del corazón para explosión en forma de corazón
function heartBurstPoints(count, scale) {
  return Array.from({ length: count }, (_, i) => {
    const t = (2 * Math.PI * i) / count;
    return heartEquation(t, scale);
  });
}

const createEmojiTexture = (emoji, size) => {
  const canvas = document.createElement("canvas");
  canvas.width = size + 8; canvas.height = size + 8;
  const ctx = canvas.getContext("2d");
  ctx.font = `${size}px serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);
  return PIXI.Texture.from(canvas);
};

// ─── Web Audio: sonidos sintéticos ───────────────────────────────────────────
function createAudioContext() {
  try { return new (window.AudioContext || window.webkitAudioContext)(); }
  catch { return null; }
}

function playCountdownBeep(ctx, freq = 440) {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

// ─── Componente ──────────────────────────────────────────────────────────────
export default function FireworksShow({ onFinished, name = "Mi Preciosa Elizabeth", photo = null }) {
  const containerRef    = useRef(null);
  const [countdown, setCountdown]   = useState(3);      // 3,2,1,GO
  const [showCountdown, setShowCountdown] = useState(true);
  const [typewriterText, setTypewriterText]   = useState("");
  const [showTypewriter, setShowTypewriter]   = useState(false);
  const [showSubtitle, setShowSubtitle]       = useState(false);
  const [cursorVisible, setCursorVisible]     = useState(true);
  const audioCtxRef = useRef(null);

  // ── Cursor parpadeante ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setCursorVisible(v => !v), 530);
    return () => clearInterval(id);
  }, []);

  // ── Typewriter efecto ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!showTypewriter) return;
    const fullText = name;
    let i = 0;
    setTypewriterText("");
    const id = setInterval(() => {
      i++;
      setTypewriterText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(id);
        setTimeout(() => setShowSubtitle(true), 400);
      }
    }, 80);
    return () => clearInterval(id);
  }, [showTypewriter, name]);

  // ── Countdown + arranque del show ─────────────────────────────────────────
  useEffect(() => {
    audioCtxRef.current = createAudioContext();
    const ctx = audioCtxRef.current;

    // Countdown 3 → 2 → 1 → GO
    let count = 3;
    setCountdown(count);
    playCountdownBeep(ctx, 520);

    const cdInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playCountdownBeep(ctx, 520);
      } else if (count === 0) {
        setCountdown("🎆");
        playCountdownBeep(ctx, 880);
      } else {
        clearInterval(cdInterval);
        setShowCountdown(false);
      }
    }, 900);

    return () => clearInterval(cdInterval);
  }, []);

  // ── PixiJS show (arranca después del countdown ~4s) ───────────────────────
  useEffect(() => {
    const delay = setTimeout(() => startPixiShow(), 3800);
    return () => clearTimeout(delay);
  }, [name, onFinished]);

  function startPixiShow() {
    if (!containerRef.current) return;

    const width  = window.innerWidth;
    const height = window.innerHeight;
    const isMobile = width < 768;
    const audioCtx = audioCtxRef.current;

    let rocketInterval = null, fadeInterval = null, trailInterval = null;
    let shootingStarTimer = null;
    const app = new PIXI.Application();
    let isDestroyed = false;

    app.init({
      width, height,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: !isMobile,
    }).then(() => {
      if (isDestroyed) { if (app.renderer) app.destroy(true,{children:true,texture:true}); return; }
      if (app.canvas && containerRef.current) containerRef.current.appendChild(app.canvas);
      else return;

      // ── Capas ──────────────────────────────────────────────────────────────
      const nebulaContainer  = new PIXI.Container();
      const starsContainer   = new PIXI.Container();
      const trailContainer   = new PIXI.Container();
      const mainContainer    = new PIXI.Container();
      const glowContainer    = new PIXI.Container();
      const uiContainer      = new PIXI.Container(); // foto en corazón
      app.stage.addChild(nebulaContainer);
      app.stage.addChild(starsContainer);
      app.stage.addChild(trailContainer);
      app.stage.addChild(glowContainer);
      app.stage.addChild(mainContainer);
      app.stage.addChild(uiContainer);

      // ── Texturas ───────────────────────────────────────────────────────────
      const heartTextures = HEARTS.map(e => createEmojiTexture(e, isMobile ? 22 : 30));
      const petalTextures = PETALS.map(e => createEmojiTexture(e, isMobile ? 26 : 38));

      const sparkGfx   = new PIXI.Graphics().circle(0,0,3).fill({color:0xffffff});
      const sparkTexture = app.renderer.generateTexture(sparkGfx);

      const glowGfx    = new PIXI.Graphics().circle(0,0,60).fill({color:0xffffff,alpha:0.9});
      const glowTexture = app.renderer.generateTexture(glowGfx);

      const trailGfx   = new PIXI.Graphics().circle(0,0,2.5).fill({color:0xff9ecd});
      const trailTexture = app.renderer.generateTexture(trailGfx);

      // ── Nebulosa de fondo animada ───────────────────────────────────────────
      const nebulas = [];
      const nebulaColors = [0x3d0050, 0x1a003a, 0x4a0070, 0x200040, 0x5c0080];
      for (let i = 0; i < (isMobile ? 5 : 8); i++) {
        const g = new PIXI.Graphics();
        const r = rnd(120, isMobile ? 220 : 340);
        g.circle(0, 0, r).fill({ color: nebulaColors[i % nebulaColors.length], alpha: 0.18 });
        const tex = app.renderer.generateTexture(g);
        const sprite = new PIXI.Sprite(tex);
        sprite.anchor.set(0.5);
        sprite.x = rnd(0, width); sprite.y = rnd(0, height);
        sprite.alpha = rnd(0.08, 0.22);
        nebulaContainer.addChild(sprite);
        nebulas.push({ sprite, vx: rnd(-0.15,0.15), vy: rnd(-0.08,0.08), baseAlpha: sprite.alpha, phase: rnd(0,Math.PI*2) });
      }

      // ── Estrellas ──────────────────────────────────────────────────────────
      const starGfxA  = new PIXI.Graphics().circle(0,0,1.5).fill({color:0xffffff});
      const starTexA  = app.renderer.generateTexture(starGfxA);
      const starGfxB  = new PIXI.Graphics().circle(0,0,1).fill({color:0xffd1e3});
      const starTexB  = app.renderer.generateTexture(starGfxB);

      const stars = Array.from({ length: isMobile ? 90 : 160 }).map(() => {
        const sprite = new PIXI.Sprite(Math.random() > 0.5 ? starTexA : starTexB);
        sprite.anchor.set(0.5);
        sprite.x = rnd(0,width); sprite.y = rnd(0,height);
        sprite.alpha = rnd(0.2,1);
        starsContainer.addChild(sprite);
        return { sprite, speed: rnd(0.007,0.022) };
      });

      // ── Estado ─────────────────────────────────────────────────────────────
      let rkCounter = 0;
      const rocketCount = isMobile ? 14 : 20;
      let rockets = [], particles = [], trails = [], glows = [];
      let giantHeartSprites = [], petals = [];
      let shootingStars = [];
      let heartPhase = null, heartTimer = 0;
      let nebulaTime = 0;

      // ── Estrella fugaz ─────────────────────────────────────────────────────
      function spawnShootingStar() {
        if (isDestroyed) return;
        const lineGfx = new PIXI.Graphics();
        lineGfx.moveTo(0,0).lineTo(rnd(60,130),rnd(20,50))
          .stroke({ color: 0xffffff, width: 1.5, alpha: 0.9 });
        const tex = app.renderer.generateTexture(lineGfx);
        const sprite = new PIXI.Sprite(tex);
        sprite.anchor.set(0.5);
        sprite.x = rnd(0, width * 0.7);
        sprite.y = rnd(0, height * 0.4);
        sprite.alpha = 0;
        starsContainer.addChild(sprite);
        shootingStars.push({ sprite, vx: rnd(8,14), vy: rnd(3,7), life: 1 });
      }

      shootingStarTimer = setInterval(() => {
        if (!isDestroyed) spawnShootingStar();
      }, rnd(2500, 4000));

      // ── Flash de destello ──────────────────────────────────────────────────
      function createFlash(cx, cy, color = 0xffffff) {
        const g = new PIXI.Sprite(glowTexture);
        g.anchor.set(0.5); g.tint = color;
        g.x = cx; g.y = cy; g.alpha = 0.85; g.scale.set(0.3);
        glowContainer.addChild(g);
        glows.push({ sprite: g });
      }

      // ── Explosión en forma de corazón ──────────────────────────────────────
      function createHeartBurst(cx, cy) {
        const pts = heartBurstPoints(isMobile ? 30 : 48, isMobile ? 1.4 : 2.0);
        pts.forEach(pt => {
          const tex = heartTextures[Math.floor(Math.random() * heartTextures.length)];
          const sprite = new PIXI.Sprite(tex);
          sprite.anchor.set(0.5);
          sprite.x = cx; sprite.y = cy;
          mainContainer.addChild(sprite);
          const speed = rnd(2.5, 6);
          const angle = Math.atan2(pt.y, pt.x);
          particles.push({
            sprite,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            gravity: 0.04, friction: 0.96,
            decay: rnd(0.008, 0.016),
          });
        });
      }

      // ── Explosión principal ────────────────────────────────────────────────
      function createBurst(cx, cy) {
        if (isDestroyed) return;
        createFlash(cx, cy, SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)]);

        // Chispas
        const sparkCount = isMobile ? 40 : 65;
        for (let i = 0; i < sparkCount; i++) {
          const sprite = new PIXI.Sprite(sparkTexture);
          sprite.anchor.set(0.5); sprite.x = cx; sprite.y = cy;
          sprite.tint = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
          sprite.scale.set(rnd(0.6,1.8));
          mainContainer.addChild(sprite);
          const angle = rnd(0,Math.PI*2), speed = rnd(4,11);
          particles.push({ sprite, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, gravity:0.09, friction:0.96, decay:rnd(0.012,0.025) });
        }

        // Corazones en círculo aleatorio
        const heartCount = isMobile ? 28 : 45;
        for (let i = 0; i < heartCount; i++) {
          const tex = heartTextures[Math.floor(Math.random() * heartTextures.length)];
          const sprite = new PIXI.Sprite(tex);
          sprite.anchor.set(0.5); sprite.x = cx; sprite.y = cy;
          mainContainer.addChild(sprite);
          const angle = rnd(0,Math.PI*2), speed = rnd(2,7);
          particles.push({ sprite, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed - rnd(0,2), gravity:0.035, friction:0.955, decay:rnd(0.008,0.018) });
        }

        // Explosión secundaria en forma de corazón con delay
        setTimeout(() => {
          if (!isDestroyed) {
            createFlash(cx, cy, 0xff9ecd);
            createHeartBurst(cx, cy);
          }
        }, rnd(100, 250));
      }

      // ── Cohetes con trayectoria curva ──────────────────────────────────────
      rocketInterval = setInterval(() => {
        if (isDestroyed) return;
        if (rkCounter < rocketCount) {
          const rkGfx = new PIXI.Graphics().circle(0,0,isMobile?4:5).fill({color:0xff6ba9});
          const rkSprite = new PIXI.Sprite(app.renderer.generateTexture(rkGfx));
          rkSprite.anchor.set(0.5);
          rkSprite.x = rnd(width*0.08, width*0.92);
          rkSprite.y = height;
          rkSprite.tint = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
          mainContainer.addChild(rkSprite);
          rockets.push({
            sprite: rkSprite,
            targetY: rnd(height*0.08, height*0.42),
            speed: rnd(11,18),
            curve: rnd(-0.3, 0.3), // zigzag horizontal
            wobble: 0,
          });
          rkCounter++;
        } else { if (rocketInterval) clearInterval(rocketInterval); }
      }, isMobile ? 280 : 220);

      // Estelas de cohetes con partículas brillantes
      trailInterval = setInterval(() => {
        if (isDestroyed) return;
        rockets.forEach(r => {
          for (let k = 0; k < 2; k++) {
            const t = new PIXI.Sprite(trailTexture);
            t.anchor.set(0.5);
            t.x = r.sprite.x + rnd(-3,3);
            t.y = r.sprite.y + rnd(2,10);
            t.alpha = rnd(0.5,0.9);
            t.scale.set(rnd(0.5,1.2));
            t.tint = r.sprite.tint;
            trailContainer.addChild(t);
            trails.push({ sprite: t, decay: rnd(0.05,0.09) });
          }
        });
      }, 25);

      // ── Timeline ───────────────────────────────────────────────────────────
      setTimeout(() => { if (!isDestroyed) setShowTypewriter(true); }, 1000);

      // Corazón gigante + foto
      setTimeout(() => {
        if (isDestroyed) return;
        heartPhase = "assembling";
        heartTimer = Date.now();
        const points  = isMobile ? 55 : 80;
        const scale   = isMobile ? 9 : 13;
        const centerX = width / 2;
        const centerY = height * 0.56;

        for (let i = 0; i < points; i++) {
          const t = (2 * Math.PI * i) / points;
          const targetPos = heartEquation(t, scale);
          const tex = heartTextures[Math.floor(Math.random() * heartTextures.length)];
          const sprite = new PIXI.Sprite(tex);
          sprite.anchor.set(0.5);
          sprite.x = centerX + targetPos.x + rnd(-300,300);
          sprite.y = centerY + targetPos.y + rnd(-300,300);
          sprite.alpha = 0;
          sprite.scale.set(rnd(0.6,1.2));
          mainContainer.addChild(sprite);
          giantHeartSprites.push({
            sprite,
            targetX: centerX + targetPos.x,
            targetY: centerY + targetPos.y,
            driftX: rnd(-1.5,1.5),
            driftY: rnd(-3,-5.5),
          });
        }

        // Foto circular en el centro del corazón (si se pasa prop)
        if (photo) {
          const photoImg = new Image();
          photoImg.crossOrigin = "anonymous";
          photoImg.onload = () => {
            if (isDestroyed) return;
            const size = isMobile ? 90 : 130;
            const photoCanvas = document.createElement("canvas");
            photoCanvas.width = size; photoCanvas.height = size;
            const pCtx = photoCanvas.getContext("2d");
            pCtx.beginPath();
            pCtx.arc(size/2, size/2, size/2, 0, Math.PI*2);
            pCtx.closePath();
            pCtx.clip();
            pCtx.drawImage(photoImg, 0, 0, size, size);
            const photoTex = PIXI.Texture.from(photoCanvas);
            const photoSprite = new PIXI.Sprite(photoTex);
            photoSprite.anchor.set(0.5);
            photoSprite.x = centerX; photoSprite.y = centerY;
            photoSprite.alpha = 0;
            uiContainer.addChild(photoSprite);
            // Aparece cuando el corazón pulsa
            setTimeout(() => {
              if (isDestroyed) return;
              const fadeIn = setInterval(() => {
                photoSprite.alpha += 0.04;
                if (photoSprite.alpha >= 1) clearInterval(fadeIn);
              }, 30);
            }, 1600);
          };
          photoImg.src = photo;
        }

        setTimeout(() => { if (!isDestroyed) heartPhase = "pulsing"; }, 1400);
        setTimeout(() => { if (!isDestroyed) heartPhase = "dissolving"; }, 4800);
        setTimeout(() => { if (!isDestroyed) { heartPhase = null; uiContainer.removeChildren(); } }, 6200);
      }, 5000);

      // Lluvia de pétalos con rebote
      setTimeout(() => {
        if (isDestroyed) return;
        const maxPetals = isMobile ? 75 : 140;
        for (let i = 0; i < maxPetals; i++) {
          const tex = petalTextures[Math.floor(Math.random() * petalTextures.length)];
          const sprite = new PIXI.Sprite(tex);
          sprite.anchor.set(0.5);
          sprite.x = rnd(0,width);
          sprite.y = rnd(-250,-10);
          sprite.scale.set(rnd(0.6,1.3));
          mainContainer.addChild(sprite);
          petals.push({
            sprite,
            speedY: rnd(2,5),
            speedX: rnd(-0.8,0.8),
            rotSpeed: rnd(-0.025,0.025),
            wobble: rnd(0, Math.PI*2),
            bounceVY: 0,
            bounced: false,
          });
        }
      }, 6200);

      // Fade out y cierre
      setTimeout(() => {
        if (isDestroyed) return;
        if (trailInterval) clearInterval(trailInterval);
        if (shootingStarTimer) clearInterval(shootingStarTimer);
        fadeInterval = setInterval(() => {
          mainContainer.alpha  -= 0.04;
          starsContainer.alpha -= 0.04;
          trailContainer.alpha -= 0.04;
          glowContainer.alpha  -= 0.04;
          nebulaContainer.alpha -= 0.04;
          uiContainer.alpha -= 0.04;
          if (mainContainer.alpha <= 0) {
            clearInterval(fadeInterval);
            app.ticker.stop();
            if (onFinished) onFinished();
          }
        }, 30);
      }, 13500);

      // ── Bucle principal ────────────────────────────────────────────────────
      app.ticker.add((ticker) => {
        if (isDestroyed) return;
        nebulaTime += ticker.deltaTime * 0.01;

        // Nebulosa animada
        nebulas.forEach((n, i) => {
          n.sprite.x += n.vx;
          n.sprite.y += n.vy;
          n.sprite.alpha = n.baseAlpha + Math.sin(nebulaTime + n.phase) * 0.06;
          if (n.sprite.x < -200 || n.sprite.x > width+200) n.vx = -n.vx;
          if (n.sprite.y < -200 || n.sprite.y > height+200) n.vy = -n.vy;
        });

        // Estrellas titilando
        stars.forEach(s => {
          s.sprite.alpha += s.speed;
          if (s.sprite.alpha > 1 || s.sprite.alpha < 0.12) s.speed = -s.speed;
        });

        // Estrellas fugaces
        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          s.sprite.x += s.vx;
          s.sprite.y += s.vy;
          s.life -= 0.022;
          s.sprite.alpha = Math.max(0, s.life);
          if (s.life <= 0) {
            starsContainer.removeChild(s.sprite);
            s.sprite.destroy();
            shootingStars.splice(i, 1);
          }
        }

        // Cohetes con trayectoria curva
        for (let i = rockets.length - 1; i >= 0; i--) {
          const r = rockets[i];
          r.wobble += 0.12;
          r.sprite.y -= r.speed;
          r.sprite.x += Math.sin(r.wobble) * r.curve * r.speed * 0.5;
          if (r.sprite.y <= r.targetY) {
            createBurst(r.sprite.x, r.sprite.y);
            mainContainer.removeChild(r.sprite);
            r.sprite.destroy();
            rockets.splice(i, 1);
          }
        }

        // Partículas
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.vx *= p.friction; p.vy *= p.friction; p.vy += p.gravity;
          p.sprite.x += p.vx; p.sprite.y += p.vy;
          p.sprite.alpha -= p.decay;
          if (p.sprite.alpha <= 0) { mainContainer.removeChild(p.sprite); p.sprite.destroy(); particles.splice(i,1); }
        }

        // Estelas
        for (let i = trails.length - 1; i >= 0; i--) {
          const t = trails[i];
          t.sprite.alpha -= t.decay;
          if (t.sprite.alpha <= 0) { trailContainer.removeChild(t.sprite); t.sprite.destroy(); trails.splice(i,1); }
        }

        // Flashes
        for (let i = glows.length - 1; i >= 0; i--) {
          const g = glows[i];
          g.sprite.scale.x += 0.13; g.sprite.scale.y += 0.13;
          g.sprite.alpha -= 0.07;
          if (g.sprite.alpha <= 0) { glowContainer.removeChild(g.sprite); g.sprite.destroy(); glows.splice(i,1); }
        }

        // Corazón gigante
        if (heartPhase === "assembling") {
          giantHeartSprites.forEach(pt => {
            pt.sprite.x += (pt.targetX - pt.sprite.x) * 0.08;
            pt.sprite.y += (pt.targetY - pt.sprite.y) * 0.08;
            if (pt.sprite.alpha < 1) pt.sprite.alpha += 0.04;
          });
        } else if (heartPhase === "pulsing") {
          const elapsed = (Date.now() - heartTimer) / 1000;
          const pulse = 1 + Math.max(0, Math.sin(elapsed * 4.5)) * 0.09;
          const centerX = width / 2, centerY = height * 0.56;
          giantHeartSprites.forEach((pt, idx) => {
            const t = (2 * Math.PI * idx) / giantHeartSprites.length;
            const pos = heartEquation(t, (isMobile ? 9 : 13) * pulse);
            pt.sprite.x = centerX + pos.x;
            pt.sprite.y = centerY + pos.y;
            const sc = 0.85 + Math.sin(elapsed * 4.5 + idx * 0.3) * 0.15;
            pt.sprite.scale.set(sc);
          });
        } else if (heartPhase === "dissolving") {
          giantHeartSprites.forEach(pt => {
            pt.sprite.x += pt.driftX; pt.sprite.y += pt.driftY;
            pt.sprite.alpha -= 0.018;
          });
        }

        // Pétalos con rebote
        petals.forEach(p => {
          p.wobble += 0.03;
          p.sprite.y += p.speedY + p.bounceVY;
          p.sprite.x += p.speedX + Math.sin(p.wobble) * 0.6;
          p.sprite.rotation += p.rotSpeed;

          // Rebote al llegar abajo
          if (!p.bounced && p.sprite.y > height - 40) {
            p.bounced = true;
            p.bounceVY = -rnd(2,5);
            p.rotSpeed *= -0.8;
          }
          if (p.bounced) {
            p.bounceVY += 0.18; // gravedad del rebote
          }

          if (p.sprite.y > height + 80) {
            p.sprite.y = rnd(-80,-10);
            p.sprite.x = rnd(0,width);
            p.bounced = false;
            p.bounceVY = 0;
          }
        });
      });
    });

    // Cleanup
    containerRef.current.__pixiCleanup = () => {
      isDestroyed = true;
      if (rocketInterval)    clearInterval(rocketInterval);
      if (fadeInterval)      clearInterval(fadeInterval);
      if (trailInterval)     clearInterval(trailInterval);
      if (shootingStarTimer) clearInterval(shootingStarTimer);
      if (app && app.renderer) {
        try { app.destroy(true,{children:true,texture:true}); } catch {}
      }
    };
  }

  useEffect(() => {
    return () => {
      if (containerRef.current?.__pixiCleanup) containerRef.current.__pixiCleanup();
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} }
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-full z-[9999] overflow-hidden select-none"
      style={{ background: "radial-gradient(ellipse at center, #1a0030 0%, #0c0314 60%, #000008 100%)" }}>

      {/* ── Countdown ──────────────────────────────────────────────────────── */}
      {showCountdown && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span key={countdown} className="font-black text-white select-none"
            style={{
              fontSize: "clamp(5rem, 20vw, 12rem)",
              textShadow: "0 0 40px #ff6ba9, 0 0 80px #c084fc, 0 0 120px #ff6ba9",
              animation: "countPop 0.85s cubic-bezier(0.34,1.56,0.64,1) forwards",
            }}>
            {countdown}
          </span>
        </div>
      )}

      {/* ── Mensaje con typewriter ─────────────────────────────────────────── */}
      {showTypewriter && (
        <div className="absolute top-[9%] left-0 w-full flex flex-col items-center justify-center text-center px-4 pointer-events-none select-none"
          style={{ animation: "pop 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>

          <h1 className="font-extrabold text-white mb-1 tracking-wide"
            style={{
              fontSize: "clamp(1.5rem, 6vw, 3rem)",
              textShadow: "0 0 20px #ff6ba9, 0 0 50px #ff6ba9, 0 0 100px #c084fc",
            }}>
            🎉 Feliz Cumpleaños 🎉
          </h1>

          {/* Nombre con typewriter */}
          <h2 className="font-black mb-3 min-h-[2.5rem]"
            style={{
              fontSize: "clamp(1.3rem, 5.5vw, 2.5rem)",
              background: "linear-gradient(90deg,#ff6ba9,#c084fc,#ff9ecd,#ffd1e3,#ff6ba9)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 2.5s linear infinite",
              filter: "drop-shadow(0 2px 10px #ff6ba9)",
            }}>
            {typewriterText}
            <span style={{
              opacity: cursorVisible ? 1 : 0,
              WebkitTextFillColor: "#ff9ecd",
              transition: "opacity 0.1s",
            }}>|</span>
          </h2>

          {showSubtitle && (
            <div className="space-y-0.5 font-medium max-w-xs md:max-w-lg"
              style={{
                fontSize: "clamp(0.65rem, 2.5vw, 0.9rem)",
                color: "#ffd1e3",
                textShadow: "0 2px 8px rgba(0,0,0,0.95)",
                animation: "fadeUp 0.6s ease-out forwards",
              }}>
              <p>✨ Gracias por llenar mi vida de amor y felicidad.</p>
              <p>🌹 Hoy celebramos un año más de tu hermosa vida.</p>
              <p>💕 Te amo muchísimo, mi amor entero.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes countPop {
          0%   { transform: scale(2.5); opacity: 0; }
          40%  { transform: scale(0.9); opacity: 1; }
          70%  { transform: scale(1.08); }
          100% { transform: scale(1);   opacity: 0; }
        }
        @keyframes pop {
          0%   { transform: scale(0.6);  opacity: 0; }
          70%  { transform: scale(1.05); opacity: 0.9; }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
        @keyframes fadeUp {
          0%   { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}