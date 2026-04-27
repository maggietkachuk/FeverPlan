// EDITABLE CONTENT: Update the CONTENT object below to revise educational copy without changing component code.
import { BookOpen } from "lucide-react";

const CONTENT = {
  title: "Fever Basics",
  subtitle: "Educational information to help you understand fever in children.",
  sections: [
    {
      heading: "What is a fever?",
      body: "A fever is generally defined as a body temperature above 100.4°F (38°C). Fever is not a disease — it is a sign that the body's immune system is responding to an infection or illness. In most cases, fever itself is not harmful."
    },
    {
      heading: "What matters more than the number",
      body: "How your child looks and acts is often more important than the exact temperature. A child with a temperature of 103°F who is alert, drinking fluids, and playing may be less concerning than a child with 100.5°F who is very difficult to wake or appears seriously unwell."
    },
    {
      heading: "Common viral fever patterns",
      body: "Viral illnesses often cause fevers that come and go over several days. It is common for a fever to improve with medication and then return as the medication wears off. This pattern alone is not a sign of worsening illness."
    },
    {
      heading: "Home care basics",
      body: "Keep your child comfortable. Dress them lightly. Encourage rest. Offer fluids frequently. You do not need to treat a fever with medication unless your child is uncomfortable — the goal of medication is comfort, not to eliminate the fever number."
    },
    {
      heading: "Hydration basics",
      body: "Staying hydrated is one of the most important parts of home care during a fever. Offer small amounts of fluid frequently. Signs of dehydration include no wet diapers or urination for several hours, dry mouth, no tears when crying, and unusual lethargy."
    },
    {
      heading: "Medication basics",
      body: "Acetaminophen (Tylenol) and ibuprofen (Advil, Motrin) are commonly used to help with fever discomfort. Always follow the dosing instructions on your specific product label. Dose is based on your child's weight — confirm the correct dose with your pharmacist or clinician. Never give aspirin to children."
    },
  ],
  disclaimer: "This content is for educational purposes only and does not constitute medical advice. Always consult your healthcare provider with specific questions about your child's health."
};

export default function FeverBasics() {
  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{CONTENT.title}</h1>
      </div>
      <p className="text-muted-foreground mb-8">{CONTENT.subtitle}</p>

      <div className="space-y-6">
        {CONTENT.sections.map(({ heading, body }) => (
          <div key={heading} className="p-5 rounded-xl bg-card border border-border">
            <h2 className="font-semibold text-foreground mb-2">{heading}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
          </div>
        ))}
      </div>

      <div className="disclaimer-box mt-8">{CONTENT.disclaimer}</div>
    </div>
  );
}
