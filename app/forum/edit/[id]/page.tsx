"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
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
  Info,
  Loader2
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Map category names to icons
const categoryIcons: Record<string, any> = {
  "General Discussion": MessageSquare,
  "Service Requests": Users,
  "Skill Sharing": PenSquare,
  "Tools & Equipment": Wrench,
  "Success Stories": Lightbulb,
};

interface EditForumPostPageProps {
  params: {
    id: string;
  };
}

export default function EditForumPostPage({ params }: EditForumPostPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
  });
  
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchPostAndCategories = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push("/sign-in");
          return;
        }
        
        // Fetch post details
        const { data: postData, error: postError } = await supabase
          .from("forum_posts")
          .select(`
            *,
            forum_categories(id, name)
          `)
          .eq("id", params.id)
          .single();
        
        if (postError) {
          throw postError;
        }
        
        // Check if user owns this post
        if (postData.user_id !== user.id) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this post.",
            variant: "destructive",
          });
          router.push(`/forum/${params.id}`);
          return;
        }
        
        setPost(postData);
        setFormData({
          title: postData.title,
          content: postData.content,
          categoryId: postData.category_id.toString(),
        });
        
        // Fetch forum categories
        const { data: categoriesData } = await supabase
          .from("forum_categories")
          .select("*")
          .order("name");
        
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast({
          title: "Error",
          description: "Failed to load post. Please try again.",
          variant: "destructive",
        });
        router.push("/forum");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPostAndCategories();
  }, [params.id, router, supabase, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, categoryId: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Validate form data
      if (!formData.title || !formData.content || !formData.categoryId) {
        toast({
          title: "Validation Error",
          description: "All fields are required",
          variant: "destructive",
        });
        return;
      }
      
      // Update post
      const { error } = await supabase
        .from("forum_posts")
        .update({
          title: formData.title,
          content: formData.content,
          category_id: parseInt(formData.categoryId),
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Post Updated",
        description: "Your forum post has been updated successfully.",
      });
      
      // Redirect to post view
      router.push(`/forum/${params.id}`);
    } catch (error) {
      console.error("Error updating post:", error);
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <Link
          href={`/forum/${params.id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Post
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Edit Discussion</CardTitle>
              <CardDescription>
                Update your post details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a descriptive title for your discussion"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Share your thoughts, questions, or ideas in detail..."
                    rows={12}
                    required
                    className="min-h-40"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Button asChild variant="outline">
                    <Link href={`/forum/${params.id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <PenSquare className="h-4 w-4 mr-2" />
                        Update Discussion
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Posting Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">Be Respectful</h4>
                  <p className="text-sm text-muted-foreground">
                    Treat others with respect and kindness.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">Stay On Topic</h4>
                  <p className="text-sm text-muted-foreground">
                    Keep discussions relevant to the selected category.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">No Spam</h4>
                  <p className="text-sm text-muted-foreground">
                    Avoid posting promotional content or spam.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
