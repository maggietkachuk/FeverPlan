import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, Trash2, Plus } from "lucide-react";
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

const FLUID_TYPES = ["Breastmilk", "Formula", "Water", "Electrolyte drink", "Popsicle", "Juice", "Other"];
const OUTPUT_TYPES = [
  { value: "wet_diaper", label: "Wet diaper" },
  { value: "urinated", label: "Urinated" },
  { value: "vomited", label: "Vomited" },
  { value: "diarrhea", label: "Diarrhea" },
] as const;

export default function FluidsOutput() {
  const utils = trpc.useUtils();
  const { selectedChildId } = useSelectedChild();
  const childId = selectedChildId ?? 0;

  const fluidsQ = trpc.fluidLogs.list.useQuery({ childProfileId: childId }, { enabled: !!selectedChildId });
  const outputQ = trpc.outputLogs.list.useQuery({ childProfileId: childId }, { enabled: !!selectedChildId });

  const [fluidType, setFluidType] = useState("Water");
  const [fluidAmount, setFluidAmount] = useState("");
  const [fluidTime, setFluidTime] = useState(() => toLocalDatetimeValue(Date.now()));
  const [fluidNote, setFluidNote] = useState("");
  const [showFluidForm, setShowFluidForm] = useState(false);

  const [outputType, setOutputType] = useState<"wet_diaper" | "urinated" | "vomited" | "diarrhea">("wet_diaper");
  const [outputTime, setOutputTime] = useState(() => toLocalDatetimeValue(Date.now()));
  const [outputNote, setOutputNote] = useState("");
  const [showOutputForm, setShowOutputForm] = useState(false);

  const createFluid = trpc.fluidLogs.create.useMutation({
    onSuccess: () => { utils.fluidLogs.list.invalidate(); setShowFluidForm(false); setFluidAmount(""); setFluidNote(""); toast.success("Fluid intake logged"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteFluid = trpc.fluidLogs.delete.useMutation({ onSuccess: () => utils.fluidLogs.list.invalidate() });

  const createOutput = trpc.outputLogs.create.useMutation({
    onSuccess: () => { utils.outputLogs.list.invalidate(); setShowOutputForm(false); setOutputNote(""); toast.success("Output event logged"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteOutput = trpc.outputLogs.delete.useMutation({ onSuccess: () => utils.outputLogs.list.invalidate() });

  if (!selectedChildId) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-muted-foreground mb-4">Please select or create a child profile first.</p>
        <Button asChild className="bg-primary text-primary-foreground"><Link href="/children">Manage Children</Link></Button>
      </div>
    );
  }

  return (
    <SubscriptionGate feature="the Fluids & Output tracker">
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Fluids & Output</h1>

      <Tabs defaultValue="fluids">
        <TabsList className="w-full mb-6 bg-secondary">
          <TabsTrigger value="fluids" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground">Fluid Intake</TabsTrigger>
          <TabsTrigger value="output" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-foreground">Output</TabsTrigger>
        </TabsList>

        <TabsContent value="fluids">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowFluidForm(!showFluidForm)} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /> Log fluid
            </Button>
          </div>
          {showFluidForm && (
            <div className="p-5 rounded-xl bg-card border border-border mb-4 space-y-4">
              <div><Label className="text-foreground mb-1.5 block">Fluid type *</Label>
                <Select value={fluidType} onValueChange={setFluidType}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">{FLUID_TYPES.map((f) => <SelectItem key={f} value={f} className="text-foreground">{f}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label className="text-foreground mb-1.5 block">Amount (optional)</Label>
                <Input value={fluidAmount} onChange={(e) => setFluidAmount(e.target.value)} placeholder="e.g. 4 oz" className="bg-input border-border text-foreground" /></div>
              <div><Label className="text-foreground mb-1.5 block">Time</Label>
                <Input type="datetime-local" value={fluidTime} onChange={(e) => setFluidTime(e.target.value)} className="bg-input border-border text-foreground" /></div>
              <div><Label className="text-foreground mb-1.5 block">Note (optional)</Label>
                <Textarea value={fluidNote} onChange={(e) => setFluidNote(e.target.value)} className="bg-input border-border text-foreground resize-none" rows={2} /></div>
              <div className="flex gap-2">
                <Button onClick={() => createFluid.mutate({ childProfileId: childId, fluidType, amountText: fluidAmount || undefined, loggedAt: new Date(fluidTime).getTime(), note: fluidNote || undefined })} disabled={createFluid.isPending} className="flex-1 bg-primary text-primary-foreground">Save</Button>
                <Button variant="outline" onClick={() => setShowFluidForm(false)} className="border-border text-foreground">Cancel</Button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {(fluidsQ.data ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No fluid intake logged yet.</div>
            ) : (fluidsQ.data ?? []).map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <Droplets className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{log.fluidType}{log.amountText ? ` · ${log.amountText}` : ""}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(log.loggedAt)}</p>
                  {log.note && <p className="text-xs text-muted-foreground">{log.note}</p>}
                </div>
                <button onClick={() => deleteFluid.mutate({ id: log.id })} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="output">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setShowOutputForm(!showOutputForm)} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /> Log output
            </Button>
          </div>
          {showOutputForm && (
            <div className="p-5 rounded-xl bg-card border border-border mb-4 space-y-4">
              <div><Label className="text-foreground mb-1.5 block">Output type *</Label>
                <Select value={outputType} onValueChange={(v) => setOutputType(v as typeof outputType)}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">{OUTPUT_TYPES.map((o) => <SelectItem key={o.value} value={o.value} className="text-foreground">{o.label}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label className="text-foreground mb-1.5 block">Time</Label>
                <Input type="datetime-local" value={outputTime} onChange={(e) => setOutputTime(e.target.value)} className="bg-input border-border text-foreground" /></div>
              <div><Label className="text-foreground mb-1.5 block">Note (optional)</Label>
                <Textarea value={outputNote} onChange={(e) => setOutputNote(e.target.value)} className="bg-input border-border text-foreground resize-none" rows={2} /></div>
              <div className="flex gap-2">
                <Button onClick={() => createOutput.mutate({ childProfileId: childId, outputType, loggedAt: new Date(outputTime).getTime(), note: outputNote || undefined })} disabled={createOutput.isPending} className="flex-1 bg-primary text-primary-foreground">Save</Button>
                <Button variant="outline" onClick={() => setShowOutputForm(false)} className="border-border text-foreground">Cancel</Button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {(outputQ.data ?? []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No output events logged yet.</div>
            ) : (outputQ.data ?? []).map((log) => {
              const label = OUTPUT_TYPES.find((o) => o.value === log.outputType)?.label ?? log.outputType;
              return (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <Droplets className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(log.loggedAt)}</p>
                    {log.note && <p className="text-xs text-muted-foreground">{log.note}</p>}
                  </div>
                  <button onClick={() => deleteOutput.mutate({ id: log.id })} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </SubscriptionGate>
  );
}
