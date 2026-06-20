import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MacroBarProps {
  label: string;
  consumed: number;
  goal: number;
  unit?: string;
  colorClass?: string;
  className?: string;
}

export function MacroBar({
  label,
  consumed,
  goal,
  unit = "g",
  colorClass = "text-primary",
  className,
}: MacroBarProps) {
  const progress = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          <span className={cn("font-semibold text-foreground", colorClass)}>
            {Math.round(consumed)}
          </span>
          {" / "}
          {goal}
          {unit}
        </span>
      </div>
      <Progress value={progress} aria-label={`${label} progress`} />
    </div>
  );
}
