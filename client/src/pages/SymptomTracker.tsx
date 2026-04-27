import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Activity, Trash2, Plus, CheckSquare, Square } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSelectedChild } from "@/hooks/useSelectedChild";
import { SubscriptionGate } from "@/components/SubscriptionGate";
import { Link } from "wouter";

function formatDateTime(ms: number) {
  return new Date(ms).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function toLocalDatetimeValue(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const PRESET_SYMPTOMS = [
  { key: "sleeping_arousable", label: "Sleeping but arousable" },
  { key: "difficult_to_wake", label: "Difficult to wake" },
  { key: "drinking_fluids", label: "Drinking fluids" },
  { key: "refusing_fluids", label: "Refusing fluids" },
  { key: "breathing_comfortably", label: "Breathing comfortably" },
  { key: "working_harder_to_breathe", label: "Working harder to breathe" },
  { key: "playful_at_times", label: "Playful at times" },
  { key: "very_lethargic", label: "Very lethargic" },
  { key: "rash_present", label: "Rash present" },
  { key: "neck_stiffness", label: "Neck stiffness" },
  { key: "seizure", label: "Seizure" },
];

export default function SymptomTracker() {
  const utils = trpc.useUtils();
  const { selectedChildId } = useSelectedChild();
  const childId = selectedChildId ?? 0;

  const logsQ = trpc.symptomLogs.list.useQuery({ childProfileId: childId }, { enabled: !!selectedChildId });
  const logs = logsQ.data ?? [];

  const [selected, setSelected] = useState<string[]>([]);
  const [loggedAt, setLoggedAt] = useState(() => toLocalDatetimeValue(Date.now()));
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const createMut = trpc.symptomLogs.create.useMutation({
    onSuccess: () => { utils.symptomLogs.list.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.symptomLogs.delete.useMutation({ onSuccess: () => utils.symptomLogs.list.invalidate() });

  const toggleSymptom = (key: string) => {
    setSelected((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
  };

  const handleSubmit = async () => {
    if (!selectedChildId) return toast.error("Please select a child first");
    if (selected.length === 0) return toast.error("Please select at least one symptom");
    const ms = new Date(loggedAt).getTime();
    for (const key of selected) {
      const label = PRESET_SYMPTOMS.find((s) => s.key === key)?.label ?? key;
      await createMut.mutateAsync({ childProfileId: childId, symptomKey: key, symptomLabel: label, value: true, loggedAt: ms, note: note || undefined });
    }
    setSelected([]); setNote(""); setShowForm(false);
    toast.success(`${selected.length} symptom${selected.length > 1 ? "s" : ""} logged`);
  };

  if (!selectedChildId) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-muted-foreground mb-4">Please select or create a child profile first.</p>
        <Button asChild className="bg-primary text-primary-foreground"><Link href="/children">Manage Children</Link></Button>
      </div>
    );
  }

  return (
    <SubscriptionGate feature="the Symptom Tracker">
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Symptom Tracker</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Log symptoms
        </Button>
      </div>

      <div className="disclaimer-box mb-5">
        This tracker records symptoms you observe. It does not diagnose or evaluate your child's condition. If you are concerned, seek care from a healthcare professional.
      </div>

      {showForm && (
        <div className="p-5 rounded-xl bg-card border border-border mb-6 space-y-4">
          <h2 className="font-semibold text-foreground">Select symptoms observed</h2>
          <div className="grid grid-cols-1 gap-2">
            {PRESET_SYMPTOMS.map(({ key, label }) => (
              <button key={key} onClick={() => toggleSymptom(key)} className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${selected.includes(key) ? "border-primary bg-primary/10 text-foreground" : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"}`}>
                {selected.includes(key) ? <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" /> : <Square className="w-4 h-4 flex-shrink-0" />}
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
          <div>
            <Label className="text-foreground mb-1.5 block">Time observed</Label>
            <Input type="datetime-local" value={loggedAt} onChange={(e) => setLoggedAt(e.target.value)} className="bg-input border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground mb-1.5 block">Additional notes (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any additional observations..." className="bg-input border-border text-foreground resize-none" rows={2} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={createMut.isPending || selected.length === 0} className="flex-1 bg-primary text-primary-foreground">
              {createMut.isPending ? "Saving..." : `Log ${selected.length > 0 ? selected.length : ""} symptom${selected.length !== 1 ? "s" : ""}`}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setSelected([]); }} className="border-border text-foreground">Cancel</Button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">History ({logs.length} entries)</h2>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No symptoms logged yet.</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <Activity className="w-4 h-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{log.symptomLabel ?? log.symptomKey}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(log.loggedAt)}</p>
                  {log.note && <p className="text-xs text-muted-foreground mt-0.5">{log.note}</p>}
                </div>
                <button onClick={() => deleteMut.mutate({ id: log.id })} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </SubscriptionGate>
  );
}
