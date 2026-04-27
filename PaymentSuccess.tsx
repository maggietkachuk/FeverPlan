import { trpc } from "@/lib/trpc";

const PREMIUM_PLAN_IDS = ["3day", "7day", "3month", "annual"] as const;

export function useSubscription() {
  const subQ = trpc.subscriptions.getActive.useQuery();
  const sub = subQ.data;
  const planType = sub?.planType ?? "free";
  const isPremium = PREMIUM_PLAN_IDS.includes(planType as (typeof PREMIUM_PLAN_IDS)[number]);
  const isLoading = subQ.isLoading;

  return {
    sub,
    planType,
    isPremium,
    isLoading,
    /** Free tier: only 1 child profile allowed */
    maxChildren: isPremium ? (planType === "3month" || planType === "annual" ? Infinity : 3) : 1,
    /** Free tier: only last 24h of logs visible */
    historyLimitMs: isPremium ? null : 24 * 60 * 60 * 1000,
  };
}
