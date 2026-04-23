import React from "react";
import { Link } from "react-router-dom";
import { FileText, Globe, Mic } from "lucide-react";

const features = [
  {
    icon: <FileText className="w-6 h-6 text-cyan-400" />,
    title: "Instant Summaries",
    description: "Curated insights instant and summary, cold and eneloop our preferred congoes.",
  },
  {
    icon: <Globe className="w-6 h-6 text-blue-400" />,
    title: "Multilingual Support",
    description: "Curated insights, support mods, support, eafbnicoogries and esenenlq conoers.",
  },
  {
    icon: <Mic className="w-6 h-6 text-cyan-400" />,
    title: "Virtual Anchor Narrations",
    description: "Curatect the instant insights and anchory, virtual anchor narrations.",
  },
];

const Features = () => {
  return (
    <div id="features" className="max-w-[1200px] mx-auto px-6 sm:px-10 pb-32 pt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {features.map((f, i) => (
          <div key={i} className={`card p-8 bg-[#131318]/80 backdrop-blur-sm border-white/[0.08] hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300 anim-fade-up-${i + 1}`}>
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.05] flex items-center justify-center mb-6">
              {f.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-4">{f.title}</h3>
            <p className="text-[15px] text-[#9898a0] leading-relaxed mb-8 min-h-[72px]">{f.description}</p>
            <button className="px-5 py-2.5 bg-[#1e1e25] hover:bg-[#2a2a35] text-white text-sm font-medium rounded-lg transition-colors border border-white/[0.05]">
              Read Summary
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-16 flex justify-center anim-fade-up-3">
         <Link to="/demo">
           <button className="btn-accent px-8 py-3.5 text-[15px] shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] rounded-full text-white bg-[#2563eb] hover:bg-[#1d4ed8]">
             Get Started for Free
           </button>
         </Link>
      </div>
    </div>
  );
};

export default Features;