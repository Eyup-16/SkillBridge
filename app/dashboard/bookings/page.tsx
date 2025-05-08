"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { BookingList } from "@/components/dashboard/bookings/booking-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";

export default function BookingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        // Get user's profile with selected role
        const { data: profile } = await supabase
          .from("profiles")
          .select("selected_role")
          .eq("id", user.id)
          .single();

        if (!profile) {
          return;
        }

        setSelectedRole(profile.selected_role);

        let bookingsData = [];

        // Fetch bookings based on role
        if (profile.selected_role === "customer") {
          // Fetch customer bookings
          const { data, error } = await supabase
            .from("bookings")
            .select(`
              *,
              worker_services(
                id,
                title,
                price,
                is_hourly,
                worker_id,
                worker_profiles(
                  id,
                  full_name,
                  avatar_url
                )
              )
            `)
            .eq("customer_id", user.id)
            .order("booking_date", { ascending: false });

          if (error) {
            throw error;
          }

          bookingsData = data || [];
        } else if (profile.selected_role === "worker") {
          // Fetch worker bookings (service requests)
          const { data, error } = await supabase
            .from("bookings")
            .select(`
              *,
              worker_services!inner(
                id,
                title,
                price,
                is_hourly,
                worker_id
              ),
              customer_profiles(
                id,
                full_name,
                avatar_url: profiles(avatar_url)
              )
            `)
            .eq("worker_services.worker_id", user.id)
            .order("booking_date", { ascending: false });

          if (error) {
            throw error;
          }

          bookingsData = data || [];
        }

        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({
          title: "Error",
          description: "Failed to load bookings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [supabase, toast]);

  // Filter bookings when tab or search query changes
  useEffect(() => {
    let filtered = [...bookings];

    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter((booking) => booking.status === activeTab);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((booking) => {
        const serviceTitle = booking.worker_services?.title?.toLowerCase() || "";
        const workerName = booking.worker_services?.worker_profiles?.full_name?.toLowerCase() || "";
        const customerName = booking.customer_profiles?.full_name?.toLowerCase() || "";
        const bookingDate = new Date(booking.booking_date).toLocaleDateString();

        return (
          serviceTitle.includes(query) ||
          workerName.includes(query) ||
          customerName.includes(query) ||
          bookingDate.includes(query)
        );
      });
    }

    setFilteredBookings(filtered);
  }, [activeTab, searchQuery, bookings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  if (isLoading) {
    return <DashboardLoading title="Loading bookings..." />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="My Bookings"
        description="Manage your bookings and service requests"
      />

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bookings..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Tabs for filtering by status */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <BookingList bookings={filteredBookings} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <BookingList bookings={filteredBookings} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="confirmed" className="mt-6">
          <BookingList bookings={filteredBookings} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <BookingList bookings={filteredBookings} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <BookingList bookings={filteredBookings} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
