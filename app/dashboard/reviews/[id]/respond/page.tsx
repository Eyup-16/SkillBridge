"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { ReviewResponse } from "@/components/dashboard/reviews/review-response";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Star } from "lucide-react";
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
import { Rating } from "@/components/ui/rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface RespondToReviewPageProps {
  params: {
    id: string;
  };
}

export default function RespondToReviewPage({ params }: RespondToReviewPageProps) {
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
        
        if (!profile || profile.selected_role !== "worker") {
          toast({
            title: "Access Denied",
            description: "Only workers can respond to reviews.",
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
                worker_id
              )
            ),
            profiles(
              id,
              full_name,
              avatar_url
            )
          `)
          .eq("id", params.id)
          .single();
        
        if (reviewError) {
          throw reviewError;
        }
        
        // Check if user has permission to respond to this review
        if (reviewData.bookings.worker_services.worker_id !== user.id) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to respond to this review.",
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

  const handleResponseSubmitted = () => {
    toast({
      title: "Response Submitted",
      description: "Your response has been submitted successfully.",
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
          <h1 className="text-2xl font-bold mt-2">Respond to Review</h1>
          <p className="text-muted-foreground">
            Provide a thoughtful response to your customer's feedback
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={review.profiles?.avatar_url || ""}
                    alt={review.profiles?.full_name || "Customer"}
                  />
                  <AvatarFallback>
                    {review.profiles?.full_name?.charAt(0) || "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {review.profiles?.full_name || "Anonymous Customer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Rating value={review.rating} readOnly size="sm" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant="outline">
              {review.bookings?.worker_services?.title || "Service"}
            </Badge>
            <p>{review.comment || "No comment provided."}</p>
            
            <div className="border-t pt-4">
              <ReviewResponse 
                review={review} 
                onResponseSubmitted={handleResponseSubmitted}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
