"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function CreateWorkerProfilePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
    city: "",
    country: "",
    bio: "",
    hourlyRate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a worker profile.",
          variant: "destructive",
        });
        window.location.href = "/sign-in";
        return;
      }

      // We'll check for and set the worker role later in the process
      // No need to check for selected_role here as we're already creating the worker profile

      // Create the worker profile
      const { error: profileError } = await supabase.from("worker_profiles").insert({
        id: user.id,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        bio: formData.bio,
        hourly_rate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        is_available: true,
      });

      if (profileError) {
        console.error("Error creating worker profile:", profileError);
        toast({
          title: "Error",
          description: profileError.message || "Failed to create worker profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Ensure the user has the worker role assigned
      const response = await fetch("/api/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ role: "worker" }),
        cache: "no-store"
      });

      if (!response.ok) {
        console.error("Error updating role after profile creation");
        // We don't return here because the profile was created successfully
        // Just show a warning that they might need to select the worker role manually
        toast({
          title: "Warning",
          description: "Profile created, but there was an issue setting your role. You may need to select the Worker role manually.",
          variant: "default",
        });
      } else {
        toast({
          title: "Success",
          description: "Your worker profile has been created!",
        });
      }

      // Add a small delay before redirecting to ensure all operations complete
      setTimeout(() => {
        // Redirect to dashboard using window.location for a full page navigation
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error("Error in profile creation:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create Your Worker Profile</CardTitle>
          <CardDescription>
            Set up your profile to start offering services on SkillBridge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell potential clients about yourself, your skills, and experience..."
                />
              </div>

              <div>
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="Leave blank if you prefer to set rates per service"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating Profile..." : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
