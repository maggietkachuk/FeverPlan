import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  createFreeSubscription: vi.fn().mockResolvedValue(undefined),
  getActiveSubscription: vi.fn().mockResolvedValue({ id: 1, userId: 1, planType: "free", status: "active", startDate: new Date(), endDate: null }),
  getUserSubscriptions: vi.fn().mockResolvedValue([]),
  activateSubscription: vi.fn().mockResolvedValue({ id: 2, planType: "7day", status: "active" }),
  getChildProfiles: vi.fn().mockResolvedValue([{ id: 1, userId: 1, childName: "Emma", ageBand: "2–5 years", weightReference: null }]),
  getChildProfile: vi.fn().mockResolvedValue({ id: 1, userId: 1, childName: "Emma" }),
  createChildProfile: vi.fn().mockResolvedValue({ id: 2, userId: 1, childName: "Liam" }),
  updateChildProfile: vi.fn().mockResolvedValue({ id: 1, childName: "Emma Updated" }),
  deleteChildProfile: vi.fn().mockResolvedValue(undefined),
  getMedicationLogs: vi.fn().mockResolvedValue([{ id: 1, userId: 1, childProfileId: 1, medicationType: "tylenol", timeGiven: Date.now(), amountText: "5 mL", note: null }]),
  createMedicationLog: vi.fn().mockResolvedValue({ id: 2, medicationType: "advil" }),
  deleteMedicationLog: vi.fn().mockResolvedValue(undefined),
  getTemperatureLogs: vi.fn().mockResolvedValue([{ id: 1, temperatureValue: "101.4", temperatureUnit: "F", loggedAt: Date.now() }]),
  createTemperatureLog: vi.fn().mockResolvedValue({ id: 2 }),
  deleteTemperatureLog: vi.fn().mockResolvedValue(undefined),
  getFluidLogs: vi.fn().mockResolvedValue([]),
  createFluidLog: vi.fn().mockResolvedValue({ id: 1 }),
  deleteFluidLog: vi.fn().mockResolvedValue(undefined),
  getOutputLogs: vi.fn().mockResolvedValue([]),
  createOutputLog: vi.fn().mockResolvedValue({ id: 1 }),
  deleteOutputLog: vi.fn().mockResolvedValue(undefined),
  getSymptomLogs: vi.fn().mockResolvedValue([]),
  createSymptomLog: vi.fn().mockResolvedValue({ id: 1 }),
  deleteSymptomLog: vi.fn().mockResolvedValue(undefined),
  getReminders: vi.fn().mockResolvedValue([{ id: 1, message: "You logged Tylenol at 10:00 PM — tap to log the next dose when ready.", isRead: false }]),
  createReminder: vi.fn().mockResolvedValue({ id: 1 }),
  markReminderRead: vi.fn().mockResolvedValue(undefined),
  markAllRemindersRead: vi.fn().mockResolvedValue(undefined),
}));

// ─── Shared test context ──────────────────────────────────────────────────────
function makeCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "parent@example.com",
      name: "Test Parent",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns the current user when authenticated", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, name: "Test Parent" });
  });

  it("returns null for unauthenticated requests", async () => {
    const ctx = { ...makeCtx(), user: null };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and returns success", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
  });
});

// ─── Subscriptions ────────────────────────────────────────────────────────────
describe("subscriptions.getActive", () => {
  it("returns the active subscription for the user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.subscriptions.getActive();
    expect(result).toMatchObject({ planType: "free", status: "active" });
  });
});

describe("subscriptions.getPlans", () => {
  it("returns all available plans", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const plans = await caller.subscriptions.getPlans();
    expect(plans.length).toBeGreaterThan(0);
    const ids = plans.map((p) => p.id);
    expect(ids).toContain("3day");
    expect(ids).toContain("7day");
    expect(ids).toContain("3month");
    expect(ids).toContain("annual");
  });
});

// ─── Child Profiles ───────────────────────────────────────────────────────────
describe("childProfiles.list", () => {
  it("returns child profiles for the authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.childProfiles.list();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ childName: "Emma" });
  });
});

describe("childProfiles.create", () => {
  it("creates a new child profile", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.childProfiles.create({ childName: "Liam", ageBand: "1–2 years" });
    expect(result).toMatchObject({ childName: "Liam" });
  });

  it("rejects empty child name", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.childProfiles.create({ childName: "" })).rejects.toThrow();
  });
});

// ─── Medication Logs ──────────────────────────────────────────────────────────
describe("medicationLogs.list", () => {
  it("returns medication logs for a child profile", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.medicationLogs.list({ childProfileId: 1 });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ medicationType: "tylenol" });
  });
});

describe("medicationLogs.create", () => {
  it("creates a medication log and generates a reminder", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.medicationLogs.create({
      childProfileId: 1,
      medicationType: "advil",
      timeGiven: Date.now(),
      amountText: "7.5 mL",
    });
    expect(result).toMatchObject({ medicationType: "advil" });
  });
});

// ─── Temperature Logs ─────────────────────────────────────────────────────────
describe("temperatureLogs.list", () => {
  it("returns temperature logs for a child profile", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.temperatureLogs.list({ childProfileId: 1 });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ temperatureValue: "101.4", temperatureUnit: "F" });
  });
});

describe("temperatureLogs.create", () => {
  it("creates a temperature log entry", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.temperatureLogs.create({
      childProfileId: 1,
      temperatureValue: "102.1",
      temperatureUnit: "F",
      loggedAt: Date.now(),
    });
    expect(result).toBeDefined();
  });
});

// ─── Reminders ────────────────────────────────────────────────────────────────
describe("reminders.list", () => {
  it("returns reminders for a child profile", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.reminders.list({ childProfileId: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].message).toContain("Tylenol");
    expect(result[0].message).toContain("tap to log the next dose when ready");
  });

  it("reminder message is framed as tracking support, not dosing guidance", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.reminders.list({ childProfileId: 1 });
    const msg = result[0].message.toLowerCase();
    // Must NOT contain dosing recommendation language
    expect(msg).not.toContain("give");
    expect(msg).not.toContain("dose now");
    expect(msg).not.toContain("it is time to");
    // Must contain tracking-support language
    expect(msg).toContain("logged");
  });
});

describe("reminders.markAllRead", () => {
  it("marks all reminders as read for a child profile", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.reminders.markAllRead({ childProfileId: 1 })).resolves.not.toThrow();
  });
});
