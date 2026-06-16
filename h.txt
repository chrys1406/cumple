import React, { useEffect, useState, useRef } from "react";

/**
 * Show de cumpleaños: cielo estrellado, cohetes con explosión de corazones,
 * mensaje con glow, corazón gigante y lluvia romántica final.
 * Todo animado con @keyframes (no `transition`) para que se vea fluido,
 * y con cantidades limitadas para que no sature el navegador.
 */

const HEARTS = ["❤️", "💖", "💕", "💗", "💞", "💘"];
const PETALS = ["🌹", "🥀", "❤️", "💕"];

const rnd = (a, b) => Math.random() * (b - a) + a;

// Puntos de un corazón paramétrico para el corazón gigante final
function heartPoints(count, scale) {
  const pts = [];
  for (let i = 0; i < count; i++) {
    const t = (2 * Math.PI * i) / count;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push({ dx: x * scale, dy: -y * scale });
  }
  return pts;
}

function FireworksShow({ onFinished, name = "Mi Preciosa Elizabeth" }) {
  const [stars] = useState(() =>
    Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: rnd(0, 100),
      top: rnd(0, 100),
      size: rnd(1, 3),
      duration: rnd(1.5, 4),
      delay: rnd(0, 3),
    }))
  );

  const [rockets, setRockets] = useState([]);
  const [bursts, setBursts] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  // Fases del corazón gigante: null -> "assembling" -> "pulsing" -> "dissolving" -> null
  const [heartPhase, setHeartPhase] = useState(null);
  const [petals, setPetals] = useState([]);
  const [fading, setFading] = useState(false);

  const finishedRef = useRef(false);
  // Guardamos la última versión de onFinished sin que dispare el efecto otra vez
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    const timers = [];

    // --- 2) Cohetes que suben y explotan (escalonados, cantidad limitada) ---
    const ROCKET_COUNT = 10;
    for (let r = 0; r < ROCKET_COUNT; r++) {
      timers.push(
        setTimeout(() => {
          const x = rnd(10, 90); // % del ancho
          const rocketId = Math.random();
          setRockets((prev) => [...prev, { id: rocketId, x }]);

          // El cohete tarda ~1.1s en llegar arriba, entonces explota
          timers.push(
            setTimeout(() => {
              setRockets((prev) => prev.filter((rk) => rk.id !== rocketId));
              const burstId = Math.random();
              const y = rnd(15, 50); // % del alto
              setBursts((prev) => [...prev, { id: burstId, x, y }]);
              timers.push(
                setTimeout(() => {
                  setBursts((prev) => prev.filter((b) => b.id !== burstId));
                }, 1800)
              );
            }, 1100)
          );
        }, r * 700)
      );
    }

    // --- 4) Mensaje principal con fade-in + glow ---
    timers.push(setTimeout(() => setShowMessage(true), 1800));

    // --- 6) Corazón gigante: se ensambla, late, y se disuelve en polvo de hadas ---
    timers.push(
      setTimeout(() => {
        setHeartPhase("assembling");
        timers.push(setTimeout(() => setHeartPhase("pulsing"), 1700));
        timers.push(setTimeout(() => setHeartPhase("dissolving"), 4000));
        timers.push(setTimeout(() => setHeartPhase(null), 5200));
      }, 5500)
    );

    // --- 7) Lluvia romántica final ---
    timers.push(
      setTimeout(() => {
        const drops = Array.from({ length: 45 }).map((_, i) => ({
          id: i,
          emoji: PETALS[Math.floor(Math.random() * PETALS.length)],
          left: rnd(0, 100),
          size: rnd(18, 38),
          duration: rnd(4, 8),
          delay: rnd(0, 3),
        }));
        setPetals(drops);
      }, 7500)
    );

    // --- 9) Fin del espectáculo: fade out y luego onFinished ---
    timers.push(
      setTimeout(() => {
        setFading(true);
        timers.push(
          setTimeout(() => {
            if (!finishedRef.current) {
              finishedRef.current = true;
              onFinishedRef.current && onFinishedRef.current();
            }
          }, 800)
        );
      }, 13500)
    );

    return () => timers.forEach(clearTimeout);
  }, []); // <- se ejecuta UNA sola vez, sin importar re-renders del padre

  // Puntos del corazón con su origen "disperso" (de donde vienen al ensamblarse)
  // y un drift aleatorio para cuando se disuelven. Se generan una sola vez.
  const giantPts = useState(() =>
    heartPoints(90, 10.5).map((p) => ({
      ...p,
      fromX: rnd(-260, 260),
      fromY: rnd(-220, 160),
      driftX: rnd(-60, 60),
      delay: rnd(0, 0.45),
    }))
  )[0];

  // Chispas/sparkles decorativos alrededor del corazón
  const sparklePts = useState(() =>
    Array.from({ length: 22 }).map(() => ({
      angle: rnd(0, 360),
      dist: rnd(70, 230),
      size: rnd(10, 22),
      duration: rnd(1.2, 2.4),
      delay: rnd(0, 2),
    }))
  )[0];

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden transition-opacity duration-700 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
      style={{
        zIndex: 9999,
        background: "radial-gradient(circle at center, rgba(20,0,35,0.55), rgba(0,0,0,0.85))",
        contain: "layout paint size",
        transform: "translateZ(0)",
      }}
    >
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        @keyframes fadeInZoom {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fw-launch {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100vh); opacity: 1; }
        }
        @keyframes fw-flash {
          from { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
          to { transform: translate(-50%, -50%) scale(6); opacity: 0; }
        }
        @keyframes fw-spark {
          from { transform: translate(-50%, -50%) translate(0,0) scale(1); opacity: 1; }
          to { transform: translate(-50%, -50%) translate(var(--sx), var(--sy)) scale(0.3); opacity: 0; }
        }
        @keyframes fw-heartburst {
          0% { transform: translate(-50%, -50%) translate(0,0) scale(0.3) rotate(0deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--dx), calc(var(--dy) + 60px)) scale(1.3) rotate(380deg); opacity: 0; }
        }
        @keyframes giantHeartAppear {
          0% { opacity: 0; transform: scale(0.3); }
          40% { opacity: 1; }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes heartAssemble {
          0% {
            opacity: 0;
            transform: translate(var(--fromX), var(--fromY)) scale(0.2) rotate(180deg);
          }
          55% {
            opacity: 1;
          }
          80% {
            transform: translate(var(--toX), var(--toY)) scale(1.25) rotate(0deg);
          }
          100% {
            opacity: 1;
            transform: translate(var(--toX), var(--toY)) scale(1) rotate(0deg);
          }
        }
        @keyframes heartPulse {
          0%, 100% { transform: translate(var(--toX), var(--toY)) scale(1); }
          50% { transform: translate(var(--toX), var(--toY)) scale(1.12); }
        }
        @keyframes heartDissolve {
          0% { opacity: 1; transform: translate(var(--toX), var(--toY)) scale(1); filter: blur(0px); }
          100% {
            opacity: 0;
            transform: translate(calc(var(--toX) + var(--driftX)), calc(var(--toY) - 140px)) scale(0.4);
            filter: blur(4px);
          }
        }
        @keyframes auraGlow {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          30% { opacity: 1; }
          100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1.15); }
        }
        @keyframes auraPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.75; }
        }
        @keyframes sparkleTwinkle {
          0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.4) rotate(0deg); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(180deg); }
        }
        @keyframes ringExpand {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
        }
        @keyframes floatDown {
          from { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          to { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle ease-in-out infinite;
          will-change: opacity;
        }
        .birthday-title {
          animation: fadeInZoom 1.4s ease forwards;
          text-shadow: 0 0 10px #fff, 0 0 20px #ff7eb3, 0 0 40px #ff4d88, 0 0 70px #ff4d88;
        }
        .fw-rocket {
          position: absolute; bottom: 0; width: 4px; height: 48px; border-radius: 10px;
          background: linear-gradient(to top, transparent, #ffb3cc, #fff);
          box-shadow: 0 0 10px #fff, 0 0 20px #ff80aa;
          animation: fw-launch 1.1s ease-in forwards;
        }
        .fw-flash {
          position: absolute; width: 24px; height: 24px; border-radius: 50%;
          background: #fff; filter: blur(8px);
          box-shadow: 0 0 20px #fff, 0 0 60px #ff75a7, 0 0 100px deeppink;
          animation: fw-flash 0.7s forwards;
          will-change: transform, opacity;
        }
        .fw-spark {
          position: absolute; width: 3px; height: 3px; border-radius: 50%;
          background: #fff; box-shadow: 0 0 6px #fff;
          animation: fw-spark 1s ease-out forwards;
          will-change: transform, opacity;
        }
        .fw-heart {
          position: absolute;
          text-shadow: 0 0 8px #ff6d9d;
          will-change: transform, opacity;
        }
        .fw-heart-burst { animation: fw-heartburst ease-out forwards; }
        .giant-heart-point {
          position: absolute;
          text-shadow: 0 0 10px hotpink;
          will-change: transform, opacity;
        }
        .giant-heart-point.assembling {
          animation: heartAssemble 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .giant-heart-point.pulsing {
          animation: heartPulse 1.6s ease-in-out infinite;
        }
        .giant-heart-point.dissolving {
          animation: heartDissolve 1.1s ease-in forwards;
        }
        .heart-aura {
          position: absolute;
          left: 50%;
          top: 50%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,182,224,0.55) 0%, rgba(255,110,180,0.25) 45%, rgba(255,80,160,0) 75%);
          animation: auraGlow 1.4s ease-out forwards;
        }
        .heart-aura.pulsing {
          animation: auraPulse 1.6s ease-in-out infinite;
        }
        .heart-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          border: 3px solid rgba(255, 215, 245, 0.8);
          border-radius: 50%;
          box-shadow: 0 0 18px rgba(255, 182, 224, 0.8);
          animation: ringExpand 1.3s ease-out forwards;
        }
        .heart-sparkle {
          position: absolute;
          left: 50%;
          top: 50%;
          animation: sparkleTwinkle ease-in-out infinite;
          text-shadow: 0 0 8px #ffd6f3;
          will-change: transform, opacity;
        }
        .petal {
          position: absolute;
          top: -10%;
          animation: floatDown linear forwards;
          text-shadow: 0 0 6px hotpink;
          will-change: transform, opacity;
        }
      `}</style>

      {/* 1) Cielo estrellado */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* 2) Cohetes subiendo */}
      {rockets.map((rk) => (
        <div key={rk.id} className="fw-rocket" style={{ left: `${rk.x}%` }} />
      ))}

      {/* 3) Explosiones: destello + chispas + corazones */}
      {bursts.map((b) => {
        const sparks = Array.from({ length: 14 }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.3;
          const d = rnd(40, 150);
          return { sx: Math.cos(angle) * d, sy: Math.sin(angle) * d, key: `${b.id}-s${i}` };
        });
        const burstHearts = Array.from({ length: 16 }).map((_, i) => {
          const angle = Math.random() * Math.PI * 2;
          const d = Math.sqrt(Math.random()) * 220;
          return {
            dx: Math.cos(angle) * d,
            dy: Math.sin(angle) * d,
            size: rnd(16, 32),
            dur: rnd(1.6, 2.6),
            emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
            key: `${b.id}-h${i}`,
          };
        });
        return (
          <React.Fragment key={b.id}>
            <div className="fw-flash" style={{ left: `${b.x}%`, top: `${b.y}%` }} />
            {sparks.map((s) => (
              <div
                key={s.key}
                className="fw-spark"
                style={{ left: `${b.x}%`, top: `${b.y}%`, "--sx": `${s.sx}px`, "--sy": `${s.sy}px` }}
              />
            ))}
            {burstHearts.map((h) => (
              <div
                key={h.key}
                className="fw-heart fw-heart-burst"
                style={{
                  left: `${b.x}%`,
                  top: `${b.y}%`,
                  fontSize: h.size,
                  "--dx": `${h.dx}px`,
                  "--dy": `${h.dy}px`,
                  animationDuration: `${h.dur}s`,
                }}
              >
                {h.emoji}
              </div>
            ))}
          </React.Fragment>
        );
      })}

      {/* 4 y 5) Mensaje principal + romántico */}
      {showMessage && (
        <div className="absolute w-full text-center px-4" style={{ top: "8%" }}>
          <h1
            className="birthday-title"
            style={{ fontSize: "clamp(40px,6vw,80px)", color: "#fff", fontWeight: "bold" }}
          >
            🎉 Feliz Cumpleaños 🎉
          </h1>
          <h2
            className="birthday-title"
            style={{ fontSize: "clamp(34px,5vw,60px)", color: "#ff8fc2", marginTop: "10px", fontWeight: "bold" }}
          >
            {name} ❤️
          </h2>
          <p
            className="birthday-title"
            style={{
              marginTop: "25px",
              color: "#ffd6e8",
              fontSize: "clamp(16px,2vw,26px)",
              maxWidth: "900px",
              marginInline: "auto",
              lineHeight: "1.6",
            }}
          >
            Gracias por llenar mi vida de amor y felicidad.
            <br />
            Hoy celebramos un año más de tu hermosa vida.
            <br />
            ❤️ Te amo muchísimo, {name} ❤️
          </p>
        </div>
      )}

      {/* 6) Corazón gigante: ensamblaje mágico, latido y disolución en polvo de hadas */}
      {heartPhase && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "55%",
            transform: "translate(-50%, -50%)",
            width: 0,
            height: 0,
          }}
        >
          {/* Resplandor de fondo tipo aura mágica */}
          <div
            className={`heart-aura ${heartPhase === "pulsing" ? "pulsing" : ""}`}
            style={{
              width: 420,
              height: 420,
              marginLeft: -210,
              marginTop: -210,
              opacity: heartPhase === "dissolving" ? 0 : undefined,
              transition: heartPhase === "dissolving" ? "opacity 1s ease-out" : undefined,
            }}
          />

          {/* Anillo de onda expansiva al formarse */}
          {heartPhase === "assembling" && (
            <div className="heart-ring" style={{ width: 60, height: 60, marginLeft: -30, marginTop: -30 }} />
          )}

          {/* Chispas brillantes orbitando */}
          {(heartPhase === "assembling" || heartPhase === "pulsing") &&
            sparklePts.map((s, i) => {
              const rad = (s.angle * Math.PI) / 180;
              const x = Math.cos(rad) * s.dist;
              const y = Math.sin(rad) * s.dist;
              return (
                <div
                  key={i}
                  className="heart-sparkle"
                  style={{
                    fontSize: s.size,
                    marginLeft: x,
                    marginTop: y,
                    animationDuration: `${s.duration}s`,
                    animationDelay: `${s.delay}s`,
                  }}
                >
                  ✨
                </div>
              );
            })}

          {/* Puntos del corazón gigante */}
          {giantPts.map((p, i) => (
            <div
              key={i}
              className={`giant-heart-point ${
                heartPhase === "assembling"
                  ? "assembling"
                  : heartPhase === "pulsing"
                  ? "pulsing"
                  : "dissolving"
              }`}
              style={{
                fontSize: 26,
                marginLeft: -13,
                marginTop: -13,
                "--fromX": `${p.fromX}px`,
                "--fromY": `${p.fromY}px`,
                "--toX": `${p.dx}px`,
                "--toY": `${p.dy}px`,
                "--driftX": `${p.driftX}px`,
                animationDelay: heartPhase === "assembling" ? `${p.delay}s` : `${i * 0.006}s`,
              }}
            >
              💖
            </div>
          ))}
        </div>
      )}

      {/* 7) Lluvia romántica final */}
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

export default React.memo(FireworksShow);