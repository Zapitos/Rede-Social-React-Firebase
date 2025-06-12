// src/main.jsx
import React from "react"; // Pode ser necessário importar React
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
