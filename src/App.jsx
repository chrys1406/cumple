import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Sparkles, ChevronLeft, ChevronRight, X, Music, Play, Pause, Images } from "lucide-react";
import FireworksShow from "./FireworksShow";

// Importa tus fotos desde src/assets.
import foto1 from "./assets/foto1.jpeg";

// ---------------------------------------------
// Datos editables: notas de amor y galería
// ---------------------------------------------
const loveNotes = [
  "Eres el sueño hecho realidad que nunca supe que tenía. ¡Feliz cumpleaños!",
  "Tus brazos son el lugar exacto al que pertenezco y del que nunca quiero irme.",
  "Cada día contigo es una aventura y un regalo. Gracias por existir.",
  "De miles de millones de personas en este planeta, mi corazón te eligió a ti.",
  "Amo tu risa, tus ojos y tu forma tan tierna de ver la vida.",
  "Te amo no solo por lo que eres, sino por lo que soy cuando estoy contigo.",
  "Eres mi sol en días nublados y mi refugio en cualquier tormenta.",
  "Por muchos años más llenos de besos, viajes locos y amor incondicional.",
  "Iluminas cada rincón de mi existencia con tu luz.",
  "Eres, hoy y siempre, el amor de mi vida entera. Feliz cumpleaños, mi amor.",
];

// Imagen destacada al centro
const featuredImage = foto1;

export default function App() {
  const navigate = useNavigate();
  const [noteIndex, setNoteIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);

  // Lluvia continua de corazones de fondo (más grandes y notorios)
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Math.random();
      const heart = {
        id,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 28 + 22,
        duration: Math.random() * 5 + 6,
        opacity: Math.random() * 0.4 + 0.5,
      };
      setHearts((prev) => [...prev, heart]);
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== id));
      }, 12000);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  const nextNote = () => setNoteIndex((i) => (i + 1) % loveNotes.length);
  const prevNote = () => setNoteIndex((i) => (i - 1 + loveNotes.length) % loveNotes.length);

  const handleShowClick = () => {
    if (showFireworks) return; // evita relanzar mientras corre
    setShowFireworks(true);
  };

  // Duración total del show (cohetes + corazón gigante + lluvia final)
  const handleShowFinished = useCallback(() => {
    setShowFireworks(false);
    setShowFinalModal(true);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 font-[Montserrat]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=Caveat:wght@500;700&family=Montserrat:wght@300;400;600&display=swap');
        html, body, #root { overflow-x: hidden; }
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .heart-fall { position: fixed; top: -8%; animation: fall linear infinite; pointer-events: none; z-index: 5; }
        .font-display { font-family: 'Playfair Display', serif; }
        .font-script { font-family: 'Caveat', cursive; }
      `}</style>

      {/* Lluvia de corazones de fondo */}
      {hearts.map((h) => (
        <Heart
          key={h.id}
          className="heart-fall text-rose-400 fill-rose-300"
          style={{
            left: h.left,
            width: h.size,
            height: h.size,
            opacity: h.opacity,
            animationDuration: `${h.duration}s`,
          }}
        />
      ))}

      {/* Show de fuegos artificiales (overlay independiente) */}
      {showFireworks && <FireworksShow onFinished={handleShowFinished} />}

      {/* Botón hacia la página de recuerdos: esquina superior derecha, con espacio */}
      <button
        onClick={() => navigate("/recuerdos")}
        className="fixed top-4 right-4 md:top-6 md:right-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 hover:bg-white border border-rose-200 text-rose-500 hover:text-rose-600 shadow-md transition font-script text-sm md:text-base"
      >
        <Images size={16} />
        Nuestros recuerdos
      </button>

      <div className="relative z-10 mx-auto max-w-5xl px-4">
        {/* ===================== PANTALLA 1: hero compacto, sin scroll ===================== */}
        <section className="min-h-screen flex flex-col items-center justify-center pt-16 pb-6 gap-4 md:gap-5">
          {/* Encabezado */}
          <header className="text-center">
            <span className="font-script text-xl md:text-2xl text-rose-500 block">
              Para la persona que ilumina mi vida
            </span>
            <h1 className="font-display italic text-4xl md:text-6xl text-rose-700 font-bold leading-tight">
              Feliz Cumpleaños
            </h1>
            <p className="font-script text-3xl md:text-4xl text-fuchsia-600 font-bold">
              mi Espocita ❤️
            </p>
          </header>

          {/* Foto destacada */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-rose-200 to-fuchsia-200 rounded-3xl blur-lg opacity-60"></div>
            <img
              src={featuredImage}
              alt="Mi amor"
              className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 object-cover rounded-3xl border-4 border-white shadow-2xl rotate-1"
            />
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2.5 shadow-lg">
              <Heart className="text-rose-500 fill-rose-500" size={20} />
            </div>
          </div>

          {/* Botón de explosión de amor: justo debajo de la foto principal */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleShowClick}
              disabled={showFireworks}
              className="relative overflow-visible px-8 md:px-10 py-3.5 md:py-4 rounded-full bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 text-white font-display font-bold text-base md:text-lg shadow-lg shadow-rose-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles size={20} /> {showFireworks ? "Te Amo Mucho Bebe..." : "Presiona aquí, mi amor"}
              </span>
            </button>
          </div>

          {/* Carta con notas de amor */}
          <div className="w-full max-w-xl">
            <div className="bg-white/60 backdrop-blur-md border border-white/70 rounded-2xl shadow-xl p-4 md:p-6 text-center min-h-[110px] md:min-h-[120px] flex flex-col items-center justify-center relative">
              <p className="font-script text-lg md:text-2xl text-gray-700 leading-snug italic px-2">
                "{loveNotes[noteIndex]}"
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={prevNote}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-600 flex items-center justify-center transition"
                  aria-label="Carta anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs text-rose-400 font-medium">
                  {noteIndex + 1} / {loveNotes.length}
                </span>
                <button
                  onClick={nextNote}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-600 flex items-center justify-center transition"
                  aria-label="Siguiente carta"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Reproductor de "nuestra canción": debajo del recuadro de textos */}
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/70 shadow-md mt-1 max-w-[90vw]">
            <span className="relative flex h-2 w-2 shrink-0">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              )}
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <Music size={14} className="text-rose-400 shrink-0" />
            <span className="text-xs md:text-sm text-rose-700 font-medium truncate">La cancion que siempre te dedicare bebe</span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition shrink-0"
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause size={11} /> : <Play size={11} className="ml-0.5" />}
            </button>
          </div>

          <footer className="text-center text-rose-400/70 text-xs md:text-sm font-medium">
            Hecho con todo el amor de mi corazón para mi esposa 🤍
          </footer>
        </section>
      </div>

      {/* Modal final: mensaje de Feliz Cumpleaños */}
      {showFinalModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          style={{ animation: "fadeIn 0.6s ease-out" }}
          onClick={() => setShowFinalModal(false)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center border-4 border-rose-200"
            style={{ animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFinalModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-600 flex items-center justify-center transition"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>
            <Heart className="text-rose-500 fill-rose-500 mx-auto mb-3" size={36} />
            <h2 className="font-display italic text-4xl md:text-5xl text-rose-600 font-bold mb-4">
              ¡Feliz Cumpleaños!
            </h2>
            <p className="font-script text-xl md:text-2xl text-gray-700 leading-relaxed">
              {/* Escribe aquí tus palabras para Espocita */}
              Mi amor, hoy quiero que sepas todo lo que significas para mí... (aquí escribo mi mensaje) 💕
            </p>
          </div>
        </div>
      )}
    </div>
  );
}