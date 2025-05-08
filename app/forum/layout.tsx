"use client";

import { useLayoutEffect } from "@/components/layout/layout-context";

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set forum-specific layout settings
  useLayoutEffect({
    headerVariant: "default",
    footerVariant: "minimal",
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Main content - full width without sidebar */}
      {children}
    </div>
  );
}
