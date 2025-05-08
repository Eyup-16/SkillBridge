import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Users,
  Globe,
  Lightbulb,
  Handshake,
  Smartphone,
  Heart,
  Star,
  MessageSquare,
  Calendar,
  Shield,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          About SkillBridge
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connecting skilled workers with customers in third-world countries to create economic opportunities and build stronger communities.
        </p>
      </section>

      {/* Mission Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <div>
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-muted-foreground mb-6">
            SkillBridge aims to bridge the gap between skilled workers and customers in third-world countries, creating a digital marketplace that empowers local talent and provides reliable services to communities.
          </p>
          <p className="text-lg text-muted-foreground mb-6">
            We believe that by connecting skilled workers with those who need their services, we can help create sustainable livelihoods, foster economic growth, and build stronger communities.
          </p>
          <Button asChild size="lg" className="mt-4">
            <Link href="/services">Explore Services</Link>
          </Button>
        </div>
        <div className="bg-muted rounded-lg p-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Connect</h3>
              <p className="text-sm text-muted-foreground">Bringing together skilled workers and customers</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Empower</h3>
              <p className="text-sm text-muted-foreground">Creating economic opportunities for local talent</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Innovate</h3>
              <p className="text-sm text-muted-foreground">Building technology for low-bandwidth environments</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Handshake className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Trust</h3>
              <p className="text-sm text-muted-foreground">Fostering reliable service exchanges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose SkillBridge</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our platform is designed specifically for the needs of third-world communities, with features that make it easy to connect and do business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Low-Bandwidth Optimized</h3>
            <p className="text-muted-foreground">
              Designed to work efficiently in areas with limited internet connectivity, ensuring accessibility for all users.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Rating & Review System</h3>
            <p className="text-muted-foreground">
              Build trust through our comprehensive rating system that helps customers find reliable service providers.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Simple Booking System</h3>
            <p className="text-muted-foreground">
              Easy-to-use booking system that allows customers to schedule services at their convenience.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Community Forum</h3>
            <p className="text-muted-foreground">
              Connect with others, share knowledge, and build community through our discussion forums.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Secure Platform</h3>
            <p className="text-muted-foreground">
              Your data and transactions are protected with industry-standard security measures.
            </p>
          </div>

          <div className="bg-card border rounded-lg p-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Community-Focused</h3>
            <p className="text-muted-foreground">
              Built with the specific needs of local communities in mind, fostering economic growth and development.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Team</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            SkillBridge is built by a passionate team dedicated to creating economic opportunities in third-world countries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              name: "Sarah Johnson",
              role: "Founder & CEO",
              bio: "With 10+ years of experience in community development, Sarah founded SkillBridge to create economic opportunities in underserved regions.",
            },
            {
              name: "Michael Rodriguez",
              role: "CTO",
              bio: "Michael leads our technical team, focusing on creating accessible technology solutions for low-bandwidth environments.",
            },
            {
              name: "Aisha Patel",
              role: "Community Director",
              bio: "Aisha works directly with communities to understand their needs and ensure SkillBridge serves them effectively.",
            },
            {
              name: "David Nguyen",
              role: "Product Manager",
              bio: "David oversees product development, ensuring SkillBridge is intuitive and accessible for all users.",
            },
          ].map((member, index) => (
            <div key={index} className="bg-card border rounded-lg p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{member.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-medium mb-1">{member.name}</h3>
              <p className="text-sm text-primary mb-3">{member.role}</p>
              <p className="text-sm text-muted-foreground">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted rounded-lg p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Join the SkillBridge Community</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Whether you're a skilled worker looking to offer your services or a customer in need of quality work, SkillBridge is here to connect you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/sign-up">Sign Up Now</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/services">Explore Services</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
