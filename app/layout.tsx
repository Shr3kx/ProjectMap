import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "sonner";
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
              duration={4000}
              theme="system"
              richColors
              closeButton
            />
         
        </ThemeProvider>
      </body>
    </html>
  );
}
