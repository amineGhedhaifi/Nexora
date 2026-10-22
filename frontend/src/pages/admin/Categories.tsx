import { useState } from "react";
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronUp, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CategoryFormDialog } from "@/components/admin/CategoryFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  createdAt: string;
}

const mockCategories: Category[] = [
  { id: "1", name: "Electronics", slug: "electronics", description: "Electronic devices and accessories", productCount: 42, createdAt: "2024-01-15" },
  { id: "2", name: "Accessories", slug: "accessories", description: "Fashion and lifestyle accessories", productCount: 28, createdAt: "2024-01-20" },
  { id: "3", name: "Clothing", slug: "clothing", description: "Apparel and wearables", productCount: 56, createdAt: "2024-02-10" },
  { id: "4", name: "Home & Kitchen", slug: "home-kitchen", description: "Home decor and kitchen essentials", productCount: 67, createdAt: "2024-02-28" },
  { id: "5", name: "Sports & Fitness", slug: "sports-fitness", description: "Sports equipment and fitness gear", productCount: 34, createdAt: "2024-03-15" },
  { id: "6", name: "Books & Media", slug: "books-media", description: "Books, movies, and digital media", productCount: 12, createdAt: "2024-04-05" },
  { id: "7", name: "Beauty & Personal Care", slug: "beauty-personal-care", description: "Cosmetics and personal care products", productCount: 23, createdAt: "2024-05-12" },
  { id: "8", name: "Toys & Games", slug: "toys-games", description: "Toys, games, and collectibles", productCount: 19, createdAt: "2024-06-20" },
];

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Category>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

  const filteredCategories = mockCategories
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleDelete = (category: Category) => {
    setDeleteConfirm(category);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage product categories</p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setFormOpen(true); }} className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" aria-hidden="true" />
          Add Category
        </Button>
      </div>

      <div className="rounded-2xl border bg-card shadow-sm">
        <div className="p-4 border-b flex flex-col gap-4">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
              aria-label="Search categories"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
            <div className="flex-1 sm:flex-none min-w-0">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as keyof Category)}
                className="mt-1.5 block w-full sm:w-[180px] h-9 rounded-lg border border-input bg-background px-3 pr-8 text-sm appearance-none focus-visible:outline-2 focus-visible:outline-ring"
                aria-label="Sort by"
              >
                <option value="name">Name</option>
                <option value="productCount">Product Count</option>
                <option value="createdAt">Date Added</option>
              </select>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              aria-label={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
              className="shrink-0"
            >
              {sortOrder === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 min-w-0">
          <table className="w-full min-w-[680px] bg-card" role="table">
            <thead>
              <tr className="border-b [&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-muted-foreground">
                <th scope="col" className={cn("cursor-pointer hover:text-foreground", sortBy === "name" && "")}>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    Name
                    {sortBy === "name" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className="whitespace-nowrap">Slug</th>
                <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap", sortBy === "productCount" && "")}>
                  <div className="flex items-center gap-1">
                    Products
                    {sortBy === "productCount" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className={cn("cursor-pointer hover:text-foreground whitespace-nowrap", sortBy === "createdAt" && "")}>
                  <div className="flex items-center gap-1">
                    Added
                    {sortBy === "createdAt" && (sortOrder === "asc" ? <ChevronUp className="size-3.5 text-primary" /> : <ChevronDown className="size-3.5 text-primary" />)}
                  </div>
                </th>
                <th scope="col" className="text-right pr-6 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_td]:border-b [&_tr:last-child_td]:border-0">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-accent/50 transition-colors">
                  <td className="font-medium max-w-[200px] truncate">{category.name}</td>
                  <td className="font-mono text-sm text-muted-foreground whitespace-nowrap">{category.slug}</td>
                  <td className="whitespace-nowrap">
                    <Badge variant="secondary" className="gap-1">
                      <span>{category.productCount}</span>
                    </Badge>
                  </td>
                  <td className="text-muted-foreground whitespace-nowrap">{new Date(category.createdAt).toLocaleDateString()}</td>
                  <td className="text-right pr-6 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditingCategory(category); setFormOpen(true); }}
                        aria-label={`Edit ${category.name}`}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category)}
                        aria-label={`Delete ${category.name}`}
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

        {filteredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="size-12 rounded-full bg-accent flex items-center justify-center">
              <Tag className="size-6 text-accent-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No categories found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Try adjusting your search" : "Get started by adding your first category"}
            </p>
            {!search && (
              <Button className="mt-4" onClick={() => setFormOpen(true)}>
                <Plus className="size-4 mr-2" aria-hidden="true" />
                Add Category
              </Button>
            )}
          </div>
        )}
      </div>

      <CategoryFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingCategory(null); }}
        category={editingCategory}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        description={
          <>
            Are you sure you want to delete "<strong>{deleteConfirm?.name}</strong>"?
            {deleteConfirm && deleteConfirm.productCount > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                This category has {deleteConfirm.productCount} product{deleteConfirm.productCount !== 1 ? "s" : ""}. 
                Deleting it will affect those products.
              </p>
            )}
          </>
        }
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
}