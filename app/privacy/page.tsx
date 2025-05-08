"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, Lock, Database, Share2, Baby,ShieldAlert, Timer, UserCog, Cookie,  FileText, Wifi, PhoneOff, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const Privacy = () => {
  const [activeSection, setActiveSection] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on initial load
    setIsMobile(window.innerWidth < 768);

    // Set up resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Set up intersection observer for sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    // Scroll to section if hash exists
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId:string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const sections = [
    { id: "introduction", title: "Introduction", icon: <Shield size={18} /> },
    { id: "information-we-collect", title: "Information We Collect", icon: <Database size={18} /> },
    { id: "how-we-use", title: "How We Use Your Information", icon: <UserCog size={18} /> },
    { id: "information-sharing", title: "Information Sharing", icon: <Share2 size={18} /> },
    { id: "data-security", title: "Data Security", icon: <Lock size={18} /> },
    { id: "data-retention", title: "Data Retention", icon: <Timer size={18} /> },
    { id: "user-rights", title: "User Rights", icon: <UserCog size={18} /> },
    { id: "cookies", title: "Cookies & Tracking", icon: <Cookie size={18} /> },
    { id: "children", title: "Children's Privacy", icon: <Baby size={18} /> },
    { id: "changes", title: "Changes to Policy", icon: <FileText size={18} /> },
    { id: "offline-access", title: "Offline Access", icon: <PhoneOff size={18} /> },
    { id: "contact", title: "Contact Us", icon: <MessageSquare size={18} /> }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Fixed back-to-top button */}
      <Button 
        onClick={scrollToTop} 
        className="fixed bottom-6 right-6 z-50 p-2 rounded-full shadow-lg bg-primary"
        size="icon"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </Button>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" passHref>
            <Button variant="ghost" className="hover:bg-slate-100">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SkillBridge Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: May 6, 2025</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Table of Contents - Desktop */}
          <div className="hidden md:block w-72 shrink-0">
            <div className="sticky top-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <nav className="space-y-1">
                    {sections.map((section) => (
                      <Button
                        key={section.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-left font-normal px-2 py-1.5 h-auto",
                          activeSection === section.id 
                            ? "bg-slate-100 text-primary font-medium" 
                            : "text-muted-foreground"
                        )}
                        onClick={() => scrollToSection(section.id)}
                      >
                        <span className="flex items-center">
                          <span className="mr-2">{section.icon}</span>
                          <span>{section.title}</span>
                        </span>
                      </Button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Tabs defaultValue="all" className="mb-8">
              <TabsList className="mb-4 w-full max-w-md mx-auto">
                <TabsTrigger value="all" className="flex-1">All Users</TabsTrigger>
                <TabsTrigger value="workers" className="flex-1">Workers</TabsTrigger>
                <TabsTrigger value="customers" className="flex-1">Customers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-6">
                <Card className="shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <div className="space-y-8">
                      <section id="introduction" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <Shield className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">1. Introduction</h2>
                        </div>
                        <div className="pl-8 space-y-3">
                          <p>At SkillBridge, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
                          <p>This policy applies to all users of SkillBridge, including skilled workers and customers. By using our services, you consent to the data practices described in this policy.</p>
                        </div>
                      </section>
                      
                      <section id="information-we-collect" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <Database className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">2. Information We Collect</h2>
                        </div>
                        <div className="pl-8 space-y-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">2.1. Information You Provide:</h3>
                            <ul className="list-disc pl-6 space-y-1 text-gray-700">
                              <li>Account information: name, email address, phone number, and password</li>
                              <li>Profile information: skills, experience, education, profile photo</li>
                              <li>Service listings: descriptions, pricing, availability</li>
                              <li>Reviews and ratings</li>
                              <li>Communications with other users</li>
                              <li>Payment information (when applicable)</li>
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">2.2. Information Automatically Collected:</h3>
                            <ul className="list-disc pl-6 space-y-1 text-gray-700">
                              <li>Device information: IP address, browser type, operating system</li>
                              <li>Usage data: pages visited, time spent on the platform</li>
                              <li>Location data (with your permission)</li>
                              <li>Cookies and similar tracking technologies</li>
                            </ul>
                          </div>
                          
                          <p>We deliberately minimize data collection to respect bandwidth limitations in the regions we serve.</p>
                        </div>
                      </section>
                      
                      <section id="how-we-use" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <UserCog className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">3. How We Use Your Information</h2>
                        </div>
                        <div className="pl-8 space-y-3">
                          <p>We use your information for the following purposes:</p>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Providing and improving our services</li>
                            <li>Connecting workers with customers</li>
                            <li>Processing service bookings and payments</li>
                            <li>Facilitating communication between users</li>
                            <li>Maintaining and optimizing the platform</li>
                            <li>Ensuring platform safety and security</li>
                            <li>Sending service updates and notifications</li>
                            <li>Developing new features based on user feedback</li>
                          </ul>
                        </div>
                      </section>
                      
                      <section id="information-sharing" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <Share2 className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">4. Information Sharing and Disclosure</h2>
                        </div>
                        <div className="pl-8 space-y-4">
                          <div>
                            <p className="font-medium">4.1. With Other Users:</p>
                            <p className="pl-4 text-gray-700">When you create a profile or service listing, certain information is shared with other users to facilitate service connections. Workers' profiles and service details are visible to customers, and customers' requests are visible to relevant workers.</p>
                          </div>
                          
                          <div>
                            <p className="font-medium">4.2. With Service Providers:</p>
                            <p className="pl-4 text-gray-700">We may share information with third-party service providers who help us operate our platform, such as hosting providers and payment processors. These providers are bound by confidentiality agreements.</p>
                          </div>
                          
                          <div>
                            <p className="font-medium">4.3. For Legal Reasons:</p>
                            <p className="pl-4 text-gray-700">We may disclose information if required by law, regulation, legal process, or governmental request.</p>
                          </div>
                        </div>
                      </section>
                      
                      <section id="data-security" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <Lock className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">5. Data Security</h2>
                        </div>
                        <div className="pl-8 space-y-3">
                          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Encryption of sensitive data</li>
                            <li>Regular security assessments</li>
                            <li>Access controls and authentication procedures</li>
                            <li>Data minimization practices</li>
                          </ul>
                          <p>However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information.</p>
                        </div>
                      </section>
                      
                      <section id="data-retention" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <Timer className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">6. Data Retention</h2>
                        </div>
                        <div className="pl-8">
                          <p>We retain your information for as long as your account is active or as needed to provide you with our services. You can request deletion of your account and associated data at any time. Some information may be retained for legal or legitimate business purposes even after account deletion.</p>
                        </div>
                      </section>
                      
                      <section id="user-rights" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <UserCog className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">7. User Rights</h2>
                        </div>
                        <div className="pl-8 space-y-3">
                          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
                          <ul className="list-disc pl-6 space-y-1 text-gray-700">
                            <li>Access to your personal information</li>
                            <li>Correction of inaccurate information</li>
                            <li>Deletion of your information</li>
                            <li>Restriction of processing</li>
                            <li>Data portability</li>
                          </ul>
                          <p>To exercise these rights, please contact us using the information provided in the "Contact Us" section.</p>
                        </div>
                      </section>
                      
                      <section id="cookies" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <Cookie className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">8. Cookies and Tracking Technologies</h2>
                        </div>
                        <div className="pl-8 space-y-3">
                          <p>We use cookies and similar technologies to enhance your experience on our platform. These technologies help us understand how you use our services, remember your preferences, and improve functionality.</p>
                          <p>You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our platform.</p>
                        </div>
                      </section>
                      
                      <section id="children" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <Baby className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">9. Children's Privacy</h2>
                        </div>
                        <div className="pl-8">
                          <p>Our platform is not intended for children under the age of 18. We do not knowingly collect information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.</p>
                        </div>
                      </section>
                      
                      <section id="changes" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <FileText className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">10. Changes to This Privacy Policy</h2>
                        </div>
                        <div className="pl-8">
                          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
                        </div>
                      </section>
                      
                      <section id="offline-access" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <PhoneOff className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">11. Offline Access and Data Usage</h2>
                        </div>
                        <div className="pl-8">
                          <p>Our platform is designed to function in low-bandwidth environments and may offer offline capabilities. When using offline features, data will be stored locally on your device and synchronized with our servers when connectivity is restored.</p>
                        </div>
                      </section>
                      
                      <section id="contact" className="scroll-mt-8">
                        <div className="flex items-center mb-4">
                          <MessageSquare className="mr-3 text-primary" />
                          <h2 className="text-2xl font-semibold text-gray-800">12. Contact Us</h2>
                        </div>
                        <div className="pl-8 space-y-2">
                          <p>If you have any questions about this Privacy Policy or our data practices, please contact us at:</p>
                          <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                            <p className="font-medium">SkillBridge by 404 Brains</p>
                            <p>Email: <a href="mailto:privacy@skillbridge.example.com" className="text-blue-600 hover:text-blue-800">privacy@skillbridge.example.com</a></p>
                          </div>
                        </div>
                      </section>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center text-gray-500 text-sm pt-6">
                  <p>© 2025 SkillBridge by 404 Brains. All rights reserved.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="workers">
                <Card className="shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center justify-center h-16 mb-4">
                      <span className="text-lg text-gray-500">Privacy information specific to workers will be displayed here.</span>
                    </div>
                    <p className="text-center text-gray-600">
                      This section includes additional privacy details relevant to skilled professionals using our platform,
                      such as how your profile information is shared, service visibility settings, and payment processing data.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="customers">
                <Card className="shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center justify-center h-16 mb-4">
                      <span className="text-lg text-gray-500">Privacy information specific to customers will be displayed here.</span>
                    </div>
                    <p className="text-center text-gray-600">
                      This section includes additional privacy details relevant to customers using our platform,
                      such as how your service requests are shared, review systems, and payment security.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;