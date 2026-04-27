import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Thermometer, Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSelectedChild } from "@/hooks/useSelectedChild";
import { Link } from "wouter";

function formatDateTime(ms: number) {
  return new Date(ms).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function toLocalDatetimeValue(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const METHODS = ["Oral", "Ear (tympanic)", "Axillary (armpit)", "Rectal", "Forehead (temporal)"];

export default function TemperatureLog() {
  const utils = trpc.useUtils();
  const { selectedChildId } = useSelectedChild();
  const childId = selectedChildId ?? 0;

  const logsQ = trpc.temperatureLogs.list.useQuery({ childProfileId: childId }, { enabled: !!selectedChildId });
  const logs = logsQ.data ?? [];

  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<"F" | "C">("F");
  const [method, setMethod] = useState("");
  const [loggedAt, setLoggedAt] = useState(() => toLocalDatetimeValue(Date.now()));
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const createMut = trpc.temperatureLogs.create.useMutation({
    onSuccess: () => { utils.temperatureLogs.list.invalidate(); setShowForm(false); setValue(""); setNote(""); toast.success("Temperature logged"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.temperatureLogs.delete.useMutation({
    onSuccess: () => { utils.temperatureLogs.list.invalidate(); toast.success("Entry removed"); },
  });

  const handleSubmit = () => {
    if (!selectedChildId) return toast.error("Please select a child first");
    if (!value.trim()) return toast.error("Please enter a temperature value");
    createMut.mutate({ childProfileId: childId, temperatureValue: value.trim(), temperatureUnit: unit, method: method || undefined, loggedAt: new Date(loggedAt).getTime(), note: note || undefined });
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
        <h1 className="text-2xl font-bold text-foreground">Temperature Log</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" /> Add reading
        </Button>
      </div>

      {showForm && (
        <div className="p-5 rounded-xl bg-card border border-border mb-6 space-y-4">
          <h2 className="font-semibold text-foreground">New reading</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-foreground mb-1.5 block">Temperature *</Label>
              <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 101.4" className="bg-input border-border text-foreground" />
            </div>
            <div className="w-24">
              <Label className="text-foreground mb-1.5 block">Unit</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as "F" | "C")}>
                <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="F" className="text-foreground">°F</SelectItem>
                  <SelectItem value="C" className="text-foreground">°C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-foreground mb-1.5 block">Method (optional)</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Select method" /></SelectTrigger>
              <SelectContent className="bg-card border-border">
                {METHODS.map((m) => <SelectItem key={m} value={m} className="text-foreground">{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground mb-1.5 block">Time taken *</Label>
            <Input type="datetime-local" value={loggedAt} onChange={(e) => setLoggedAt(e.target.value)} className="bg-input border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground mb-1.5 block">Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any notes..." className="bg-input border-border text-foreground resize-none" rows={2} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={createMut.isPending} className="flex-1 bg-primary text-primary-foreground">
              {createMut.isPending ? "Saving..." : "Save reading"}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="border-border text-foreground">Cancel</Button>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">History ({logs.length} readings)</h2>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No temperature readings logged yet.</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => {
              const temp = parseFloat(log.temperatureValue);
              const isHigh = (log.temperatureUnit === "F" && temp >= 100.4) || (log.temperatureUnit === "C" && temp >= 38);
              return (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isHigh ? "bg-red-500/15" : "bg-secondary"}`}>
                    <Thermometer className={`w-4 h-4 ${isHigh ? "text-red-400" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-foreground text-lg">{log.temperatureValue}°{log.temperatureUnit}</p>
                      {i === 0 && <span className="text-xs text-primary font-medium">Latest</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDateTime(log.loggedAt)}{log.method ? ` · ${log.method}` : ""}</p>
                    {log.note && <p className="text-xs text-muted-foreground mt-0.5">{log.note}</p>}
                  </div>
                  <button onClick={() => { if (confirm("Remove this entry?")) deleteMut.mutate({ id: log.id }); }} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
