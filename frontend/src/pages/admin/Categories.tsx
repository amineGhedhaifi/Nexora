import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CategoryFormDialog } from "@/components/admin/CategoryFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatDate } from "@/lib/format";
import {
  adminCategoriesService,
  type AdminCategory,
} from "@/services/admin-categories.service";
import { getErrorMessage } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  productCount: number;
  createdAt: string;
}

type SortKey = keyof Category;
type SortOrder = "asc" | "desc";

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

function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
}: {
  label: string;
  column: SortKey;
  sortBy: SortKey;
  sortOrder: SortOrder;
  onSort: (column: SortKey) => void;
}) {
  const active = sortBy === column;
  return (
    <th
      scope="col"
      aria-sort={
        active ? (sortOrder === "asc" ? "ascending" : "descending") : "none"
      }
      className="whitespace-nowrap"
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className="flex items-center gap-1 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {label}
        {active &&
          (sortOrder === "asc" ? (
            <ChevronUp className="size-3.5 text-primary" />
          ) : (
            <ChevronDown className="size-3.5 text-primary" />
          ))}
      </button>
    </th>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
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

  // All categories are loaded at once, so search and sorting cover the full list.
  const filteredCategories = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return categories
      .filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.slug.toLowerCase().includes(term),
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
  }, [categories, debouncedSearch, sortBy, sortOrder]);

  const handleSort = (column: SortKey) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const openCreateForm = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await adminCategoriesService.deleteCategory(deleteConfirm.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      // Close the confirmation on success *and* failure, so an error isn't hidden behind the modal.
      setDeleteConfirm(null);
      setDeleting(false);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingCategory(null);
  };

  const handleCategorySave = async (formData: {
    name: string;
    slug: string;
    description: string;
  }) => {
    try {
      if (editingCategory) {
        await adminCategoriesService.updateCategory(
          editingCategory.id,
          formData,
        );
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
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage product categories
          </p>
        </div>
        <Button
          onClick={openCreateForm}
          className="h-11 w-full sm:h-10 sm:w-auto"
        >
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add Category
        </Button>
      </div>

      {error && (
        <div
          className="flex items-start gap-3 rounded-lg border border-destructive bg-destructive/10 p-4 sm:items-center"
          role="alert"
        >
          <AlertCircle
            className="mt-0.5 size-5 shrink-0 text-destructive sm:mt-0"
            aria-hidden="true"
          />
          <p className="min-w-0 flex-1 break-words text-sm text-destructive">
            {error}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="rounded-2xl border bg-card shadow-sm">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b p-4">
          <div className="relative min-w-0">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10"
              aria-label="Search categories"
            />
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <span className="hidden whitespace-nowrap text-sm text-muted-foreground sm:block">
              Sort by:
            </span>
            <Select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as SortKey)}
              className="w-full sm:w-[180px]"
              aria-label="Sort by"
            >
              <option value="name">Name</option>
              <option value="productCount">Product Count</option>
              <option value="createdAt">Date Added</option>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              aria-label={
                sortOrder === "asc" ? "Sort descending" : "Sort ascending"
              }
              className="shrink-0"
            >
              {sortOrder === "asc" ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              className="size-8 animate-spin text-primary"
              aria-hidden="true"
            />
            <span className="sr-only">Loading categories...</span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-accent">
              <Tag
                className="size-6 text-accent-foreground"
                aria-hidden="true"
              />
            </div>
            <h3 className="mt-4 text-lg font-medium">No categories found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "Try adjusting your search"
                : "Get started by adding your first category"}
            </p>
            {search ? (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearch("")}
              >
                Clear Search
              </Button>
            ) : (
              <Button className="mt-4" onClick={openCreateForm}>
                <Plus className="mr-2 size-4" aria-hidden="true" />
                Add Category
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Below lg: one card per category, nothing scrolls sideways */}
            <ul className="divide-y lg:hidden">
              {filteredCategories.map((category) => (
                <li key={category.id} className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words font-medium">{category.name}</p>
                      <p className="break-all font-mono text-xs text-muted-foreground">
                        {category.slug}
                      </p>
                    </div>
                    <Badge
                      variant="neutral"
                      className="shrink-0 whitespace-nowrap"
                    >
                      {category.productCount} product
                      {category.productCount !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {category.description && (
                    <p className="line-clamp-2 break-words text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Added {formatDate(category.createdAt)}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 flex-1"
                      onClick={() => openEditForm(category)}
                      aria-label={`Edit ${category.name}`}
                    >
                      <Edit className="mr-2 size-4" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteConfirm(category)}
                      disabled={deleting}
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 className="mr-2 size-4" aria-hidden="true" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            {/* lg and up: table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full bg-card">
                <thead>
                  <tr className="border-b [&_th]:px-6 [&_th]:py-3 [&_th]:text-left [&_th]:text-sm [&_th]:font-medium [&_th]:text-muted-foreground">
                    <SortableHeader
                      label="Name"
                      column="name"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th scope="col" className="whitespace-nowrap">
                      Slug
                    </th>
                    <SortableHeader
                      label="Products"
                      column="productCount"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Added"
                      column="createdAt"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={handleSort}
                    />
                    <th scope="col" className="whitespace-nowrap !text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_td]:border-b [&_td]:px-6 [&_td]:py-4 [&_td]:text-sm [&_tr:last-child_td]:border-0">
                  {filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="transition-colors hover:bg-accent/50"
                    >
                      <td className="max-w-[240px] truncate font-medium">
                        {category.name}
                      </td>
                      <td className="whitespace-nowrap font-mono text-sm text-muted-foreground">
                        {category.slug}
                      </td>
                      <td className="whitespace-nowrap">
                        <Badge variant="neutral" className="gap-1">
                          <span>{category.productCount}</span>
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap text-muted-foreground">
                        {formatDate(category.createdAt)}
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(category)}
                            aria-label={`Edit ${category.name}`}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(category)}
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
            Are you sure you want to delete "
            <strong>{deleteConfirm?.name}</strong>"?
            {deleteConfirm && deleteConfirm.productCount > 0 && (
              // <span>, not <p>: the description is usually rendered inside a <p> already
              <span className="mt-2 block text-sm text-muted-foreground">
                This category has {deleteConfirm.productCount} product
                {deleteConfirm.productCount !== 1 ? "s" : ""}. Deleting it will
                affect those products.
              </span>
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
