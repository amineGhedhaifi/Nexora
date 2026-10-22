import { useEffect, useState, useRef } from "react";
import { Loader2, Image as ImageIcon, Upload, X, FileImage } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProductImage } from "@/components/shared/ProductImage";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

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

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  imageFile: File | null;
  categoryId: string;
  isActive: boolean;
}

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (product: Product) => void;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    categoryId: string;
    isActive: boolean;
  } | null;
  categories: Category[];
}

const initialFormData: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  imageFile: null,
  categoryId: "",
  isActive: true,
};

export function ProductFormDialog({ open, onClose, onSave, product, categories }: ProductFormDialogProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        imageUrl: product.imageUrl,
        imageFile: null,
        categoryId: product.categoryId,
        isActive: product.isActive,
      });
      setImagePreview(product.imageUrl);
    } else {
      setFormData(initialFormData);
      setImagePreview(null);
    }
    setErrors({});
  }, [product, open]);

  const validate = (): boolean => {
    const newErrors: Partial<ProductFormData> = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Valid price is required";
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = "Valid stock quantity is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.imageUrl.trim() && !formData.imageFile) newErrors.imageUrl = "Image is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    
    // Create FormData for file upload
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("name", formData.name);
    formDataToSubmit.append("slug", formData.slug);
    formDataToSubmit.append("description", formData.description);
    formDataToSubmit.append("price", formData.price);
    formDataToSubmit.append("stock", formData.stock);
    formDataToSubmit.append("categoryId", formData.categoryId);
    formDataToSubmit.append("isActive", formData.isActive.toString());
    if (formData.imageFile) {
      formDataToSubmit.append("image", formData.imageFile);
    } else if (formData.imageUrl) {
      formDataToSubmit.append("imageUrl", formData.imageUrl);
    }
    
    // In real app: await createProduct(formDataToSubmit) or updateProduct(id, formDataToSubmit)
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Create product object for local state update
    const savedProduct: Product = {
      id: product?.id || crypto.randomUUID(),
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      imageUrl: formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl,
      categoryId: formData.categoryId,
      categoryName: categories.find(c => c.id === formData.categoryId)?.name || "",
      isActive: formData.isActive,
      createdAt: product?.createdAt || new Date().toISOString().split("T")[0],
    };
    
    setSubmitting(false);
    if (onSave) {
      onSave(savedProduct);
    } else {
      onClose();
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, imageUrl: "Please select an image file" }));
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, imageUrl: "Image must be less than 5MB" }));
      return;
    }
    
    setFormData((prev) => ({ ...prev, imageFile: file, imageUrl: "" }));
    setErrors((prev) => ({ ...prev, imageUrl: undefined }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0] || null;
    handleFileSelect(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, imageFile: null, imageUrl: "" }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-[48rem] lg:max-w-[56rem] max-h-[90vh] overflow-y-auto sm:p-0 p-4">
        <DialogHeader className="px-6 sm:px-6 lg:px-8 py-6 border-b">
          <DialogTitle className="text-xl sm:text-lg">{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription className="text-sm">
            {product
              ? "Update the product details below."
              : "Fill in the details below to add a new product to your catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-6 lg:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Product Name"
              htmlFor="product-name"
              error={errors.name}
            >
              <Input
                id="product-name"
                value={formData.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setFormData((prev) => ({ ...prev, name: newName }));
                  if (!formData.slug || product === null) generateSlug(newName);
                }}
                onBlur={() => generateSlug(formData.name)}
                autoComplete="off"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "product-name-error" : undefined}
              />
            </FormField>

            <FormField
              label="Slug"
              htmlFor="product-slug"
              error={errors.slug}
              hint="URL-friendly identifier. Auto-generated from name."
            >
              <Input
                id="product-slug"
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                aria-invalid={!!errors.slug}
                aria-describedby={errors.slug ? "product-slug-error" : undefined}
              />
            </FormField>
          </div>

          <FormField
            label="Description"
            htmlFor="product-description"
            error={errors.description}
          >
            <Textarea
              id="product-description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "product-description-error" : undefined}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField
              label="Price ($)"
              htmlFor="product-price"
              error={errors.price}
            >
              <Input
                id="product-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                aria-invalid={!!errors.price}
                aria-describedby={errors.price ? "product-price-error" : undefined}
              />
            </FormField>

            <FormField
              label="Stock Quantity"
              htmlFor="product-stock"
              error={errors.stock}
            >
              <Input
                id="product-stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                aria-invalid={!!errors.stock}
                aria-describedby={errors.stock ? "product-stock-error" : undefined}
              />
            </FormField>

            <FormField
              label="Category"
              htmlFor="product-category"
              error={errors.categoryId}
            >
              <Select
                id="product-category"
                value={formData.categoryId}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                aria-invalid={!!errors.categoryId}
                aria-describedby={errors.categoryId ? "product-category-error" : undefined}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField
            label="Product Image"
            htmlFor="product-image"
            error={errors.imageUrl}
            hint="Upload an image (max 5MB). Supported formats: JPG, PNG, WebP"
          >
            <div className="space-y-3">
              <div
                className={cn(
                  "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent/50",
                  formData.imageFile || formData.imageUrl ? "border-transparent bg-transparent p-0" : ""
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
              >
                <input
                  ref={fileInputRef}
                  id="product-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Upload product image"
                  disabled={submitting}
                />
                
                {(formData.imageFile || formData.imageUrl) && imagePreview ? (
                  <div className="relative w-full max-w-xs">
                    <ProductImage
                      src={imagePreview}
                      alt={formData.name || "Product preview"}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2"
                      onClick={(e) => { e.stopPropagation(); removeImage(); }}
                      aria-label="Remove image"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className={cn("size-12 rounded-full flex items-center justify-center", dragActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                      <Upload className="size-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-medium">Drag & drop an image here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WebP up to 5MB</p>
                  </div>
                )}
              </div>
              
              {errors.imageUrl && (
                <p className="text-sm text-destructive" role="alert">{errors.imageUrl}</p>
              )}
            </div>
          </FormField>

          <FormField
            label="Status"
            htmlFor="product-status"
          >
            <div className="flex items-center gap-3">
              <Switch
                id="product-status"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="product-status" className="mb-0 cursor-pointer text-sm">
                {formData.isActive ? "Active (visible in store)" : "Inactive (hidden from store)"}
              </Label>
            </div>
          </FormField>

          <DialogFooter className="border-t pt-4 flex-col sm:flex-row-reverse gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting} className="w-full sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}