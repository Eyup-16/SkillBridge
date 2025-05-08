"use client";

import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User as UserIcon,
  Calendar,
  Settings,
  MessageSquare,
  Wrench,
  Clock,
  Users,
  Star,
  LogOut,
  ChevronRight,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/contexts/user-profile-context";

interface DashboardSidebarProps {
  user: User | null;
  selectedRole: string | null;
  isWorker: boolean;
}

export function DashboardSidebar({ user, selectedRole, isWorker }: DashboardSidebarProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { profile } = useUserProfile();

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await supabase.auth.signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="mr-2 h-4 w-4" />,
      roles: ["customer", "worker"],
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: <UserIcon className="mr-2 h-4 w-4" />,
      roles: ["customer", "worker"],
    },
    {
      href: "/dashboard/bookings",
      label: "My Bookings",
      icon: <Calendar className="mr-2 h-4 w-4" />,
      roles: ["customer"],
    },
    {
      href: "/dashboard/service-requests",
      label: "Service Requests",
      icon: <Calendar className="mr-2 h-4 w-4" />,
      roles: ["worker"],
    },
    {
      href: "/dashboard/services",
      label: "My Services",
      icon: <Wrench className="mr-2 h-4 w-4" />,
      roles: ["worker"],
    },
    {
      href: "/dashboard/clients",
      label: "My Clients",
      icon: <Users className="mr-2 h-4 w-4" />,
      roles: ["worker"],
    },
    {
      href: "/dashboard/saved-services",
      label: "Saved Services",
      icon: <Star className="mr-2 h-4 w-4" />,
      roles: ["customer"],
    },
    {
      href: "/dashboard/forum",
      label: "My Forum Posts",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      roles: ["customer", "worker"],
    },
    {
      href: "/dashboard/reviews",
      label: "Reviews",
      icon: <Star className="mr-2 h-4 w-4" />,
      roles: ["customer", "worker"],
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
      roles: ["customer", "worker"],
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    (item) => item.roles.includes(selectedRole as string)
  );

  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 border-2 border-primary/20 mb-4">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt="User avatar" />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary text-4xl">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <h2 className="text-xl font-bold">{user?.email}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedRole === "worker" ? "Service Provider" : "Customer"}
          </p>
          {/* Role switcher button */}
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-xs"
            asChild
          >
            <Link href="/role-selection?switch=true">
              Switch Role
            </Link>
          </Button>
          <div className="mt-4 w-full">
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/profile">
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <nav className="bg-card rounded-lg border overflow-hidden mb-6">
        <div className="p-2 space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isSigningOut ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}
