import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "HealthMate - Elderly-Safe AI Medical Companion",
  description: "Simple multilingual summaries for medical reports, pill guidance, and dietary health tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
        <main className="flex-1 pb-24 max-w-xl w-full mx-auto px-4 pt-4">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
