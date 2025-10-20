interface CompressImageOptions {
    maxWidth: number;
    maxHeight: number;
    quality?: number;
  }
  
  export async function compressImage(
    file: File,
    options: CompressImageOptions
  ): Promise<File> {
    const { maxWidth, maxHeight, quality = 0.8 } = options;
  
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const img = new Image();
  
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;
  
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
  
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
  
          // Create canvas
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }
  
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
  
          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create blob"));
                return;
              }
  
              // Create new file
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
  
              resolve(compressedFile);
            },
            "image/jpeg",
            quality
          );
        };
  
        img.onerror = () => {
          reject(new Error("Failed to load image"));
        };
  
        img.src = e.target?.result as string;
      };
  
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
  
      reader.readAsDataURL(file);
    });
  }
  
  // Helper: Get file size in MB
  export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }
  
  // Helper: Validate image dimensions
  export async function validateImageDimensions(
    file: File,
    minWidth: number,
    minHeight: number
  ): Promise<{ valid: boolean; message?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
  
      reader.onload = (e) => {
        const img = new Image();
  
        img.onload = () => {
          if (img.width < minWidth || img.height < minHeight) {
            resolve({
              valid: false,
              message: `Image must be at least ${minWidth}x${minHeight}px`,
            });
          } else {
            resolve({ valid: true });
          }
        };
  
        img.onerror = () => {
          resolve({ valid: false, message: "Invalid image file" });
        };
  
        img.src = e.target?.result as string;
      };
  
      reader.onerror = () => {
        resolve({ valid: false, message: "Failed to read file" });
      };
  
      reader.readAsDataURL(file);
    });
  }

  