import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight",
      h6: "scroll-m-20 text-base font-semibold tracking-tight",
      p: "leading-7",
      blockquote: "mt-6 border-l-2 pl-6 italic",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      subtle: "text-xs text-muted-foreground",
    },
    font: {
      sans: "font-sans",
      serif: "font-serif",
      mono: "font-mono",
    },
    affects: {
      default: "",
      removePMargin: "[&_p]:m-0",
    },
  },
  defaultVariants: {
    variant: "p",
    affects: "default",
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean;
  as?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "p"
    | "span"
    | "div"
    | "blockquote"
    | "code";
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, affects, font, asChild = false, as, ...props }, ref) => {
    const Comp = asChild ? Slot : as || getDefaultTag(variant);

    return (
      <Comp
        className={cn(typographyVariants({ variant, affects, font }), className)}
        ref={ref as React.Ref<HTMLElement>}
        {...props}
      />
    );
  }
);
Typography.displayName = "Typography";

// Helper function to get default HTML tag based on variant
function getDefaultTag(variant: TypographyProps["variant"]) {
  switch (variant) {
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "h4":
      return "h4";
    case "h5":
      return "h5";
    case "h6":
      return "h6";
    case "blockquote":
      return "blockquote";
    case "code":
      return "code";
    default:
      return "p";
  }
}

export { Typography, typographyVariants };
