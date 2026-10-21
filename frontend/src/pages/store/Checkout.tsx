import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft, Info, ShoppingBag, AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { EmptyState } from "@/components/shared/EmptyState";
import { countries } from "@/data/countries";
import { useCart } from "@/hooks/useCart";
import { useCreateOrderApi } from "@/hooks/useCreateOrderApi";
import { getErrorMessage } from "@/services/api";
import { ordersService } from "@/services/orders.service";
import {
  checkoutSchema,
  type CheckoutFormValues,
} from "@/schemas/checkout.schema";

export default function Checkout() {
  const { items, subtotal, shipping, total, clearCart, isLoading: cartLoading } = useCart();
  const navigate = useNavigate();
  const createOrder = useCreateOrderApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
    },
  });

  // Props shared by every field: id, accessibility attributes and the form binding
  const field = (name: keyof CheckoutFormValues) => ({
    id: `checkout-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `checkout-${name}-error` : undefined,
    ...register(name),
  });

  const onSubmit = handleSubmit((values) => {
    const customerName = `${values.firstName} ${values.lastName}`.trim();
    const shippingAddress = [
      values.address,
      values.city,
      values.postalCode,
      values.country,
    ]
      .filter(Boolean)
      .join(", ");

    const orderInput = {
      customerName,
      customerPhone: values.phone.trim(),
      shippingAddress,
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
    };

    createOrder.mutate(
      orderInput,
      {
        onSuccess: async (order) => {
          // Store the order locally with form data for the success page
          await ordersService.storeOrder(order, {
            items: orderInput.items.map(({ productId, quantity }) => ({
              productId,
              name: items.find((i) => i.productId === productId)?.name ?? "",
              price: items.find((i) => i.productId === productId)?.price ?? 0,
              image: items.find((i) => i.productId === productId)?.image ?? null,
              quantity,
            })),
            shippingInfo: {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              phone: values.phone,
              address: values.address,
              city: values.city,
              postalCode: values.postalCode,
              country: values.country,
            },
            subtotal,
            shippingCost: shipping,
            total,
          });
          navigate(`/order-success/${order.id}`, { replace: true });
          clearCart();
        },
      },
    );
  });

  // Don't flash the empty state while the order is being placed
  if (items.length === 0 && !createOrder.isPending && !createOrder.isSuccess) {
    return (
      <section className="page-container section-y">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add something to your cart before checking out."
          action={
            <Link to="/shop" className={buttonVariants({ size: "lg" })}>
              Start shopping
            </Link>
          }
        />
      </section>
    );
  }

  const submitError = createOrder.isError
    ? getErrorMessage(createOrder.error)
    : null;

  return (
    <section className="page-container py-10 sm:py-14">
      <Link
        to="/cart"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-link"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to cart
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
        Checkout
      </h1>
      <p className="mt-1 text-muted-foreground">
        Enter your delivery details to place your order. No account needed.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5 lg:items-start">
        <form
          onSubmit={onSubmit}
          noValidate
          className="space-y-6 lg:col-span-3"
        >
          <div
            role="group"
            aria-labelledby="contact-heading"
            className="rounded-2xl border bg-card p-6"
          >
            <h2 id="contact-heading" className="text-lg font-semibold">
              Contact
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField
                label="Email"
                htmlFor="checkout-email"
                error={errors.email?.message}
              >
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...field("email")}
                />
              </FormField>
              <FormField
                label="Phone"
                htmlFor="checkout-phone"
                error={errors.phone?.message}
              >
                <Input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 555 123 4567"
                  {...field("phone")}
                />
              </FormField>
            </div>
          </div>

          <div
            role="group"
            aria-labelledby="shipping-heading"
            className="rounded-2xl border bg-card p-6"
          >
            <h2 id="shipping-heading" className="text-lg font-semibold">
              Shipping address
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormField
                label="First name"
                htmlFor="checkout-firstName"
                error={errors.firstName?.message}
              >
                <Input autoComplete="given-name" {...field("firstName")} />
              </FormField>
              <FormField
                label="Last name"
                htmlFor="checkout-lastName"
                error={errors.lastName?.message}
              >
                <Input autoComplete="family-name" {...field("lastName")} />
              </FormField>
              <FormField
                label="Address"
                htmlFor="checkout-address"
                error={errors.address?.message}
                className="sm:col-span-2"
              >
                <Input
                  autoComplete="street-address"
                  placeholder="Street and house number"
                  {...field("address")}
                />
              </FormField>
              <FormField
                label="City"
                htmlFor="checkout-city"
                error={errors.city?.message}
              >
                <Input autoComplete="address-level2" {...field("city")} />
              </FormField>
              <FormField
                label="Postal code"
                htmlFor="checkout-postalCode"
                error={errors.postalCode?.message}
              >
                <Input autoComplete="postal-code" {...field("postalCode")} />
              </FormField>
              <FormField
                label="Country"
                htmlFor="checkout-country"
                error={errors.country?.message}
                className="sm:col-span-2"
              >
                <Select autoComplete="country-name" {...field("country")}>
                  <option value="">Select a country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>
          </div>

          <p className="flex items-start gap-3 rounded-xl bg-accent p-4 text-sm text-accent-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            There is no online payment. Place your order and we'll take care of
            the rest. The final total is calculated by the server.
          </p>

          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>{submitError}</p>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={createOrder.isPending}
            disabled={cartLoading || items.length === 0}
          >
            Place order
          </Button>
        </form>

        <aside className="lg:col-span-2 lg:sticky lg:top-28">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
          />
          {cartLoading && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Loading cart...
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}