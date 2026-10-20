export interface Testimonial {
  id: string;
  name: string;
  location: string;
  /** 1 to 5 */
  rating: number;
  text: string;
  /** Product the customer bought, shown under the review. */
  product?: string;
}
