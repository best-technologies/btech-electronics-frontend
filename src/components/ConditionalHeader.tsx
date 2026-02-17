"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/landing-page/components/Header";

/**
 * Renders the main site Header only on non-dashboard routes.
 * Dashboard routes use the sidebar for navigation.
 */
export function ConditionalHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }
  return <Header />;
}
