"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Theme, ThemeConfig } from "@/types/theme";
import { themes, getThemeVariables } from "@/lib/themes";

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  themes: Record<Theme, ThemeConfig>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>("dark-green");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const themeConfig = themes[currentTheme];

    // Set data-theme attribute
    root.setAttribute("data-theme", themeConfig.theme);

    // Apply CSS variables
    const variables = getThemeVariables(currentTheme);
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Save to localStorage
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme, mounted]);

  const setTheme = (theme: Theme) => {
    if (themes[theme]) {
      setCurrentTheme(theme);
    }
  };

  const cycleTheme = () => {
    const themeKeys = Object.keys(themes) as Theme[];
    const currentIndex = themeKeys.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setCurrentTheme(themeKeys[nextIndex]);
  };

  return (
    <ThemeContext.Provider
      value={{ currentTheme, setTheme, cycleTheme, themes }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
