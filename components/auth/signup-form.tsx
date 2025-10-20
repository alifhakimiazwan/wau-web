"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { signupSchema, type SignupFormData } from "@/lib/auth/schemas";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { signup } from "@/lib/auth/actions";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod"; // ⭐ ADD THIS
import { useForm } from "react-hook-form"; // ⭐ ADD THIS

type SignupFormProps = React.ComponentProps<"form">;

export function SignupForm({ className, ...props }: SignupFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    startTransition(async () => {
      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      const result = await signup(formData);

      if (result.success) {
        toast.success(result.message);
        router.push("/login");
      } else {
        setError("root", { message: result.error });
      }
    });
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
        </div>

        {/* Root Error */}
        {errors.root && (
          <Alert variant="destructive">
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        {/* Full Name */}
        <Field>
          <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
          <Input
            id="fullName"
            type="text"
            placeholder="John Doe"
            disabled={isPending}
            {...register("fullName")}
          />
          {errors.fullName && (
            <FieldDescription className="text-destructive">
              {errors.fullName.message}
            </FieldDescription>
          )}
        </Field>

        {/* Email */}
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

        {/* Password */}
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            disabled={isPending}
            autoComplete="new-password"
            {...register("password")}
          />
          {errors.password ? (
            <FieldDescription className="text-destructive">
              {errors.password.message}
            </FieldDescription>
          ) : (
            <FieldDescription className="text-sm text-muted-foreground">
              Must be at least 8 characters long
            </FieldDescription>
          )}
        </Field>

        {/* Confirm Password */}
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            disabled={isPending}
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <FieldDescription className="text-destructive">
              {errors.confirmPassword.message}
            </FieldDescription>
          )}
        </Field>

        {/* Submit */}
        <Field>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <FieldDescription className="px-6 text-center">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
