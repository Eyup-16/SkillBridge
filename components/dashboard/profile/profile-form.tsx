"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  profile: any;
  workerProfile: any;
  customerProfile: any;
  selectedRole: string | null;
}

export function ProfileForm({ profile, workerProfile, customerProfile, selectedRole }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    // Common profile fields
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    phone_number: profile?.phone_number || "",
    bio: profile?.bio || "",
    
    // Worker-specific fields
    worker_full_name: workerProfile?.full_name || "",
    worker_phone_number: workerProfile?.phone_number || "",
    address: workerProfile?.address || "",
    city: workerProfile?.city || "",
    country: workerProfile?.country || "",
    hourly_rate: workerProfile?.hourly_rate?.toString() || "",
    years_experience: workerProfile?.years_experience?.toString() || "",
    
    // Customer-specific fields
    customer_full_name: customerProfile?.full_name || "",
    customer_phone_number: customerProfile?.phone_number || "",
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
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Update common profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          bio: formData.bio,
        })
        .eq("id", user.id);
      
      if (profileError) {
        throw profileError;
      }
      
      // Update role-specific profile
      if (selectedRole === "worker" && workerProfile) {
        const { error: workerError } = await supabase
          .from("worker_profiles")
          .update({
            full_name: formData.worker_full_name,
            phone_number: formData.worker_phone_number,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
            years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
          })
          .eq("id", user.id);
        
        if (workerError) {
          throw workerError;
        }
      } else if (selectedRole === "customer" && customerProfile) {
        const { error: customerError } = await supabase
          .from("customer_profiles")
          .update({
            full_name: formData.customer_full_name,
            phone_number: formData.customer_phone_number,
          })
          .eq("id", user.id);
        
        if (customerError) {
          throw customerError;
        }
      }
      
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Common Profile Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={profile?.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>
        </div>
        
        <div>
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
          />
        </div>
      </div>
      
      {/* Worker-specific Fields */}
      {selectedRole === "worker" && workerProfile && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium">Service Provider Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="worker_full_name">Professional Name</Label>
              <Input
                id="worker_full_name"
                name="worker_full_name"
                value={formData.worker_full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="worker_phone_number">Business Phone</Label>
              <Input
                id="worker_phone_number"
                name="worker_phone_number"
                value={formData.worker_phone_number}
                onChange={handleChange}
              />
            </div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
              <Input
                id="hourly_rate"
                name="hourly_rate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="years_experience">Years of Experience</Label>
              <Input
                id="years_experience"
                name="years_experience"
                type="number"
                min="0"
                value={formData.years_experience}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Customer-specific Fields */}
      {selectedRole === "customer" && customerProfile && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium">Customer Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_full_name">Customer Name</Label>
              <Input
                id="customer_full_name"
                name="customer_full_name"
                value={formData.customer_full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="customer_phone_number">Contact Phone</Label>
              <Input
                id="customer_phone_number"
                name="customer_phone_number"
                value={formData.customer_phone_number}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      )}
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
