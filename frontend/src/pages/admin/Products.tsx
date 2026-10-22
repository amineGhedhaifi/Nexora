import { useState } from "react";
import { Plus, Search, ChevronDown, ChevronUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ProductTable } from "@/components/admin/ProductTable";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  categoryId: string;
  categoryName: string;
  createdAt: string;
}

const mockProducts: Product[] = [
  { id: "1", name: "Wireless Noise-Canceling Headphones", slug: "wireless-headphones", description: "Premium wireless headphones with active noise cancellation", price: 299.99, stock: 45, imageUrl: "/images/headphones.jpg", isActive: true, categoryId: "1", categoryName: "Electronics", createdAt: "2024-01-15" },
  { id: "2", name: "Premium Leather Messenger Bag", slug: "leather-messenger-bag", description: "Handcrafted leather messenger bag for professionals", price: 249.00, stock: 23, imageUrl: "/images/bag.jpg", isActive: true, categoryId: "2", categoryName: "Accessories", createdAt: "2024-02-20" },
  { id: "3", name: "Organic Cotton T-Shirt (3-pack)", slug: "organic-cotton-tshirt-3pack", description: "Soft organic cotton t-shirts in a 3-pack", price: 49.99, stock: 120, imageUrl: "/images/tshirt.jpg", isActive: true, categoryId: "3", categoryName: "Clothing", createdAt: "2024-03-10" },
  { id: "4", name: "Stainless Steel Water Bottle", slug: "stainless-water-bottle", description: "Insulated stainless steel water bottle, keeps drinks cold for 24h", price: 29.99, stock: 89, imageUrl: "/images/bottle.jpg", isActive: true, categoryId: "4", categoryName: "Home & Kitchen", createdAt: "2024-04-05" },
  { id: "5", name: "Bluetooth Mechanical Keyboard", slug: "bluetooth-mechanical-keyboard", description: "RGB backlit mechanical keyboard with Bluetooth 5.0", price: 149.99, stock: 34, imageUrl: "/images/keyboard.jpg", isActive: true, categoryId: "1", categoryName: "Electronics", createdAt: "2024-05-12" },
  { id: "6", name: "Minimalist Desk Lamp", slug: "minimalist-desk-lamp", description: "Adjustable LED desk lamp with touch controls", price: 59.99, stock: 67, imageUrl: "/images/lamp.jpg", isActive: false, categoryId: "4", categoryName: "Home & Kitchen", createdAt: "2024-06-18" },
  { id: "7", name: "Yoga Mat Premium", slug: "yoga-mat-premium", description: "Non-slip premium yoga mat with carrying strap", price: 39.99, stock: 156, imageUrl: "/images/yoga.jpg", isActive: true, categoryId: "5", categoryName: "Sports & Fitness", createdAt: "2024-07-22" },
  { id: "8", name: "Ceramic Coffee Mug Set (4)", slug: "ceramic-coffee-mug-set", description: "Hand-glazed ceramic mugs, set of 4", price: 34.99, stock: 78, imageUrl: "/images/mugs.jpg", isActive: true, categoryId: "4", categoryName: "Home & Kitchen", createdAt: "2024-08-30" },
];

const categories = [
  { id: "1", name: "Electronics" },
  { id: "2", name: "Accessories" },
  { id: "3", name: "Clothing" },
  { id: "4", name: "Home & Kitchen" },
  { id: "5", name: "Sports & Fitness" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState<keyof Product>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      const matchesStatus = !statusFilter || (statusFilter === "active" ? p.isActive : !p.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleDelete = (product: Product) => {
    setDeleteConfirm(product);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleProductSave = (savedProduct: Product) => {
    if (editingProduct) {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? savedProduct : p))
      );
    } else {
      // Add new product
      setProducts((prev) => [savedProduct, ...prev]);
    }
    handleFormClose();
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
                onValueChange={setCategoryFilter}
                className="w-full sm:w-[180px]"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>

            <div className="flex-1 sm:flex-none min-w-0">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
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
                  onValueChange={setSortBy}
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
      />
    </div>
  );
}