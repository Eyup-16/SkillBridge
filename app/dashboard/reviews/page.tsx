"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ReviewResponse } from "@/components/dashboard/reviews/review-response";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Star, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ReviewsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchReviews = async () => {
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

        if (!profile) {
          router.push("/role-selection");
          return;
        }

        setSelectedRole(profile.selected_role);

        if (profile.selected_role === "worker") {
          // Fetch reviews for worker's services
          const { data: reviewsData, error } = await supabase
            .from("reviews")
            .select(`
              *,
              bookings!inner(
                id,
                service_id,
                booking_date,
                customer_id,
                worker_services!inner(
                  id,
                  title,
                  worker_id
                )
              ),
              profiles!inner(
                id,
                full_name,
                avatar_url
              )
            `)
            .eq("bookings.worker_services.worker_id", user.id)
            .order("created_at", { ascending: false });

          if (error) {
            throw error;
          }

          setReviews(reviewsData || []);
          setFilteredReviews(reviewsData || []);
        } else if (profile.selected_role === "customer") {
          // Fetch reviews created by the customer
          const { data: reviewsData, error } = await supabase
            .from("reviews")
            .select(`
              *,
              bookings!inner(
                id,
                service_id,
                booking_date,
                customer_id,
                worker_services!inner(
                  id,
                  title,
                  worker_id,
                  worker_profiles!inner(
                    id,
                    full_name,
                    avatar_url
                  )
                )
              )
            `)
            .eq("bookings.customer_id", user.id)
            .order("created_at", { ascending: false });

          if (error) {
            throw error;
          }

          setReviews(reviewsData || []);
          setFilteredReviews(reviewsData || []);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        toast({
          title: "Error",
          description: "Failed to load reviews. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [supabase, router, toast]);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...reviews];

    // Apply rating filter
    if (filterRating !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(filterRating)
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.comment?.toLowerCase().includes(query) ||
          review.bookings?.worker_services?.title.toLowerCase().includes(query) ||
          (selectedRole === "worker" &&
            review.profiles?.full_name.toLowerCase().includes(query)) ||
          (selectedRole === "customer" &&
            review.bookings?.worker_services?.worker_profiles?.full_name.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredReviews(filtered);
  }, [reviews, searchQuery, filterRating, sortOrder, selectedRole]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoading) {
    return <DashboardLoading title="Loading reviews..." />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Reviews"
        description={
          selectedRole === "worker"
            ? "Manage and respond to reviews from your customers"
            : "View and manage your reviews for services"
        }
      />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search reviews..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        <div className="flex gap-2">
          <Select
            value={filterRating}
            onValueChange={setFilterRating}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            title={`Sort by date ${sortOrder === "asc" ? "newest first" : "oldest first"}`}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh"
          >
            <Loader2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {selectedRole === "worker" ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={review.bookings?.worker_services?.worker_profiles?.avatar_url || ""}
                            alt={review.bookings?.worker_services?.worker_profiles?.full_name || "Provider"}
                          />
                          <AvatarFallback>
                            {review.bookings?.worker_services?.worker_profiles?.full_name?.charAt(0) || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {review.bookings?.worker_services?.worker_profiles?.full_name || "Service Provider"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < review.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <Badge variant="outline" className="mb-2">
                    {review.bookings?.worker_services?.title || "Service"}
                  </Badge>
                  <p className="text-sm mt-2">{review.comment || "No comment provided."}</p>
                </div>

                {/* Worker response section */}
                {selectedRole === "worker" && (
                  <ReviewResponse
                    review={review}
                    onResponseSubmitted={handleRefresh}
                  />
                )}

                {/* Show worker response to customer */}
                {selectedRole === "customer" && review.worker_response && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium text-sm mb-2">Provider Response:</h4>
                    <p className="text-sm">{review.worker_response}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Responded on {new Date(review.worker_response_at || "").toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No reviews found</h3>
            <p className="text-muted-foreground mb-6">
              {selectedRole === "worker"
                ? "You haven't received any reviews yet."
                : "You haven't left any reviews yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
