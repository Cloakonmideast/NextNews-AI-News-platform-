// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import CustomizeAvatar from "./pages/CustomizeAvatar";
import AnchorPage from "./pages/AnchorPage";
import NewsDetail from "./pages/Details";
import { LanguageProvider } from "./LanguageContext"; 

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="bg-[#0b0b0f] min-h-screen text-white">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/demo" element={<HomePage />} />
            <Route path="/demo/anchor" element={<AnchorPage/>} />
            <Route path="/demo/anchor/customize" element={<CustomizeAvatar />} />
            <Route path="/news/:id" element={<NewsDetail />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}