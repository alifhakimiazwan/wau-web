import type { Database } from "@/types/database.types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type ProductType = "link" | "lead_magnet" | "digital_product";
export type ProductStatus = "draft" | "published";

// Base product config shared across all product types
export interface BaseProductConfig {
  subtitle?: string;
  buttonText?: string;
  thumbnail?: string;
  successMessage?: string;
}

// Lead Magnet specific config
export interface LeadMagnetConfig extends BaseProductConfig {
  customerFields: {
    email: boolean;
    name: boolean;
    phone: boolean;
  };
  freebieType: "link" | "file";
  freebieLink?: {
    url: string;
    title: string;
  };
  freebieFile?: {
    url: string;
    filename: string;
    size: number;
  };
}

// Form data types
export interface LeadMagnetFormData {
  name: string;
  subtitle?: string;
  buttonText?: string;
  thumbnail?: string;
  customerFields: {
    email: boolean;
    name: boolean;
    phone: boolean;
  };
  freebieType: "link" | "file";
  freebieLink?: {
    url: string;
    title: string;
  };
  freebieFile?: File;
  successMessage?: string;
}
