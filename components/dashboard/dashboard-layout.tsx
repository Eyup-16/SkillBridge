"use client";

import { ReactNode, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isWorker, setIsWorker] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/sign-in");
          return;
        }
        
        setUser(user);
        
        // Get user's profile with selected role
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("selected_role")
          .eq("id", user.id)
          .single();
        
        if (error || !profile?.selected_role) {
          console.error("Error fetching user profile or no role selected:", error);
          router.push("/role-selection");
          return;
        }
        
        setSelectedRole(profile.selected_role);
        
        // Check if user has a worker profile
        const { data: workerProfile } = await supabase
          .from("worker_profiles")
          .select("id")
          .eq("id", user.id)
          .single();
        
        setIsWorker(profile.selected_role === "worker");
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          router.push("/sign-in");
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <DashboardSidebar 
          user={user} 
          selectedRole={selectedRole} 
          isWorker={isWorker} 
        />
        
        {/* Main content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
