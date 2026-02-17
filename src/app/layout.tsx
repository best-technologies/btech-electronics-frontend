import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalHeader } from "@/components/ConditionalHeader";
import { AuthRehydrate } from "@/components/AuthRehydrate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Best Technologies | Electronics Distribution Partner",
  description:
    "Your trusted distribution partner for electronics in Ibadan, Nigeria. TVs, appliances, inverters, solar batteries & more. Serving wholesalers across Oyo and beyond.",
  icons: {
    icon: "/btech-logo.jpg",
    apple: "/btech-logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthRehydrate />
          <div className="flex min-h-screen flex-col bg-background text-foreground">
            <ConditionalHeader />
            <div className="flex-1 min-h-0 flex flex-col">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
