"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette, Check, ChevronDown } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Theme } from "@/types/theme";

export function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentTheme, setTheme, themes } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleThemeSelect = (theme: Theme) => {
    setTheme(theme);
    setIsOpen(false);
  };

  // Group themes by type
  const lightThemes = Object.entries(themes).filter(
    ([_, config]) => config.theme === "light",
  );
  const darkThemes = Object.entries(themes).filter(
    ([_, config]) => config.theme === "dark",
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center bg-card hover:bg-accent border border-border rounded-full transition-colors shadow-sm"
        aria-label="Select theme"
        title={`Current: ${themes[currentTheme].name}`}
      >
        <Palette size={16} className="text-foreground" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-popover border border-border rounded-xl shadow-2xl p-3 min-w-[280px] max-w-[320px] z-50 animate-fade-in backdrop-blur-xl">
          {/* Current Theme Display */}
          <div className="px-3 py-2 mb-2 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1">Current Theme</p>
            <p className="text-sm font-semibold text-foreground">
              {themes[currentTheme].name}
            </p>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {/* Light Themes */}
            {lightThemes.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-muted-foreground px-3 py-1 mb-1">
                  Light Themes ({lightThemes.length})
                </p>
                <div className="flex flex-col gap-1">
                  {lightThemes.map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleThemeSelect(key as Theme)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                        currentTheme === key
                          ? "bg-primary/20 border border-primary/50"
                          : "bg-transparent hover:bg-accent border border-transparent"
                      }`}
                    >
                      <span
                        className={`text-sm ${
                          currentTheme === key
                            ? "font-semibold text-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {config.name}
                      </span>
                      {currentTheme === key && (
                        <Check size={14} className="text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dark Themes */}
            {darkThemes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground px-3 py-1 mb-1">
                  Dark Themes ({darkThemes.length})
                </p>
                <div className="flex flex-col gap-1">
                  {darkThemes.map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleThemeSelect(key as Theme)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                        currentTheme === key
                          ? "bg-primary/20 border border-primary/50"
                          : "bg-transparent hover:bg-accent border border-transparent"
                      }`}
                    >
                      <span
                        className={`text-sm ${
                          currentTheme === key
                            ? "font-semibold text-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {config.name}
                      </span>
                      {currentTheme === key && (
                        <Check size={14} className="text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Hint */}
          <div className="mt-2 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              {themes[currentTheme].theme === "dark" ? "🌙" : "☀️"}{" "}
              {lightThemes.length + darkThemes.length} themes available
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
