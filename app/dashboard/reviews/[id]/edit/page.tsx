"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ReviewForm } from "@/components/dashboard/reviews/review-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EditReviewPageProps {
  params: {
    id: string;
  };
}

export default function EditReviewPage({ params }: EditReviewPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [review, setReview] = useState<any>(null);
  
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchReview = async () => {
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
            title: "Access Denied",
            description: "Only customers can edit reviews.",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }
        
        // Fetch review details
        const { data: reviewData, error: reviewError } = await supabase
          .from("reviews")
          .select(`
            *,
            bookings(
              id,
              service_id,
              booking_date,
              customer_id,
              worker_services(
                id,
                title,
                worker_id,
                worker_profiles(
                  id,
                  full_name,
                  avatar_url
                )
              )
            )
          `)
          .eq("id", params.id)
          .single();
        
        if (reviewError) {
          throw reviewError;
        }
        
        // Check if user has permission to edit this review
        if (reviewData.bookings.customer_id !== user.id) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this review.",
            variant: "destructive",
          });
          router.push("/dashboard/reviews");
          return;
        }
        
        setReview(reviewData);
      } catch (error) {
        console.error("Error fetching review:", error);
        toast({
          title: "Error",
          description: "Failed to load review details. Please try again.",
          variant: "destructive",
        });
        router.push("/dashboard/reviews");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReview();
  }, [params.id, router, supabase, toast]);

  const handleReviewSubmitted = () => {
    toast({
      title: "Review Updated",
      description: "Your review has been updated successfully.",
    });
    router.push("/dashboard/reviews");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!review) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Review not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/reviews">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reviews
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
            <Link href="/dashboard/reviews">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Reviews
            </Link>
          </Button>
          <h1 className="text-2xl font-bold mt-2">Edit Review</h1>
          <p className="text-muted-foreground">
            Update your review for {review.bookings?.worker_services?.title || "this service"}
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <ReviewForm 
            bookingId={review.booking_id}
            initialData={{
              rating: review.rating,
              comment: review.comment || "",
            }}
            isEdit={true}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
