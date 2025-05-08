"use client";

import { Loader2 } from "lucide-react";
import { DashboardCard } from "./dashboard-card";

interface DashboardLoadingProps {
  title?: string;
  cardCount?: number;
}

export function DashboardLoading({ 
  title = "Loading...", 
  cardCount = 3 
}: DashboardLoadingProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted rounded-md animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-muted rounded-md animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: cardCount }).map((_, i) => (
          <DashboardCard
            key={i}
            title={title}
            isLoading={true}
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardLoadingFull() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
