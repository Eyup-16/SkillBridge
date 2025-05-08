"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowUp, Book, FileText, Info, Shield, Users, Star, AlertTriangle, Ban, XCircle, FileQuestion, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Terms() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle scroll to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Scroll to section function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const sections = [
    { id: "introduction", title: "Introduction", icon: <Info className="h-4 w-4" /> },
    { id: "definitions", title: "Definitions", icon: <Book className="h-4 w-4" /> },
    { id: "user-accounts", title: "User Accounts", icon: <Users className="h-4 w-4" /> },
    { id: "worker-services", title: "Worker Services", icon: <FileText className="h-4 w-4" /> },
    { id: "booking-payments", title: "Booking & Payments", icon: <Shield className="h-4 w-4" /> },
    { id: "ratings-reviews", title: "Ratings & Reviews", icon: <Star className="h-4 w-4" /> },
    { id: "user-conduct", title: "User Conduct", icon: <AlertTriangle className="h-4 w-4" /> },
    { id: "termination", title: "Termination", icon: <Ban className="h-4 w-4" /> },
    { id: "liability", title: "Limitation of Liability", icon: <XCircle className="h-4 w-4" /> },
    { id: "dispute", title: "Dispute Resolution", icon: <FileQuestion className="h-4 w-4" /> },
    { id: "changes", title: "Changes to Terms", icon: <FileText className="h-4 w-4" /> },
    { id: "contact", title: "Contact Information", icon: <Mail className="h-4 w-4" /> },
  ];

  return (
    <div className="container max-w-5xl mx-auto py-8">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="font-medium">Terms of Service</span>
      </div>

      {/* Back button */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Table of Contents - Sidebar */}
        <div className="md:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Contents</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="flex flex-col space-y-1">
                  {sections.map((section) => (
                    <Button
                      key={section.id}
                      variant="ghost"
                      className={`justify-start ${
                        activeSection === section.id
                          ? "bg-muted font-medium"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => scrollToSection(section.id)}
                    >
                      <span className="mr-2">{section.icon}</span>
                      {section.title}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl font-bold">SkillBridge Terms of Service</CardTitle>
              <p className="text-muted-foreground">Last Updated: May 6, 2025</p>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="all" className="mb-8">
                <TabsList>
                  <TabsTrigger value="all">All Terms</TabsTrigger>
                  <TabsTrigger value="workers">For Workers</TabsTrigger>
                  <TabsTrigger value="customers">For Customers</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-8 mt-6">
                  <section id="introduction" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <Info className="h-5 w-5 mr-2" />
                      1. Introduction
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        Welcome to SkillBridge, a platform designed to connect local skilled workers with customers seeking services.
                        By accessing or using our platform, you agree to be bound by these Terms of Service ("Terms").
                        Please read them carefully.
                      </p>
                      <p>
                        SkillBridge is operated by 404 Brains, and these Terms constitute a legally binding agreement between you and our company.
                      </p>
                    </div>
                  </section>

                  <section id="definitions" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <Book className="h-5 w-5 mr-2" />
                      2. Definitions
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>"Platform" refers to the SkillBridge website, mobile applications, and services.</p>
                      <p>"User" refers to any individual who accesses or uses the Platform, including Workers and Customers.</p>
                      <p>"Worker" refers to skilled individuals offering services through our Platform.</p>
                      <p>"Customer" refers to individuals seeking to hire Workers through our Platform.</p>
                    </div>
                  </section>

                  <section id="user-accounts" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <Users className="h-5 w-5 mr-2" />
                      3. User Accounts
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        <strong>3.1. Registration:</strong> To use certain features of the Platform, you must register for an account.
                        You agree to provide accurate, current, and complete information and to update such information to keep it accurate,
                        current, and complete.
                      </p>
                      <p>
                        <strong>3.2. Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.
                        You agree to notify us immediately of any unauthorized use of your account.
                      </p>
                      <p>
                        <strong>3.3. Account Types:</strong> The Platform offers different types of accounts for Workers and Customers,
                        each with specific features tailored to their needs.
                      </p>
                    </div>
                  </section>

                  <section id="worker-services" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <FileText className="h-5 w-5 mr-2" />
                      4. Worker Services
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        <strong>4.1. Service Listings:</strong> Workers may create service listings that accurately describe their skills,
                        experience, availability, and pricing.
                      </p>
                      <p>
                        <strong>4.2. Worker Responsibilities:</strong> Workers are responsible for performing services as described in their
                        listings and agreed upon with Customers.
                      </p>
                      <p>
                        <strong>4.3. Independent Contractors:</strong> Workers are not employees of SkillBridge but are independent contractors
                        providing services directly to Customers.
                      </p>
                    </div>
                  </section>

                  <section id="booking-payments" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <Shield className="h-5 w-5 mr-2" />
                      5. Booking and Payments
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        <strong>5.1. Service Booking:</strong> Customers may book services through the Platform based on Worker availability.
                      </p>
                      <p>
                        <strong>5.2. Payment Processing:</strong> We may offer payment processing services to facilitate transactions between
                        Workers and Customers.
                      </p>
                      <p>
                        <strong>5.3. Fees:</strong> SkillBridge may charge service fees for using the Platform. These fees will be clearly
                        communicated before any transaction.
                      </p>
                    </div>
                  </section>

                  <section id="ratings-reviews" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <Star className="h-5 w-5 mr-2" />
                      6. Ratings and Reviews
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        <strong>6.1. Review System:</strong> Our Platform includes a review system that allows Users to rate and review each other after completing a service transaction.
                      </p>
                      <p>
                        <strong>6.2. Honest Reviews:</strong> Users agree to provide honest and accurate reviews based on their actual experiences.
                      </p>
                      <p>
                        <strong>6.3. Prohibited Content:</strong> Reviews containing abusive language, false information, or personal attacks are prohibited and may be removed.
                      </p>
                    </div>
                  </section>

                  <section id="user-conduct" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      7. User Conduct
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        <strong>7.1. Prohibited Activities:</strong> Users shall not engage in any activity that is illegal, harmful, threatening, abusive, harassing, or otherwise objectionable.
                      </p>
                      <p>
                        <strong>7.2. Content Restrictions:</strong> Users shall not post content that infringes on intellectual property rights, contains malware, or violates privacy rights.
                      </p>
                      <p>
                        <strong>7.3. Community Guidelines:</strong> Users agree to follow our Community Guidelines, which promote respectful and productive interactions.
                      </p>
                    </div>
                  </section>

                  <section id="termination" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <Ban className="h-5 w-5 mr-2" />
                      8. Termination
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        <strong>8.1. User Termination:</strong> Users may terminate their accounts at any time by following the instructions on the Platform.
                      </p>
                      <p>
                        <strong>8.2. Platform Termination Rights:</strong> SkillBridge reserves the right to suspend or terminate any User's access to the Platform for violations of these Terms or for any other reason at our discretion.
                      </p>
                    </div>
                  </section>

                  <section id="liability" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <XCircle className="h-5 w-5 mr-2" />
                      9. Limitation of Liability
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        <strong>9.1. Service Guarantee:</strong> SkillBridge does not guarantee the quality, safety, or legality of Worker services, the accuracy of listings, or the ability of Workers to perform services.
                      </p>
                      <p>
                        <strong>9.2. Liability Cap:</strong> To the maximum extent permitted by law, SkillBridge's liability to any User is limited to the amount of fees paid by that User to SkillBridge in the six months preceding the claim.
                      </p>
                    </div>
                  </section>

                  <section id="dispute" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <FileQuestion className="h-5 w-5 mr-2" />
                      10. Dispute Resolution
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        <strong>10.1. User Disputes:</strong> SkillBridge encourages Users to resolve disputes directly with each other.
                      </p>
                      <p>
                        <strong>10.2. Mediation:</strong> For unresolved disputes, SkillBridge may offer a mediation process to help reach a resolution.
                      </p>
                    </div>
                  </section>

                  <section id="changes" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <FileText className="h-5 w-5 mr-2" />
                      11. Changes to Terms
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        SkillBridge reserves the right to modify these Terms at any time. We will provide notice of significant changes. Your continued use of the Platform after such modifications constitutes your acceptance of the updated Terms.
                      </p>
                    </div>
                  </section>

                  <section id="contact" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <Mail className="h-5 w-5 mr-2" />
                      12. Contact Information
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        If you have questions about these Terms, please contact us at legal@skillbridge.example.com.
                      </p>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="workers" className="space-y-8 mt-6">
                  <div className="bg-muted p-4 rounded-md mb-6">
                    <p className="text-sm">
                      This section highlights terms that are particularly relevant for Workers.
                      Please note that all terms in the full agreement apply to you as well.
                    </p>
                  </div>

                  <section id="worker-services-tab" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <FileText className="h-5 w-5 mr-2" />
                      Worker Services
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        <strong>Service Listings:</strong> Workers may create service listings that accurately describe their skills,
                        experience, availability, and pricing.
                      </p>
                      <p>
                        <strong>Worker Responsibilities:</strong> Workers are responsible for performing services as described in their
                        listings and agreed upon with Customers.
                      </p>
                      <p>
                        <strong>Independent Contractors:</strong> Workers are not employees of SkillBridge but are independent contractors
                        providing services directly to Customers.
                      </p>
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="customers" className="space-y-8 mt-6">
                  <div className="bg-muted p-4 rounded-md mb-6">
                    <p className="text-sm">
                      This section highlights terms that are particularly relevant for Customers.
                      Please note that all terms in the full agreement apply to you as well.
                    </p>
                  </div>

                  <section id="booking-payments-tab" className="scroll-mt-24">
                    <h2 className="text-xl font-semibold flex items-center mb-4">
                      <Shield className="h-5 w-5 mr-2" />
                      Booking and Payments
                    </h2>
                    <div className="pl-7 space-y-4">
                      <p>
                        <strong>Service Booking:</strong> Customers may book services through the Platform based on Worker availability.
                      </p>
                      <p>
                        <strong>Payment Processing:</strong> We may offer payment processing services to facilitate transactions between
                        Workers and Customers.
                      </p>
                      <p>
                        <strong>Fees:</strong> SkillBridge may charge service fees for using the Platform. These fees will be clearly
                        communicated before any transaction.
                      </p>
                    </div>
                  </section>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="text-center text-muted-foreground text-sm mt-8">
            <p>© {new Date().getFullYear()} SkillBridge by 404 Brains. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-8 right-8 rounded-full shadow-md"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}