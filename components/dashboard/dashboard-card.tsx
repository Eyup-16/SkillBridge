"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  isLoading?: boolean;
}

export function DashboardCard({
  title,
  description,
  icon: Icon,
  footer,
  className,
  children,
  isLoading = false,
}: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          <CardTitle>{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={cn("pt-0", isLoading && "animate-pulse")}>
        {isLoading ? (
          <div className="h-24 bg-muted rounded-md"></div>
        ) : (
          children
        )}
      </CardContent>
      {footer && <CardFooter className="border-t pt-3">{footer}</CardFooter>}
    </Card>
  );
}
