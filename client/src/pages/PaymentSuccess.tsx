import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Loader2, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    setSessionId(sid);
  }, []);

  const verifyPayment = trpc.subscriptions.verifyPayment.useMutation({
    onSuccess: (data) => {
      if (data.success) setVerified(true);
    },
  });

  useEffect(() => {
    if (sessionId && !verified) {
      verifyPayment.mutate({ sessionId });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Thermometer className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">FeverPlan</span>
        </div>

        {verifyPayment.isPending ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Confirming your payment...</p>
          </div>
        ) : verified ? (
          <div className="flex flex-col items-center gap-4 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">You're all set!</h1>
            <p className="text-muted-foreground">Your access has been activated. You can now use all premium features.</p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground mt-2">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">
              {sessionId ? "We could not confirm your payment. Please contact support if you were charged." : "No payment session found."}
            </p>
            <Button asChild variant="outline">
              <Link href="/pricing">Back to Pricing</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
