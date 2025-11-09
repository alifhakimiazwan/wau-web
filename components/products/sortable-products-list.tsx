"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  Trash2,
  Eye,
  Package,
  LayoutList,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateProductPositions,
  deleteProduct,
  updateSection,
  deleteSection,
} from "@/lib/products/actions";
import { toast } from "sonner";
import type { Database } from "@/types/database.types";
import { Typography } from "@/components/ui/typography";
import { isSection } from "@/lib/products/types";

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
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [sectionToEdit, setSectionToEdit] = useState<Product | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingSection, setIsEditingSection] = useState(false);

  // Helper function to get edit route based on product type
  const getEditRoute = (product: Product): string => {
    if (!product.type) return "/store/products";

    const routes = {
      link: `/store/products/links/${product.id}`,
      lead_magnet: `/store/products/lead-magnet/${product.id}`,
      digital_product: `/store/products/digital-product/${product.id}`,
    };

    return routes[product.type as keyof typeof routes] || "/store/products";
  };

  // Handle product card click to edit
  const handleProductClick = (product: Product) => {
    if (isSection(product)) return; // Don't navigate for sections
    router.push(getEditRoute(product));
  };

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
        router.refresh(); // Refresh server data
      }
    });
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);

    // Check if it's a section or product
    const isItemSection = isSection(productToDelete);
    const result = isItemSection
      ? await deleteSection(productToDelete.id)
      : await deleteProduct(productToDelete.id);

    if (result.success) {
      toast.success(
        isItemSection
          ? "Section deleted successfully"
          : "Product deleted successfully"
      );
      setProductToDelete(null);
      setIsDeleting(false);
      router.refresh(); // Refresh server data
    } else {
      toast.error(
        result.error ||
          `Failed to delete ${isItemSection ? "section" : "product"}`
      );
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleEditSection = (section: Product) => {
    setSectionToEdit(section);
    setSectionTitle(section.name);
  };

  const confirmEditSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionToEdit) return;

    setIsEditingSection(true);
    const result = await updateSection(sectionToEdit.id, sectionTitle);

    if (result.success) {
      toast.success("Section updated successfully");
      setSectionToEdit(null);
      setSectionTitle("");
      setIsEditingSection(false);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update section");
      setIsEditingSection(false);
    }
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
          // Check if this is a section
          const itemIsSection = isSection(product);

          if (itemIsSection) {
            // Render section header
            return (
              <SortableItem key={product.id} value={product.id}>
                <div className="flex items-center gap-4 p-3 bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors">
                  {/* Drag Handle */}
                  <SortableItemHandle className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5" />
                  </SortableItemHandle>

                  {/* Section Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-md bg-background flex items-center justify-center">
                      <LayoutList className="h-5 w-5 text-primary" />
                    </div>
                  </div>

                  {/* Section Title */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">Section</p>
                  </div>

                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleEditSection(product)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
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
          }

          // Render regular product
          const Icon =
            productTypeIcons[product.type as keyof typeof productTypeIcons];
          const typeLabel =
            productTypeLabels[product.type as keyof typeof productTypeLabels];
          const typeColor =
            productTypeColors[product.type as keyof typeof productTypeColors];

          return (
            <SortableItem key={product.id} value={product.id}>
              <div
                className="flex items-center gap-4 p-4 bg-background border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {/* Drag Handle */}
                <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                  <SortableItemHandle
                    className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="h-5 w-5" />
                  </SortableItemHandle>
                </div>

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
                <div onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleProductClick(product)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
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
            <AlertDialogTitle>
              Delete{" "}
              {productToDelete && isSection(productToDelete)
                ? "Section"
                : "Product"}
              ?
            </AlertDialogTitle>
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

      {/* Edit Section Dialog */}
      <Dialog
        open={!!sectionToEdit}
        onOpenChange={(open) => !open && setSectionToEdit(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>Update the section title</DialogDescription>
          </DialogHeader>
          <form onSubmit={confirmEditSection}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Section Title</Label>
                <Input
                  id="edit-title"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  maxLength={100}
                  disabled={isEditingSection}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSectionToEdit(null)}
                disabled={isEditingSection}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isEditingSection}>
                {isEditingSection ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
