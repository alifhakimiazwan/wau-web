"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { completeOnboarding } from "@/lib/onboarding/actions";
import {
  onboardingSchema,
  type OnboardingFormData,
} from "@/lib/validations/onboarding";
import { useUsernameAvailability } from "@/hooks/use-username-availability";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Check, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Typography } from "../ui/typography";
import Image from "next/image";

interface OnboardingFormProps extends React.ComponentProps<"div"> {
  userName?: string;
}

export function OnboardingForm({
  className,
  userName,
  ...props
}: OnboardingFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: userName || "",
      phoneNumber: "",
    },
  });

  const username = watch("username");

  // ⭐ Use custom hook - much cleaner!
  const { isChecking, isAvailable } = useUsernameAvailability({
    username,
    setError,
    clearErrors,
  });

  const onSubmit = async (data: OnboardingFormData) => {
    // Check username is available before submitting
    if (isAvailable === false) {
      setError("username", { message: "Username is already taken" });
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("name", data.name);
      formData.append("phoneNumber", data.phoneNumber || "");

      try {
        const result = await completeOnboarding(formData);

        if (!result.success && result.error) {
          setError("root", { message: result.error });
          toast.error(result.error);
        }
      } catch (error) {
        if (error instanceof Error && error.message !== "NEXT_REDIRECT") {
          setError("root", { message: "An unexpected error occurred" });
          toast.error("An unexpected error occurred");
        }
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Image
              height={100}
              width={100}
              alt="Wau logo"
              src="/Wau.svg"
            ></Image>
            <Typography variant="h1"> Welcome</Typography>
            <p className="text-muted-foreground text-sm">
              Let&apos;s set up your profile
            </p>
          </div>

          {/* Root Error */}
          {errors.root && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                {errors.root.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Username Field */}
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <div className="relative">
              <div className="flex items-center rounded-none border border-input bg-background">
                <span className="pl-3 text-sm">wau.bio/</span>
                <Input
                  id="username"
                  type="text"
                  disabled={isPending}
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none leading-7 text-blue-700 font-medium"
                  {...register("username", {
                    onChange: (e) => {
                      e.target.value = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "");
                    },
                  })}
                />
                {isChecking && (
                  <Loader2 className="mr-3 h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!isChecking && isAvailable === true && (
                  <Check className="mr-3 h-4 w-4 text-green-500" />
                )}
                {!isChecking && isAvailable === false && (
                  <X className="mr-3 h-4 w-4 text-destructive" />
                )}
              </div>
            </div>
            {errors.username ? (
              <FieldDescription className="text-destructive">
                {errors.username.message}
              </FieldDescription>
            ) : (
              isAvailable === true && (
                <FieldDescription className="text-green-600">
                  ✓ Username is available!
                </FieldDescription>
              )
            )}
          </Field>

          {/* Name Field */}
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              disabled={isPending}
              {...register("name")}
            />
            {errors.name && (
              <FieldDescription className="text-destructive">
                {errors.name.message}
              </FieldDescription>
            )}
          </Field>

          {/* Phone Number Field */}
          <Field>
            <FieldLabel htmlFor="phoneNumber">
              Phone Number{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </FieldLabel>
            <PhoneInput
              id="phoneNumber"
              placeholder="+60 12-345 6789"
              disabled={isPending}
              defaultCountry="MY"
              international
              value={watch("phoneNumber")}
              onChange={(value) => setValue("phoneNumber", value || "")}
            />
            {errors.phoneNumber && (
              <FieldDescription className="text-destructive">
                {errors.phoneNumber.message}
              </FieldDescription>
            )}
          </Field>

          {/* Submit Button */}
          <Field>
            <Button
              type="submit"
              disabled={isPending || isChecking || isAvailable === false}
              className="w-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating your profile...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <FieldDescription className="px-6 text-center text-xs">
        By continuing, you agree to our{" "}
        <a href="/terms" className="underline hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
