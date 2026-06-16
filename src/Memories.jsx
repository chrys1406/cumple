import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";

import foto1 from "./assets/foto1.jpeg";
import foto2 from "./assets/foto2.jpeg";
import foto3 from "./assets/foto3.jpeg";
import foto4 from "./assets/foto4.jpeg";
import foto5 from "./assets/foto5.jpeg";
import foto6 from "./assets/foto6.jpeg";
import foto7 from "./assets/foto7.jpeg";
import foto8 from "./assets/foto8.jpeg";
import foto9 from "./assets/foto9.jpeg";
import foto10 from "./assets/foto10.jpeg";
import foto11 from "./assets/foto11.jpeg";

// Cuando tengas más fotos simplemente agrégalas aquí
const memories = [
  { id: 1, src: foto11, caption: "Cuando fuimos a satelite a jugar jueguitos y creo que celebravamos algo ❤️" },
  { id: 2, src: foto2, caption: "Siempre juntos miau 💕" },
  { id: 3, src: foto3, caption: "jaja mi bebe pechocha✨" },
  { id: 4, src: foto4, caption: "una fotito despues de hacer cuchi cuchi jaja🌹" },
  { id: 5, src: foto5, caption: "Dia de pisinaaaaa yeiiiii 🥰" },
  { id: 6, src: foto6, caption: "Tan hermosa que es mi bebe💖" },
  { id: 7, src: foto7, caption: "jajaj recuerdo que no quise botarlo en la calle y lo puse en tu bolsilo💕 " },
  { id: 8, src: foto8, caption: "Mi doña que peluches y tambien parecias esos raperos jajaj❤️" },
  { id: 9, src: foto9, caption: "Mi frutilla con mostacho te amo mucho mucho mucho🥰" },
  { id: 10, src: foto10, caption: "Nuestro primer cumpleaños juntos ❤️" },
];

export default function Memories() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 flex flex-col items-center justify-center px-4">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Caveat:wght@700&display=swap');

        .title{
          font-family:'Playfair Display',serif;
        }

        .script{
          font-family:'Caveat',cursive;
        }

        .heart{
          width:760px;
          max-width:95vw;
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:14px;
        }

        .row{
          display:flex;
          justify-content:center;
          gap:14px;
          width:100%;
        }

        .piece{
          overflow:hidden;
          border-radius:22px;
          cursor:pointer;
          background:white;
          border:4px solid white;
          box-shadow:0 10px 25px rgba(0,0,0,.18);
          transition:.35s;
        }

        .piece:hover{
          transform:scale(1.06) rotate(2deg);
        }

        .piece img{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }

        .small{
          width:180px;
          height:180px;
        }

        .medium{
          width:170px;
          height:170px;
        }

        @media(max-width:768px){

          .small{
            width:28vw;
            height:28vw;
          }

          .medium{
            width:22vw;
            height:22vw;
          }

        }

      `}</style>

      <button
        onClick={() => navigate("/")}
        className="absolute top-5 left-5 bg-white rounded-full px-4 py-2 shadow flex items-center gap-2 text-rose-500"
      >
        <ArrowLeft size={18}/>
        Volver
      </button>

      <h1 className="title text-5xl text-rose-600 mb-2 italic">
        Nuestros Recuerdos
      </h1>

      <p className="script text-3xl text-pink-500 mb-8">
        Cada pedacito forma nuestro corazón ❤️
      </p>
      <p className="script text-3xl text-pink-500 mb-8">
       Has click en las imagenes  para que se abran mi corazon de melon ❤️
      </p>

      <div className="heart">

        {/* FILA SUPERIOR (3) */}

        <div className="row">

          {memories.slice(0,3).map((m)=>(
            <button
              key={m.id}
              className="piece medium"
              onClick={()=>setSelected(m)}
            >
              <img src={m.src} alt="" />
            </button>
          ))}

        </div>

        {/* FILA CENTRAL (4) */}

        <div className="row">

          {memories.slice(3,7).map((m)=>(
            <button
              key={m.id}
              className="piece small"
              onClick={()=>setSelected(m)}
            >
              <img src={m.src} alt="" />
            </button>
          ))}

        </div>

        {/* FILA INFERIOR (3) */}

        <div className="row">

          {memories.slice(7,10).map((m)=>(
            <button
              key={m.id}
              className="piece medium"
              onClick={()=>setSelected(m)}
            >
              <img src={m.src} alt="" />
            </button>
          ))}

        </div>

      </div>
            {/* Modal para ampliar la imagen */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg text-rose-500 hover:bg-rose-100 transition"
            >
              <X size={20} />
            </button>

            <img
              src={selected.src}
              alt={selected.caption}
              className="w-full h-[320px] object-contain bg-pink-100"
            />

            <div className="p-6 text-center">
              <h2 className="script text-3xl text-rose-500">
                {selected.caption}
              </h2>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}