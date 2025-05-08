"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { PostList } from "@/components/dashboard/forum/post-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Plus } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardLoading } from "@/components/dashboard/dashboard-loading";

export default function ForumPostsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        // Fetch user's forum posts
        const { data, error } = await supabase
          .from("forum_posts")
          .select(`
            *,
            forum_categories(id, name),
            forum_comments(id)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        // Fetch profiles for the posts
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", user.id);

        // Add profile info and comment count to each post
        const postsWithCommentCount = data.map((post) => ({
          ...post,
          profiles: profiles?.[0],
          comment_count: post.forum_comments ? post.forum_comments.length : 0,
        }));

        setPosts(postsWithCommentCount);
        setFilteredPosts(postsWithCommentCount);
      } catch (error) {
        console.error("Error fetching forum posts:", error);
        toast({
          title: "Error",
          description: "Failed to load forum posts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [supabase, toast]);

  // Filter posts when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPosts(posts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = posts.filter((post) => {
      const title = post.title.toLowerCase();
      const content = post.content.toLowerCase();
      const category = post.forum_categories?.name.toLowerCase() || "";

      return (
        title.includes(query) ||
        content.includes(query) ||
        category.includes(query)
      );
    });

    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };

  const handleDeletePost = async (postId: number) => {
    try {
      // Delete post
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", postId);

      if (error) {
        throw error;
      }

      // Update local state
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      setFilteredPosts((prev) => prev.filter((post) => post.id !== postId));

      toast({
        title: "Post Deleted",
        description: "Your forum post has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting forum post:", error);
      toast({
        title: "Error",
        description: "Failed to delete forum post. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <DashboardLoading title="Loading forum posts..." />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="My Forum Posts"
        description="Manage your forum posts and discussions"
        actions={
          <Button asChild>
            <Link href="/forum/new">
              <Plus className="mr-2 h-4 w-4" />
              Create New Post
            </Link>
          </Button>
        }
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your posts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      {/* Posts List */}
      <PostList
        posts={filteredPosts}
        isLoading={isLoading}
        onDelete={handleDeletePost}
      />
    </div>
  );
}
