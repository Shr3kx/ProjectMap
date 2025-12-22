import { Persona } from "@/types/chat";
import { Sparkles, Zap, Flame, Waves, Moon } from "lucide-react";

export interface PersonaConfig {
  name: string;
  icon: string;
  description: string;
  features: {
    webSearch: boolean;
  };
}

export const personas: Record<Persona, PersonaConfig> = {
  eevee: {
    name: "Eevee",
    icon: "Sparkles",
    description: "Versatile all-rounder with web search and advanced thinking",
    features: {
      webSearch: true,
    },
  },
  jolteon: {
    name: "Jolteon",
    icon: "Zap",
    description: "Lightning-fast responses with no delays",
    features: {
      webSearch: false,
    },
  },
  flareon: {
    name: "Flareon",
    icon: "Flame",
    description: "Warm, flirty, and playful conversations",
    features: {
      webSearch: false,
    },
  },
  vaporeon: {
    name: "Vaporeon",
    icon: "Waves",
    description: "Sophisticated research and analysis assistant",
    features: {
      webSearch: true,
    },
  },
  umbreon: {
    name: "Umbreon",
    icon: "Moon",
    description: "Maximum power with full reasoning capabilities",
    features: {
      webSearch: true,
    },
  },
};
