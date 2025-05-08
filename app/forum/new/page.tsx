import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  ArrowLeft,
  HelpCircle,
  MessageSquare,
  Users,
  PenSquare,
  Lightbulb,
  Wrench,
  Info
} from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { createForumPost } from "@/app/actions/forum";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Map category names to icons
const categoryIcons: Record<string, any> = {
  "General Discussion": MessageSquare,
  "Service Requests": Users,
  "Skill Sharing": PenSquare,
  "Tools & Equipment": Wrench,
  "Success Stories": Lightbulb,
};

export default async function NewForumPostPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch forum categories
  const { data: categories } = await supabase
    .from("forum_categories")
    .select("*")
    .order("name");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <>
      <div className="mb-6">
        <Link
          href="/forum"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forum
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Create New Discussion</CardTitle>
              <CardDescription>
                Share your thoughts, questions, or ideas with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createForumPost} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter a descriptive title for your discussion"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {categories?.map((category) => {
                      const IconComponent = categoryIcons[category.name] || HelpCircle;
                      return (
                        <div key={category.id} className="flex items-start space-x-2">
                          <input
                            type="radio"
                            id={`category-${category.id}`}
                            name="categoryId"
                            value={category.id}
                            className="mt-1"
                            required
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={`category-${category.id}`}
                              className="flex items-center cursor-pointer"
                            >
                              <IconComponent className="h-4 w-4 mr-2 text-primary" />
                              <span className="font-medium">{category.name}</span>
                            </label>
                            <p className="text-xs text-muted-foreground ml-6">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Share your thoughts, questions, or ideas in detail..."
                    rows={12}
                    required
                    className="min-h-40"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button asChild variant="outline">
                    <Link href="/forum">Cancel</Link>
                  </Button>
                  <SubmitButton>
                    <PenSquare className="h-4 w-4 mr-2" />
                    Create Discussion
                  </SubmitButton>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={profile?.avatar_url || ""}
                    alt={profile?.full_name || "User"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {(profile?.full_name || user.email?.charAt(0) || "A").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile?.full_name || user.email}</p>
                  <p className="text-xs text-muted-foreground">Posting as yourself</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Posting Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="flex gap-2">
                <div className="mt-0.5 text-primary">
                  <Info className="h-4 w-4" />
                </div>
                <p>Be respectful and considerate of other community members.</p>
              </div>
              <div className="flex gap-2">
                <div className="mt-0.5 text-primary">
                  <Info className="h-4 w-4" />
                </div>
                <p>Choose the most appropriate category for your discussion.</p>
              </div>
              <div className="flex gap-2">
                <div className="mt-0.5 text-primary">
                  <Info className="h-4 w-4" />
                </div>
                <p>Provide clear details to help others understand your post.</p>
              </div>
              <div className="flex gap-2">
                <div className="mt-0.5 text-primary">
                  <Info className="h-4 w-4" />
                </div>
                <p>Check for similar discussions before creating a new one.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
