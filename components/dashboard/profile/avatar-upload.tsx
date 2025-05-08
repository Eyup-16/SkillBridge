"use client";

import { useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useUserProfile } from "@/contexts/user-profile-context";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
}

export function AvatarUpload({ userId, currentAvatarUrl }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const { toast } = useToast();
  const { updateAvatar, refreshProfile } = useUserProfile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    try {
      if (!fileInputRef.current?.files?.[0]) return;

      setUploading(true);

      const file = fileInputRef.current.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${uuidv4()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("user-avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("user-avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update avatar URL in all profiles using our context
      await updateAvatar(publicUrl);

      setAvatarUrl(publicUrl);
      setPreview(null);

      toast({
        title: "Success",
        description: "Your avatar has been updated successfully.",
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);

      // Remove avatar URL from all profiles using our context
      await updateAvatar(null);

      setAvatarUrl(null);
      setPreview(null);

      toast({
        title: "Success",
        description: "Your avatar has been removed.",
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Error",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Current Avatar or Preview */}
        <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20 relative">
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl text-primary/40">
                {userId.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex flex-col items-center space-y-2 w-full max-w-xs">
          {preview ? (
            <div className="flex space-x-2 w-full">
              <Button
                type="button"
                onClick={uploadAvatar}
                disabled={uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={cancelUpload}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 w-full">
              <input
                type="file"
                id="avatar"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Image
              </Button>

              {avatarUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={removeAvatar}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Remove Avatar
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Supported formats: JPEG, PNG, GIF</p>
        <p>Maximum file size: 5MB</p>
      </div>
    </div>
  );
}
