import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contactDetails } from "@/data/contact";
import { useSendContactMessage } from "@/hooks/useSendContactMessage";
import {
  contactService,
  getValidationErrors,
  isContactValidationError,
} from "@/services/contact.service";
import {
  contactSchema,
  type ContactFormValues,
} from "@/schemas/contact.schema";

const NO_TOPICS: ContactTopic[] = [];

function ContactTopicsSelect({
  topics,
  isPending,
  isError,
  ...fieldProps
}: {
  topics: ContactTopic[];
  isPending: boolean;
  isError: boolean;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Select {...fieldProps} disabled={isPending || isError || topics.length === 0}>
      {isPending ? (
        <option value="" disabled>
          <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />
          Loading topics...
        </option>
      ) : isError ? (
        <option value="" disabled>
          Failed to load topics. Please refresh the page.
        </option>
      ) : topics.length === 0 ? (
        <option value="" disabled>
          No topics available
        </option>
      ) : (
        <>
          <option value="">Choose a topic</option>
          {topics.map((topic) => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </>
      )}
    </Select>
  );
}

export default function Contact() {
  const sendMessage = useSendContactMessage();

  const {
    data: topics = NO_TOPICS,
    isPending: topicsPending,
    isError: topicsError,
    refetch: refetchTopics,
  } = useQuery({
    queryKey: ["contact-topics"],
    queryFn: () => contactService.getTopics(),
    staleTime: 10 * 60_000,
  });

  const canSubmit = topics.length > 0 && !topicsPending && !topicsError;

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", topic: "", message: "" },
  });

  const field = (name: keyof ContactFormValues) => ({
    id: `contact-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
    ...register(name),
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();
    try {
      await sendMessage.mutateAsync(values);
    } catch (error) {
      if (isContactValidationError(error)) {
        const validationErrors = getValidationErrors(error);
        validationErrors.forEach((ve) => {
          if (ve.field in values) {
            setError(ve.field as keyof ContactFormValues, {
              type: "server",
              message: ve.message,
            });
          }
        });
      }
      throw error;
    }
  });

  const sendAnother = () => {
    sendMessage.reset();
    reset();
  };

  return (
    <>
      <div className="border-b bg-surface">
        <div className="page-container py-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-link">
            Contact
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            We'd love to hear from you
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Questions about an order or a product? Send us a message and we'll
            reply within one business day.
          </p>
        </div>
      </div>

      <section className="page-container section-y">
        <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3">
            {sendMessage.isSuccess ? (
              <div
                role="status"
                className="rounded-2xl border bg-card p-8 text-center sm:p-12"
              >
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-success-soft text-success">
                  <CheckCircle2 className="size-9" aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-2xl font-bold tracking-tight">
                  Message sent
                </h2>
                <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                  Thanks for reaching out, {getValues("name")}. We'll reply to{" "}
                  {getValues("email")} within one business day.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={sendAnother}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                noValidate
                className="space-y-5 rounded-2xl border bg-card p-6 sm:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    label="Name"
                    htmlFor="contact-name"
                    error={errors.name?.message}
                  >
                    <Input autoComplete="name" {...field("name")} />
                  </FormField>
                  <FormField
                    label="Email"
                    htmlFor="contact-email"
                    error={errors.email?.message}
                  >
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...field("email")}
                    />
                  </FormField>
                </div>

                <FormField
                  label="Topic"
                  htmlFor="contact-topic"
                  error={errors.topic?.message}
                >
                  <ContactTopicsSelect
                    topics={topics}
                    isPending={topicsPending}
                    isError={topicsError}
                    {...field("topic")}
                  />
                  {(topicsError || topics.length === 0) && !topicsPending && (
                    <p
                      role="alert"
                      className="mt-2 text-sm text-destructive flex items-center gap-2"
                    >
                      <AlertCircle className="size-4" aria-hidden="true" />
                      <span>Unable to load topics. </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto text-sm"
                        onClick={refetchTopics}
                      >
                        Retry
                      </Button>
                    </p>
                  )}
                </FormField>

                <FormField
                  label="Message"
                  htmlFor="contact-message"
                  error={errors.message?.message}
                  hint="Include your order number if your question is about an order."
                >
                  <Textarea rows={6} {...field("message")} />
                </FormField>

                {sendMessage.isError && !isContactValidationError(sendMessage.error) && (
                  <p
                    role="alert"
                    className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
                  >
                    We couldn't send your message. Please try again.
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  loading={sendMessage.isPending}
                  disabled={!canSubmit}
                  className="w-full sm:w-auto"
                >
                  Send message
                </Button>

                {!canSubmit && !sendMessage.isPending && (
                  <p className="text-sm text-muted-foreground text-center">
                    {topicsPending
                      ? "Loading topics..."
                      : topicsError
                      ? "Unable to load topics. Please refresh the page."
                      : "No topics available. Please try again later."}
                  </p>
                )}
              </form>
            )}
          </div>

          <aside aria-label="Contact details" className="lg:col-span-2">
            <h2 className="text-lg font-semibold">Other ways to reach us</h2>
            <ul className="mt-5 space-y-4">
              {contactDetails.map(({ icon: Icon, label, value, href }) => (
                <li
                  key={label}
                  className="flex items-start gap-4 rounded-2xl border bg-card p-5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="font-medium break-words transition-colors hover:text-link"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="font-medium">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
