"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import SkillBridgeLogo from "@/components/skillbridge-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useUserProfile } from "@/contexts/user-profile-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  Bell
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SiteHeaderProps {
  className?: string;
  variant?: "default" | "transparent";
}

export function SiteHeader({
  className,
  variant = "default"
}: SiteHeaderProps) {
  const { user, profile, isLoading } = useUserProfile();
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Determine if we're on a dashboard page
  const isDashboardPage = pathname.startsWith("/dashboard");

  return (
    <header
      className={cn(
        "w-full sticky top-0 z-50 transition-all duration-200",
        variant === "transparent" && !isScrolled
          ? "bg-transparent border-transparent"
          : "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        isScrolled && "shadow-sm",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" className="mr-4 hidden md:block">
            <SkillBridgeLogo />
          </Link>
          <MainNav className="hidden md:flex" />
        </div>
        <div className="flex items-center gap-4">
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : isLoading ? (
            <div className="h-9 w-24 bg-muted animate-pulse rounded-md"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-80 overflow-y-auto">
                    {/* Sample notifications */}
                    <div className="p-3 hover:bg-muted cursor-pointer">
                      <p className="text-sm font-medium">New booking request</p>
                      <p className="text-xs text-muted-foreground">John Doe booked your service</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-3 hover:bg-muted cursor-pointer">
                      <p className="text-sm font-medium">Service completed</p>
                      <p className="text-xs text-muted-foreground">Your service has been marked as completed</p>
                      <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View all notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-3">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block text-sm font-medium truncate max-w-[100px]">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {profile?.selected_role && (
                    <div className="px-2 py-1.5">
                      <Badge variant="outline" className="w-full justify-center text-xs">
                        {profile.selected_role === "worker" ? "Worker" : "Customer"}
                      </Badge>
                    </div>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button asChild size="sm" variant={"outline"}>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm" variant={"default"}>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          )}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
