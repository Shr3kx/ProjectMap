// Theme type definitions for ProjectMap
export type Theme =
  | "light-pink"
  | "light-green"
  | "github-light"
  | "ayu"
  | "frosted-glass"
  | "dark-pink"
  | "dark-green"
  | "github-dark"
  | "catppuccin"
  | "tokyo-night"
  | "nord"
  | "gruvbox"
  | "one-dark"
  | "dracula"
  | "cyberpunk-2077"
  | "synthwave-84"
  | "neon-synthwave"
  | "panda"
  | "atom-one-dark";

export interface ThemeConfig {
  name: string;
  theme: "light" | "dark";
  colors: {
    background: string;
    foreground: string;
    card: string;
    "card-foreground": string;
    popover: string;
    "popover-foreground": string;
    primary: string;
    "primary-foreground": string;
    secondary: string;
    "secondary-foreground": string;
    muted: string;
    "muted-foreground": string;
    accent: string;
    "accent-foreground": string;
    destructive: string;
    "destructive-foreground": string;
    border: string;
    input: string;
    ring: string;
    sidebar: string;
    "sidebar-foreground": string;
    "sidebar-border": string;
  };
}
