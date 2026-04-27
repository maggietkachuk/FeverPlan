import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Pill, Thermometer, Droplets, Activity, AlertTriangle, Baby, Bell } from "lucide-react";
import { useSelectedChild } from "@/hooks/useSelectedChild";
import { useState, useEffect } from "react";
import { toast } from "sonner";

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function formatDate(ms: number) {
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const { selectedChildId, setSelectedChildId } = useSelectedChild();
  const childrenQ = trpc.childProfiles.list.useQuery();
  const children = childrenQ.data ?? [];

  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children]);

  const child = children.find((c) => c.id === selectedChildId);
  const childId = selectedChildId ?? 0;

  const medsQ = trpc.medicationLogs.list.useQuery({ childProfileId: childId, limit: 5 }, { enabled: !!selectedChildId });
  const tempsQ = trpc.temperatureLogs.list.useQuery({ childProfileId: childId, limit: 5 }, { enabled: !!selectedChildId });
  const fluidsQ = trpc.fluidLogs.list.useQuery({ childProfileId: childId, limit: 20 }, { enabled: !!selectedChildId });
  const outputQ = trpc.outputLogs.list.useQuery({ childProfileId: childId, limit: 20 }, { enabled: !!selectedChildId });
  const remindersQ = trpc.reminders.list.useQuery({ childProfileId: childId }, { enabled: !!selectedChildId });

  const markAllRead = trpc.reminders.markAllRead.useMutation({ onSuccess: () => remindersQ.refetch() });

  const lastMed = medsQ.data?.[0];
  const lastTemp = tempsQ.data?.[0];
  const unreadReminders = (remindersQ.data ?? []).filter((r) => !r.isRead);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  const todayFluids = (fluidsQ.data ?? []).filter((f) => f.loggedAt >= todayMs).length;
  const todayOutput = (outputQ.data ?? []).filter((o) => o.loggedAt >= todayMs).length;
  const todayMeds = (medsQ.data ?? []).filter((m) => m.timeGiven >= todayMs).length;

  if (children.length === 0) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
          <Baby className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Add a child profile to get started</h2>
        <p className="text-muted-foreground mb-6">Create a profile for your child to begin tracking.</p>
        <Button asChild className="bg-primary text-primary-foreground">
          <Link href="/children">Add Child Profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedChildId(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${c.id === selectedChildId ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
            >
              {c.childName}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{child?.childName ?? "Dashboard"}</h1>
        {child?.ageBand && <p className="text-sm text-muted-foreground">{child.ageBand}</p>}
      </div>

      {/* Reminders */}
      {unreadReminders.length > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-primary/8 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-primary font-medium text-sm">
              <Bell className="w-4 h-4" />
              {unreadReminders.length} reminder{unreadReminders.length > 1 ? "s" : ""}
            </div>
            <button onClick={() => markAllRead.mutate({ childProfileId: childId })} className="text-xs text-muted-foreground hover:text-foreground">
              Mark all read
            </button>
          </div>
          <p className="text-sm text-foreground">{unreadReminders[0].message}</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Last temperature</p>
          {lastTemp ? (
            <>
              <p className="text-2xl font-bold text-foreground">{lastTemp.temperatureValue}°{lastTemp.temperatureUnit}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatTime(lastTemp.loggedAt)} · {formatDate(lastTemp.loggedAt)}</p>
            </>
          ) : <p className="text-muted-foreground text-sm">None logged</p>}
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Last medication</p>
          {lastMed ? (
            <>
              <p className="text-lg font-bold text-foreground capitalize">{lastMed.medicationType}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatTime(lastMed.timeGiven)} · {formatDate(lastMed.timeGiven)}</p>
            </>
          ) : <p className="text-muted-foreground text-sm">None logged</p>}
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Today's fluids</p>
          <p className="text-2xl font-bold text-foreground">{todayFluids}</p>
          <p className="text-xs text-muted-foreground mt-1">entries logged</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-xs text-muted-foreground mb-1">Today's output</p>
          <p className="text-2xl font-bold text-foreground">{todayOutput}</p>
          <p className="text-xs text-muted-foreground mt-1">events logged</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/medications", icon: Pill, label: "Log Tylenol", color: "text-blue-400" },
            { href: "/medications", icon: Pill, label: "Log Advil", color: "text-orange-400" },
            { href: "/temperature", icon: Thermometer, label: "Add temperature", color: "text-red-400" },
            { href: "/fluids", icon: Droplets, label: "Add fluids", color: "text-cyan-400" },
            { href: "/fluids", icon: Droplets, label: "Log output", color: "text-purple-400" },
            { href: "/red-flags", icon: AlertTriangle, label: "Red flags", color: "text-amber-400" },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={label} href={href} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
              <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
              <span className="text-sm font-medium text-foreground">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's meds */}
      {todayMeds > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Today's medications ({todayMeds})</h2>
          <div className="space-y-2">
            {(medsQ.data ?? []).filter((m) => m.timeGiven >= todayMs).slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground capitalize">{m.medicationType}</span>
                  {m.amountText && <span className="text-xs text-muted-foreground">· {m.amountText}</span>}
                </div>
                <span className="text-xs text-muted-foreground">{formatTime(m.timeGiven)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="disclaimer-box mt-6">
        This tool is for tracking and education only. It does not provide medical advice. Always follow medication labels and seek care from a healthcare professional when needed.
      </div>
    </div>
  );
}
