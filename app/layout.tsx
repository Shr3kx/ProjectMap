import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { themePresets } from "@/lib/themes";
import { Suspense } from "react";

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
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  );
}
