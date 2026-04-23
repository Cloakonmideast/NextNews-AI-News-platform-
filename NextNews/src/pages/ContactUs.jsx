import React from "react";
import { Mail, ArrowUpRight } from "lucide-react";

const ContactUs = () => {
  return (
    <div id="contact" className="relative py-20 sm:py-28">
      {/* Section divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14 animate-fade-up">
          <p className="text-sm font-medium tracking-widest uppercase text-blue-400/70 mb-3">
            Contact
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Get in touch
          </h2>
          <p className="text-sm text-white/35 mt-3 max-w-md mx-auto">
            Have feedback or questions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-5">
          {/* Contact Form — 3 cols */}
          <div className="md:col-span-3 glass-card rounded-2xl p-6 sm:p-8">
            <form className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full bg-white/[0.04] text-white text-sm py-3 px-4 rounded-xl border border-white/[0.08] focus:outline-none focus:border-blue-500/40 transition-colors placeholder-white/20"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full bg-white/[0.04] text-white text-sm py-3 px-4 rounded-xl border border-white/[0.08] focus:outline-none focus:border-blue-500/40 transition-colors placeholder-white/20"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2">Message</label>
                <textarea
                  className="w-full bg-white/[0.04] text-white text-sm py-3 px-4 rounded-xl border border-white/[0.08] focus:outline-none focus:border-blue-500/40 transition-colors placeholder-white/20 h-28 resize-none"
                  placeholder="Your message..."
                />
              </div>
              <button
                type="button"
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-500/20"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Info — 2 cols */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="glass-card rounded-2xl p-6 sm:p-7 flex-1">
              <h3 className="text-sm font-semibold text-white mb-5">Contact Info</h3>
              <div className="flex items-center gap-3 text-white/50">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm">contact@nextnews.ai</span>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-6 sm:p-7 flex-1">
              <p className="text-sm text-white/35 leading-relaxed mb-4">
                Building the future of AI-powered news delivery. Open source and community driven.
              </p>
              <a href="#" className="inline-flex items-center gap-1.5 text-xs text-blue-400/70 hover:text-blue-400 transition-colors">
                Learn more about us
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-white/[0.05] max-w-4xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">© 2025 NextNews. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors">Privacy</a>
            <a href="#" className="text-xs text-white/25 hover:text-white/50 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
