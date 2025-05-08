import { cn } from "@/lib/utils";

interface SkillBridgeLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function SkillBridgeLogo({ 
  className, 
  size = "md" 
}: SkillBridgeLogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("text-primary font-bold flex items-center", sizeClasses[size])}>
        <span className="text-primary">Skill</span>
        <span className="text-blue-500">Bridge</span>
      </div>
    </div>
  );
}
