import React from "react";

const Button = ({ text, outlined, onClick, disabled, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        outlined
          ? "text-white/70 border border-white/[0.12] bg-transparent hover:bg-white/[0.06] hover:text-white"
          : "text-white bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20"
      } ${className}`}
    >
      {text}
    </button>
  );
};

export default Button;