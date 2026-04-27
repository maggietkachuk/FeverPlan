import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionGateProps {
  children: React.ReactNode;
  /** Feature label shown in the upgrade prompt */
  feature?: string;
}

/**
 * Wraps premium-only content. Free-tier users see an upgrade prompt instead.
 */
export function SubscriptionGate({ children, feature = "this feature" }: SubscriptionGateProps) {
  const { isPremium, isLoading } = useSubscription();

  if (isLoading) return null;

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Upgrade to unlock {feature}</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs">
          This feature is available on paid plans. Passes start at $7 for 3 days — no recurring charges.
        </p>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/pricing">View plans</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
