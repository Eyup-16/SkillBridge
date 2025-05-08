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

interface EditBookingPageProps {
  params: {
    id: string;
  };
}

export default function EditBookingPage({ params }: EditBookingPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchBooking = async () => {
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
            description: "You need to be in customer role to edit bookings.",
            variant: "destructive",
          });
          router.push("/role-selection");
          return;
        }
        
        // Fetch booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            *,
            worker_services(
              *,
              worker_profiles(*),
              service_categories(*)
            )
          `)
          .eq("id", params.id)
          .single();
        
        if (bookingError) {
          throw bookingError;
        }
        
        // Check if user has permission to edit this booking
        if (bookingData.customer_id !== user.id) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this booking.",
            variant: "destructive",
          });
          router.push("/dashboard/bookings");
          return;
        }
        
        // Check if booking is in editable state
        if (bookingData.status !== "pending") {
          toast({
            title: "Cannot Edit",
            description: "Only pending bookings can be edited. Please contact the service provider for changes.",
            variant: "destructive",
          });
          router.push(`/dashboard/bookings/${params.id}`);
          return;
        }
        
        setBooking(bookingData);
      } catch (error) {
        console.error("Error fetching booking:", error);
        toast({
          title: "Error",
          description: "Failed to load booking details. Please try again.",
          variant: "destructive",
        });
        router.push("/dashboard/bookings");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooking();
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
            <Link href={`/dashboard/bookings/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Booking
            </Link>
          </Button>
          <h1 className="text-2xl font-bold mt-2">Edit Booking</h1>
          <p className="text-muted-foreground">
            Update your booking details
          </p>
        </div>

        <BookingForm 
          bookingId={parseInt(params.id)} 
          initialData={booking} 
          isEdit={true} 
        />
      </div>
    </DashboardLayout>
  );
}
