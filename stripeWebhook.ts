// FeverPlan subscription plans
// Update prices here to change what's shown on the pricing page

export type PlanId = "free" | "3day" | "7day" | "3month" | "annual";

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // in cents
  displayPrice: string;
  description: string;
  durationDays: number | null; // null = unlimited
  features: string[];
  highlighted?: boolean;
  stripePriceId?: string; // set after creating in Stripe dashboard
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    displayPrice: "Free",
    description: "Basic access to get started",
    durationDays: null,
    features: [
      "1 child profile",
      "Medication log (last 24 hours)",
      "Temperature log (last 24 hours)",
      "Fever Basics guide",
      "Red Flags reference",
    ],
  },
  {
    id: "3day",
    name: "3-Day Pass",
    price: 700,
    displayPrice: "$7",
    description: "Perfect for a short illness",
    durationDays: 3,
    features: [
      "Up to 3 child profiles",
      "Full medication timeline",
      "Temperature history",
      "Fluids & output tracker",
      "Symptom tracker",
      "In-app reminders",
    ],
  },
  {
    id: "7day",
    name: "7-Day Pass",
    price: 1200,
    displayPrice: "$12",
    description: "Great for a full week of illness",
    durationDays: 7,
    highlighted: true,
    features: [
      "Up to 3 child profiles",
      "Full medication timeline",
      "Temperature history",
      "Fluids & output tracker",
      "Symptom tracker",
      "In-app reminders",
    ],
  },
  {
    id: "3month",
    name: "3-Month Pass",
    price: 2400,
    displayPrice: "$24",
    description: "Covers a full cold & flu season",
    durationDays: 90,
    features: [
      "Unlimited child profiles",
      "Full medication timeline",
      "Temperature history",
      "Fluids & output tracker",
      "Symptom tracker",
      "In-app reminders",
      "Extended history",
    ],
  },
  {
    id: "annual",
    name: "Annual Pass",
    price: 4900,
    displayPrice: "$49",
    description: "Best value for the whole year",
    durationDays: 365,
    features: [
      "Unlimited child profiles",
      "Full medication timeline",
      "Temperature history",
      "Fluids & output tracker",
      "Symptom tracker",
      "In-app reminders",
      "Extended history",
      "Priority support",
    ],
  },
];

export function getPlanById(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function getPlanEndDate(planId: PlanId): Date | null {
  const plan = getPlanById(planId);
  if (!plan || plan.durationDays === null) return null;
  const end = new Date();
  end.setDate(end.getDate() + plan.durationDays);
  return end;
}

// Access control: which plan IDs grant "premium" access
export const PREMIUM_PLAN_IDS: PlanId[] = ["3day", "7day", "3month", "annual"];

export function isPremiumPlan(planId: PlanId): boolean {
  return PREMIUM_PLAN_IDS.includes(planId);
}
