import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Customer",
    location: "Nairobi, Kenya",
    content: "I needed a carpenter to fix my broken cabinet doors. Through SkillBridge, I found a skilled professional who did an excellent job at a reasonable price. The platform made it easy to communicate and schedule the service.",
    rating: 5,
    service: "Carpentry",
  },
  {
    name: "Michael Rodriguez",
    role: "Electrician",
    location: "Manila, Philippines",
    content: "As an electrician, SkillBridge has helped me connect with customers in my area who need my services. The booking system is straightforward, and I've been able to grow my client base significantly.",
    rating: 5,
    service: "Electrical Services",
  },
  {
    name: "Aisha Patel",
    role: "Customer",
    location: "Mumbai, India",
    content: "Finding a reliable tailor in my neighborhood was challenging until I discovered SkillBridge. The reviews helped me choose the right person, and I was very satisfied with the quality of work.",
    rating: 4,
    service: "Tailoring",
  },
  {
    name: "David Nguyen",
    role: "Plumber",
    location: "Ho Chi Minh City, Vietnam",
    content: "SkillBridge has transformed my small plumbing business. I now have a steady stream of clients and the platform handles all the scheduling and payments, letting me focus on my work.",
    rating: 5,
    service: "Plumbing",
  },
];

export function Testimonials() {
  return (
    <div className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            What People Are Saying
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from our community of skilled workers and satisfied customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col h-full rounded-xl border bg-card shadow-sm transition-all hover:shadow-md overflow-hidden"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-primary/20">
                    <Quote className="h-6 w-6" />
                  </div>
                </div>

                <p className="text-sm text-card-foreground mb-4">"{testimonial.content}"</p>

                <div className="mt-auto">
                  <div className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full mb-2">
                    {testimonial.service}
                  </div>
                </div>
              </div>

              <div className="border-t p-4 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role} • {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-2">Join thousands of satisfied users</p>
          <h3 className="text-2xl font-bold">4.8 out of 5 stars from over 500 reviews</h3>
        </div>
      </div>
    </div>
  );
}
