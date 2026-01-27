import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProjectMap - AI Chat",
  description:
    "A privacy-first AI chat app powered by ProjectMap and Google Gemini. No data saved—pure fun and creativity!",
  keywords: ["AI", "chat", "Gemini", "ProjectMap", "chatbot"],
  authors: [{ name: "ProjectMap Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10B981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "hsl(var(--card))",
                color: "hsl(var(--card-foreground))",
                border: "1px solid hsl(var(--border))",
              },
              success: {
                iconTheme: {
                  primary: "hsl(var(--primary))",
                  secondary: "hsl(var(--primary-foreground))",
                },
              },
              error: {
                iconTheme: {
                  primary: "hsl(var(--destructive))",
                  secondary: "hsl(var(--destructive-foreground))",
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
