"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Calendar, Edit } from "lucide-react";
import Link from "next/link";
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

interface BookingActionsProps {
  booking: any;
  userRole: string | null;
  userId: string | null;
}

export function BookingActions({ booking, userRole, userId }: BookingActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsLoading(true);

      // Update booking status
      const { error } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", booking.id);

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
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setIsLoading(true);

      // Update booking status
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: cancellationReason,
          cancelled_by: userRole || "unknown",
          updated_at: new Date().toISOString()
        })
        .eq("id", booking.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Booking Cancelled",
        description: "The booking has been cancelled successfully.",
      });

      // Reset state and refresh
      setCancellationReason("");
      setOpenCancelDialog(false);
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has permission to perform actions
  const isCustomer = booking.customer_id === userId;
  const isWorker = booking.worker_services?.worker_id === userId;

  // Only show actions if user is involved in the booking
  if (!isCustomer && !isWorker) {
    return null;
  }

  // Don't show actions for completed or cancelled bookings
  if (booking.status === "completed" || booking.status === "cancelled") {
    return (
      <div className="flex items-center">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            booking.status === "completed"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Status badge */}
      <span
        className={`text-xs px-2 py-1 rounded-full ${
          booking.status === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-blue-100 text-blue-800"
        }`}
      >
        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
      </span>

      {/* Customer edit action */}
      {isCustomer && booking.status === "pending" && (
        <Button
          variant="outline"
          size="sm"
          asChild
        >
          <Link href={`/dashboard/bookings/${booking.id}/edit`}>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Link>
        </Button>
      )}

      {/* Worker actions */}
      {isWorker && (
        <>
          {booking.status === "pending" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusChange("confirmed")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Confirm
            </Button>
          )}

          {booking.status === "confirmed" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => handleStatusChange("completed")}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Mark as Completed
            </Button>
          )}
        </>
      )}

      {/* Cancel action (available to both worker and customer) */}
      {(booking.status === "pending" || booking.status === "confirmed") && (
        <AlertDialog open={openCancelDialog} onOpenChange={setOpenCancelDialog}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
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
                onClick={handleCancelBooking}
                disabled={isLoading}
              >
                {isLoading ? "Cancelling..." : "Confirm Cancel"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Add to Calendar option */}
      {booking.status !== "cancelled" && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Calendar className="h-3 w-3 mr-1" />
              Add to Calendar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add to Calendar</DialogTitle>
              <DialogDescription>
                Choose your preferred calendar application
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Generate Google Calendar URL
                  const startDate = new Date(booking.booking_date);
                  const startTime = booking.start_time.split(":");
                  startDate.setHours(parseInt(startTime[0]), parseInt(startTime[1]));

                  let endDate = new Date(startDate);
                  if (booking.end_time) {
                    const endTime = booking.end_time.split(":");
                    endDate.setHours(parseInt(endTime[0]), parseInt(endTime[1]));
                  } else {
                    // Default to 1 hour if no end time
                    endDate.setHours(endDate.getHours() + 1);
                  }

                  const title = encodeURIComponent(booking.worker_services?.title || "Booking");
                  const details = encodeURIComponent(
                    `Booking ID: ${booking.id}\nService: ${booking.worker_services?.title || "N/A"}\nNotes: ${booking.notes || "None"}`
                  );

                  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate.toISOString().replace(/[-:]/g, "").replace(/\.\d+/g, "").replace("Z", "")}/${endDate.toISOString().replace(/[-:]/g, "").replace(/\.\d+/g, "").replace("Z", "")}&details=${details}`;

                  window.open(googleUrl, "_blank");
                }}
              >
                Google Calendar
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // Generate iCal file
                  const startDate = new Date(booking.booking_date);
                  const startTime = booking.start_time.split(":");
                  startDate.setHours(parseInt(startTime[0]), parseInt(startTime[1]));

                  let endDate = new Date(startDate);
                  if (booking.end_time) {
                    const endTime = booking.end_time.split(":");
                    endDate.setHours(parseInt(endTime[0]), parseInt(endTime[1]));
                  } else {
                    // Default to 1 hour if no end time
                    endDate.setHours(endDate.getHours() + 1);
                  }

                  const title = booking.worker_services?.title || "Booking";
                  const description = `Booking ID: ${booking.id}\nService: ${booking.worker_services?.title || "N/A"}\nNotes: ${booking.notes || "None"}`;

                  // Create iCal content
                  const icalContent = [
                    "BEGIN:VCALENDAR",
                    "VERSION:2.0",
                    "BEGIN:VEVENT",
                    `SUMMARY:${title}`,
                    `DESCRIPTION:${description}`,
                    `DTSTART:${startDate.toISOString().replace(/[-:]/g, "").replace(/\.\d+/g, "")}`,
                    `DTEND:${endDate.toISOString().replace(/[-:]/g, "").replace(/\.\d+/g, "")}`,
                    "END:VEVENT",
                    "END:VCALENDAR"
                  ].join("\n");

                  // Create download link
                  const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `booking-${booking.id}.ics`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Apple Calendar (iCal)
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {}}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
