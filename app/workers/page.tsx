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
  User,
  Clock,
  Filter,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Map category names to icons (same as in services page)
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

export default async function WorkersPage({
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

  // First, get all worker profiles
  let workersQuery = supabase
    .from("worker_profiles")
    .select(`
      *
    `);

  // Apply location filter if provided
  if (searchParams.location) {
    workersQuery = workersQuery.or(
      `city.ilike.%${searchParams.location}%,country.ilike.%${searchParams.location}%`
    );
  }

  // Apply search filter if provided (for worker names)
  if (searchParams.search) {
    workersQuery = workersQuery.ilike("full_name", `%${searchParams.search}%`);
  }

  // Execute query to get all workers
  const { data: workers } = await workersQuery;

  // If category filter is provided, we need to filter workers who offer services in that category
  let filteredWorkers = workers || [];

  if (searchParams.category && workers) {
    // Find the category ID for the selected category
    const categoryId = categories?.find(
      (c) => c.name.toLowerCase() === searchParams.category?.toLowerCase()
    )?.id;

    if (categoryId) {
      // Get all worker services in this category
      const { data: categoryServices } = await supabase
        .from("worker_services")
        .select("worker_id")
        .eq("category_id", categoryId);

      // Filter workers who have services in this category
      const workerIdsInCategory = new Set(
        categoryServices?.map((service) => service.worker_id) || []
      );

      filteredWorkers = workers.filter((worker) =>
        workerIdsInCategory.has(worker.id)
      );
    }
  }

  // For each worker, fetch their services with categories and calculate average rating
  const workersWithDetails = await Promise.all(
    filteredWorkers.map(async (worker) => {
      // Fetch worker's services with categories
      const { data: services } = await supabase
        .from("worker_services")
        .select(`
          *,
          service_categories(id, name, icon)
        `)
        .eq("worker_id", worker.id);

      // Get unique categories this worker offers
      const uniqueCategories = Array.from(
        new Set(
          services?.map((service) => service.service_categories?.name) || []
        )
      ).filter(Boolean);

      // Fetch reviews for this worker's services
      const { data: reviews } = await supabase
        .from("reviews")
        .select(`
          *,
          bookings(
            service_id,
            worker_services(worker_id)
          )
        `)
        .filter("bookings.worker_services.worker_id", "eq", worker.id);

      // Calculate average rating
      const averageRating =
        reviews && reviews.length > 0
          ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
          : 0;

      return {
        ...worker,
        categories: uniqueCategories,
        services: services || [],
        averageRating,
        reviewCount: reviews?.length || 0,
      };
    })
  );

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Find Skilled Workers
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with professional service providers across various categories
            </p>
            <div className="max-w-lg mx-auto">
              <form className="flex gap-2" action="/workers" method="get">
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
                    placeholder="Search by name or skill..."
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
                <h2 className="text-lg font-semibold">Filter Workers</h2>
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
                      )?.name || searchParams.category
                    } Workers`
                  : "All Workers"}
              </h2>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {workersWithDetails.length} worker{workersWithDetails.length !== 1 ? "s" : ""} found
              </Badge>
            </div>

            {workersWithDetails.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workersWithDetails.map((worker) => (
                  <Card key={worker.id} className="overflow-hidden group hover:shadow-md transition-all duration-300">
                    <Link href={`/workers/${worker.id}`} className="block">
                      <CardHeader className="p-6 pb-3">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-primary/10">
                            {worker.avatar_url ? (
                              <AvatarImage
                                src={worker.avatar_url}
                                alt={worker.full_name}
                              />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {worker.full_name.charAt(0)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                              {worker.full_name}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>
                                {worker.city}, {worker.country}
                              </span>
                            </div>
                            <div className="flex items-center mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < Math.round(worker.averageRating)
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({worker.reviewCount})
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="px-6 pt-0">
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {worker.bio || "No bio provided."}
                          </p>
                        </div>

                        <div className="flex items-center text-xs text-muted-foreground mb-3">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{worker.is_available ? "Available now" : "Not available"}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {worker.categories.slice(0, 3).map((category:any) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {worker.categories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{worker.categories.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </CardContent>

                      <CardFooter className="px-6 py-3 border-t bg-muted/30">
                        <div className="w-full text-center text-sm font-medium text-primary">
                          View Profile
                          <ChevronRight className="h-3 w-3 inline-block ml-1" />
                        </div>
                      </CardFooter>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-lg border">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No workers found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <Button asChild>
                  <Link href="/workers">View All Workers</Link>
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
                    Share Your Skills
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Join our community of skilled workers and start offering your services to customers in need.
                    Create your profile, list your skills, and grow your business.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg">
                      <Link href="/sign-up">Become a Provider</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/about">Learn More</Link>
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
