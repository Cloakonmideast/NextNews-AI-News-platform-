import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, User, Menu, X } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0b0f]/85 backdrop-blur-xl border-b border-white/[0.05]">
      <div className="flex items-center justify-between px-6 sm:px-10 py-4 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <span className="text-xl font-bold tracking-tight text-white">
            Next<span className="text-cyan-400">News</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {isLanding ? (
            <>
              <a href="#features" className="text-[15px] text-white/50 hover:text-white transition-colors">Features</a>
              <a href="#contact" className="text-[15px] text-white/50 hover:text-white transition-colors">Technology</a>
              <Link to="/demo">
                <button className="btn-ghost !border-white/20 hover:!border-white/40">Get Started</button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/demo" className={`text-[15px] transition-colors relative ${location.pathname === "/demo" ? "text-white font-medium" : "text-white/50 hover:text-white"}`}>
                My Feed
                {location.pathname === "/demo" && (
                  <span className="absolute -bottom-[26px] left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                )}
              </Link>
              <Link to="/demo/anchor" className={`text-[15px] transition-colors ${location.pathname.includes("anchor") ? "text-white font-medium" : "text-white/50 hover:text-white"}`}>
                Explore
              </Link>
              <Link to="/">
                <button className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors shadow-sm">
                  Go Back to Home Page
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2.5 rounded-lg hover:bg-white/[0.05]" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6 text-white/60" /> : <Menu className="w-6 h-6 text-white/60" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.05] bg-[#0b0b0f]/95 backdrop-blur-xl anim-fade-in px-6 py-5 space-y-1">
          {isLanding ? (
            <>
              <a href="#features" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-base text-white/60 hover:text-white rounded-lg hover:bg-white/[0.04]">Features</a>
              <a href="#contact" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-base text-white/60 hover:text-white rounded-lg hover:bg-white/[0.04]">Technology</a>
              <Link to="/demo" onClick={() => setMobileOpen(false)}><button className="btn-ghost w-full mt-3 py-3 !border-white/20">Get Started</button></Link>
            </>
          ) : (
            <>
              <Link to="/demo" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-base text-white/60 hover:text-white rounded-lg hover:bg-white/[0.04]">My Feed</Link>
              <Link to="/demo/anchor" onClick={() => setMobileOpen(false)} className="block py-3 px-4 text-base text-white/60 hover:text-white rounded-lg hover:bg-white/[0.04]">Explore</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;