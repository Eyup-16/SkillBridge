"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { BookingActions } from "@/components/dashboard/bookings/booking-actions";
import { ReviewForm } from "@/components/dashboard/reviews/review-form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Clock, User, MapPin, DollarSign, ArrowLeft, Star } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Rating } from "@/components/ui/rating";

interface BookingDetailPageProps {
  params: {
    id: string;
  };
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [review, setReview] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  // Removed reviewData and isSubmittingReview states as they're now handled by the ReviewForm component

  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchBookingDetails = async () => {
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

        if (!profile) {
          router.push("/role-selection");
          return;
        }

        setUserRole(profile.selected_role);

        // Fetch booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from("bookings")
          .select(`
            *,
            worker_services(
              *,
              worker_profiles(*),
              service_categories(*)
            ),
            customer_profiles(*)
          `)
          .eq("id", params.id)
          .single();

        if (bookingError) {
          throw bookingError;
        }

        // Check if user has permission to view this booking
        const isCustomer = bookingData.customer_id === user.id;
        const isWorker = bookingData.worker_services?.worker_id === user.id;

        if (!isCustomer && !isWorker) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to view this booking.",
            variant: "destructive",
          });
          router.push("/dashboard/bookings");
          return;
        }

        setBooking(bookingData);

        // Check if there's a review for this booking
        if (bookingData.status === "completed") {
          const { data: reviewData } = await supabase
            .from("reviews")
            .select("*")
            .eq("booking_id", params.id)
            .single();

          setReview(reviewData || null);
          setShowReviewForm(!reviewData && isCustomer);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
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

    fetchBookingDetails();
  }, [supabase, params.id, router, toast]);

  // Review submission is now handled by the ReviewForm component

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Booking not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/bookings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/bookings">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Bookings
              </Link>
            </Button>
            <h1 className="text-2xl font-bold mt-2">Booking Details</h1>
          </div>

          <BookingActions
            booking={booking}
            userRole={userRole}
            userId={userId}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main booking info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>{booking.worker_services?.title}</CardTitle>
              <CardDescription>
                {booking.worker_services?.service_categories?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Date: {new Date(booking.booking_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    Time: {booking.start_time}
                    {booking.end_time && ` - ${booking.end_time}`}
                  </span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    Price: ${booking.price || booking.worker_services?.price || "N/A"}
                    {booking.worker_services?.is_hourly && "/hr"}
                  </span>
                </div>
              </div>

              {booking.notes && (
                <div className="p-4 bg-muted/50 rounded-md">
                  <p className="font-medium mb-1">Notes:</p>
                  <p>{booking.notes}</p>
                </div>
              )}

              {booking.cancellation_reason && (
                <div className="p-4 bg-red-50 rounded-md">
                  <p className="font-medium mb-1">Cancellation Reason:</p>
                  <p>{booking.cancellation_reason}</p>
                  {booking.cancelled_by && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      Cancelled by: {booking.cancelled_by}
                    </p>
                  )}
                </div>
              )}

              {/* Review section */}
              {review && (
                <div className="p-4 bg-primary/5 rounded-md">
                  <div className="flex items-center mb-2">
                    <p className="font-medium">Review:</p>
                    <div className="ml-2">
                      <Rating value={review.rating} readOnly size="sm" />
                    </div>
                  </div>
                  <p>{review.comment}</p>
                  {review.worker_response && (
                    <div className="mt-2 pl-4 border-l-2 border-primary/20">
                      <p className="font-medium text-sm">Response:</p>
                      <p className="text-sm">{review.worker_response}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Review form */}
              {showReviewForm && (
                <ReviewForm
                  bookingId={parseInt(params.id)}
                  onReviewSubmitted={() => window.location.reload()}
                />
              )}
            </CardContent>
          </Card>

          {/* Service provider/customer info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {userRole === "customer" ? "Service Provider" : "Customer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userRole === "customer" ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {booking.worker_services?.worker_profiles?.avatar_url ? (
                        <img
                          src={booking.worker_services.worker_profiles.avatar_url}
                          alt="Provider"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-primary/70" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {booking.worker_services?.worker_profiles?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.worker_services?.worker_profiles?.years_experience
                          ? `${booking.worker_services.worker_profiles.years_experience} years experience`
                          : "Service Provider"}
                      </p>
                    </div>
                  </div>

                  {booking.worker_services?.worker_profiles?.city && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {booking.worker_services.worker_profiles.city},
                        {booking.worker_services.worker_profiles.country}
                      </span>
                    </div>
                  )}

                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/workers/${booking.worker_services?.worker_id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary/70" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {booking.customer_profiles?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customer
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
