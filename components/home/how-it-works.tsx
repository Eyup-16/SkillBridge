import { Search, Calendar, Star, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    title: "Find a Service",
    description: "Search for skilled workers in your area based on the service you need.",
    icon: Search,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
  {
    title: "Book an Appointment",
    description: "Select a convenient time and date for the service you require.",
    icon: Calendar,
    color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  },
  {
    title: "Get the Service",
    description: "Receive quality service from skilled professionals in your community.",
    icon: MessageSquare,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    title: "Rate and Review",
    description: "Share your experience to help others find reliable service providers.",
    icon: Star,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  },
];

export function HowItWorks() {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How SkillBridge Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Connect with skilled workers in your community in just a few simple steps
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-24 left-0 w-full h-0.5 bg-border hidden lg:block"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, stepIdx) => (
              <div
                key={step.title}
                className="relative flex flex-col items-center text-center bg-card border rounded-lg p-6 transition-all hover:shadow-md"
              >
                {/* Step number */}
                <div className="absolute -top-5 bg-background border rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  {stepIdx + 1}
                </div>

                <div className={`flex h-16 w-16 items-center justify-center rounded-full ${step.color} mb-6`}>
                  <step.icon className="h-8 w-8" />
                </div>

                <h3 className="text-xl font-semibold mb-3">
                  {step.title}
                </h3>

                <p className="text-muted-foreground">
                  {step.description}
                </p>

                {stepIdx < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg">
              <Link href="/services">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
