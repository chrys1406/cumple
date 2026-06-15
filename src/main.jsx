import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Memories from "./Memories.jsx";
import "./index.css"; // si no tienes este archivo, crea uno vacío o quita esta línea

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/recuerdos" element={<Memories />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);