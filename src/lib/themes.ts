export type ThemeMode = "light" | "dark";

export type ThemeTokenName =
  | "background"
  | "foreground"
  | "card"
  | "card-foreground"
  | "popover"
  | "popover-foreground"
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "secondary-foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "accent-foreground"
  | "destructive"
  | "destructive-foreground"
  | "border"
  | "input"
  | "ring"
  | "sidebar"
  | "sidebar-foreground"
  | "sidebar-border"
  | "btn-border"; // Added btn-border token

export interface ThemePreset {
  name: string;
  theme: ThemeMode;
  colors: Record<ThemeTokenName, string>;
}

export const themePresets: Record<string, ThemePreset> = {
  "light-pink": {
    name: "Neon Rose Light",
    theme: "light",
    colors: {
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "0 0% 100%",
      "card-foreground": "240 10% 3.9%",
      popover: "0 0% 100%",
      "popover-foreground": "240 10% 3.9%",
      primary: "336 80% 58%",
      "primary-foreground": "0 0% 100%",
      secondary: "240 4.8% 95.9%",
      "secondary-foreground": "240 5.9% 10%",
      muted: "240 4.8% 95.9%",
      "muted-foreground": "240 3.8% 46.1%",
      accent: "336 80% 95%",
      "accent-foreground": "336 80% 58%",
      destructive: "0 84.2% 60.2%",
      "destructive-foreground": "0 0% 98%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: "336 80% 58%",
      sidebar: "0 0% 98%",
      "sidebar-foreground": "240 10% 3.9%",
      "sidebar-border": "240 5.9% 90%",
      "btn-border": "0 0% 0%", // Black border for light theme
    },
  },
  "light-green": {
    name: "Evergreen Light",
    theme: "light",
    colors: {
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "0 0% 100%",
      "card-foreground": "240 10% 3.9%",
      popover: "0 0% 100%",
      "popover-foreground": "240 10% 3.9%",
      primary: "142 70% 45%",
      "primary-foreground": "0 0% 100%",
      secondary: "240 4.8% 95.9%",
      "secondary-foreground": "240 5.9% 10%",
      muted: "240 4.8% 95.9%",
      "muted-foreground": "240 3.8% 46.1%",
      accent: "142 50% 95%",
      "accent-foreground": "142 70% 45%",
      destructive: "0 84.2% 60.2%",
      "destructive-foreground": "0 0% 98%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: "142 70% 45%",
      sidebar: "0 0% 98%",
      "sidebar-foreground": "240 10% 3.9%",
      "sidebar-border": "240 5.9% 90%",
      "btn-border": "0 0% 0%", // Black border for light theme
    },
  },
  "light-amethyst": {
    name: "Amethyst Light",
    theme: "light",
    colors: {
      background: "0 0% 100%", // White base
      foreground: "240 10% 3.9%", // Dark text
      card: "0 0% 100%",
      "card-foreground": "240 10% 3.9%",
      popover: "0 0% 100%",
      "popover-foreground": "240 10% 3.9%",
      primary: "234 89% 74%", // Same amethyst purple
      "primary-foreground": "0 0% 100%", // White text on purple
      secondary: "240 4.8% 95.9%", // Subtle gray
      "secondary-foreground": "240 5.9% 10%",
      muted: "240 4.8% 95.9%",
      "muted-foreground": "240 3.8% 46.1%",
      accent: "234 70% 92%", // Light purple accent
      "accent-foreground": "234 89% 30%", // Deep purple text
      destructive: "0 84.2% 60.2%",
      "destructive-foreground": "0 0% 98%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: "234 89% 74%", // Purple ring
      sidebar: "0 0% 98%",
      "sidebar-foreground": "240 10% 3.9%",
      "sidebar-border": "240 5.9% 90%",
      "btn-border": "0 0% 0%", // Black border for light theme
    },
  },
  "dark-pink": {
    name: "Neon Rose Dark",
    theme: "dark",
    colors: {
      background: "240 10% 4%",
      foreground: "0 0% 98%",
      card: "240 10% 4%",
      "card-foreground": "0 0% 98%",
      popover: "240 10% 4%",
      "popover-foreground": "0 0% 98%",
      primary: "336 80% 65%",
      "primary-foreground": "0 0% 98%",
      secondary: "240 3.7% 15.9%",
      "secondary-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      accent: "336 50% 25%",
      "accent-foreground": "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      "destructive-foreground": "0 0% 98%",
      border: "240 3.7% 15.9%",
      input: "240 3.7% 15.9%",
      ring: "336 80% 65%",
      sidebar: "240 10% 7%",
      "sidebar-foreground": "0 0% 98%",
      "sidebar-border": "240 3.7% 15.9%",
      "btn-border": "0 0% 98%", // White border for dark theme
    },
  },
  "dark-green": {
    name: "Evergreen Dark",
    theme: "dark",
    colors: {
      background: "240 10% 4%",
      foreground: "0 0% 98%",
      card: "240 10% 4%",
      "card-foreground": "0 0% 98%",
      popover: "240 10% 4%",
      "popover-foreground": "0 0% 98%",
      primary: "142 70% 45%",
      "primary-foreground": "0 0% 98%",
      secondary: "240 3.7% 15.9%",
      "secondary-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      accent: "142 40% 20%",
      "accent-foreground": "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      "destructive-foreground": "0 0% 98%",
      border: "240 3.7% 15.9%",
      input: "240 3.7% 15.9%",
      ring: "142 70% 45%",
      sidebar: "240 10% 7%",
      "sidebar-foreground": "0 0% 98%",
      "sidebar-border": "240 3.7% 15.9%",
      "btn-border": "0 0% 98%", // White border for dark theme
    },
  },
  "dark-amethyst": {
    name: "Amethyst Night",
    theme: "dark",
    colors: {
      background: "240 10% 4%",
      foreground: "0 0% 98%",
      card: "240 10% 4%",
      "card-foreground": "0 0% 98%",
      popover: "240 10% 4%",
      "popover-foreground": "0 0% 98%",
      primary: "234 89% 74%",
      "primary-foreground": "0 0% 98%",
      secondary: "240 3.7% 15.9%",
      "secondary-foreground": "0 0% 98%",
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      accent: "234 70% 70%",
      "accent-foreground": "0 0% 98%",
      destructive: "0 62.8% 30.6%",
      "destructive-foreground": "0 0% 98%",
      border: "240 3.7% 15.9%",
      input: "240 3.7% 15.9%",
      ring: "234 100% 85%",
      sidebar: "240 10% 7%",
      "sidebar-foreground": "0 0% 98%",
      "sidebar-border": "240 3.7% 15.9%",
      "btn-border": "0 0% 14%", // White border for dark theme
    },
  },
};

export const themePresetList: Array<{ id: string; preset: ThemePreset }> =
  Object.entries(themePresets).map(([id, preset]) => ({ id, preset }));
