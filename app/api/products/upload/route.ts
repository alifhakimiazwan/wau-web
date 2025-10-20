import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * API Route: Upload Product Files
 * Handles upload of product thumbnails and freebie files
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as "product_thumbnail" | "lead_magnet_file";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!type || !["product_thumbnail", "lead_magnet_file"].includes(type)) {
      return NextResponse.json(
        { success: false, error: "Invalid upload type" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify user has a store
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { success: false, error: "Store not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    // Validate file type and size
    const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const ALLOWED_FILE_TYPES = [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (type === "product_thumbnail") {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed" },
          { status: 400 }
        );
      }

      if (file.size > MAX_THUMBNAIL_SIZE) {
        return NextResponse.json(
          { success: false, error: "File too large. Maximum size is 5MB" },
          { status: 400 }
        );
      }
    } else if (type === "lead_magnet_file") {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: "Invalid file type. Only PDF and ZIP files are allowed" },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: "File too large. Maximum size is 50MB" },
          { status: 400 }
        );
      }
    }

    // Generate file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const folderPath =
      type === "product_thumbnail" ? "products/thumbnails" : "products/files";
    const filePath = `${folderPath}/${user.id}/${fileName}`;

    console.log("Uploading file to path:", filePath);

    // Convert File to ArrayBuffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    console.log("File converted to buffer, uploading to Supabase...");

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("user-uploads")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload file. Please try again." },
        { status: 500 }
      );
    }

    console.log("File uploaded successfully");

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("user-uploads").getPublicUrl(filePath);

    console.log("Public URL generated:", publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      filename: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error("File upload API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during upload",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : String(error)
        }),
      },
      { status: 500 }
    );
  }
}
