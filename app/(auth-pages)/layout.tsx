"use client";

import { useLayoutEffect } from "@/components/layout/layout-context";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set auth-specific layout settings
  useLayoutEffect({
    headerVariant: "default",
    footerVariant: "minimal",
  });

  return (
    <div className="max-w-7xl flex flex-col gap-12 items-start">{children}</div>
  );
}
