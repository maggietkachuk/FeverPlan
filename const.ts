// EDITABLE CONTENT: Update the FAQS array below to revise FAQ content without changing component code.
import { HelpCircle } from "lucide-react";
import { useState } from "react";

const FAQS = [
  { q: "Does FeverPlan tell me what dose to give my child?", a: "No. FeverPlan never calculates, recommends, or suggests medication doses. It only records what you enter. Always follow your medication label and confirm the correct dose with your pharmacist or clinician." },
  { q: "Is FeverPlan a telehealth or medical advice service?", a: "No. FeverPlan is a tracking and education tool only. It does not provide medical advice, diagnosis, or treatment. Always seek care from a qualified healthcare professional when needed." },
  { q: "What does the medication timeline show?", a: "The timeline shows the entries you have logged — medication type, time, and any amount or notes you entered. This is for your tracking reference only and does not represent a dosing schedule or recommendation." },
  { q: "Can I use FeverPlan for multiple children?", a: "Yes. Paid plans support multiple child profiles so you can track each child separately." },
  { q: "What happens when my access pass expires?", a: "Your data is retained. You can purchase a new pass at any time to regain full access to all features." },
  { q: "What does the Red Flags page show?", a: "The Red Flags page provides high-level educational information about symptoms commonly evaluated urgently. It is written in general terms and is not personalized medical advice. If you are concerned about your child, seek care from a healthcare professional." },
  { q: "Is my data private?", a: "Yes. Your tracking data is private to your account and is never shared or sold." },
  { q: "Can I use FeverPlan at night on my phone?", a: "Yes — FeverPlan is designed specifically for nighttime, one-handed use on a phone. The dark interface and large buttons are intentional." },
  { q: "What if I logged the wrong information?", a: "You can delete individual log entries from any tracker screen. Tap the trash icon next to an entry to remove it." },
  { q: "Does FeverPlan replace my doctor?", a: "No. FeverPlan is a support tool for tracking and education only. It does not replace professional medical care. Always consult your healthcare provider with specific questions about your child's health." },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
          <HelpCircle className="w-4 h-4 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Frequently Asked Questions</h1>
      </div>
      <p className="text-muted-foreground mb-8">Common questions about FeverPlan.</p>

      <div className="space-y-2">
        {FAQS.map(({ q, a }, i) => (
          <div key={i} className="rounded-xl bg-card border border-border overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
            >
              <span className="font-medium text-foreground text-sm pr-4">{q}</span>
              <span className={`text-muted-foreground flex-shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}>▾</span>
            </button>
            {open === i && (
              <div className="px-4 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="disclaimer-box mt-8">
        FeverPlan is for educational and tracking purposes only. It does not provide medical advice, diagnosis, or treatment.
      </div>
    </div>
  );
}
