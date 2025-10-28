import { forwardRef, useId } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const FloatingTextarea = forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    const id = useId();

    return (
      <div className="space-y-1">
        <div className="group relative w-full">
          <label
            htmlFor={id}
            className={cn(
              "origin-start absolute top-3 block cursor-text px-2 text-sm transition-all",
              "text-muted-foreground group-focus-within:text-foreground has-[+textarea:not(:placeholder-shown)]:text-foreground",
              "group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium",
              "has-[+textarea:not(:placeholder-shown)]:pointer-events-none has-[+textarea:not(:placeholder-shown)]:top-0 has-[+textarea:not(:placeholder-shown)]:cursor-default has-[+textarea:not(:placeholder-shown)]:text-xs has-[+textarea:not(:placeholder-shown)]:font-medium",
              error && "text-destructive group-focus-within:text-destructive"
            )}
          >
            <span className="bg-background inline-flex px-1">{label}</span>
          </label>
          <Textarea
            id={id}
            ref={ref}
            placeholder=" "
            className={cn("dark:bg-background pt-6", error && "border-destructive", className)}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

FloatingTextarea.displayName = "FloatingTextarea";

export { FloatingTextarea };
