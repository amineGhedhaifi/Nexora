import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronUp, Tag, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CategoryFormDialog } from "@/components/admin/CategoryFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn } from "@/lib/utils";
import { adminCategoriesService, type AdminCategory } from "@/services/admin-categories.service";
import { getErrorMessage } from "@/services/api";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  createdAt: string;
}

function toCategory(adminCategory: AdminCategory): Category {
  return {
    id: adminCategory.id,
    name: adminCategory.name,
    slug: adminCategory.slug,
    description: adminCategory.description,
    productCount: adminCategory._count.products,
    createdAt: adminCategory.createdAt,
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Category>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const adminCategories = await adminCategoriesService.getAdminCategories();
      setCategories(adminCategories.map(toCategory));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories
    .filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortOrder === "asc" ? -1 : 1;
      if (bVal == null) return sortOrder === "asc" ? 1 : -1;
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleDelete = (category: Category) => {
    setDeleteConfirm(category);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await adminCategoriesService.deleteCategory(deleteConfirm.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCategory(null);
  };

  const handleCategorySave = async (formData: { name: string; slug: string; description: string }) => {
    try {
      if (editingCategory) {
        await adminCategoriesService.updateCategory(editingCategory.id, formData);
      } else {
        await adminCategoriesService.createCategory(formData);
      }
      // Refresh the category list
      fetchCategories();
      handleFormClose();
    } catch (err) {
      setError(getErrorMessage(err));
      throw err; // Re-throw so the dialog can handle it
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

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 flex items-center gap-3" role="alert">
          <AlertCircle className="size-5 text-destructive shrink-0" aria-hidden="true" />
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      )}

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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            <span className="sr-only">Loading categories...</span>
          </div>
        ) : (
          <>
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
                        <Badge variant="neutral" className="gap-1">
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
                            disabled={deleting}
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
          </>
        )}
      </div>

      <CategoryFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSave={handleCategorySave}
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
        disabled={deleting}
      />
    </div>
  );
}