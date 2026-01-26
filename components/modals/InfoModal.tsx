"use client";

import React from "react";
import { X, Sparkles, Shield, Palette, Code, Globe } from "lucide-react";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-border p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X size={18} className="text-foreground" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
              <Sparkles size={32} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                ProjectMap AI Chat
              </h2>
              <p className="text-sm text-muted-foreground">
                Privacy-first AI companion powered by ProjectMap
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6 space-y-8">
          {/* Key Features Grid */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Feature Cards */}
              <div className="bg-secondary/50 border border-border rounded-xl p-4 hover:bg-secondary/70 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Complete Privacy
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      No login required, no chat history saved, no tracking or
                      analytics. Your conversations are truly ephemeral.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 border border-border rounded-xl p-4 hover:bg-secondary/70 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Palette size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      19 Beautiful Themes
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Choose from 5 light and 14 dark themes, all professionally
                      designed with perfect contrast ratios.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 border border-border rounded-xl p-4 hover:bg-secondary/70 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Web Search & Files
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Get real-time information with web search and analyze
                      images and documents with multimodal AI.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Code size={20} className="text-primary" />
              Technical Details
            </h3>
            <div className="bg-secondary/30 border border-border rounded-xl p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    Frontend
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-foreground">
                      Next.js 15 + React 19
                    </p>
                    <p className="text-xs text-foreground">TypeScript</p>
                    <p className="text-xs text-foreground">Tailwind CSS 4</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    AI Integration
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-foreground">Google Gemini 2.0</p>
                    <p className="text-xs text-foreground">Vercel AI SDK</p>
                    <p className="text-xs text-foreground">
                      Multimodal Support
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Version:
                  </span>{" "}
                  1.0.4 •{" "}
                  <span className="font-semibold text-foreground">
                    License:
                  </span>{" "}
                  MIT •{" "}
                  <span className="font-semibold text-foreground">
                    Built with:
                  </span>{" "}
                  ❤️
                </p>
              </div>
            </div>
          </div>

          {/* Features Checklist */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              What Makes ProjectMap Special
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "No login or sign-up required",
                "Zero data collection or tracking",
                "No chat history persistence",
                "API key rotation for reliability",
                "Real-time web search capability",
                "Image and file analysis",
                "Markdown with code highlighting",
                "Response time tracking",
                "Model information display",
                "19 professionally designed themes",
                "WCAG AA accessibility compliant",
                "Fully keyboard navigable",
                "Open source and transparent",
                "Mobile responsive design",
                "Glassmorphism UI effects",
                "Smooth animations throughout",
              ].map(feature => (
                <div key={feature} className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-4">
              Resources & Links
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/iam-sahil/ProjectMap"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground rounded-lg transition-colors text-sm border border-border"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground rounded-lg transition-colors text-sm border border-border"
              >
                <Globe size={16} />
                <span>Get API Key</span>
              </a>
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-secondary-foreground hover:text-accent-foreground rounded-lg transition-colors text-sm border border-border"
              >
                <Code size={16} />
                <span>Next.js</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-secondary/30 px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-muted-foreground">
              Made with <span className="text-red-500">❤️</span> by developers,
              for developers
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Powered by</span>
              <span className="text-xs font-semibold text-foreground">
                Google Gemini
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-semibold text-foreground">
                Vercel AI SDK
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
