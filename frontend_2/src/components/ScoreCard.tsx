import { cn } from "@/lib/utils";

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  className?: string;
}

export const ScoreCard = ({ title, score, maxScore = 100, className }: ScoreCardProps) => {
  const percentage = (score / maxScore) * 100;
  
  const getColorClass = (percent: number) => {
    if (percent >= 80) return "text-success";
    if (percent >= 60) return "text-warning";
    return "text-destructive";
  };

  const getGradientClass = (percent: number) => {
    if (percent >= 80) return "bg-success";
    if (percent >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className={cn("p-6 rounded-xl bg-card border shadow-md hover-lift", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <span className={cn("text-2xl font-bold", getColorClass(percentage))}>
          {score}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-1000 ease-out", getGradientClass(percentage))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
