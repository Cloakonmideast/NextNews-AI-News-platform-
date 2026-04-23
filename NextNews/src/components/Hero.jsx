import React from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 sm:px-10 text-center relative z-10 pt-20">
      <h1 className="anim-fade-up text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight max-w-4xl text-white">
        AI-Powered News
        <br />
        Summary Platform
      </h1>
      <p className="anim-fade-up-1 mt-6 text-lg sm:text-xl text-[#9898a0] max-w-lg leading-relaxed">
        Curated insights, delivered on-demand.
      </p>
    </div>
  );
};

export default Hero;