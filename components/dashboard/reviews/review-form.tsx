"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ReviewFormProps {
  bookingId: number;
  onReviewSubmitted: () => void;
  initialData?: {
    rating: number;
    comment: string;
  };
  isEdit?: boolean;
}

export function ReviewForm({ 
  bookingId, 
  onReviewSubmitted, 
  initialData = { rating: 5, comment: "" },
  isEdit = false
}: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: initialData.rating,
    comment: initialData.comment,
  });
  
  const supabase = createClient();
  const { toast } = useToast();

  const handleRatingChange = (value: number) => {
    setReviewData((prev) => ({ ...prev, rating: value }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewData((prev) => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (isEdit) {
        // Update existing review
        const { error } = await supabase
          .from("reviews")
          .update({
            rating: reviewData.rating,
            comment: reviewData.comment,
            updated_at: new Date().toISOString(),
          })
          .eq("booking_id", bookingId);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Review Updated",
          description: "Your review has been updated successfully.",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from("reviews")
          .insert({
            booking_id: bookingId,
            rating: reviewData.rating,
            comment: reviewData.comment,
          });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Review Submitted",
          description: "Thank you for your feedback!",
        });
      }
      
      onReviewSubmitted();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Review" : "Leave a Review"}</CardTitle>
        <CardDescription>
          {isEdit 
            ? "Update your review for this service" 
            : "Share your experience with this service"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="mb-2 block">Rating</Label>
          <Rating 
            value={reviewData.rating} 
            onChange={handleRatingChange} 
            size="lg"
          />
        </div>
        <div>
          <Label htmlFor="comment">Comment</Label>
          <Textarea
            id="comment"
            placeholder="Share your experience with this service..."
            value={reviewData.comment}
            onChange={handleCommentChange}
            rows={4}
            className="mt-1"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Submitting..."}
            </>
          ) : (
            isEdit ? "Update Review" : "Submit Review"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
