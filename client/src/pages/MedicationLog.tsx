import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Pill, Trash2, Clock, Plus } from "lucide-react";
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

export default function MedicationLog() {
  const utils = trpc.useUtils();
  const { selectedChildId } = useSelectedChild();
  const childId = selectedChildId ?? 0;

  const logsQ = trpc.medicationLogs.list.useQuery({ childProfileId: childId }, { enabled: !!selectedChildId });
  const logs = logsQ.data ?? [];

  const [medType, setMedType] = useState<"tylenol" | "advil" | "other">("tylenol");
  const [timeGiven, setTimeGiven] = useState(() => toLocalDatetimeValue(Date.now()));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const createMut = trpc.medicationLogs.create.useMutation({
    onSuccess: () => {
      utils.medicationLogs.list.invalidate();
      utils.reminders.list.invalidate();
      setShowForm(false); setAmount(""); setNote("");
      toast.success("Medication logged");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMut = trpc.medicationLogs.delete.useMutation({
    onSuccess: () => { utils.medicationLogs.list.invalidate(); toast.success("Entry removed"); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!selectedChildId) return toast.error("Please select a child first");
    const ms = new Date(timeGiven).getTime();
    createMut.mutate({ childProfileId: childId, medicationType: medType, timeGiven: ms, amountText: amount || undefined, note: note || undefined });
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
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Medication Log</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Log medication
        </Button>
      </div>

      <div className="disclaimer-box mb-5">
        This tracker records what you enter. Always confirm dose, concentration, timing, and age appropriateness using your medication label or pharmacist/clinician guidance. FeverPlan does not recommend doses.
      </div>

      {showForm && (
        <div className="p-5 rounded-xl bg-card border border-border mb-6 space-y-4">
          <h2 className="font-semibold text-foreground">New entry</h2>
          <div>
            <Label className="text-foreground mb-1.5 block">Medication *</Label>
            <Select value={medType} onValueChange={(v) => setMedType(v as typeof medType)}>
              <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="tylenol" className="text-foreground">Tylenol (acetaminophen)</SelectItem>
                <SelectItem value="advil" className="text-foreground">Advil / Motrin (ibuprofen)</SelectItem>
                <SelectItem value="other" className="text-foreground">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground mb-1.5 block">Time given *</Label>
            <Input type="datetime-local" value={timeGiven} onChange={(e) => setTimeGiven(e.target.value)} className="bg-input border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground mb-1.5 block">Amount (optional — your own words)</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 5 mL" className="bg-input border-border text-foreground" />
            <p className="text-xs text-muted-foreground mt-1">Enter the amount you gave. This is for your records only.</p>
          </div>
          <div>
            <Label className="text-foreground mb-1.5 block">Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any notes..." className="bg-input border-border text-foreground resize-none" rows={2} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={createMut.isPending} className="flex-1 bg-primary text-primary-foreground">
              {createMut.isPending ? "Saving..." : "Save entry"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="border-border text-foreground">Cancel</Button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Timeline ({logs.length} entries)</h2>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No medications logged yet.</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${log.medicationType === "tylenol" ? "bg-blue-500/15" : log.medicationType === "advil" ? "bg-orange-500/15" : "bg-secondary"}`}>
                  <Pill className={`w-4 h-4 ${log.medicationType === "tylenol" ? "text-blue-400" : log.medicationType === "advil" ? "text-orange-400" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground capitalize">{log.medicationType}</p>
                    {i === 0 && <span className="text-xs text-primary font-medium">Most recent</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(log.timeGiven)}
                  </div>
                  {log.amountText && <p className="text-xs text-muted-foreground mt-0.5">Amount: {log.amountText}</p>}
                  {log.note && <p className="text-xs text-muted-foreground mt-0.5">{log.note}</p>}
                </div>
                <button onClick={() => { if (confirm("Remove this entry?")) deleteMut.mutate({ id: log.id }); }} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="disclaimer-box mt-6">
        Interval information shown here is for tracking support only — it reflects what you logged, not a dosing recommendation. Always follow your medication label.
      </div>
    </div>
  );
}
