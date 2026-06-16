import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Memories from "./Memories.jsx";
import GlobalMusic from "./GlobalMusic.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Reproductor global: sigue sonando entre páginas */}
      <GlobalMusic />

      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/recuerdos" element={<Memories />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);