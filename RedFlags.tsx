import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { User, CreditCard, CheckCircle, Clock } from "lucide-react";

function formatDate(d: Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  "3day": "3-Day Pass",
  "7day": "7-Day Pass",
  "3month": "3-Month Pass",
  annual: "Annual Pass",
};

export default function Account() {
  const { user } = useAuth();
  const subQ = trpc.subscriptions.getActive.useQuery();
  const allSubsQ = trpc.subscriptions.getAll.useQuery();
  const sub = subQ.data;
  const allSubs = allSubsQ.data ?? [];

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Account & Billing</h1>

      {/* Profile */}
      <div className="p-5 rounded-xl bg-card border border-border mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground">Profile</h2>
        </div>
        <div className="space-y-1 text-sm">
          {user?.name && <p className="text-foreground">{user.name}</p>}
          {user?.email && <p className="text-muted-foreground">{user.email}</p>}
        </div>
      </div>

      {/* Current plan */}
      <div className="p-5 rounded-xl bg-card border border-border mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground">Current Plan</h2>
        </div>
        {subQ.isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : sub ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{PLAN_LABELS[sub.planType] ?? sub.planType}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${sub.status === "active" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>{sub.status}</span>
            </div>
            {sub.endDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                Access expires: {formatDate(sub.endDate)}
              </div>
            )}
            {sub.planType === "free" && (
              <p className="text-xs text-muted-foreground mt-2">Upgrade to a paid plan for full access to all trackers and history.</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No active plan found.</p>
        )}
        <Button asChild size="sm" className="mt-4 bg-primary text-primary-foreground">
          <Link href="/pricing">View plans & upgrade</Link>
        </Button>
      </div>

      {/* Purchase history */}
      {allSubs.filter((s) => s.planType !== "free").length > 0 && (
        <div className="p-5 rounded-xl bg-card border border-border mb-4">
          <h2 className="font-semibold text-foreground mb-3">Purchase History</h2>
          <div className="space-y-2">
            {allSubs.filter((s) => s.planType !== "free").map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-foreground">{PLAN_LABELS[s.planType] ?? s.planType}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(s.startDate)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "active" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="disclaimer-box mt-4">
        FeverPlan is for tracking and education only. It does not provide medical advice. For billing questions, contact support.
      </div>
    </div>
  );
}
