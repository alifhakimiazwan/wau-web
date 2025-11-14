"use client";

import { useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Star, Plus, Trash2, User, Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";
import type { ProductReviewSchema } from "@/lib/products/schemas";

interface ReviewsSectionProps {
  reviews: ProductReviewSchema[];
  onReviewsChange: (reviews: ProductReviewSchema[]) => void;
}

export function ReviewsSection({
  reviews,
  onReviewsChange,
}: ReviewsSectionProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addReview = () => {
    const newReview: ProductReviewSchema = {
      rating: 5,
      customerName: "",
      reviewText: "",
      profileImage: undefined,
    };
    onReviewsChange([...reviews, newReview]);
    setEditingIndex(reviews.length);
  };

  const removeReview = (index: number) => {
    const newReviews = reviews.filter((_, i) => i !== index);
    onReviewsChange(newReviews);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const updateReview = (
    index: number,
    field: keyof ProductReviewSchema,
    value: string | number | undefined
  ) => {
    const newReviews = [...reviews];
    newReviews[index] = { ...newReviews[index], [field]: value };
    onReviewsChange(newReviews);
  };

  const handleProfileImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "product_thumbnail");

    try {
      const { data } = await axios.post("/api/products", formData);

      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      updateReview(index, "profileImage", data.url);
      toast.success("Profile image uploaded successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeProfileImage = (index: number) => {
    updateReview(index, "profileImage", undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <FieldLabel>Product Reviews (Optional)</FieldLabel>
          <FieldDescription>
            Add customer reviews to build trust and credibility
          </FieldDescription>
        </div>
        <Button type="button" onClick={addReview} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Review
        </Button>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p className="text-sm">No reviews added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header with Rating and Delete */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateReview(index, "rating", star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={cn(
                              "w-5 h-5 transition-colors",
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeReview(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>

                  {/* Reviewer Name */}
                  <Field>
                    <Input
                      placeholder="Reviewer name"
                      value={review.customerName}
                      onChange={(e) =>
                        updateReview(index, "customerName", e.target.value)
                      }
                    />
                  </Field>

                  {/* Review Text */}
                  <Field>
                    <Textarea
                      placeholder="Review text"
                      value={review.reviewText}
                      onChange={(e) =>
                        updateReview(index, "reviewText", e.target.value)
                      }
                      rows={3}
                      className="resize-none"
                    />
                  </Field>

                  {/* Profile Image (Optional) */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {uploadingIndex === index ? (
                          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                        ) : review.profileImage ? (
                          <Image
                            src={review.profileImage}
                            alt={review.customerName}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <User className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      {review.profileImage && uploadingIndex !== index && (
                        <button
                          type="button"
                          onClick={() => removeProfileImage(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-800 hover:bg-blue-900 text-white flex items-center justify-center shadow-md transition-colors z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        id={`profile-image-${index}`}
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleProfileImageUpload(index, file);
                          }
                        }}
                        disabled={uploadingIndex === index}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById(`profile-image-${index}`)
                            ?.click()
                        }
                        disabled={uploadingIndex === index}
                      >
                        <Upload className="w-3 h-3 mr-2" />
                        {review.profileImage ? "Change Image" : "Upload Image"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
