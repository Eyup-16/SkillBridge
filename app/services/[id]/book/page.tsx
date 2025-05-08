"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { BookingForm } from "@/components/dashboard/bookings/booking-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

interface BookServicePageProps {
  params: {
    id: string;
  };
}

export default function BookServicePage({ params }: BookServicePageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState<any>(null);
  
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchService = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/sign-in");
          return;
        }
        
        // Get user's profile with selected role
        const { data: profile } = await supabase
          .from("profiles")
          .select("selected_role")
          .eq("id", user.id)
          .single();
        
        if (!profile || profile.selected_role !== "customer") {
          toast({
            title: "Role Required",
            description: "You need to be in customer role to book services.",
            variant: "destructive",
          });
          router.push("/role-selection");
          return;
        }
        
        // Fetch service details
        const { data: serviceData, error: serviceError } = await supabase
          .from("worker_services")
          .select(`
            *,
            worker_profiles(*),
            service_categories(*)
          `)
          .eq("id", params.id)
          .single();
        
        if (serviceError) {
          throw serviceError;
        }
        
        // Check if service is active
        if (!serviceData.is_active) {
          toast({
            title: "Service Unavailable",
            description: "This service is currently unavailable for booking.",
            variant: "destructive",
          });
          router.push(`/services/${params.id}`);
          return;
        }
        
        setService(serviceData);
      } catch (error) {
        console.error("Error fetching service:", error);
        toast({
          title: "Error",
          description: "Failed to load service details. Please try again.",
          variant: "destructive",
        });
        router.push("/services");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchService();
  }, [params.id, router, supabase, toast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
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
            <Link href={`/services/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Service
            </Link>
          </Button>
          <h1 className="text-2xl font-bold mt-2">Book Service</h1>
          <p className="text-muted-foreground">
            Complete the form below to book this service
          </p>
        </div>

        <BookingForm serviceId={parseInt(params.id)} />
      </div>
    </DashboardLayout>
  );
}
