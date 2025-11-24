import { cn } from "@/lib/utils";

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  showValue?: boolean;
  className?: string;
}

export const ProgressBar = ({ 
  label, 
  value, 
  maxValue = 100, 
  showValue = true,
  className 
}: ProgressBarProps) => {
  const percentage = (value / maxValue) * 100;
  
  const getGradient = (percent: number) => {
    if (percent >= 80) return "gradient-primary";
    if (percent >= 60) return "gradient-secondary";
    return "gradient-accent";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        {showValue && (
          <span className="text-muted-foreground">
            {value}/{maxValue}
          </span>
        )}
      </div>
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-out",
            getGradient(percentage)
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
