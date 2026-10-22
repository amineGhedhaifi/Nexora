import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";

interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  } | null;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
}

const initialFormData: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
};

export function CategoryFormDialog({
  open,
  onClose,
  category,
}: CategoryFormDialogProps) {
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [category, open]);

  const validate = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {};
    if (!formData.name.trim()) newErrors.name = "Category name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(formData.slug))
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitting(false);
    onClose();
  };

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md max-h-[90vh] overflow-y-auto sm:p-0 p-4">
        <DialogHeader className="px-6 py-6 border-b">
          <DialogTitle className="text-xl sm:text-lg">
            {category ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {category
              ? "Update the category details below."
              : "Fill in the details below to add a new category."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Category Name"
              htmlFor="category-name"
              error={errors.name}
            >
              <Input
                id="category-name"
                value={formData.name}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, name: e.target.value }));
                  if (!formData.slug || category === null) generateSlug();
                }}
                onBlur={generateSlug}
                autoComplete="off"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "category-name-error" : undefined}
              />
            </FormField>

            <FormField
              label="Slug"
              htmlFor="category-slug"
              error={errors.slug}
              hint="URL-friendly identifier. Auto-generated from name. Use lowercase letters, numbers, and hyphens only."
            >
              <Input
                id="category-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                aria-invalid={!!errors.slug}
                aria-describedby={errors.slug ? "category-slug-error" : undefined}
              />
            </FormField>
          </div>

          <FormField
            label="Description (Optional)"
            htmlFor="category-description"
          >
            <Textarea
              id="category-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              placeholder="Brief description of this category"
            />
          </FormField>

          <DialogFooter className="border-t pt-4 flex-col sm:flex-row-reverse gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting} className="w-full sm:w-auto">
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : category ? (
                "Update Category"
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
