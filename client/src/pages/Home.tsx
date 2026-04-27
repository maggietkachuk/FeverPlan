import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Thermometer, Pill, Droplets, Activity, AlertTriangle, BookOpen,
  CheckCircle, ArrowRight, Shield, Moon
} from "lucide-react";

const FEATURES = [
  { icon: Pill, title: "Medication Tracker", desc: "Log Tylenol and Advil entries with time, amount, and notes. View a clean chronological timeline." },
  { icon: Thermometer, title: "Temperature Log", desc: "Record temperature readings with timestamps, method, and notes. Track trends over time." },
  { icon: Droplets, title: "Fluids & Output", desc: "Track fluid intake and output events — wet diapers, urination, vomiting, and more." },
  { icon: Activity, title: "Symptom Tracker", desc: "Log symptoms with timestamps and free-text notes to share with your care team." },
  { icon: AlertTriangle, title: "Red Flags Guide", desc: "Clear, high-level guidance on symptoms commonly evaluated urgently — always framed as education." },
  { icon: BookOpen, title: "Fever Basics", desc: "Concise educational content on fever, hydration, home care, and what matters most." },
];

const FAQS = [
  { q: "Does FeverPlan tell me what dose to give?", a: "No. FeverPlan only records what you enter. It never calculates, recommends, or suggests medication doses. Always follow your medication label and consult your pharmacist or clinician." },
  { q: "Is this a telehealth or medical advice service?", a: "No. FeverPlan is a tracking and education tool only. It does not provide medical advice, diagnosis, or treatment. Always seek care from a healthcare professional when needed." },
  { q: "Can I use it for multiple children?", a: "Yes. Paid plans support multiple child profiles so you can track each child separately." },
  { q: "What happens when my pass expires?", a: "Your data is retained. You can purchase a new pass at any time to regain full access." },
  { q: "Is my data private?", a: "Yes. Your tracking data is private to your account and is never shared or sold." },
];

const PLANS = [
  { id: "3day", name: "3-Day Pass", price: "$7", desc: "Short illness", days: 3, highlighted: false },
  { id: "7day", name: "7-Day Pass", price: "$12", desc: "Full week", days: 7, highlighted: true },
  { id: "3month", name: "3-Month Pass", price: "$24", desc: "Cold & flu season", days: 90, highlighted: false },
  { id: "annual", name: "Annual Pass", price: "$49", desc: "Best value", days: 365, highlighted: false },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Thermometer className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">FeverPlan</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button asChild size="sm" className="bg-primary text-primary-foreground">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
                <Button asChild size="sm" className="bg-primary text-primary-foreground">
                  <Link href="/pricing">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
        <div className="container relative">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6 animate-fade-up">
              <Moon className="w-3 h-3" />
              Designed for 2 AM
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-up-delay-1">
              Your child has a fever.{" "}
              <span className="text-primary">Let's simplify</span>{" "}
              what to do next.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed animate-fade-up-delay-2">
              Track medications, log symptoms, and review red flags in one place.
              Simple fever support for exhausted parents — built for one-handed use at night.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up-delay-3">
              <Button asChild size="lg" className="bg-primary text-primary-foreground text-base px-8 h-12">
                <Link href="/pricing">Get Started <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              {isAuthenticated && (
                <Button asChild variant="outline" size="lg" className="text-base h-12 border-border">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-6">Tracking and education only. Not medical advice.</p>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">How it works</h2>
            <p className="text-muted-foreground">Three simple steps to get organized during a fever episode.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { step: "1", title: "Create a profile", desc: "Set up a child profile with a name and age range." },
              { step: "2", title: "Start logging", desc: "Log medications, temperatures, fluids, and symptoms as they happen." },
              { step: "3", title: "Stay informed", desc: "Review your timeline and consult the red flags guide when needed." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold text-lg flex items-center justify-center mb-4">{step}</div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-16 border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Everything you need</h2>
            <p className="text-muted-foreground">All the tracking tools parents need during a fever episode, in one place.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/12 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-16 border-t border-border">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Simple, time-based access</h2>
            <p className="text-muted-foreground">Pay for what you need. No subscriptions, no recurring charges.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {PLANS.map((plan) => (
              <div key={plan.id} className={`relative p-5 rounded-xl border flex flex-col ${plan.highlighted ? "border-primary bg-primary/8" : "border-border bg-card"}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">Most popular</div>
                )}
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{plan.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">{plan.desc}</p>
                </div>
                <ul className="space-y-1.5 mb-5 flex-1">
                  {["Full tracker access", "Medication timeline", "Red flags guide", plan.days >= 90 ? "Unlimited children" : "Up to 3 children"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button asChild size="sm" className={plan.highlighted ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}>
                  <Link href="/pricing">Choose plan</Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">A free tier is also available with limited access.</p>
        </div>
      </section>

      <section className="py-12 border-t border-border bg-card/40">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            {[
              { icon: Shield, text: "Education & tracking only — not medical advice" },
              { icon: Moon, text: "Designed for nighttime, one-handed use" },
              { icon: CheckCircle, text: "No dosing recommendations, ever" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary flex-shrink-0" />{text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 border-t border-border">
        <div className="container max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="p-5 rounded-xl bg-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="container">
          <div className="disclaimer-box mb-6 max-w-2xl mx-auto text-center">
            <strong className="block mb-1">Important Notice</strong>
            This tool is for educational and tracking purposes only and does not provide medical advice, diagnosis, or treatment.
            Always follow medication labels and seek care from your healthcare professional or emergency services when needed.
            If your child appears seriously unwell, has trouble breathing, is difficult to wake, or you are worried — seek urgent medical care immediately.
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                <Thermometer className="w-3 h-3 text-primary-foreground" />
              </div>
              <span>FeverPlan — Track. Understand. Decide.</span>
            </div>
            <div className="flex gap-4">
              <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link href="/fever-basics" className="hover:text-foreground transition-colors">Fever Guide</Link>
              <Link href="/red-flags" className="hover:text-foreground transition-colors">Red Flags</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
