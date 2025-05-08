"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createForumPost(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = parseInt(formData.get("categoryId") as string);

  if (!title || !content || !categoryId) {
    // Handle validation error
    console.error("All fields are required");
    return;
  }

  const { error } = await supabase.from("forum_posts").insert({
    title,
    content,
    category_id: categoryId,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating forum post:", error);
    return;
  }

  revalidatePath("/forum");
  redirect("/forum");
}

export async function updateForumPost(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const postId = parseInt(formData.get("postId") as string);
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = parseInt(formData.get("categoryId") as string);

  if (!title || !content || !categoryId || !postId) {
    // Handle validation error
    console.error("All fields are required");
    return;
  }

  // Check if user owns this post
  const { data: post } = await supabase
    .from("forum_posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (!post || post.user_id !== user.id) {
    console.error("Unauthorized: User does not own this post");
    return;
  }

  const { error } = await supabase
    .from("forum_posts")
    .update({
      title,
      content,
      category_id: categoryId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);

  if (error) {
    console.error("Error updating forum post:", error);
    return;
  }

  revalidatePath(`/forum/${postId}`);
  redirect(`/forum/${postId}`);
}

export async function deleteForumPost(postId: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if user owns this post
  const { data: post } = await supabase
    .from("forum_posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (!post || post.user_id !== user.id) {
    return { success: false, error: "Unauthorized: User does not own this post" };
  }

  const { error } = await supabase
    .from("forum_posts")
    .delete()
    .eq("id", postId);

  if (error) {
    console.error("Error deleting forum post:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/forum");
  revalidatePath("/dashboard/forum");
  return { success: true };
}

export async function createForumComment(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const postId = parseInt(formData.get("postId") as string);
  const content = formData.get("content") as string;

  if (!content || !postId) {
    // Handle validation error
    console.error("Comment content is required");
    return;
  }

  const { error } = await supabase.from("forum_comments").insert({
    content,
    post_id: postId,
    user_id: user.id,
  });

  if (error) {
    console.error("Error creating forum comment:", error);
    return;
  }

  revalidatePath(`/forum/${postId}`);
  redirect(`/forum/${postId}`);
}

export async function updateForumComment(commentId: number, content: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  if (!content) {
    return { success: false, error: "Comment content is required" };
  }

  // Check if user owns this comment
  const { data: comment } = await supabase
    .from("forum_comments")
    .select("user_id, post_id")
    .eq("id", commentId)
    .single();

  if (!comment || comment.user_id !== user.id) {
    return { success: false, error: "Unauthorized: User does not own this comment" };
  }

  const { error } = await supabase
    .from("forum_comments")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId);

  if (error) {
    console.error("Error updating forum comment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/forum/${comment.post_id}`);
  return { success: true };
}

export async function deleteForumComment(commentId: number) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if user owns this comment
  const { data: comment } = await supabase
    .from("forum_comments")
    .select("user_id, post_id")
    .eq("id", commentId)
    .single();

  if (!comment || comment.user_id !== user.id) {
    return { success: false, error: "Unauthorized: User does not own this comment" };
  }

  const { error } = await supabase
    .from("forum_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    console.error("Error deleting forum comment:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/forum/${comment.post_id}`);
  return { success: true };
}
