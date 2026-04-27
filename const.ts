import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Baby } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSelectedChild } from "@/hooks/useSelectedChild";

const AGE_BANDS = ["0–3 months", "3–6 months", "6–12 months", "1–2 years", "2–5 years", "5–12 years", "12+ years"];

export default function ChildProfiles() {
  const utils = trpc.useUtils();
  const { selectedChildId, setSelectedChildId } = useSelectedChild();
  const childrenQ = trpc.childProfiles.list.useQuery();
  const children = childrenQ.data ?? [];

  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [ageBand, setAgeBand] = useState("");
  const [weight, setWeight] = useState("");

  const createMut = trpc.childProfiles.create.useMutation({
    onSuccess: () => { utils.childProfiles.list.invalidate(); setAddOpen(false); setName(""); setAgeBand(""); setWeight(""); toast.success("Child profile added"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.childProfiles.update.useMutation({
    onSuccess: () => { utils.childProfiles.list.invalidate(); setEditId(null); toast.success("Profile updated"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.childProfiles.delete.useMutation({
    onSuccess: (_, vars) => {
      utils.childProfiles.list.invalidate();
      if (selectedChildId === vars.id) setSelectedChildId(null);
      toast.success("Profile removed");
    },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (c: typeof children[0]) => {
    setEditId(c.id); setName(c.childName); setAgeBand(c.ageBand ?? ""); setWeight(c.weightReference ?? "");
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Children</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /> Add child
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground">
            <DialogHeader><DialogTitle>Add child profile</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div><Label className="text-foreground mb-1.5 block">Name or nickname *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emma" className="bg-input border-border text-foreground" /></div>
              <div><Label className="text-foreground mb-1.5 block">Age range</Label>
                <Select value={ageBand} onValueChange={setAgeBand}>
                  <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Select age range" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">{AGE_BANDS.map((a) => <SelectItem key={a} value={a} className="text-foreground">{a}</SelectItem>)}</SelectContent>
                </Select></div>
              <div><Label className="text-foreground mb-1.5 block">Weight (optional, for your reference only)</Label>
                <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 22 lbs" className="bg-input border-border text-foreground" /></div>
              <p className="text-xs text-muted-foreground">Weight is stored for your personal reference only. FeverPlan does not use it for any calculations.</p>
              <Button disabled={!name.trim()} onClick={() => createMut.mutate({ childName: name.trim(), ageBand: ageBand || undefined, weightReference: weight || undefined })} className="w-full bg-primary text-primary-foreground">
                {createMut.isPending ? "Adding..." : "Add profile"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {children.length === 0 ? (
        <div className="text-center py-16">
          <Baby className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No child profiles yet. Add one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((c) => (
            <div key={c.id} className={`p-4 rounded-xl border ${c.id === selectedChildId ? "border-primary bg-primary/8" : "border-border bg-card"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{c.childName}</p>
                  {c.ageBand && <p className="text-xs text-muted-foreground mt-0.5">{c.ageBand}</p>}
                  {c.weightReference && <p className="text-xs text-muted-foreground">Weight ref: {c.weightReference}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {c.id !== selectedChildId && (
                    <Button size="sm" variant="outline" className="text-xs border-border" onClick={() => setSelectedChildId(c.id)}>Select</Button>
                  )}
                  {c.id === selectedChildId && <span className="text-xs text-primary font-medium">Active</span>}
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { if (confirm("Remove this profile?")) deleteMut.mutate({ id: c.id }); }} className="p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={editId !== null} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader><DialogTitle>Edit profile</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div><Label className="text-foreground mb-1.5 block">Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-input border-border text-foreground" /></div>
            <div><Label className="text-foreground mb-1.5 block">Age range</Label>
              <Select value={ageBand} onValueChange={setAgeBand}>
                <SelectTrigger className="bg-input border-border text-foreground"><SelectValue placeholder="Select age range" /></SelectTrigger>
                <SelectContent className="bg-card border-border">{AGE_BANDS.map((a) => <SelectItem key={a} value={a} className="text-foreground">{a}</SelectItem>)}</SelectContent>
              </Select></div>
            <div><Label className="text-foreground mb-1.5 block">Weight reference</Label>
              <Input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 22 lbs" className="bg-input border-border text-foreground" /></div>
            <Button disabled={!name.trim()} onClick={() => editId && updateMut.mutate({ id: editId, childName: name.trim(), ageBand: ageBand || undefined, weightReference: weight || undefined })} className="w-full bg-primary text-primary-foreground">
              {updateMut.isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
