"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Star, Edit, Trash } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ReviewsListProps {
  reviews: any[];
  isLoading: boolean;
  userRole: string;
  userId: string;
  onEditReview?: (review: any) => void;
  onRefresh?: () => void;
}

export function ReviewsList({ 
  reviews, 
  isLoading, 
  userRole, 
  userId,
  onEditReview,
  onRefresh
}: ReviewsListProps) {
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);
  
  const supabase = createClient();
  const { toast } = useToast();

  const handleDeleteReview = async (reviewId: number) => {
    try {
      setDeletingReviewId(reviewId);
      
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted successfully.",
      });
      
      onRefresh?.();
    } catch (error) {
      console.error("Error deleting review:", error);
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium mb-2">No reviews found</h3>
        <p className="text-muted-foreground mb-6">
          {userRole === "worker"
            ? "You haven't received any reviews yet."
            : "You haven't left any reviews yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {userRole === "worker" ? (
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
                <Rating value={review.rating} readOnly size="sm" />
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
            
            {/* Worker response section for customer view */}
            {userRole === "customer" && review.worker_response && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium text-sm mb-2">Provider Response:</h4>
                <p className="text-sm">{review.worker_response}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Responded on {new Date(review.worker_response_at || "").toLocaleDateString()}
                </p>
              </div>
            )}
          </CardContent>
          
          {/* Action buttons for customer's own reviews */}
          {userRole === "customer" && review.bookings?.customer_id === userId && (
            <CardFooter className="border-t pt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditReview?.(review)}
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Review</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this review? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteReview(review.id)}
                      disabled={deletingReviewId === review.id}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deletingReviewId === review.id ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
