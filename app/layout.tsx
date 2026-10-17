import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav, Sidebar } from "@/components/BottomNav";
import { GuideProvider } from "@/components/DoctorGuide";
import { LanguageProvider } from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "HealthMate - Elderly-Safe AI Medical Companion",
  description: "Simple multilingual summaries for medical reports, pill guidance, and dietary health tracking.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f5f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-ink flex flex-col antialiased">
        <LanguageProvider>
          <GuideProvider>
            <Sidebar />
            <main className="flex-1 w-full pb-28 lg:pb-16 lg:pl-[var(--sidebar-width)]">
              <div className="max-w-xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-10">
                {children}
              </div>
            </main>
            <BottomNav />
          </GuideProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
