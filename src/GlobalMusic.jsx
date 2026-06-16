import { useEffect, useRef, useState } from "react";
import { Music, Play, Pause } from "lucide-react";
import cancion from "./assets/cancion.mp3";

export default function GlobalMusic() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={cancion}
        loop
        onEnded={() => setIsPlaying(false)}
      />

      <button
        onClick={toggleMusic}
        className="fixed bottom-5 right-5 z-[99999]
                   flex items-center gap-2
                   px-4 py-2 rounded-full
                   bg-rose-500 hover:bg-rose-600
                   text-white shadow-lg transition"
      >
        <Music size={16} />
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </>
  );
}