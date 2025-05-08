"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Clock, User, MapPin, DollarSign, Check, X } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface BookingListProps {
  bookings: any[];
  isLoading: boolean;
}

export function BookingList({ bookings, isLoading }: BookingListProps) {
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [openCancelDialog, setOpenCancelDialog] = useState<number | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      setActionLoading(bookingId);

      // Update booking status
      const { error } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Booking ${newStatus} successfully.`,
      });

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error(`Error updating booking status:`, error);
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      setActionLoading(bookingId);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get user's profile with selected role
      const { data: profile } = await supabase
        .from("profiles")
        .select("selected_role")
        .eq("id", user.id)
        .single();

      // Update booking status
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: cancellationReason,
          cancelled_by: profile?.selected_role || "unknown",
          updated_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (error) {
        throw error;
      }

      toast({
        title: "Booking Cancelled",
        description: "The booking has been cancelled successfully.",
      });

      // Reset state and refresh
      setCancellationReason("");
      setOpenCancelDialog(null);
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-all">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {booking.worker_services?.title}
                  </h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {booking.start_time}
                        {booking.end_time && ` - ${booking.end_time}`}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {booking.customer_profiles?.full_name ||
                         booking.worker_services?.worker_profiles?.full_name ||
                         "Unknown"}
                      </span>
                    </div>

                    {booking.price && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        <span>
                          ${booking.price}
                          {booking.worker_services?.is_hourly && "/hr"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : booking.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>

                  {booking.payment_status && (
                    <span className="text-xs mt-1 text-muted-foreground">
                      Payment: {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {booking.notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm">
                  <p className="font-medium mb-1">Notes:</p>
                  <p>{booking.notes}</p>
                </div>
              )}

              {booking.cancellation_reason && (
                <div className="mt-4 p-3 bg-red-50 rounded-md text-sm">
                  <p className="font-medium mb-1">Cancellation Reason:</p>
                  <p>{booking.cancellation_reason}</p>
                  {booking.cancelled_by && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      Cancelled by: {booking.cancelled_by}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="border-t p-4 bg-muted/20 flex flex-wrap gap-2 justify-end">
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/bookings/${booking.id}`}>
                  View Details
                </Link>
              </Button>

              {booking.status === "pending" && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStatusChange(booking.id, "confirmed")}
                    disabled={actionLoading === booking.id}
                  >
                    {actionLoading === booking.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    Confirm
                  </Button>

                  <AlertDialog open={openCancelDialog === booking.id} onOpenChange={(open) => !open && setOpenCancelDialog(null)}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setOpenCancelDialog(booking.id)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel this booking? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Label htmlFor="cancellation-reason">Reason for cancellation</Label>
                        <Textarea
                          id="cancellation-reason"
                          placeholder="Please provide a reason for cancellation"
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Nevermind</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                        >
                          {actionLoading === booking.id ? "Cancelling..." : "Confirm Cancel"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {booking.status === "confirmed" && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStatusChange(booking.id, "completed")}
                    disabled={actionLoading === booking.id}
                  >
                    {actionLoading === booking.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    Mark as Completed
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
