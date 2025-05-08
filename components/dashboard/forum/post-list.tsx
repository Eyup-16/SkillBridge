"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit, Trash, Eye, MessageSquare, Calendar } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PostListProps {
  posts: any[];
  isLoading: boolean;
  onDelete: (postId: number) => Promise<void>;
}

export function PostList({ posts, isLoading, onDelete }: PostListProps) {
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

  const handleDelete = async (postId: number) => {
    setDeletingPostId(postId);
    try {
      await onDelete(postId);
    } finally {
      setDeletingPostId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="font-medium mb-2">No forum posts found</h3>
        <p className="text-muted-foreground mb-6">
          You haven't created any forum posts yet.
        </p>
        <Button asChild>
          <Link href="/forum/new">
            Create Your First Post
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden hover:shadow-md transition-all">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <Badge variant="outline">
                      {post.forum_categories?.name || "Uncategorized"}
                    </Badge>
                    {post.is_pinned && (
                      <Badge variant="secondary">Pinned</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {post.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5 mr-1" />
                      <span>{post.comment_count} comments</span>
                    </div>
                    
                    {post.view_count !== undefined && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span>{post.view_count} views</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="border-t p-4 bg-muted/20 flex flex-wrap gap-2 justify-end">
              <Button asChild variant="outline" size="sm">
                <Link href={`/forum/post/${post.id}`}>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  View
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="sm">
                <Link href={`/forum/edit/${post.id}`}>
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Link>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Forum Post</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this forum post? This action cannot be undone.
                      All comments on this post will also be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingPostId === post.id}
                    >
                      {deletingPostId === post.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
