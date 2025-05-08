"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createBooking(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user's profile with selected role
  const { data: profile } = await supabase
    .from("profiles")
    .select("selected_role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.selected_role !== "customer") {
    // Redirect to role selection if not in customer role
    return { success: false, error: "You must be in customer role to book services" };
  }

  const serviceId = parseInt(formData.get("serviceId") as string);
  const bookingDate = formData.get("bookingDate") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string || null;
  const notes = formData.get("notes") as string || null;
  const addressId = parseInt(formData.get("addressId") as string) || null;
  const price = parseFloat(formData.get("price") as string) || null;

  if (!serviceId || !bookingDate || !startTime) {
    // Handle validation error
    return { success: false, error: "Service, date and start time are required" };
  }

  // Check if service exists and is available
  const { data: service } = await supabase
    .from("worker_services")
    .select("*")
    .eq("id", serviceId)
    .single();

  if (!service) {
    return { success: false, error: "Service not found" };
  }

  if (!service.is_active) {
    return { success: false, error: "This service is currently unavailable" };
  }

  // Create booking
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      service_id: serviceId,
      customer_id: user.id,
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      notes: notes,
      status: "pending",
      price: price,
      payment_status: "pending",
      address_id: addressId,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/bookings");
  return { success: true, bookingId: data.id };
}

export async function updateBooking(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const bookingId = parseInt(formData.get("bookingId") as string);
  const bookingDate = formData.get("bookingDate") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string || null;
  const notes = formData.get("notes") as string || null;
  const addressId = parseInt(formData.get("addressId") as string) || null;

  if (!bookingId || !bookingDate || !startTime) {
    // Handle validation error
    return { success: false, error: "Booking ID, date and start time are required" };
  }

  // Check if booking exists and belongs to the user
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  if (booking.customer_id !== user.id) {
    return { success: false, error: "You don't have permission to update this booking" };
  }

  // Only allow updates for pending bookings
  if (booking.status !== "pending") {
    return { 
      success: false, 
      error: "Only pending bookings can be updated. Please contact the service provider for changes to confirmed bookings." 
    };
  }

  // Update booking
  const { error } = await supabase
    .from("bookings")
    .update({
      booking_date: bookingDate,
      start_time: startTime,
      end_time: endTime,
      notes: notes,
      address_id: addressId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) {
    console.error("Error updating booking:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/bookings/${bookingId}`);
  return { success: true };
}

export async function cancelBooking(bookingId: number, reason: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Get user's profile with selected role
  const { data: profile } = await supabase
    .from("profiles")
    .select("selected_role")
    .eq("id", user.id)
    .single();

  // Check if booking exists
  const { data: booking } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  // Check if user has permission (either customer or worker)
  const isCustomer = booking.customer_id === user.id;
  
  // For worker, we need to check if they own the service
  let isWorker = false;
  if (profile?.selected_role === "worker") {
    const { data: service } = await supabase
      .from("worker_services")
      .select("worker_id")
      .eq("id", booking.service_id)
      .single();
    
    isWorker = service?.worker_id === user.id;
  }

  if (!isCustomer && !isWorker) {
    return { success: false, error: "You don't have permission to cancel this booking" };
  }

  // Update booking status
  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancellation_reason: reason,
      cancelled_by: profile?.selected_role || "unknown",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) {
    console.error("Error cancelling booking:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/dashboard/bookings/${bookingId}`);
  revalidatePath("/dashboard/bookings");
  return { success: true };
}
