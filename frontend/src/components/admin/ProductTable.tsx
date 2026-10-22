import { ChevronUp, ChevronDown, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/shared/ProductImage";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  createdAt: string;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  sortBy: keyof Product;
  sortOrder: "asc" | "desc";
}

const fallbackImage = (
  <div className="size-14 rounded-lg bg-muted flex items-center justify-center">
    <Package className="size-6 text-muted-foreground/50" aria-hidden="true" />
  </div>
);

export function ProductTable({ products, onEdit, onDelete, sortBy, sortOrder }: ProductTableProps) {
  const columns: Array<{ key: string; label: string; sortable?: boolean; minWidth: string }> = [
    { key: "image", label: "Image", minWidth: "56px" },
    { key: "name", label: "Product", sortable: true, minWidth: "180px" },
    { key: "categoryName", label: "Category", sortable: true, minWidth: "120px" },
    { key: "price", label: "Price", sortable: true, minWidth: "100px" },
    { key: "stock", label: "Stock", sortable: true, minWidth: "100px" },
    { key: "isActive", label: "Status", minWidth: "100px" },
    { key: "createdAt", label: "Added", sortable: true, minWidth: "120px" },
    { key: "actions", label: "Actions", minWidth: "96px" },
  ];

  const renderSortIcon = (key: string) => {
    if (sortBy !== key) return <ChevronDown className="size-3.5 text-muted-foreground/50" />;
    return sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />;
  };

  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 min-w-0">
      <table className="w-full min-w-[872px] bg-card" role="table">
        <thead>
          <tr className="border-b [&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-muted-foreground">
            {columns.map((col) => (
              <th key={col.key} scope="col" className={cn(col.sortable && "cursor-pointer hover:text-foreground")}>
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && renderSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_td]:border-b [&_tr:last-child_td]:border-0">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-accent/50 transition-colors">
              <td className="whitespace-nowrap">
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="size-14 rounded-lg object-cover"
                  fallback={fallbackImage}
                />
              </td>
              <td className="font-medium max-w-[200px] truncate">{product.name}</td>
              <td className="text-muted-foreground whitespace-nowrap">{product.categoryName}</td>
              <td className="font-medium tabular-nums whitespace-nowrap">{formatCurrency(product.price)}</td>
              <td className={cn("tabular-nums whitespace-nowrap", product.stock < 10 && "text-destructive font-medium")}>
                {product.stock}
                {product.stock < 10 && product.stock > 0 && (
                  <Badge variant="warning" className="ml-1 text-xs">Low</Badge>
                )}
                {product.stock === 0 && <Badge variant="destructive" className="ml-1 text-xs">Out</Badge>}
              </td>
              <td className="whitespace-nowrap">
                <Badge variant={product.isActive ? "success" : "neutral"}>
                  {product.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="text-muted-foreground whitespace-nowrap">{formatDate(product.createdAt)}</td>
              <td className="text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                    aria-label={`Edit ${product.name}`}
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(product)}
                    aria-label={`Delete ${product.name}`}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}