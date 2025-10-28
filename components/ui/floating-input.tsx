import { forwardRef, useId } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, className, ...props }, ref) => {
    const id = useId();

    return (
      <div className="space-y-1">
        <div className="group relative w-full">
          <label
            htmlFor={id}
            className={cn(
              "origin-start absolute top-1/2 block -translate-y-1/2 cursor-text px-2 text-sm transition-all",
              "text-muted-foreground group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:text-foreground",
              "group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium",
              "has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium",
              error && "text-destructive group-focus-within:text-destructive"
            )}
          >
            <span className="bg-background inline-flex px-1">{label}</span>
          </label>
          <Input
            id={id}
            ref={ref}
            placeholder=" "
            className={cn("dark:bg-background", error && "border-destructive", className)}
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

FloatingInput.displayName = "FloatingInput";

export { FloatingInput };
