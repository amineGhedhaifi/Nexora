import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Package,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductTable } from "@/components/admin/ProductTable";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  adminProductsService,
  type AdminProduct,
} from "@/services/products.service";
import { categoriesService } from "@/services/categories.service";
import { getErrorMessage } from "@/services/api";
import { useDebounce } from "@/hooks/useDebounce";

interface Category {
  id: string;
  name: string;
  slug: string;
}

type SortKey = keyof AdminProduct;
type SortOrder = "asc" | "desc";

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [deleteConfirm, setDeleteConfirm] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 10;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminProductsService.getProducts({
        page,
        limit,
        category: categoryFilter || undefined,
      });
      setProducts(response.items);
      setTotalPages(response.totalPages);
      setTotalProducts(response.total);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await categoriesService.getAll();
      setCategories(
        cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
      );
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, [fetchCategories]);

  // Search, status and sorting only apply to the products on the current page
  // (only the category filter is sent to the API).
  const filteredProducts = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term);
        const matchesStatus =
          !statusFilter ||
          (statusFilter === "active" ? p.isActive : !p.isActive);
        return matchesSearch && matchesStatus;
      })
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
  }, [products, debouncedSearch, statusFilter, sortBy, sortOrder]);

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1); // a new filter can have fewer pages than the current one
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    if (categoryFilter) handleCategoryFilterChange("");
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEditForm = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await adminProductsService.deleteProduct(deleteConfirm.id);
      // Reload so page counts stay correct; step back if we just emptied the last page.
      if (products.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchProducts();
      }
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
    setEditingProduct(null);
  };

  const handleProductSave = async (formData: FormData) => {
    try {
      if (editingProduct) {
        await adminProductsService.updateProduct(editingProduct.id, formData);
      } else {
        await adminProductsService.createProduct(formData);
      }
      // Refresh the product list
      fetchProducts();
      handleFormClose();
    } catch (err) {
      setError(getErrorMessage(err));
      throw err; // Re-throw so the dialog can handle it
    }
  };

  const hasFilters = Boolean(search || categoryFilter || statusFilter);

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Button
          onClick={openCreateForm}
          className="h-11 w-full sm:h-10 sm:w-auto"
        >
          <Plus className="mr-2 size-4" aria-hidden="true" />
          Add Product
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
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10"
              aria-label="Search products"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
            <Select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
              className="w-full sm:w-[180px]"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-[150px]"
              aria-label="Filter by status"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>

            <div className="col-span-2 flex min-w-0 items-center gap-2 sm:col-span-1">
              <span className="hidden whitespace-nowrap text-sm text-muted-foreground sm:block">
                Sort by:
              </span>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="w-full sm:w-[150px]"
                aria-label="Sort by"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stock">Stock</option>
                <option value="createdAt">Date Added</option>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
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
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2
              className="size-8 animate-spin text-primary"
              aria-hidden="true"
            />
            <span className="sr-only">Loading products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <Package
              className="size-12 text-muted-foreground/50"
              aria-hidden="true"
            />
            <h3 className="mt-4 text-lg font-medium">No products found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasFilters
                ? "Try adjusting your search or filters"
                : "Get started by adding your first product"}
            </p>
            {hasFilters ? (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button className="mt-4" onClick={openCreateForm}>
                <Plus className="mr-2 size-4" aria-hidden="true" />
                Add Product
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Below lg: one card per product, nothing scrolls sideways */}
            <ul className="divide-y lg:hidden">
              {filteredProducts.map((product) => {
                const outOfStock = Number(product.stock) <= 0;
                return (
                  <li key={product.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-medium">
                          {product.name}
                        </p>
                        <p className="break-all font-mono text-xs text-muted-foreground">
                          {product.slug}
                        </p>
                      </div>
                      <Badge
                        variant={product.isActive ? "success" : "neutral"}
                        className="shrink-0"
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <dl className="grid grid-cols-3 gap-2 text-sm">
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Price</dt>
                        <dd className="mt-0.5 break-words font-medium tabular-nums">
                          {formatCurrency(Number(product.price))}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Stock</dt>
                        <dd
                          className={
                            outOfStock
                              ? "mt-0.5 font-medium text-destructive"
                              : "mt-0.5 tabular-nums"
                          }
                        >
                          {outOfStock ? "Out of stock" : product.stock}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Added</dt>
                        <dd className="mt-0.5 break-words">
                          {formatDate(product.createdAt)}
                        </dd>
                      </div>
                    </dl>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 flex-1"
                        onClick={() => openEditForm(product)}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Edit className="mr-2 size-4" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteConfirm(product)}
                        disabled={deleting}
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 className="mr-2 size-4" aria-hidden="true" />
                        Delete
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* lg and up: your existing table component */}
            <div className="hidden lg:block">
              <ProductTable
                products={filteredProducts}
                onEdit={openEditForm}
                onDelete={setDeleteConfirm}
                sortBy={sortBy}
                sortOrder={sortOrder}
              />
            </div>

            {totalPages > 1 && (
              <div className="border-t p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredProducts.length} of {totalProducts} product
                    {totalProducts !== 1 ? "s" : ""}
                  </p>
                  <div className="overflow-x-auto">
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ProductFormDialog
        open={formOpen}
        onClose={handleFormClose}
        onSave={handleProductSave}
        product={editingProduct}
        categories={categories}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        disabled={deleting}
      />
    </div>
  );
}
