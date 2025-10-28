"use client";

import { useState, useTransition } from "react";
import {
  Sortable,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Link2,
  Gift,
  ShoppingBag,
  GripVertical,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateProductPositions, deleteProduct } from "@/lib/products/actions";
import { toast } from "sonner";
import type { Database } from "@/types/database.types";
import { Typography } from "@/components/ui/typography";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface SortableProductsListProps {
  initialProducts: Product[];
  onEdit?: (product: Product) => void;
  onPreview?: (product: Product) => void;
}

const productTypeIcons = {
  link: Link2,
  lead_magnet: Gift,
  digital_product: ShoppingBag,
};

const productTypeLabels = {
  link: "Link",
  lead_magnet: "Lead Magnet",
  digital_product: "Digital Product",
};

const productTypeColors = {
  link: "bg-blue-100 text-blue-700 border-blue-200",
  lead_magnet: "bg-purple-100 text-purple-700 border-purple-200",
  digital_product: "bg-green-100 text-green-700 border-green-200",
};

export function SortableProductsList({
  initialProducts,
  onEdit,
  onPreview,
}: SortableProductsListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleValueChange = (newProducts: Product[]) => {
    setProducts(newProducts);

    // Update positions in database
    startTransition(async () => {
      const productIds = newProducts.map((p) => p.id);
      const result = await updateProductPositions(productIds);

      if (!result.success) {
        // Revert on error
        setProducts(products);
        toast.error(result.error || "Failed to update product order");
      } else {
        toast.success("Product order updated");
      }
    });
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    const result = await deleteProduct(productToDelete.id);

    if (result.success) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      toast.success("Product deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete product");
    }

    setIsDeleting(false);
    setProductToDelete(null);
  };

  const getItemValue = (product: Product) => product.id;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
        <Typography variant="h3" font="serif" className="mb-2">
          No products yet
        </Typography>
        <Typography variant="muted" className="max-w-md">
          Create your first product to start building your store. Choose from
          links, lead magnets, or digital products.
        </Typography>
      </div>
    );
  }

  return (
    <>
      <Sortable
        value={products}
        onValueChange={handleValueChange}
        getItemValue={getItemValue}
        strategy="vertical"
        className="space-y-3"
      >
        {products.map((product) => {
          const Icon =
            productTypeIcons[product.type as keyof typeof productTypeIcons];
          const typeLabel =
            productTypeLabels[product.type as keyof typeof productTypeLabels];
          const typeColor =
            productTypeColors[product.type as keyof typeof productTypeColors];

          return (
            <SortableItem key={product.id} value={product.id}>
              <div className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg hover:bg-accent/50 transition-colors">
                {/* Drag Handle */}
                <SortableItemHandle className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
                  <GripVertical className="h-5 w-5" />
                </SortableItemHandle>

                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {product.thumbnail_url ? (
                    <div className="relative w-16 h-16 rounded-md overflow-hidden">
                      <Image
                        src={product.thumbnail_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {/* Type Badge */}
                    <Badge
                      variant="outline"
                      className={`text-xs border ${typeColor}`}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {typeLabel}
                    </Badge>

                    {/* Status Badge */}
                    <Badge
                      variant={
                        product.status === "published" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {product.status === "published" ? (
                        <>
                          <Eye className="h-3 w-3 mr-1" />
                          Published
                        </>
                      ) : (
                        "Draft"
                      )}
                    </Badge>
                  </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(product)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onPreview && (
                      <DropdownMenuItem onClick={() => onPreview(product)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(product)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </SortableItem>
          );
        })}
      </Sortable>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {productToDelete?.name}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
