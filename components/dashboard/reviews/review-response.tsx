"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReviewResponseProps {
  review: {
    id: number;
    booking_id: number;
    rating: number;
    comment: string | null;
    worker_response: string | null;
    worker_response_at: string | null;
  };
  onResponseSubmitted: () => void;
}

export function ReviewResponse({ review, onResponseSubmitted }: ReviewResponseProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState(review.worker_response || "");
  const [isEditing, setIsEditing] = useState(!review.worker_response);
  
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      toast({
        title: "Response Required",
        description: "Please enter a response to the review.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("reviews")
        .update({
          worker_response: response,
          worker_response_at: new Date().toISOString(),
        })
        .eq("id", review.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Response Submitted",
        description: "Your response has been submitted successfully.",
      });
      
      setIsEditing(false);
      onResponseSubmitted();
    } catch (error) {
      console.error("Error submitting response:", error);
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResponse = () => {
    setIsEditing(true);
  };

  if (review.worker_response && !isEditing) {
    return (
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">Your Response</h4>
          <Button variant="ghost" size="sm" onClick={handleEditResponse}>
            Edit Response
          </Button>
        </div>
        <p className="text-sm">{review.worker_response}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Responded on {new Date(review.worker_response_at || "").toLocaleDateString()}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-medium text-sm mb-2">
        {review.worker_response ? "Edit Your Response" : "Respond to Review"}
      </h4>
      <Textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write your response to this review..."
        rows={3}
        className="mb-2"
      />
      <div className="flex justify-end gap-2">
        {review.worker_response && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
        <Button size="sm" onClick={handleSubmitResponse} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <MessageSquare className="mr-2 h-3.5 w-3.5" />
              {review.worker_response ? "Update Response" : "Submit Response"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
