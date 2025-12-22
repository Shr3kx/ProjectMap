"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  themePresets,
  themePresetList,
  type ThemePreset,
  type ThemeTokenName,
} from "@/lib/themes";

const STORAGE_KEY = "theme:preset-id";

function applyTheme(preset: ThemePreset) {
  const root = document.documentElement;

  if (preset.theme === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }

  Object.entries(preset.colors).forEach(([token, value]) => {
    root.style.setProperty(`--${token as ThemeTokenName}`, `hsl(${value})`);
  });
}

interface ThemeContextType {
  currentThemeId: string;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentThemeId, setCurrentThemeId] = useState<string>("dark-green");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEY) || "dark-green";
    setCurrentThemeId(storedId);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const preset = themePresets[currentThemeId] ?? themePresets["dark-green"];
      applyTheme(preset);
    }
  }, [currentThemeId, mounted]);

  const cycleTheme = () => {
    const currentIndex = themePresetList.findIndex(
      ({ id }) => id === currentThemeId
    );
    const nextIndex = (currentIndex + 1) % themePresetList.length;
    const nextId = themePresetList[nextIndex].id;
    setCurrentThemeId(nextId);
    try {
      localStorage.setItem(STORAGE_KEY, nextId);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider value={{ currentThemeId, cycleTheme }}>
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
