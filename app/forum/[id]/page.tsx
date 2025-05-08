import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  Share2,
  Flag,
  HelpCircle,
  Users,
  PenSquare,
  Lightbulb,
  Wrench,
  MessageSquare,
  Edit,
  Trash,
  MoreVertical
} from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { createForumComment } from "@/app/actions/forum";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ForumCommentActions } from "@/components/forum/comment-actions";

// Map category names to icons
const categoryIcons: Record<string, any> = {
  "General Discussion": MessageSquare,
  "Service Requests": Users,
  "Skill Sharing": PenSquare,
  "Tools & Equipment": Wrench,
  "Success Stories": Lightbulb,
};

export default async function ForumPostPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Fetch post details
  const { data: post, error } = await supabase
    .from("forum_posts")
    .select(`
      *,
      forum_categories(id, name)
    `)
    .eq("id", params.id)
    .single();

  if (error || !post) {
    notFound();
  }

  // Fetch comments for this post
  const { data: comments } = await supabase
    .from("forum_comments")
    .select(`
      *,
      user_id
    `)
    .eq("post_id", params.id)
    .order("created_at", { ascending: true });

  // Fetch user profiles
  const userIds = [
    post.user_id,
    ...(comments?.map((comment) => comment.user_id) || []),
  ];
  const uniqueUserIds = Array.from(new Set(userIds));

  // Get user info from profiles
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", uniqueUserIds);

  // Create a map of user IDs to user data for easy lookup
  const userMap = (users || []).reduce(
    (acc, user) => {
      acc[user.id] = user;
      return acc;
    },
    {} as Record<string, any>
  );

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const IconComponent = categoryIcons[post.forum_categories?.name] || HelpCircle;

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

      <div className="bg-card border rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Badge variant="outline" className="font-normal">
                {post.forum_categories?.name}
              </Badge>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={userMap[post.user_id]?.avatar_url || ""}
                alt={userMap[post.user_id]?.full_name || "User"}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {(userMap[post.user_id]?.full_name || "A").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {userMap[post.user_id]?.full_name || post.user_id.substring(0, 8) || "Anonymous"}
              </p>
              <p className="text-xs text-muted-foreground">
                Posted on {new Date(post.created_at || "").toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none mb-6">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{comments?.length || 0} comments</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>Like</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </div>
            </div>

            {/* Edit post button - only visible to post author */}
            {user && user.id === post.user_id && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/forum/edit/${post.id}`}>
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit Post
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            Comments ({comments?.length || 0})
          </h2>
          {user && (
            <Button variant="outline" size="sm" asChild>
              <a href="#comment-form">Add Comment</a>
            </Button>
          )}
        </div>

        {comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="border">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={userMap[comment.user_id]?.avatar_url || ""}
                          alt={userMap[comment.user_id]?.full_name || "User"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {(userMap[comment.user_id]?.full_name || "A").charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {userMap[comment.user_id]?.full_name || comment.user_id.substring(0, 8) || "Anonymous"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.created_at || "").toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Comment actions (edit/delete) */}
                    <ForumCommentActions
                      comment={comment}
                      currentUserId={user?.id}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-foreground">
                      <Heart className="h-3.5 w-3.5" />
                      <span>Like</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-foreground">
                      <Flag className="h-3.5 w-3.5" />
                      <span>Report</span>
                    </button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border text-center py-8">
            <CardContent>
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No comments yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share your thoughts on this discussion
              </p>
              {user && (
                <Button asChild>
                  <a href="#comment-form">Add Comment</a>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {user ? (
        <div id="comment-form" className="bg-card border rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">Leave a Comment</h3>
          <form action={createForumComment}>
            <input type="hidden" name="postId" value={params.id} />
            <div className="space-y-4">
              <Textarea
                name="content"
                placeholder="Share your thoughts on this discussion..."
                rows={4}
                required
                className="min-h-32"
              />
              <div className="flex justify-end">
                <SubmitButton>Post Comment</SubmitButton>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <Card className="border text-center p-6">
          <CardContent className="p-0">
            <h3 className="text-lg font-medium mb-2">Join the conversation</h3>
            <p className="text-muted-foreground mb-6">
              Sign in to share your thoughts and connect with other members
            </p>
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
