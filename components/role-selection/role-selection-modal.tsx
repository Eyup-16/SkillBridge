"use client";

import { useState } from "react";
import { AlertCircle, Briefcase, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RoleCard } from "./role-card";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  availableRoles: string[];
}

export function RoleSelectionModal({
  isOpen,
  onOpenChange,
  userId,
  availableRoles,
}: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

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

      // Close the modal
      onOpenChange(false);

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose Your Role</DialogTitle>
          <DialogDescription>
            Select how you want to use SkillBridge. You can change your role later.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4 mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
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

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Processing..." : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
