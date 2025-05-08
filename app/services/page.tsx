import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CategoryFilter } from "@/components/category-filter";
import {
  Hammer,
  Droplet,
  Zap,
  Scissors,
  Wrench,
  Paintbrush,
  Trash,
  Flower,
  BookOpen,
  Cpu,
  Search,
  MapPin,
  Star,
  Filter,
  ChevronRight,
  DollarSign,
  Clock,
  User
} from "lucide-react";
import Link from "next/link";

// Map category names to icons
const categoryIcons: Record<string, any> = {
  "Carpentry": Hammer,
  "Plumbing": Droplet,
  "Electrical": Zap,
  "Tailoring": Scissors,
  "Mechanics": Wrench,
  "Painting": Paintbrush,
  "Cleaning": Trash,
  "Gardening": Flower,
  "Teaching": BookOpen,
  "Technology": Cpu,
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; location?: string };
}) {
  const supabase = await createClient();

  // Fetch service categories
  const { data: categories } = await supabase
    .from("service_categories")
    .select("*")
    .order("name");

  // Build query for services
  let servicesQuery = supabase
    .from("worker_services")
    .select(`
      *,
      service_categories(id, name, icon),
      worker_profiles(id, full_name, city, country, avatar_url),
      service_images(image_url, is_primary)
    `);

  // Apply category filter if provided
  if (searchParams.category) {
    const categoryId = categories?.find(
      (c) => c.name.toLowerCase() === searchParams.category?.toLowerCase()
    )?.id;

    if (categoryId) {
      servicesQuery = servicesQuery.eq("category_id", categoryId);
    }
  }

  // Apply search filter if provided
  if (searchParams.search) {
    servicesQuery = servicesQuery.or(
      `title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`
    );
  }

  // Apply location filter if provided
  if (searchParams.location) {
    servicesQuery = servicesQuery.or(
      `worker_profiles.city.ilike.%${searchParams.location}%,worker_profiles.country.ilike.%${searchParams.location}%`
    );
  }

  // Execute query
  const { data: services } = await servicesQuery;

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Discover Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find skilled professionals offering quality services in your area
            </p>
            <div className="max-w-lg mx-auto">
              <form className="flex gap-2" action="/services" method="get">
                {/* Preserve existing query parameters except search */}
                {Object.entries(searchParams).map(([key, value]) => {
                  if (key !== 'search' && value) {
                    return (
                      <input
                        key={key}
                        type="hidden"
                        name={key}
                        value={value}
                      />
                    );
                  }
                  return null;
                })}
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search for services..."
                    name="search"
                    defaultValue={searchParams.search || ""}
                    className="h-12"
                  />
                </div>
                <Button type="submit" size="lg" className="shrink-0">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-72 shrink-0">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <h2 className="text-lg font-semibold">Filter Services</h2>
              </CardHeader>
              <CardContent>
                <CategoryFilter />
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-2xl font-bold">
                {searchParams.category
                  ? `${
                      categories?.find(
                        (c) =>
                          c.name.toLowerCase() ===
                          searchParams.category?.toLowerCase()
                      )?.name || searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1)
                    } Services`
                  : "All Services"}
              </h2>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {services?.length || 0} service{services?.length !== 1 ? "s" : ""} found
              </Badge>
            </div>

          {/* Services grid */}
          {services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const primaryImage = service.service_images?.find(
                  (img:any) => img.is_primary
                );
                const IconComponent =
                  categoryIcons[service.service_categories?.name] || Wrench;

                return (
                  <Card key={service.id} className="overflow-hidden group hover:shadow-md transition-all duration-300">
                    <Link href={`/workers/${service.worker_id}`} className="block">
                      <div className="h-48 bg-muted relative">
                        {primaryImage ? (
                          <img
                            src={primaryImage.image_url}
                            alt={service.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <IconComponent className="h-16 w-16 text-primary/60" />
                          </div>
                        )}
                        <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground hover:bg-background/90">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {service.price}{" "}
                          <span className="opacity-70 ml-1">{service.is_hourly ? "/hr" : "fixed"}</span>
                        </Badge>
                        <Badge variant="secondary" className="absolute bottom-3 left-3">
                          {service.service_categories?.name}
                        </Badge>
                      </div>

                      <CardHeader className="p-5 pb-2">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                          {service.title}
                        </h3>
                      </CardHeader>

                      <CardContent className="p-5 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {service.description}
                        </p>

                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-primary/10">
                            {service.worker_profiles?.avatar_url ? (
                              <AvatarImage
                                src={service.worker_profiles.avatar_url}
                                alt={service.worker_profiles.full_name}
                              />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {service.worker_profiles?.full_name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {service.worker_profiles?.full_name}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>
                                {service.worker_profiles?.city}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="px-5 py-3 border-t bg-muted/30">
                        <div className="w-full text-center text-sm font-medium text-primary">
                          View Details
                          <ChevronRight className="h-3 w-3 inline-block ml-1" />
                        </div>
                      </CardFooter>
                    </Link>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-lg border">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No services found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button asChild>
                <Link href="/services">View All Services</Link>
              </Button>
            </div>
          )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 border-t pt-16">
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-4">
                    Offer Your Services
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Are you skilled in a trade or profession? Join our community of service providers
                    and connect with customers looking for your expertise.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg">
                      <Link href="/sign-up">Become a Provider</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/workers">Browse Providers</Link>
                    </Button>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                  <div className="relative w-72 h-72 bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Wrench className="h-24 w-24 text-primary/40" />
                    </div>
                    <div className="absolute top-4 left-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Hammer className="h-8 w-8 text-primary/60" />
                    </div>
                    <div className="absolute bottom-8 right-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <Paintbrush className="h-10 w-10 text-primary/60" />
                    </div>
                    <div className="absolute top-1/2 right-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary/60" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
