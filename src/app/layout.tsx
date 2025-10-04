import type React from "react";
import type { Metadata } from "next";
import { Outfit, Fira_Code } from "next/font/google";
import "./globals.css";
import { themePresets } from "@/lib/themes";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/ConvexClientProvider";
import { SyncUser } from "@/components/SyncUsers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fira_code = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var STORAGE_KEY = 'theme:preset-id';
    var id = localStorage.getItem(STORAGE_KEY) || 'dark-green';
    var presets = ${JSON.stringify(themePresets)};
    var preset = presets[id] || presets['dark-green'];
    var root = document.documentElement;
    if (preset.theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    var colors = preset.colors || {};
    for (var k in colors) {
      if (Object.prototype.hasOwnProperty.call(colors, k)) {
        root.style.setProperty('--' + k, 'hsl(' + colors[k] + ')');
      }
    }
  } catch (e) {}
})();`,
          }}
        />
      </head>
      <body className={`font-sans ${outfit.variable} ${fira_code.variable}`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <SyncUser />
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
