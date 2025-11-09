"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/themed/button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Magnet, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import type { DesignCustomization } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import {
  getBorderRadius,
  getInputBorderRadius,
} from "@/lib/utils/design-helpers";
import { submitLeadCapture, retryFreebieEmail } from "@/lib/leads/actions";
import { useAnalyticsContext } from "@/components/analytics/analytics-provider";

interface CustomerFields {
  email?: boolean;
  name?: boolean;
  phone?: boolean;
}

interface LeadMagnetPreviewProps {
  name?: string;
  subtitle?: string;
  buttonText?: string;
  thumbnail?: string | null;
  customerFields?: CustomerFields;
  successMessage?: string;
  designConfig?: DesignCustomization | null;
  cardBackgroundColor?: string;
  cardShadow?: boolean;
  // Analytics props
  productId?: string;
  storeId?: string;
  isPreview?: boolean;
}

export function LeadMagnetPreview({
  name = "Your Lead Magnet Title",
  subtitle,
  buttonText = "Get Free Access",
  thumbnail,
  customerFields = { email: false, name: false, phone: false },
  successMessage = "Check your email for your freebie!",
  designConfig,
  cardBackgroundColor = '#FFFFFF',
  cardShadow = false,
  productId,
  storeId,
  isPreview = false,
}: LeadMagnetPreviewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [emailSent, setEmailSent] = useState(false);
  const [leadCaptureId, setLeadCaptureId] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);

  // Get analytics context only if on storefront
  let analytics;
  try {
    analytics = productId && storeId && !isPreview ? useAnalyticsContext() : null;
  } catch {
    // Not wrapped in AnalyticsProvider (e.g., in dashboard preview)
    analytics = null;
  }

  const isInteractive = productId && storeId && !isPreview;

  const borderRadius = getBorderRadius(designConfig);
  const inputBorderRadius = getInputBorderRadius(designConfig);
  const topBorderRadius = getBorderRadius(designConfig, "top");

  const handleCardClick = () => {
    if (isInteractive) {
      setIsDialogOpen(true);
      // Reset state when opening
      setSubmitStatus('idle');
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isInteractive || !productId || !storeId) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const fullName = formData.get('name') as string | null;
    const phoneNumber = formData.get('phone') as string | null;

    try {
      const result = await submitLeadCapture({
        storeId,
        productId,
        email,
        fullName: fullName || undefined,
        phoneNumber: phoneNumber || undefined,
        sessionId: analytics?.sessionId || undefined,
        referrer: analytics?.referrer || undefined,
        utm_source: analytics?.utmParams.utm_source,
        utm_medium: analytics?.utmParams.utm_medium,
        utm_campaign: analytics?.utmParams.utm_campaign,
        utm_content: analytics?.utmParams.utm_content,
        utm_term: analytics?.utmParams.utm_term,
      });

      if (result.success && result.data) {
        setSubmitStatus('success');
        setEmailSent(result.data.emailSent);
        setLeadCaptureId(result.data.leadCaptureId);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Error submitting lead capture:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryEmail = async () => {
    if (!leadCaptureId) return;

    setIsRetrying(true);
    setErrorMessage('');

    try {
      const result = await retryFreebieEmail({ leadCaptureId });

      if (result.success) {
        setEmailSent(true);
        setErrorMessage('');
      } else {
        setErrorMessage(result.error || 'Failed to resend email. Please try again.');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Error retrying email:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const cardContent = (
    <Card
      className={cn(
        "overflow-hidden py-0 gap-0 border-1",
        isInteractive && "cursor-pointer transition-all hover:opacity-90 hover:scale-[1.02]",
        borderRadius
      )}
      style={{
        backgroundColor: cardBackgroundColor,
        boxShadow: cardShadow
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 2px 5px -2px rgba(0, 0, 0, 0.2)"
          : undefined,
      }}
      onClick={handleCardClick}
    >
      {/* Thumbnail - 2:1 aspect ratio */}
      {thumbnail ? (
        <div
          className={cn(
            "relative w-full aspect-[2/1] overflow-hidden",
            topBorderRadius
          )}
        >
          <Image
            src={thumbnail}
            alt={name || "Lead magnet"}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={cn(
            "w-full aspect-[2/1] bg-muted flex items-center justify-center",
            topBorderRadius
          )}
        >
          <Magnet className="w-16 h-16 text-muted-foreground" />
        </div>
      )}

      {/* Content section with padding */}
      <div className="p-6 space-y-4">
        {/* Title and Subtitle */}
        <div className="text-left space-y-2">
          <h3 className="text-xl font-bold tracking-tight">
            {name || "Your Lead Magnet Title"}
          </h3>
          {subtitle && (
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          )}
        </div>

        {/* CTA Button */}
        <LinkButton
          label={buttonText || "Get Free Access"}
          config={{
            style: designConfig?.buttonConfig.style || "filled",
            shape: designConfig?.blockShape || "rounded",
          }}
          accentColor={designConfig?.colors.accent}
          disabled
        />
      </div>
    </Card>
  );

  // If not interactive, just return the card
  if (!isInteractive) {
    return <div className="w-full max-w-md mx-auto">{cardContent}</div>;
  }

  // Interactive version with dialog
  return (
    <>
      <div className="w-full max-w-md mx-auto">{cardContent}</div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{name || "Get Your Free Content"}</DialogTitle>
            {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
          </DialogHeader>

          {/* Success State */}
          {submitStatus === 'success' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-green-900">{successMessage}</p>
                  {!emailSent && (
                    <p className="text-sm text-green-700">
                      Your information has been saved, but we encountered an issue sending the email.
                    </p>
                  )}
                </div>
              </div>

              {!emailSent && (
                <div className="flex flex-col gap-2">
                  {errorMessage && (
                    <p className="text-sm text-red-600">{errorMessage}</p>
                  )}
                  <Button
                    onClick={handleRetryEmail}
                    disabled={isRetrying}
                    className="w-full"
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      'Resend Email'
                    )}
                  </Button>
                </div>
              )}

              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}

          {/* Form State */}
          {submitStatus !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field */}
              {customerFields.name && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    required={customerFields.name}
                    disabled={isSubmitting}
                    className={inputBorderRadius}
                  />
                </div>
              )}

              {/* Email field - always shown if any field is enabled */}
              {(customerFields.email || customerFields.name || customerFields.phone) && (
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    disabled={isSubmitting}
                    className={inputBorderRadius}
                  />
                </div>
              )}

              {/* Phone field */}
              {customerFields.phone && (
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    required={customerFields.phone}
                    disabled={isSubmitting}
                    className={inputBorderRadius}
                  />
                </div>
              )}

              {/* Error message */}
              {submitStatus === 'error' && errorMessage && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  buttonText || "Get Free Access"
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
