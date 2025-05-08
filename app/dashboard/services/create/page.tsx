"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ServiceForm } from "@/components/dashboard/services/service-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateServicePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/sign-in");
          return;
        }
        
        setUserId(user.id);
        
        // Get user's profile with selected role
        const { data: profile } = await supabase
          .from("profiles")
          .select("selected_role")
          .eq("id", user.id)
          .single();
        
        if (!profile || profile.selected_role !== "worker") {
          toast({
            title: "Access Denied",
            description: "You need to be in worker role to create services.",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }
        
        // Check if user has a worker profile
        const { data: workerProfile } = await supabase
          .from("worker_profiles")
          .select("id")
          .eq("id", user.id)
          .single();
        
        if (!workerProfile) {
          toast({
            title: "Worker Profile Required",
            description: "You need to create a worker profile first.",
            variant: "destructive",
          });
          router.push("/dashboard/create-worker-profile");
          return;
        }
        
        // Fetch service categories
        const { data: categoriesData } = await supabase
          .from("service_categories")
          .select("*")
          .order("name");
        
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error checking user and fetching data:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserAndFetchData();
  }, [supabase, router, toast]);

  const handleCreateService = async (formData: any) => {
    try {
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      // Create service
      const { data: service, error } = await supabase
        .from("worker_services")
        .insert({
          worker_id: userId,
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          price: formData.price,
          is_hourly: formData.is_hourly,
          min_duration: formData.min_duration,
          max_duration: formData.max_duration,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Upload images if provided
      if (formData.images && formData.images.length > 0) {
        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${userId}-${service.id}-${i}-${Date.now()}.${fileExt}`;
          const filePath = `service-images/${fileName}`;
          
          // Upload file to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from("service-images")
            .upload(filePath, file);
          
          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            continue;
          }
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from("service-images")
            .getPublicUrl(filePath);
          
          const publicUrl = urlData.publicUrl;
          
          // Save image reference in database
          await supabase
            .from("service_images")
            .insert({
              service_id: service.id,
              image_url: publicUrl,
              is_primary: i === 0, // First image is primary
            });
        }
      }
      
      toast({
        title: "Service Created",
        description: "Your service has been created successfully.",
      });
      
      // Redirect to services page
      router.push("/dashboard/services");
    } catch (error) {
      console.error("Error creating service:", error);
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>
          </Button>
          <h1 className="text-2xl font-bold mt-2">Create New Service</h1>
          <p className="text-muted-foreground">
            Add a new service to your offerings
          </p>
        </div>

        <ServiceForm 
          categories={categories}
          onSubmit={handleCreateService}
          initialData={null}
        />
      </div>
    </DashboardLayout>
  );
}
