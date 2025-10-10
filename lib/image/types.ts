export interface ImageUploadProps {
    currentImageUrl?: string | null;
    onUploadCompleteAction: (url: string) => void;
    type: "avatar" | "banner";
    storeName?: string;
    storeSlug: string;
  }