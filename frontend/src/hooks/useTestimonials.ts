import { testimonials } from "@/data/testimonials";

/**
 * Static for now. When reviews come from the API, switch this to a query
 * (like useFeaturedProducts) and the components won't need to change.
 */
export function useTestimonials() {
  return { testimonials };
}
