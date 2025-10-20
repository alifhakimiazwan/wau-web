import { NextResponse } from "next/server";
import { createLeadMagnetProduct } from "@/lib/products/actions";

/**
 * API Route: Create Product
 * Handles creation of different product types
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...productData } = body;

    // Route to appropriate product creation handler
    if (type === "lead_magnet") {
      const result = await createLeadMagnetProduct(productData);

      if (!result.success) {
        const status = result.error?.includes("authenticated") ? 401 :
                       result.error?.includes("not found") ? 404 : 400;
        return NextResponse.json(result, { status });
      }

      return NextResponse.json({
        success: true,
        product: result.data,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid product type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Create product API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : String(error)
        }),
      },
      { status: 500 }
    );
  }
}
