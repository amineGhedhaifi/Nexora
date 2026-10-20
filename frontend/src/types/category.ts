/** Matches GET /api/categories. */
export interface Category {
  id: string;
  name: string;
  /** URL-friendly identifier, e.g. "beauty-personal-care". */
  slug: string;
  description: string | null;
}
