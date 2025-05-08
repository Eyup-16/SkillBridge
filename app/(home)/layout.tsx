"use client";

import { useLayoutEffect } from "@/components/layout/layout-context";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set home-specific layout settings with transparent header
  useLayoutEffect({
    headerVariant: "transparent",
    footerVariant: "default",
  });

  return <>{children}</>;
}
