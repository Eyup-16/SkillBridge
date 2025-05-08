"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProfileForm } from "@/components/dashboard/profile/profile-form";
import { AvatarUpload } from "@/components/dashboard/profile/avatar-upload";
import { SecuritySettings } from "@/components/dashboard/profile/security-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        // Get user's profile with selected role
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setProfile(profileData);
        setSelectedRole(profileData.selected_role);

        // Get role-specific profile data
        if (profileData.selected_role === "worker") {
          const { data: workerData, error: workerError } = await supabase
            .from("worker_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!workerError) {
            setWorkerProfile(workerData);
          }
        } else if (profileData.selected_role === "customer") {
          const { data: customerData, error: customerError } = await supabase
            .from("customer_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!customerError) {
            setCustomerProfile(customerData);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [supabase, toast]);

  if (isLoading) {
    return <DashboardLoading title="Loading profile..." />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Profile Management"
        description="Manage your account settings and profile information"
      />

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Update your basic profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm
                profile={profile}
                workerProfile={workerProfile}
                customerProfile={customerProfile}
                selectedRole={selectedRole}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avatar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>
                Upload or update your profile picture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarUpload
                userId={profile?.id}
                currentAvatarUrl={profile?.avatar_url}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettings userId={profile?.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
