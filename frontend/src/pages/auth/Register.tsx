import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PageSpinner } from "@/components/shared/PageSpinner";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth.schema";
import { getErrorMessage } from "@/services/api";

export default function Register() {
  const { isAuthenticated, isLoading, register: registerAccount } = useAuth();
  const navigate = useNavigate();

  const createAccount = useMutation({
    mutationFn: ({ name, email, password }: RegisterFormValues) =>
      registerAccount(name, email, password),
    // The API doesn't start a session on sign-up: send the user to sign in
    onSuccess: (_user, values) =>
      navigate("/login", {
        replace: true,
        state: { registered: true, email: values.email.trim() },
      }),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const field = (name: keyof RegisterFormValues) => ({
    id: `register-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `register-${name}-error` : undefined,
    ...register(name),
  });

  if (isLoading) return <PageSpinner label="Checking your session" />;

  // Already signed in: there is nothing to register
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-muted-foreground">
        Track your orders and check out faster. You can always shop without one.
      </p>

      <form
        onSubmit={handleSubmit((values) => createAccount.mutate(values))}
        noValidate
        className="mt-8 space-y-5"
      >
        <FormField
          label="Full name"
          htmlFor="register-name"
          error={errors.name?.message}
        >
          <Input autoComplete="name" {...field("name")} />
        </FormField>

        <FormField
          label="Email"
          htmlFor="register-email"
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
          label="Password"
          htmlFor="register-password"
          error={errors.password?.message}
          hint="Use at least 8 characters."
        >
          <PasswordInput autoComplete="new-password" {...field("password")} />
        </FormField>

        <FormField
          label="Confirm password"
          htmlFor="register-confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            autoComplete="new-password"
            {...field("confirmPassword")}
          />
        </FormField>

        {createAccount.isError && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {getErrorMessage(createAccount.error)}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={createAccount.isPending}
        >
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-link hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
