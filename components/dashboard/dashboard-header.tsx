"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  
  // Determine if we're on a nested route
  const isNestedRoute = pathname.split('/').filter(Boolean).length > 2;
  
  // If no backHref is provided but we're on a nested route, 
  // default to going up one level
  const defaultBackHref = isNestedRoute 
    ? pathname.split('/').slice(0, -1).join('/') 
    : '/dashboard';
  
  const href = backHref || defaultBackHref;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        {backHref !== undefined && (
          <div className="mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link href={href}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                {backLabel}
              </Link>
            </Button>
          </div>
        )}
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
