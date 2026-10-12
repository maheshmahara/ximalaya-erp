import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ximalaya Coffee ERP - Specialty Traceability & EUDR Compliance",
  description: "End-to-end farm-to-cup traceability and EUDR verification engine for Himalayan specialty coffee.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-neutral-950 text-neutral-100 min-h-screen flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
