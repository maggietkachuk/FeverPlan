// EDITABLE CONTENT: Update the CONTENT object below to revise red flags copy without changing component code.
import { AlertTriangle } from "lucide-react";

const CONTENT = {
  title: "Red Flags & When to Seek Care",
  subtitle: "This page provides high-level educational guidance on symptoms commonly evaluated urgently. It is not a substitute for medical judgment.",
  emergencyNote: "If your child appears seriously unwell, call emergency services or go to the nearest emergency room immediately.",
  sections: [
    {
      heading: "Seek urgent evaluation for any child with",
      items: [
        "Difficulty breathing, fast breathing, or noisy breathing",
        "Lips or fingernails appearing blue or gray",
        "A seizure (convulsion) that has not occurred before",
        "Extreme difficulty waking or unusual unresponsiveness",
        "A non-blanching rash (a rash that does not fade when pressed)",
        "Signs of severe dehydration: no wet diapers for 8+ hours, no tears, very dry mouth, sunken eyes",
        "Neck stiffness combined with fever and headache",
        "A bulging fontanelle (soft spot) in infants",
      ]
    },
    {
      heading: "Age-based considerations",
      items: [
        "Infants under 3 months with any fever (100.4°F / 38°C or higher) — urgent evaluation is commonly recommended",
        "Infants 3–6 months with fever above 102°F (38.9°C) — prompt evaluation is often advised",
        "Children of any age who appear very ill, regardless of temperature",
      ]
    },
    {
      heading: "Other symptoms commonly evaluated promptly",
      items: [
        "Fever lasting more than 5 days",
        "Fever that returns after being gone for more than 24 hours",
        "Ear pain, eye redness, or throat pain that is severe or worsening",
        "Persistent vomiting or diarrhea with signs of dehydration",
        "Severe headache",
        "Significant abdominal pain",
        "Limping or refusing to bear weight",
      ]
    },
    {
      heading: "Trust your instincts",
      items: [
        "If something feels wrong, seek care. You know your child best.",
        "These symptoms are commonly evaluated urgently — this list is not exhaustive.",
        "Seek medical attention promptly if you are concerned, regardless of whether a specific symptom is listed here.",
      ]
    }
  ],
  disclaimer: "This content is for educational purposes only. It does not provide medical advice, diagnosis, or treatment. Always seek care from a qualified healthcare professional. In an emergency, call 911 or your local emergency number."
};

export default function RedFlags() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{CONTENT.title}</h1>
      </div>
      <p className="text-muted-foreground mb-4">{CONTENT.subtitle}</p>

      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-8">
        <p className="text-sm font-semibold text-red-300">{CONTENT.emergencyNote}</p>
      </div>

      <div className="space-y-5">
        {CONTENT.sections.map(({ heading, items }) => (
          <div key={heading} className="p-5 rounded-xl bg-card border border-border">
            <h2 className="font-semibold text-foreground mb-3">{heading}</h2>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="disclaimer-box mt-8">{CONTENT.disclaimer}</div>
    </div>
  );
}
