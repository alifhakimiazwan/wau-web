import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  percentageChange?: number;
  isIncrease?: boolean;
  icon?: LucideIcon;
  formatter?: (value: number) => string;
}

export function MetricCard({
  label,
  value,
  percentageChange,
  isIncrease,
  icon: Icon,
}: MetricCardProps) {
  const hasChange = percentageChange !== undefined && percentageChange !== 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {hasChange && (
          <div className="flex items-center gap-1 mt-1 text-xs">
            {isIncrease ? (
              <>
                <ArrowUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-medium">
                  +{Math.abs(percentageChange).toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <ArrowDown className="h-3 w-3 text-red-600" />
                <span className="text-red-600 font-medium">
                  -{Math.abs(percentageChange).toFixed(1)}%
                </span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
