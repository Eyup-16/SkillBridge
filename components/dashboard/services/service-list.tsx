"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit, Trash, Eye, Star, DollarSign } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface ServiceListProps {
  services: any[];
  isLoading: boolean;
}

export function ServiceList({ services, isLoading }: ServiceListProps) {
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const handleToggleActive = async (serviceId: number, currentStatus: boolean) => {
    try {
      setActionLoading(serviceId);
      
      // Update service active status
      const { error } = await supabase
        .from("worker_services")
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", serviceId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Service ${!currentStatus ? "activated" : "deactivated"} successfully.`,
      });
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error(`Error updating service status:`, error);
      toast({
        title: "Error",
        description: "Failed to update service status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    try {
      setActionLoading(serviceId);
      
      // Check if service has any bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("id")
        .eq("service_id", serviceId)
        .limit(1);
      
      if (bookingsError) {
        throw bookingsError;
      }
      
      if (bookings && bookings.length > 0) {
        toast({
          title: "Cannot Delete",
          description: "This service has bookings associated with it. Deactivate it instead.",
          variant: "destructive",
        });
        return;
      }
      
      // Delete service
      const { error } = await supabase
        .from("worker_services")
        .delete()
        .eq("id", serviceId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Service Deleted",
        description: "The service has been deleted successfully.",
      });
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
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

  if (services.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="font-medium mb-2">No services found</h3>
        <p className="text-muted-foreground mb-6">
          You haven't created any services yet.
        </p>
        <Button asChild>
          <Link href="/dashboard/services/create">
            Create Your First Service
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => {
        // Find primary image or use first image
        const primaryImage = service.service_images?.find((img: any) => img.is_primary) || 
                            (service.service_images?.length > 0 ? service.service_images[0] : null);
        
        return (
          <Card key={service.id} className="overflow-hidden hover:shadow-md transition-all">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Service image */}
                <div className="w-full md:w-48 h-48 md:h-auto bg-muted relative">
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
                  
                  {service.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      Featured
                    </Badge>
                  )}
                  
                  {!service.is_active && (
                    <Badge variant="destructive" className="absolute top-2 right-2">
                      Inactive
                    </Badge>
                  )}
                </div>
                
                {/* Service details */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{service.title}</h3>
                        <Badge variant="outline">
                          {service.service_categories?.name}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {service.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-3.5 w-3.5 mr-1" />
                          <span>
                            ${service.price}
                            {service.is_hourly && "/hr"}
                          </span>
                        </div>
                        
                        {service.avg_rating && (
                          <div className="flex items-center text-sm">
                            <Star className="h-3.5 w-3.5 mr-1 fill-yellow-400 text-yellow-400" />
                            <span>{service.avg_rating.toFixed(1)}</span>
                          </div>
                        )}
                        
                        {service.total_bookings !== undefined && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{service.total_bookings} bookings</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2 mr-4">
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={() => handleToggleActive(service.id, service.is_active)}
                          disabled={actionLoading === service.id}
                          id={`active-${service.id}`}
                        />
                        <label
                          htmlFor={`active-${service.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {service.is_active ? "Active" : "Inactive"}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="border-t p-4 bg-muted/20 flex flex-wrap gap-2 justify-end">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/services/${service.id}`}>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/services/${service.id}/edit`}>
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Link>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Service</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this service? This action cannot be undone.
                        <br /><br />
                        <strong>Note:</strong> If this service has any bookings, you won't be able to delete it.
                        Consider deactivating it instead.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteService(service.id)}
                        disabled={actionLoading === service.id}
                      >
                        {actionLoading === service.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
