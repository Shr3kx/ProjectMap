"use client";

import React from "react";
import { Persona } from "@/types/chat";
import { personas } from "@/lib/ai";
import { Sparkles, Zap, Flame, Waves, Moon } from "lucide-react";

interface ModelSwitcherProps {
  currentPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

const iconMap: Record<string, any> = {
  Sparkles,
  Zap,
  Flame,
  Waves,
  Moon,
};

export function ModelSwitcher({
  currentPersona,
  onPersonaChange,
}: ModelSwitcherProps) {
  const currentConfig = personas[currentPersona];
  const IconComponent = iconMap[currentConfig.icon] || Sparkles;

  return (
    <button
      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-muted-foreground border border-white/10 rounded-lg transition-all duration-200 text-xs font-medium"
      onClick={() => {
        // Cycle through personas
        const personaList: Persona[] = [
          "eevee",
          "jolteon",
          "flareon",
          "vaporeon",
          "umbreon",
        ];
        const currentIndex = personaList.indexOf(currentPersona);
        const nextIndex = (currentIndex + 1) % personaList.length;
        onPersonaChange(personaList[nextIndex]);
      }}
      title={`Current: ${currentConfig.name}`}
    >
      <IconComponent size={14} />
      <span>{currentConfig.name}</span>
    </button>
  );
}
