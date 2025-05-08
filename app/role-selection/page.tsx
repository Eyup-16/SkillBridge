"use client";

import { useEffect, useState } from "react";
import { Briefcase, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
import { RoleCard } from "@/components/role-selection/role-card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSwitchingRole = searchParams.get('switch') === 'true';
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);

        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // If no user is logged in, redirect to sign in
          router.push("/sign-in");
          return;
        }

        setUserId(user.id);

        // Check if the user already has a selected role
        const { data: profile } = await supabase
          .from("profiles")
          .select("selected_role")
          .eq("id", user.id)
          .single();

        if (profile?.selected_role) {
          // Store the current role
          setCurrentRole(profile.selected_role);

          // If user already has a selected role and is not explicitly switching roles,
          // redirect to dashboard
          if (!isSwitchingRole) {
            router.push("/dashboard");
            return;
          }

          // If switching roles, pre-select the current role
          setSelectedRole(profile.selected_role);
        }

        // Get user's available roles
        const { data: roleAssignments } = await supabase
          .from("user_role_assignments")
          .select("role_name")
          .eq("user_id", user.id);

        // No auto-selection - user must explicitly choose their role
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  const handleRoleSelect = (roleName: string) => {
    setSelectedRole(roleName);
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;

    try {
      setIsSubmitting(true);

      // Call the role API to update the user's role
      const response = await fetch("/api/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating role:", errorData.error);
        setError(errorData.error || "Failed to update role. Please try again.");
        toast({
          title: "Error",
          description: errorData.error || "Failed to update role. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      // Clear any previous errors
      setError(null);

      // If the selected role is 'worker' and the user needs to create a worker profile,
      // redirect to create one
      if (data.needsWorkerProfile) {
        // Use window.location for a full page navigation instead of client-side routing
        window.location.href = "/dashboard/create-worker-profile";
      } else {
        // Otherwise, go to the dashboard
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error in role selection:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isSwitchingRole ? "Switch Your Role" : "Choose Your Role"}
        </h1>
        <p className="text-muted-foreground">
          {isSwitchingRole
            ? "Select which role you want to switch to. Your current role is " +
              (currentRole === "worker" ? "Worker" : "Customer") + "."
            : "Select how you want to use SkillBridge. You can change your role later."
          }
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <RoleCard
          title="Worker"
          description="Offer your skills and services"
          icon={Briefcase}
          roleName="worker"
          isSelected={selectedRole === "worker"}
          onSelect={handleRoleSelect}
        />
        <RoleCard
          title="Customer"
          description="Find and book services"
          icon={User}
          roleName="customer"
          isSelected={selectedRole === "customer"}
          onSelect={handleRoleSelect}
        />
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!selectedRole || isSubmitting}
        >
          {isSubmitting
            ? "Processing..."
            : isSwitchingRole
              ? (selectedRole === currentRole ? "Continue with Current Role" : "Switch Role")
              : "Continue"
          }
        </Button>
      </div>
    </div>
  );
}
