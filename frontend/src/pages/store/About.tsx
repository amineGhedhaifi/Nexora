import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { aboutSteps, aboutStats, aboutValues } from "@/data/about";

export default function About() {
  return (
    <>
      <div className="border-b bg-surface">
        <div className="page-container py-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-link">
            About Nexora
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Everyday products, without the friction.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Nexora is an online store for the things you use every day. We keep
            a focused catalog, price it honestly, and make ordering as quick as
            it should be.
          </p>
        </div>
      </div>

      <section aria-labelledby="story-heading" className="section-y">
        <div className="page-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-5 text-muted-foreground">
            <h2
              id="story-heading"
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Why we started Nexora
            </h2>
            <p>
              Online shopping should be simple. Too many stores ask you to
              create an account before you can buy, hide shipping costs until
              the last step, and leave you guessing where your order is.
            </p>
            <p>
              Nexora was built to fix that. You can browse, order, and follow
              your delivery without signing up for anything. The price you see
              is the price you pay, shipping is free over $75, and every order
              has a clear status from the moment you place it.
            </p>
            <p>
              We keep the catalog small on purpose. Every product is something
              we'd recommend to a friend, from headphones to coffee gear.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-4">
            {aboutStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border bg-card p-6">
                <dd className="text-3xl font-bold tracking-tight text-link sm:text-4xl">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        aria-labelledby="values-heading"
        className="section-y border-t bg-surface"
      >
        <div className="page-container">
          <SectionHeading
            id="values-heading"
            align="center"
            eyebrow="What we stand for"
            title="Built around you"
          />
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {aboutValues.map(({ icon: Icon, title, text }, index) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="rounded-2xl border bg-card p-6"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="steps-heading" className="section-y">
        <div className="page-container">
          <SectionHeading
            id="steps-heading"
            align="center"
            eyebrow="How it works"
            title="From browsing to your door"
          />
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {aboutSteps.map(({ icon: Icon, title, text }, index) => (
              <motion.li
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                className="relative rounded-2xl border bg-card p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-muted-foreground">{text}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="cta-heading"
        className="page-container pb-16 sm:pb-24"
      >
        <div className="rounded-3xl border bg-accent px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2
            id="cta-heading"
            className="text-3xl font-bold tracking-tight text-accent-foreground sm:text-4xl"
          >
            Ready to find your next favorite?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-accent-foreground/80">
            Browse the catalog, or get in touch if you have a question. We're
            happy to help.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/shop" className={buttonVariants({ size: "lg" })}>
              Shop now
            </Link>
            <Link
              to="/contact"
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
