"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ServiceFormProps {
  categories: any[];
  onSubmit: (formData: any) => Promise<void>;
  initialData: any | null;
}

export function ServiceForm({ categories, onSubmit, initialData }: ServiceFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category_id: initialData?.category_id?.toString() || "",
    price: initialData?.price?.toString() || "",
    is_hourly: initialData?.is_hourly ?? true,
    min_duration: initialData?.min_duration?.toString() || "60",
    max_duration: initialData?.max_duration?.toString() || "120",
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>(
    initialData?.service_images || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_hourly: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: File[] = [];
    const newPreviewUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      if (!file.type.startsWith("image/")) {
        continue;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }
      
      newImages.push(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPreviewUrls.push(event.target.result as string);
          if (newPreviewUrls.length === newImages.length) {
            setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
          }
        }
      };
      reader.readAsDataURL(file);
    }

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validate form data
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }
      
      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }
      
      if (!formData.category_id) {
        throw new Error("Category is required");
      }
      
      if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) < 0) {
        throw new Error("Valid price is required");
      }
      
      // Prepare data for submission
      const submissionData = {
        ...formData,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        min_duration: formData.min_duration ? parseInt(formData.min_duration) : null,
        max_duration: formData.max_duration ? parseInt(formData.max_duration) : null,
        images,
        existingImages,
      };
      
      await onSubmit(submissionData);
    } catch (error: any) {
      console.error("Form validation error:", error);
      alert(error.message || "An error occurred. Please check your form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Provide the basic details about your service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Service Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Professional Plumbing Service"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category_id">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => handleSelectChange("category_id", value)}
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
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your service in detail..."
              rows={6}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & Duration</CardTitle>
          <CardDescription>
            Set your service pricing and duration details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_hourly"
                checked={formData.is_hourly}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="is_hourly">Hourly Rate</Label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_duration">Minimum Duration (minutes)</Label>
              <Input
                id="min_duration"
                name="min_duration"
                type="number"
                min="0"
                value={formData.min_duration}
                onChange={handleChange}
                placeholder="60"
              />
            </div>
            
            <div>
              <Label htmlFor="max_duration">Maximum Duration (minutes)</Label>
              <Input
                id="max_duration"
                name="max_duration"
                type="number"
                min="0"
                value={formData.max_duration}
                onChange={handleChange}
                placeholder="120"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Images</CardTitle>
          <CardDescription>
            Upload images showcasing your service (first image will be the primary image)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing images */}
          {existingImages.length > 0 && (
            <div>
              <Label>Current Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                {existingImages.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square rounded-md overflow-hidden border bg-muted">
                      <img
                        src={image.image_url}
                        alt={`Service image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeExistingImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {image.is_primary && (
                      <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* New images */}
          {imagePreviewUrls.length > 0 && (
            <div>
              <Label>New Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-md overflow-hidden border bg-muted">
                      <img
                        src={url}
                        alt={`New image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    {index === 0 && existingImages.length === 0 && (
                      <span className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Image upload */}
          <div>
            <input
              type="file"
              id="images"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Images
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Supported formats: JPEG, PNG, GIF</p>
            <p>Maximum file size: 5MB per image</p>
            <p>Recommended size: 1200 x 800 pixels</p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {initialData ? "Updating..." : "Creating..."}
          </>
        ) : (
          initialData ? "Update Service" : "Create Service"
        )}
      </Button>
    </form>
  );
}
