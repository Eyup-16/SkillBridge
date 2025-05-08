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

interface EditServicePageProps {
  params: {
    id: string;
  };
}

export default function EditServicePage({ params }: EditServicePageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchServiceAndCategories = async () => {
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
            description: "You need to be in worker role to edit services.",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }
        
        // Fetch service
        const { data: serviceData, error: serviceError } = await supabase
          .from("worker_services")
          .select(`
            *,
            service_images(*)
          `)
          .eq("id", params.id)
          .single();
        
        if (serviceError) {
          throw serviceError;
        }
        
        // Check if user owns this service
        if (serviceData.worker_id !== user.id) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this service.",
            variant: "destructive",
          });
          router.push("/dashboard/services");
          return;
        }
        
        setService(serviceData);
        
        // Fetch service categories
        const { data: categoriesData } = await supabase
          .from("service_categories")
          .select("*")
          .order("name");
        
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error fetching service and categories:", error);
        toast({
          title: "Error",
          description: "Failed to load service data. Please try again.",
          variant: "destructive",
        });
        router.push("/dashboard/services");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceAndCategories();
  }, [supabase, params.id, router, toast]);

  const handleUpdateService = async (formData: any) => {
    try {
      if (!userId || !service) {
        throw new Error("User not authenticated or service not found");
      }
      
      // Update service
      const { error } = await supabase
        .from("worker_services")
        .update({
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          price: formData.price,
          is_hourly: formData.is_hourly,
          min_duration: formData.min_duration,
          max_duration: formData.max_duration,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service.id);
      
      if (error) {
        throw error;
      }
      
      // Handle existing images
      const existingImageIds = formData.existingImages.map((img: any) => img.id);
      
      // Delete removed images
      const imagesToDelete = service.service_images.filter(
        (img: any) => !existingImageIds.includes(img.id)
      );
      
      for (const image of imagesToDelete) {
        await supabase
          .from("service_images")
          .delete()
          .eq("id", image.id);
      }
      
      // Update primary image status
      if (formData.existingImages.length > 0) {
        for (let i = 0; i < formData.existingImages.length; i++) {
          const image = formData.existingImages[i];
          await supabase
            .from("service_images")
            .update({ is_primary: i === 0 && formData.images.length === 0 })
            .eq("id", image.id);
        }
      }
      
      // Upload new images if provided
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
              is_primary: i === 0 && formData.existingImages.length === 0,
            });
        }
      }
      
      toast({
        title: "Service Updated",
        description: "Your service has been updated successfully.",
      });
      
      // Redirect to services page
      router.push("/dashboard/services");
    } catch (error) {
      console.error("Error updating service:", error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
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

  if (!service) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Service not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>
          </Button>
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
          <h1 className="text-2xl font-bold mt-2">Edit Service</h1>
          <p className="text-muted-foreground">
            Update your service details
          </p>
        </div>

        <ServiceForm 
          categories={categories}
          onSubmit={handleUpdateService}
          initialData={service}
        />
      </div>
    </DashboardLayout>
  );
}
