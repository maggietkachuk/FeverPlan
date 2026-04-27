import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { CheckCircle, Thermometer } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

const PLANS = [
  { id: "free" as const, name: "Free", price: "$0", desc: "Basic access", features: ["1 child profile", "Medication log (24h)", "Temperature log (24h)", "Fever Basics guide", "Red Flags reference"], highlighted: false },
  { id: "3day" as const, name: "3-Day Pass", price: "$7", desc: "Short illness", features: ["Up to 3 child profiles", "Full medication timeline", "Temperature history", "Fluids & output tracker", "Symptom tracker", "In-app reminders"], highlighted: false },
  { id: "7day" as const, name: "7-Day Pass", price: "$12", desc: "Full week", features: ["Up to 3 child profiles", "Full medication timeline", "Temperature history", "Fluids & output tracker", "Symptom tracker", "In-app reminders"], highlighted: true },
  { id: "3month" as const, name: "3-Month Pass", price: "$24", desc: "Cold & flu season", features: ["Unlimited child profiles", "Full medication timeline", "Temperature history", "Fluids & output tracker", "Symptom tracker", "In-app reminders", "Extended history"], highlighted: false },
  { id: "annual" as const, name: "Annual Pass", price: "$49", desc: "Best value", features: ["Unlimited child profiles", "Full medication timeline", "Temperature history", "Fluids & output tracker", "Symptom tracker", "In-app reminders", "Extended history"], highlighted: false },
];

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState<string | null>(null);

  const createCheckout = trpc.subscriptions.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) window.open(data.url, "_blank");
      setLoading(null);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to start checkout");
      setLoading(null);
    },
  });

  const handleChoose = (planId: "3day" | "7day" | "3month" | "annual") => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoading(planId);
    toast.info("Redirecting to checkout...");
    createCheckout.mutate({ planId, origin: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Thermometer className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">FeverPlan</span>
          </Link>
          {isAuthenticated ? (
            <Button asChild size="sm" className="bg-primary text-primary-foreground">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          )}
        </div>
      </header>

      <div className="container py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Simple, time-based pricing</h1>
          <p className="text-muted-foreground">Pay only for what you need. No recurring charges.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`relative flex flex-col p-5 rounded-xl border ${plan.highlighted ? "border-primary bg-primary/8" : "border-border bg-card"}`}>
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap">Most popular</div>
              )}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{plan.name}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{plan.price}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{plan.desc}</p>
              </div>
              <ul className="space-y-1.5 mb-5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />{f}
                  </li>
                ))}
              </ul>
              {plan.id === "free" ? (
                <Button asChild size="sm" variant="outline" className="border-border text-foreground">
                  <a href={isAuthenticated ? "/dashboard" : getLoginUrl()}>
                    {isAuthenticated ? "Go to dashboard" : "Sign in free"}
                  </a>
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={loading === plan.id}
                  onClick={() => handleChoose(plan.id)}
                  className={plan.highlighted ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}
                >
                  {loading === plan.id ? "Loading..." : "Choose plan"}
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="disclaimer-box mt-10 max-w-2xl mx-auto text-center">
          FeverPlan is a tracking and education tool only. It does not provide medical advice, diagnosis, or treatment.
          Always follow medication labels and seek care from a healthcare professional when needed.
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Test card: 4242 4242 4242 4242 · Any future date · Any CVC
        </p>
      </div>
    </div>
  );
}
