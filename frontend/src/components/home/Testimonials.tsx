import { motion } from "motion/react"
import { Star } from "lucide-react"
import { SectionHeading } from "@/components/shared/SectionHeading"
import { useTestimonials } from "@/hooks/useTestimonials"
import { TestimonialCard } from "./TestimonialCard"

export function Testimonials() {
  const { testimonials } = useTestimonials()

  return (
    <section aria-labelledby="testimonials-heading" className="section-y border-t bg-surface">
      <div className="page-container">
        <SectionHeading
          id="testimonials-heading"
          align="center"
          eyebrow="Reviews"
          title="Loved by customers"
          description="Real feedback from people who shopped with us."
        />

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="flex" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-primary text-primary" />
            ))}
          </div>
          <span>
            <span className="font-semibold text-foreground">4.8</span> average from 2,000+ reviews
          </span>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.li
              key={testimonial.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
              className="sm:last:col-span-2 lg:last:col-span-1"
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
