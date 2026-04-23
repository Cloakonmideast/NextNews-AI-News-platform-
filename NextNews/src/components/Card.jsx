import React from "react";

const Card = ({ icon, title, description }) => {
  return (
    <div className="glass-card group rounded-2xl p-7 sm:p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 cursor-default">
      <div className="text-4xl mb-5 animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-white mb-2.5">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </div>
  );
};

export default Card;