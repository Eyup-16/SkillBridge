"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { BookingList } from "@/components/dashboard/bookings/booking-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function ServiceRequestsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const fetchBookings = async () => {
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

      if (profile.selected_role !== "worker") {
        toast({
          title: "Access Denied",
          description: "You need to be in worker role to access this page.",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

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
            avatar_url
          )
        `)
        .eq("worker_services.worker_id", user.id)
        .order("booking_date", { ascending: false });

      if (error) {
        throw error;
      }

      setBookings(data || []);
      setFilteredBookings(data || []);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      toast({
        title: "Error",
        description: "Failed to load service requests. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

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
        const customerName = booking.customer_profiles?.full_name?.toLowerCase() || "";
        const bookingDate = new Date(booking.booking_date).toLocaleDateString();

        return (
          serviceTitle.includes(query) ||
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchBookings();
  };

  if (isLoading) {
    return <DashboardLoading title="Loading service requests..." />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader
          title="Service Requests"
          description="Manage booking requests for your services"
          actions={
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          }
        />

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search requests..."
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
            <TabsTrigger value="all">
              All
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {bookings.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {bookings.filter(b => b.status === "pending").length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {bookings.filter(b => b.status === "confirmed").length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {bookings.filter(b => b.status === "completed").length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled
              <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {bookings.filter(b => b.status === "cancelled").length}
              </span>
            </TabsTrigger>
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
    </DashboardLayout>
  );
}
