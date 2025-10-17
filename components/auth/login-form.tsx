"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "@/lib/auth/actions";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type LoginFormProps = React.ComponentProps<"form">;

export function LoginForm({ className, ...props }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      try {
        const result = await login(formData);

        if (!result.success && result.error) {
          setError("root", { message: result.error });
        }
      } catch (error) {
        if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
          const errorMessage = error.message || "An unexpected error occurred";
          setError("root", { message: errorMessage });
          toast.error(errorMessage);
        }
      }
    });
  };

  // const handleGithubLogin = async () => {
  //   startTransition(async () => {
  //     try {
  //       await loginWithGithub()
  //     } catch (error) {
  //       if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
  //         toast.error('Failed to login with GitHub')
  //       }
  //     }
  //   })
  // }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Log in to your account to continue
          </p>
        </div>

        {/* ⭐ Better Error Alert */}
        {errors.root && (
          <Alert
            variant={
              errors.root.message?.includes("confirm your email")
                ? "default"
                : "destructive"
            }
            className={cn(
              errors.root.message?.includes("confirm your email") &&
                "border-blue-500 bg-blue-50 text-blue-900"
            )}
          >
            {errors.root.message?.includes("confirm your email") ? (
              <Info className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription className="ml-2">
              {errors.root.message}
              {/* ⭐ Add helpful link for email confirmation */}
              {errors.root.message?.includes("confirm your email") && (
                <div className="mt-2">
                  <Link
                    href="/resend-confirmation"
                    className="font-medium underline"
                  >
                    Resend confirmation email
                  </Link>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Email Field */}
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            disabled={isPending}
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && (
            <FieldDescription className="text-destructive">
              {errors.email.message}
            </FieldDescription>
          )}
        </Field>

        {/* Password Field */}
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            disabled={isPending}
            autoComplete="current-password"
            {...register("password")}
          />
          {errors.password ? (
            <FieldDescription className="text-destructive">
              {errors.password.message}
            </FieldDescription>
          ) : (
            <FieldDescription>
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </FieldDescription>
          )}
        </Field>

        {/* Submit Button */}
        <Field>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        {/* GitHub Login */}
        <Field>
          {/* <Button 
            variant="outline" 
            type="button"
            onClick={handleGithubLogin}
            disabled={isPending}
            className="w-full"
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Log in with GitHub
          </Button> */}
          <FieldDescription className="px-6 text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
