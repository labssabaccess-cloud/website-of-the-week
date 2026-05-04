import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "OTW – Of The Week",
  description: "Discover and vote for the best websites every week. A Play Store for the web.",
  openGraph: {
    title: "OTW – Of The Week",
    description: "Discover and vote for the best websites every week.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[#0a0a0f] text-slate-200 antialiased min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <footer className="border-t border-white/5 py-8 mt-16">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-slate-500 text-sm">© 2025 OTW – Of The Week. All rights reserved.</p>
              <div className="flex gap-6 text-sm text-slate-500">
                <a href="/submit" className="hover:text-violet-400 transition-colors">Submit a site</a>
                <a href="/archive" className="hover:text-violet-400 transition-colors">Archive</a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
