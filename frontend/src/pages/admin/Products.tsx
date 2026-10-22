import { useState, useEffect, useCallback } from "react";
import { Plus, Search, ChevronDown, ChevronUp, Package, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ProductTable } from "@/components/admin/ProductTable";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Pagination } from "@/components/ui/pagination";
import { adminProductsService, type AdminProduct } from "@/services/products.service";
import { categoriesService } from "@/services/categories.service";
import { getErrorMessage } from "@/services/api";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<keyof AdminProduct>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
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
      setCategories(cats.map((c) => ({ id: c.id, name: c.name, slug: c.slug })));
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

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || (statusFilter === "active" ? p.isActive : !p.isActive);
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

  const handleDelete = (product: AdminProduct) => {
    setDeleteConfirm(product);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await adminProductsService.deleteProduct(deleteConfirm.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      setTotalProducts((prev) => prev - 1);
      setDeleteConfirm(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setFormOpen(true); }} className="w-full sm:w-auto">
          <Plus className="size-4 mr-2" aria-hidden="true" />
          Add Product
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
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
              aria-label="Search products"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
            <div className="flex-1 sm:flex-none min-w-0">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-[180px]"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </Select>
            </div>

            <div className="flex-1 sm:flex-none min-w-0">
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
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full min-w-0">
              <span className="text-sm text-muted-foreground self-center whitespace-nowrap hidden sm:block">Sort by:</span>
              <div className="flex-1 min-w-0">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as keyof AdminProduct)}
                  className="w-full sm:w-[150px]"
                  aria-label="Sort by"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                  <option value="createdAt">Date Added</option>
                </Select>
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
            <span className="sr-only">Loading products...</span>
          </div>
        ) : (
          <>
            <ProductTable
              products={filteredProducts}
              onEdit={(product) => { setEditingProduct(product); setFormOpen(true); }}
              onDelete={handleDelete}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />

            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <Package className="size-12 text-muted-foreground/50" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-medium">No products found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search || categoryFilter || statusFilter
                    ? "Try adjusting your search or filters"
                    : "Get started by adding your first product"}
                </p>
                {!search && !categoryFilter && !statusFilter && (
                  <Button className="mt-4" onClick={() => setFormOpen(true)}>
                    <Plus className="size-4 mr-2" aria-hidden="true" />
                    Add Product
                  </Button>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="border-t p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredProducts.length} of {totalProducts} product{totalProducts !== 1 ? "s" : ""}
                  </p>
                  <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
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