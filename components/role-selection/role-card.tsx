"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface RoleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  roleName: string;
  isSelected?: boolean;
  onSelect: (roleName: string) => void;
}

export function RoleCard({
  title,
  description,
  icon: Icon,
  roleName,
  isSelected = false,
  onSelect,
}: RoleCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 border-2",
        isSelected
          ? "border-primary bg-primary/5"
          : isHovered
          ? "border-primary/50 bg-primary/5"
          : "border-border"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(roleName)}
    >
      <CardHeader>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {roleName === "worker" ? (
            <>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                <span>Offer your skills and services</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                <span>Set your own rates and availability</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                <span>Manage bookings and client interactions</span>
              </li>
            </>
          ) : (
            <>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                <span>Browse and book services</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                <span>Find skilled workers in your area</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">•</span>
                <span>Track your bookings and history</span>
              </li>
            </>
          )}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={() => onSelect(roleName)}
        >
          {isSelected ? "Selected" : "Select"}
        </Button>
      </CardFooter>
    </Card>
  );
}
