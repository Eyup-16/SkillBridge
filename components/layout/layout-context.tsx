"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type HeaderVariant = "default" | "transparent";
type FooterVariant = "default" | "minimal";

interface LayoutContextType {
  headerVariant: HeaderVariant;
  footerVariant: FooterVariant;
  showHeader: boolean;
  showFooter: boolean;
  setHeaderVariant: (variant: HeaderVariant) => void;
  setFooterVariant: (variant: FooterVariant) => void;
  setShowHeader: (show: boolean) => void;
  setShowFooter: (show: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType>({
  headerVariant: "default",
  footerVariant: "default",
  showHeader: true,
  showFooter: true,
  setHeaderVariant: () => {},
  setFooterVariant: () => {},
  setShowHeader: () => {},
  setShowFooter: () => {},
});

export const useLayout = () => useContext(LayoutContext);

interface LayoutProviderProps {
  children: ReactNode;
}

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [headerVariant, setHeaderVariant] = useState<HeaderVariant>("default");
  const [footerVariant, setFooterVariant] = useState<FooterVariant>("default");
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);

  return (
    <LayoutContext.Provider
      value={{
        headerVariant,
        footerVariant,
        showHeader,
        showFooter,
        setHeaderVariant,
        setFooterVariant,
        setShowHeader,
        setShowFooter,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

// Custom hook for setting layout options in a component
export function useLayoutEffect(options: {
  headerVariant?: HeaderVariant;
  footerVariant?: FooterVariant;
  showHeader?: boolean;
  showFooter?: boolean;
}) {
  const layout = useLayout();

  React.useEffect(() => {
    // Save current values to restore later
    const prevHeaderVariant = layout.headerVariant;
    const prevFooterVariant = layout.footerVariant;
    const prevShowHeader = layout.showHeader;
    const prevShowFooter = layout.showFooter;

    // Apply new values
    if (options.headerVariant !== undefined) {
      layout.setHeaderVariant(options.headerVariant);
    }
    if (options.footerVariant !== undefined) {
      layout.setFooterVariant(options.footerVariant);
    }
    if (options.showHeader !== undefined) {
      layout.setShowHeader(options.showHeader);
    }
    if (options.showFooter !== undefined) {
      layout.setShowFooter(options.showFooter);
    }

    // Cleanup function to restore previous values
    return () => {
      layout.setHeaderVariant(prevHeaderVariant);
      layout.setFooterVariant(prevFooterVariant);
      layout.setShowHeader(prevShowHeader);
      layout.setShowFooter(prevShowFooter);
    };
  }, [
    options.headerVariant,
    options.footerVariant,
    options.showHeader,
    options.showFooter,
    layout
  ]);
}
