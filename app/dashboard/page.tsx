"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  User,
  Calendar,
  MessageSquare,
  Wrench,
  Clock,
  ChevronRight
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isWorker, setIsWorker] = useState(false);
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);
  const [workerBookings, setWorkerBookings] = useState<any[]>([]);
  const [forumPosts, setForumPosts] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/sign-in");
          return;
        }
        
        setUser(user);
        
        // Get user's profile with selected role
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("selected_role")
          .eq("id", user.id)
          .single();
        
        if (error || !profile?.selected_role) {
          console.error("Error fetching user profile or no role selected:", error);
          router.push("/role-selection");
          return;
        }
        
        const selectedRole = profile.selected_role;
        setSelectedRole(selectedRole);
        
        // Check if user has a worker profile
        const { data: workerProfile } = await supabase
          .from("worker_profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        const isWorker = selectedRole === "worker";
        setIsWorker(isWorker);
        
        // Fetch user's bookings (as a customer)
        const { data: customerBookingsData } = await supabase
          .from("bookings")
          .select(`
            *,
            worker_services(
              id,
              title,
              worker_id,
              worker_profiles(full_name)
            )
          `)
          .eq("customer_id", user.id)
          .order("booking_date", { ascending: false })
          .limit(5);
        
        setCustomerBookings(customerBookingsData || []);
        
        // If user is a worker, fetch bookings for their services
        if (isWorker) {
          const { data: workerBookingsData } = await supabase
            .from("bookings")
            .select(`
              *,
              worker_services!inner(
                id,
                title,
                worker_id
              ),
              customer_id
            `)
            .eq("worker_services.worker_id", user.id)
            .order("booking_date", { ascending: false })
            .limit(5);
          
          setWorkerBookings(workerBookingsData || []);
        }
        
        // Fetch user's forum posts
        const { data: forumPostsData } = await supabase
          .from("forum_posts")
          .select(`
            *,
            forum_categories(name)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3);
        
        setForumPosts(forumPostsData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [supabase, router, toast]);

  if (isLoading) {
    return <DashboardLoading title="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Dashboard"
        description="Welcome to your SkillBridge dashboard"
      />

      {/* Recent Bookings (as customer) */}
      <DashboardCard
        title="My Recent Bookings"
        icon={Calendar}
        footer={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/bookings">View All</Link>
          </Button>
        }
      >
        {customerBookings.length > 0 ? (
          <div className="space-y-4">
            {customerBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">
                    {booking.worker_services?.title}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {new Date(booking.booking_date).toLocaleDateString()},{" "}
                      {booking.start_time}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <User className="h-3 w-3 mr-1" />
                    <span>
                      {booking.worker_services?.worker_profiles?.full_name}
                    </span>
                  </div>
                </div>
                <div>
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
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-6 text-muted-foreground">
            You haven't made any bookings yet.
          </p>
        )}
      </DashboardCard>

      {/* Worker Bookings (if applicable) */}
      {isWorker && (
        <DashboardCard
          title="Service Requests"
          icon={Wrench}
          footer={
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/service-requests">View All</Link>
            </Button>
          }
        >
          {workerBookings.length > 0 ? (
            <div className="space-y-4">
              {workerBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">
                      {booking.worker_services?.title}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(booking.booking_date).toLocaleDateString()},{" "}
                        {booking.start_time}
                      </span>
                    </div>
                  </div>
                  <div>
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
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-muted-foreground">
              You don't have any service requests yet.
            </p>
          )}
        </DashboardCard>
      )}

      {/* Recent Forum Posts */}
      <DashboardCard
        title="My Forum Activity"
        icon={MessageSquare}
        footer={
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/forum">View All</Link>
          </Button>
        }
      >
        {forumPosts.length > 0 ? (
          <div className="space-y-4">
            {forumPosts.map((post) => (
              <Link
                key={post.id}
                href={`/forum/${post.id}`}
                className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50"
              >
                <div>
                  <p className="font-medium">{post.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {post.forum_categories?.name}
                    </span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(post.created_at || "").toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>You haven't created any forum posts yet.</p>
            <Button asChild className="mt-4">
              <Link href="/forum/new">Create a Post</Link>
            </Button>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
