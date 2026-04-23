import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// StrictMode removed: it intentionally double-invokes effects in dev mode,
// which causes every API call (trending news, summaries) to fire twice,
// burning through Gemini free-tier quota (20 req/day) instantly.
createRoot(document.getElementById("root")).render(<App />);