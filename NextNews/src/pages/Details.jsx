// src/pages/Details.jsx
import { useLocation, Link } from "react-router-dom";
import React from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useLanguage } from "../LanguageContext";

const NewsDetail = () => {
  const location = useLocation();
  const news = location.state?.news;

  const { t, language } = useLanguage();
  const isRTL = language === "urdu";

  if (!news) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-5">
        <div className="text-center glass-card rounded-2xl p-10 max-w-sm w-full">
          <p className="text-white/40 text-sm mb-4">No article selected.</p>
          <Link to="/demo" className="text-blue-400 text-sm hover:underline">
            ← Back to news
          </Link>
        </div>
      </div>
    );
  }

  const { title, thumbnail, description, link } = news;

  return (
    <div className="min-h-screen bg-[#09090b] text-white" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 sm:py-12 animate-fade-up">
        {/* Back */}
        <Link
          to="/demo"
          className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white/60 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("goBack")}
        </Link>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug mb-6">
          {title}
        </h1>

        {/* Thumbnail */}
        {thumbnail && (
          <div className="glass-card rounded-2xl overflow-hidden mb-8">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-52 sm:h-64 md:h-80 object-cover"
            />
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-white/45 leading-relaxed mb-8">
          {description || "Click the link below to read the full article from the source."}
        </p>

        {/* Read full article */}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/15 rounded-lg transition-colors"
          >
            Read Full Article
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;