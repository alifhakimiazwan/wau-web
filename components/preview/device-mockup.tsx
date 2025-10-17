import { cn } from "@/lib/utils";

interface DeviceMockupProps {
  children: React.ReactNode;
  className?: string;
}

export function IPhoneMockup({ children, className }: DeviceMockupProps) {
  return (
    <div className={cn("relative mx-auto", className)}>
      {/* iPhone 15 Pro Frame */}
      <div className="relative mx-auto border-[10px] border-gray-800 dark:border-gray-800 bg-gray-800 rounded-[3.5rem] h-[700px] w-[350px] shadow-xl">
        {/* Top Notch */}
        <div className="absolute top-0 inset-x-0">
          <div className="mx-auto bg-gray-800 h-7 w-44 rounded-b-3xl" />
        </div>

        {/* Screen Content */}
        <div className="relative h-full w-full overflow-hidden rounded-[3rem] bg-white dark:bg-gray-900">
          {/* Scrollable Content */}
          <div className="absolute inset-0 overflow-y-auto">{children}</div>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-36 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
      </div>
    </div>
  );
}
