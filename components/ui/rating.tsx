"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  className?: string;
  starClassName?: string;
  showValue?: boolean;
  maxValue?: number;
}

export function Rating({
  value,
  onChange,
  size = "md",
  readOnly = false,
  className,
  starClassName,
  showValue = false,
  maxValue = 5,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverValue(index);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  const handleClick = (index: number) => {
    if (readOnly) return;
    onChange?.(index);
  };

  // Determine star size based on the size prop
  const starSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const starSize = starSizes[size];

  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex">
        {[...Array(maxValue)].map((_, index) => {
          const starValue = index + 1;
          const isActive = (hoverValue !== null ? hoverValue : value) >= starValue;
          
          return (
            <span
              key={index}
              className={cn(
                "cursor-pointer transition-colors",
                readOnly && "cursor-default",
                starClassName
              )}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleClick(starValue)}
            >
              <Star
                className={cn(
                  starSize,
                  "transition-colors",
                  isActive
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                )}
              />
            </span>
          );
        })}
      </div>
      
      {showValue && (
        <span className="ml-2 text-sm font-medium">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
