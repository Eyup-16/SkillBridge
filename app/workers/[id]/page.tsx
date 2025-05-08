import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Star, MapPin, Phone, Mail, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function WorkerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Fetch worker profile
  const { data: worker, error } = await supabase
    .from("worker_profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !worker) {
    notFound();
  }

  // Fetch worker services
  const { data: services } = await supabase
    .from("worker_services")
    .select(`
      *,
      service_categories(name, icon),
      service_images(image_url, is_primary)
    `)
    .eq("worker_id", params.id);

  // Fetch reviews for this worker's services
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      bookings(
        customer_id,
        service_id,
        worker_services(title)
      )
    `)
    .in(
      "booking_id",
      services
        ? services.map((service) =>
            supabase
              .from("bookings")
              .select("id")
              .eq("service_id", service.id)
          )
        : []
    );

  // Calculate average rating
  const averageRating =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0;

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Worker Profile */}
        <div className="md:col-span-1">
          <div className="bg-card rounded-lg shadow-sm border p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {worker.avatar_url ? (
                  <img
                    src={worker.avatar_url}
                    alt={worker.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary">
                    {worker.full_name.charAt(0)}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold">{worker.full_name}</h1>
              <div className="flex items-center mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  ({reviews?.length || 0} reviews)
                </span>
              </div>
              <div className="mt-4 flex items-center justify-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {worker.city}, {worker.country}
                </span>
              </div>
              {worker.phone_number && (
                <div className="mt-2 flex items-center justify-center text-muted-foreground">
                  <Phone className="h-4 w-4 mr-1" />
                  <span>{worker.phone_number}</span>
                </div>
              )}
              <div className="mt-6">
                <Button asChild className="w-full">
                  <Link href={services && services.length > 0 ? `/services/${services[0].id}/book` : `/services?worker=${params.id}`}>
                    Book Now
                  </Link>
                </Button>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground text-sm">
                {worker.bio || "No bio provided."}
              </p>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Availability</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <span>{worker.is_available ? "Available now" : "Not available"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Services and Reviews */}
        <div className="md:col-span-2">
          <div className="bg-card rounded-lg shadow-sm border p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Services Offered</h2>
            {services && services.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{service.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          ${service.price}{" "}
                          <span className="text-xs text-muted-foreground">
                            {service.is_hourly ? "/hr" : "fixed"}
                          </span>
                        </p>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {service.service_categories?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No services listed yet.</p>
            )}
          </div>

          <div className="bg-card rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">Reviews</h2>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium">
                          {review.bookings?.worker_services?.title}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(review.created_at || "").toLocaleDateString()}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {review.comment || "No comment provided."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
