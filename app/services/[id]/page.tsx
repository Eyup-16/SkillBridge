"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Star,
  Heart,
  Share,
  MessageSquare,
  Bookmark,
  BookOpen
} from "lucide-react";
import { Rating } from "@/components/ui/rating";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ServiceDetailPageProps {
  params: {
    id: string;
  };
}

export default function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch service details
        const { data: serviceData, error: serviceError } = await supabase
          .from("worker_services")
          .select(`
            *,
            service_categories(*),
            worker_profiles(*),
            service_images(*)
          `)
          .eq("id", params.id)
          .single();

        if (serviceError) {
          throw serviceError;
        }

        setService(serviceData);

        // Fetch reviews for this service
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select(`
            *,
            bookings(service_id, customer_id),
            profiles(full_name, avatar_url)
          `)
          .eq("bookings.service_id", params.id)
          .order("created_at", { ascending: false })
          .limit(5);

        setReviews(reviewsData || []);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Get user's profile with selected role
          const { data: profile } = await supabase
            .from("profiles")
            .select("selected_role")
            .eq("id", user.id)
            .single();

          setUserRole(profile?.selected_role || null);

          // Check if service is saved
          const { data: savedService } = await supabase
            .from("saved_services")
            .select("id")
            .eq("user_id", user.id)
            .eq("service_id", params.id)
            .single();

          setIsSaved(!!savedService);
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
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

    fetchServiceDetails();
  }, [params.id, router, supabase, toast]);

  const handleToggleSave = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      if (isSaved) {
        // Remove from saved services
        const { error } = await supabase
          .from("saved_services")
          .delete()
          .eq("user_id", user.id)
          .eq("service_id", params.id);

        if (error) throw error;

        setIsSaved(false);
        toast({
          title: "Service Removed",
          description: "Service removed from your saved list.",
        });
      } else {
        // Add to saved services
        const { error } = await supabase
          .from("saved_services")
          .insert({
            user_id: user.id,
            service_id: params.id,
          });

        if (error) throw error;

        setIsSaved(true);
        toast({
          title: "Service Saved",
          description: "Service added to your saved list.",
        });
      }
    } catch (error) {
      console.error("Error toggling save status:", error);
      toast({
        title: "Error",
        description: "Failed to update saved status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Service not found.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/services">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Sort images to get primary image first
  const sortedImages = [...(service.service_images || [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return 0;
  });

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/services">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Service images and details */}
        <div className="md:col-span-2 space-y-6">
          {/* Service images carousel */}
          <div className="bg-muted rounded-lg overflow-hidden">
            {sortedImages.length > 0 ? (
              <Carousel className="w-full">
                <CarouselContent>
                  {sortedImages.map((image: any, index: number) => (
                    <CarouselItem key={index}>
                      <div className="h-[300px] md:h-[400px] relative">
                        <img
                          src={image.image_url}
                          alt={`${service.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            ) : (
              <div className="h-[300px] md:h-[400px] flex items-center justify-center bg-primary/10">
                <span className="text-primary/60 text-4xl font-bold">
                  {service.title.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Service details */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                {service.service_categories?.name}
              </Badge>
              {!service.is_active && (
                <Badge variant="destructive">Unavailable</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-4">{service.title}</h1>

            <div className="flex items-center gap-4 mb-6 text-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>
                  {service.worker_profiles?.city || "Location not specified"}
                  {service.worker_profiles?.country && `, ${service.worker_profiles.country}`}
                </span>
              </div>

              {service.avg_rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>{service.avg_rating.toFixed(1)} ({service.total_reviews || 0} reviews)</span>
                </div>
              )}
            </div>

            <div className="prose max-w-none mb-8">
              <p className="whitespace-pre-wrap">{service.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-semibold">Pricing</h3>
                </div>
                <p className="text-2xl font-bold">
                  ${service.price}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {service.is_hourly ? "per hour" : "fixed price"}
                  </span>
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-semibold">Duration</h3>
                </div>
                <p>
                  {service.min_duration && service.max_duration ? (
                    <>
                      {service.min_duration} - {service.max_duration} hours
                    </>
                  ) : service.min_duration ? (
                    <>Minimum {service.min_duration} hours</>
                  ) : service.max_duration ? (
                    <>Up to {service.max_duration} hours</>
                  ) : (
                    "Duration not specified"
                  )}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {service.is_active && userRole === "customer" && (
                <Button asChild size="lg">
                  <Link href={`/services/${params.id}/book`}>
                    <BookOpen className="mr-2 h-5 w-5" />
                    Book Now
                  </Link>
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={handleToggleSave}
              >
                {isSaved ? (
                  <>
                    <Bookmark className="mr-2 h-5 w-5 fill-primary" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-2 h-5 w-5" />
                    Save
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
              >
                <Link href={`/workers/${service.worker_id}`}>
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Contact Provider
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Provider info and reviews */}
        <div className="space-y-6">
          {/* Provider card */}
          <Card>
            <CardHeader>
              <CardTitle>Service Provider</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={service.worker_profiles?.avatar_url || ""}
                    alt={service.worker_profiles?.full_name || "Provider"}
                  />
                  <AvatarFallback className="text-lg">
                    {service.worker_profiles?.full_name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {service.worker_profiles?.full_name || "Anonymous Provider"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.worker_profiles?.bio?.substring(0, 60) || "No bio available"}
                    {service.worker_profiles?.bio?.length > 60 ? "..." : ""}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/workers/${service.worker_id}`}>
                  View Full Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Reviews section */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                {reviews.length > 0
                  ? `${reviews.length} recent reviews`
                  : "No reviews yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={review.profiles?.avatar_url || ""}
                            alt={review.profiles?.full_name || "User"}
                          />
                          <AvatarFallback>
                            {review.profiles?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {review.profiles?.full_name || "Anonymous User"}
                          </p>
                          <div className="flex items-center">
                            <Rating value={review.rating} readOnly size="sm" />
                            <span className="text-xs text-muted-foreground ml-2">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm">{review.comment}</p>

                      {/* Show worker response if available */}
                      {review.worker_response && (
                        <div className="mt-2 pl-4 border-l-2 border-primary/20">
                          <p className="font-medium text-xs">Provider Response:</p>
                          <p className="text-xs">{review.worker_response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    No reviews available for this service yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
