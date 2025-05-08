"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, User, Calendar, Mail, Phone, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ClientsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [filteredClients, setFilteredClients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchClients = async () => {
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

        if (!profile || profile.selected_role !== "worker") {
          toast({
            title: "Access Denied",
            description: "You need to be in worker role to access this page.",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }

        // Fetch unique clients who have booked the worker's services
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            id,
            customer_id,
            status,
            booking_date,
            worker_services!inner(
              worker_id
            )
          `)
          .eq("worker_services.worker_id", user.id);

        if (bookingsError) {
          throw bookingsError;
        }

        // Extract unique customer IDs
        const uniqueCustomerIds = [...new Set(bookings.map(booking => booking.customer_id))];

        if (uniqueCustomerIds.length === 0) {
          setClients([]);
          setFilteredClients([]);
          setIsLoading(false);
          return;
        }

        // Fetch client profiles
        const { data: clientProfiles, error: clientsError } = await supabase
          .from("customer_profiles")
          .select(`
            id,
            full_name,
            phone_number,
            total_bookings,
            total_spent,
            profiles(
              email,
              avatar_url
            )
          `)
          .in("id", uniqueCustomerIds);

        if (clientsError) {
          throw clientsError;
        }

        // For each client, get their most recent booking with this worker
        const clientsWithBookingInfo = await Promise.all(
          (clientProfiles || []).map(async (client) => {
            // Get client's bookings with this worker
            const clientBookings = bookings.filter(b => b.customer_id === client.id);

            // Sort by date (most recent first)
            clientBookings.sort((a, b) =>
              new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
            );

            // Count completed bookings
            const completedBookings = clientBookings.filter(b => b.status === "completed").length;

            return {
              email: client.profiles?.[0]?.email,
              avatar_url: client.profiles?.[0]?.avatar_url,
              last_booking_date: clientBookings[0]?.booking_date,
              completed_bookings: completedBookings,
              total_bookings_with_worker: clientBookings.length,
            }
          })
        );

        setClients(clientsWithBookingInfo);
        setFilteredClients(clientsWithBookingInfo);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Error",
          description: "Failed to load client data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [supabase, router, toast]);

  // Filter clients when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredClients(clients);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = clients.filter((client) => {
      const fullName = client.full_name?.toLowerCase() || "";
      const email = client.email?.toLowerCase() || "";
      const phone = client.phone_number?.toLowerCase() || "";

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phone.includes(query)
      );
    });

    setFilteredClients(filtered);
  }, [searchQuery, clients]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <DashboardLoading title="Loading clients..." />;
  }

  return (
      <div className="space-y-6">
        <DashboardHeader
          title="My Clients"
          description="Manage your client relationships"
        />

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients by name, email, or phone..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Clients List */}
        {filteredClients.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <h3 className="font-medium mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-6">
              You don't have any clients yet. They'll appear here once someone books your services.
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Booking</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {client.avatar_url ? (
                              <img
                                src={client.avatar_url}
                                alt={client.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5 text-primary/70" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{client.full_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span>{client.email || "N/A"}</span>
                          </div>
                          {client.phone_number && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                              <span>{client.phone_number}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>{formatDate(client.last_booking_date)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{client.total_bookings_with_worker} total</p>
                          <p className="text-xs text-muted-foreground">{client.completed_bookings} completed</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/bookings?client=${client.id}`}>
                            View Bookings
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
