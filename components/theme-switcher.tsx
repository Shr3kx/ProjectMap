"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  themePresets,
  themePresetList,
  type ThemePreset,
  type ThemeTokenName,
} from "@/lib/themes";
import { PaintbrushVertical } from "lucide-react";

const STORAGE_KEY = "theme:preset-id";

function applyTheme(preset: ThemePreset) {
  const root = document.documentElement;

  // Toggle dark class to support dark: utilities and any dark-mode variants
  if (preset.theme === "dark") {
    root.classList.add("dark");
    // Helps native UI choose correct palette
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }

  // Apply CSS variables from the preset; use HSL color function for given triples.
  // Variables are consumed directly via Tailwind tokens (bg-background, text-foreground, etc.)
  Object.entries(preset.colors).forEach(([token, value]) => {
    // token is one of ThemeTokenName; CSS var names match: --background, --card-foreground, etc.
    root.style.setProperty(`--${token as ThemeTokenName}`, `hsl(${value})`);
  });
}

export function ThemeSwitcher() {
  const [currentId, setCurrentId] = React.useState<string>(() => {
    if (typeof window === "undefined") return "dark-green";
    return localStorage.getItem(STORAGE_KEY) || "dark-green";
  });

  React.useEffect(() => {
    const initial = themePresets[currentId] ?? themePresets["dark-green"];
    applyTheme(initial);
  }, []); // apply once on mount to avoid FOUC on subsequent navigations

  const currentPreset = themePresets[currentId] ?? themePresets["dark-green"];

  function onSelect(id: string) {
    const preset = themePresets[id];
    if (!preset) return;
    setCurrentId(id);
    applyTheme(preset);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-xl p-2 bg-background">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="skeuomorphic-button"
            aria-label={`Current theme: ${currentPreset.name}`}
          >
            <PaintbrushVertical className="size-4" aria-hidden="true" />
            <span className="sr-only">{`Theme: ${currentPreset.name}`}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Select theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={currentId} onValueChange={onSelect}>
            {themePresetList.map(({ id, preset }) => (
              <DropdownMenuRadioItem key={id} value={id}>
                {preset.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default ThemeSwitcher;
