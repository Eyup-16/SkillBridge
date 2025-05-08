"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Star, Trash, DollarSign, MapPin, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";
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
import { Badge } from "@/components/ui/badge";

export default function SavedServicesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [savedServices, setSavedServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [removingServiceId, setRemovingServiceId] = useState<number | null>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchSavedServices = async () => {
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
            title: "Access Denied",
            description: "You need to be in customer role to access this page.",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }
        
        // Fetch saved services
        const { data: savedServiceData, error: savedServiceError } = await supabase
          .from("saved_services")
          .select(`
            id,
            service_id,
            created_at,
            worker_services(
              id,
              title,
              description,
              price,
              is_hourly,
              is_active,
              avg_rating,
              category_id,
              service_categories(
                id,
                name,
                icon
              ),
              worker_id,
              worker_profiles(
                id,
                full_name,
                city,
                country,
                avatar_url
              ),
              service_images(
                id,
                image_url,
                is_primary
              )
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        
        if (savedServiceError) {
          throw savedServiceError;
        }
        
        // Filter out any null worker_services (in case a service was deleted)
        const validSavedServices = (savedServiceData || []).filter(
          item => item.worker_services !== null
        );
        
        setSavedServices(validSavedServices);
        setFilteredServices(validSavedServices);
      } catch (error) {
        console.error("Error fetching saved services:", error);
        toast({
          title: "Error",
          description: "Failed to load saved services. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSavedServices();
  }, [supabase, router, toast]);

  // Filter services when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredServices(savedServices);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = savedServices.filter((item) => {
      const service = item.worker_services;
      const title = service?.title?.toLowerCase() || "";
      const description = service?.description?.toLowerCase() || "";
      const category = service?.service_categories?.name?.toLowerCase() || "";
      const workerName = service?.worker_profiles?.full_name?.toLowerCase() || "";
      const location = `${service?.worker_profiles?.city}, ${service?.worker_profiles?.country}`.toLowerCase();
      
      return (
        title.includes(query) ||
        description.includes(query) ||
        category.includes(query) ||
        workerName.includes(query) ||
        location.includes(query)
      );
    });
    
    setFilteredServices(filtered);
  }, [searchQuery, savedServices]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const handleRemoveSavedService = async (savedServiceId: number) => {
    try {
      setRemovingServiceId(savedServiceId);
      
      // Delete saved service
      const { error } = await supabase
        .from("saved_services")
        .delete()
        .eq("id", savedServiceId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setSavedServices((prev) => prev.filter((item) => item.id !== savedServiceId));
      setFilteredServices((prev) => prev.filter((item) => item.id !== savedServiceId));
      
      toast({
        title: "Service Removed",
        description: "The service has been removed from your saved list.",
      });
    } catch (error) {
      console.error("Error removing saved service:", error);
      toast({
        title: "Error",
        description: "Failed to remove service. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingServiceId(null);
    }
  };

  if (isLoading) {
    return <DashboardLoading title="Loading saved services..." />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Saved Services"
        description="Manage your saved and favorite services"
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search saved services..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Saved Services List */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <h3 className="font-medium mb-2">No saved services found</h3>
          <p className="text-muted-foreground mb-6">
            You haven't saved any services yet. Browse services and click the star icon to save them.
          </p>
          <Button asChild>
            <Link href="/services">
              Browse Services
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((item) => {
            const service = item.worker_services;
            
            // Find primary image or use first image
            const primaryImage = service.service_images?.find((img: any) => img.is_primary) || 
                                (service.service_images?.length > 0 ? service.service_images[0] : null);
            
            return (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-all">
                <CardContent className="p-0">
                  {/* Service image */}
                  <div className="h-48 bg-muted relative">
                    {primaryImage ? (
                      <img
                        src={primaryImage.image_url}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <span className="text-primary/60 text-xl font-bold">
                          {service.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {!service.is_active && (
                      <Badge variant="destructive" className="absolute top-2 right-2">
                        Unavailable
                      </Badge>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 left-2 h-8 w-8"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Saved Service</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove this service from your saved list?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveSavedService(item.id)}
                            disabled={removingServiceId === item.id}
                          >
                            {removingServiceId === item.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                Removing...
                              </>
                            ) : (
                              "Remove"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  {/* Service details */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">
                        {service.service_categories?.name}
                      </Badge>
                      {service.avg_rating && (
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 mr-1 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{service.avg_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <User className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                        <span>{service.worker_profiles?.full_name}</span>
                      </div>
                      
                      <div className="flex items-center text-sm font-medium">
                        <DollarSign className="h-3.5 w-3.5 mr-1" />
                        <span>
                          ${service.price}
                          {service.is_hourly && "/hr"}
                        </span>
                      </div>
                    </div>
                    
                    {service.worker_profiles?.city && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span>
                          {service.worker_profiles.city}, {service.worker_profiles.country}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="border-t p-4 bg-muted/20">
                    <Button asChild className="w-full">
                      <Link href={`/services/${service.id}`}>
                        View Service
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
