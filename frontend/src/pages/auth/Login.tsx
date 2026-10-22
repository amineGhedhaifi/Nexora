import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PageSpinner } from "@/components/shared/PageSpinner";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/schemas/auth.schema";
import { getErrorMessage } from "@/services/api";

interface LoginLocationState {
  /** Where to go after signing in (set by protected routes). */
  from?: string;
  /** Set by the register page after a successful sign-up. */
  registered?: boolean;
  email?: string;
}

export default function Login() {
  const { isLoading, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as LoginLocationState | null) ?? {};
  const from = state.from ?? "/";

  const signIn = useMutation({
    mutationFn: ({ email, password }: LoginFormValues) =>
      login(email, password),
    onSuccess: (data) => {
      // Redirect admin users to admin dashboard
      if (data.user?.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
    defaultValues: { email: state.email ?? "", password: "" },
  });

  const field = (name: keyof LoginFormValues) => ({
    id: `login-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `login-${name}-error` : undefined,
    ...register(name),
  });

  // Don't flash the form while an existing session is being restored
  if (isLoading) return <PageSpinner label="Checking your session" />;

  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">
        Sign in to see your orders and check out faster.
      </p>

      {state.registered && (
        <p
          role="status"
          className="mt-6 flex items-start gap-3 rounded-xl bg-success-soft p-4 text-sm font-medium text-success"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Your account has been created. Sign in to continue.
        </p>
      )}

      <form
        onSubmit={handleSubmit((values) => signIn.mutate(values))}
        noValidate
        className="mt-8 space-y-5"
      >
        <FormField
          label="Email"
          htmlFor="login-email"
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
          htmlFor="login-password"
          error={errors.password?.message}
        >
          <PasswordInput
            autoComplete="current-password"
            {...field("password")}
          />
        </FormField>

        {signIn.isError && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {getErrorMessage(signIn.error)}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={signIn.isPending}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to Nexora?{" "}
        <Link
          to="/register"
          className="font-semibold text-link hover:underline"
        >
          Create an account
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        No account needed to shop.{" "}
        <Link to="/shop" className="font-semibold text-link hover:underline">
          Continue as a guest
        </Link>
      </p>
    </>
  );
}
