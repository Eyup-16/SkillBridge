"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBooking, updateBooking } from "@/app/actions/booking";

interface BookingFormProps {
  serviceId?: number;
  bookingId?: number;
  initialData?: any;
  isEdit?: boolean;
}

export function BookingForm({ serviceId, bookingId, initialData, isEdit = false }: BookingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [service, setService] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    bookingDate: initialData?.booking_date || "",
    startTime: initialData?.start_time || "",
    endTime: initialData?.end_time || "",
    notes: initialData?.notes || "",
    addressId: initialData?.address_id?.toString() || "",
    price: initialData?.price?.toString() || "",
  });
  
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
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
        
        if (!profile || profile.selected_role !== "customer") {
          toast({
            title: "Role Required",
            description: "You need to be in customer role to book services.",
            variant: "destructive",
          });
          router.push("/role-selection");
          return;
        }
        
        // Fetch service details if serviceId is provided
        if (serviceId) {
          const { data: serviceData, error: serviceError } = await supabase
            .from("worker_services")
            .select(`
              *,
              worker_profiles(*),
              service_categories(*)
            `)
            .eq("id", serviceId)
            .single();
          
          if (serviceError) {
            throw serviceError;
          }
          
          setService(serviceData);
          
          // Set default price if available
          if (serviceData.price && !formData.price) {
            setFormData(prev => ({
              ...prev,
              price: serviceData.price.toString()
            }));
          }
        }
        
        // Fetch booking details if bookingId is provided
        if (bookingId && isEdit) {
          const { data: bookingData, error: bookingError } = await supabase
            .from("bookings")
            .select(`
              *,
              worker_services(
                *,
                worker_profiles(*),
                service_categories(*)
              )
            `)
            .eq("id", bookingId)
            .single();
          
          if (bookingError) {
            throw bookingError;
          }
          
          // Check if user has permission to edit this booking
          if (bookingData.customer_id !== user.id) {
            toast({
              title: "Access Denied",
              description: "You don't have permission to edit this booking.",
              variant: "destructive",
            });
            router.push("/dashboard/bookings");
            return;
          }
          
          // Check if booking is in editable state
          if (bookingData.status !== "pending") {
            toast({
              title: "Cannot Edit",
              description: "Only pending bookings can be edited. Please contact the service provider for changes.",
              variant: "destructive",
            });
            router.push(`/dashboard/bookings/${bookingId}`);
            return;
          }
          
          setService(bookingData.worker_services);
          
          setFormData({
            bookingDate: bookingData.booking_date,
            startTime: bookingData.start_time,
            endTime: bookingData.end_time || "",
            notes: bookingData.notes || "",
            addressId: bookingData.address_id?.toString() || "",
            price: bookingData.price?.toString() || "",
          });
        }
        
        // Fetch customer addresses
        const { data: addressesData } = await supabase
          .from("customer_addresses")
          .select("*")
          .eq("customer_id", user.id)
          .order("is_default", { ascending: false });
        
        setAddresses(addressesData || []);
        
        // Set default address if available and not already set
        if (addressesData && addressesData.length > 0 && !formData.addressId) {
          const defaultAddress = addressesData.find(addr => addr.is_default) || addressesData[0];
          setFormData(prev => ({
            ...prev,
            addressId: defaultAddress.id.toString()
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [serviceId, bookingId, isEdit, router, supabase, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Validate form data
      if (!formData.bookingDate || !formData.startTime) {
        toast({
          title: "Validation Error",
          description: "Date and start time are required",
          variant: "destructive",
        });
        return;
      }
      
      const formDataObj = new FormData();
      
      if (isEdit && bookingId) {
        // Update existing booking
        formDataObj.append("bookingId", bookingId.toString());
        formDataObj.append("bookingDate", formData.bookingDate);
        formDataObj.append("startTime", formData.startTime);
        formDataObj.append("endTime", formData.endTime);
        formDataObj.append("notes", formData.notes);
        formDataObj.append("addressId", formData.addressId);
        
        const result = await updateBooking(formDataObj);
        
        if (result.success) {
          toast({
            title: "Booking Updated",
            description: "Your booking has been updated successfully.",
          });
          
          router.push(`/dashboard/bookings/${bookingId}`);
        } else {
          throw new Error(result.error || "Failed to update booking");
        }
      } else {
        // Create new booking
        formDataObj.append("serviceId", serviceId?.toString() || "");
        formDataObj.append("bookingDate", formData.bookingDate);
        formDataObj.append("startTime", formData.startTime);
        formDataObj.append("endTime", formData.endTime);
        formDataObj.append("notes", formData.notes);
        formDataObj.append("addressId", formData.addressId);
        formDataObj.append("price", formData.price);
        
        const result = await createBooking(formDataObj);
        
        if (result.success) {
          toast({
            title: "Booking Created",
            description: "Your booking has been created successfully.",
          });
          
          router.push(`/dashboard/bookings/${result.bookingId}`);
        } else {
          throw new Error(result.error || "Failed to create booking");
        }
      }
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Booking" : "Book Service"}</CardTitle>
        <CardDescription>
          {isEdit 
            ? "Update your booking details" 
            : service?.title 
              ? `Book "${service.title}" service` 
              : "Complete your booking details"
          }
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Service details summary */}
          {service && (
            <div className="bg-muted/40 p-4 rounded-lg mb-4">
              <h3 className="font-medium mb-2">{service.title}</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Provider: {service.worker_profiles?.full_name}</p>
                <p>Category: {service.service_categories?.name}</p>
                <p>Price: ${service.price}{service.is_hourly ? "/hour" : ""}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookingDate">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="bookingDate"
                  name="bookingDate"
                  type="date"
                  value={formData.bookingDate}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time (Optional)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressId">Service Location</Label>
              <Select
                value={formData.addressId}
                onValueChange={(value) => handleSelectChange("addressId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an address" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.length > 0 ? (
                    addresses.map((address) => (
                      <SelectItem key={address.id} value={address.id.toString()}>
                        {address.address_line1}, {address.city}
                        {address.is_default && " (Default)"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No addresses found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions (Optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any special requirements or instructions for the service provider..."
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Updating..." : "Booking..."}
              </>
            ) : (
              isEdit ? "Update Booking" : "Confirm Booking"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
