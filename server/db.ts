import { and, desc, eq, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  childProfiles,
  fluidLogs,
  medicationLogs,
  outputLogs,
  reminders,
  subscriptions,
  symptomLogs,
  temperatureLogs,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export async function getActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const now = new Date();
  const paid = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"), gte(subscriptions.endDate, now)))
    .orderBy(desc(subscriptions.endDate))
    .limit(1);
  if (paid.length > 0) return paid[0];
  const free = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.planType, "free"), eq(subscriptions.status, "active")))
    .limit(1);
  return free[0] ?? null;
}

export async function getUserSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt));
}

export async function createFreeSubscription(userId: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  if (existing.length > 0) return;
  await db.insert(subscriptions).values({ userId, planType: "free", status: "active", startDate: new Date() });
}

export async function activateSubscription(
  userId: number,
  planType: "3day" | "7day" | "3month" | "annual",
  endDate: Date,
  stripeCustomerId: string,
  stripeSessionId: string
) {
  const db = await getDb();
  if (!db) return;
  await db.insert(subscriptions).values({ userId, planType, status: "active", startDate: new Date(), endDate, stripeCustomerId, stripeSessionId });
}

// ─── Child Profiles ───────────────────────────────────────────────────────────

export async function getChildProfiles(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(childProfiles).where(and(eq(childProfiles.userId, userId), eq(childProfiles.isActive, true))).orderBy(childProfiles.createdAt);
}

export async function getChildProfile(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(childProfiles).where(and(eq(childProfiles.id, id), eq(childProfiles.userId, userId))).limit(1);
  return result[0] ?? null;
}

export async function createChildProfile(userId: number, childName: string, ageBand?: string, weightReference?: string) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(childProfiles).values({ userId, childName, ageBand: ageBand ?? null, weightReference: weightReference ?? null });
}

export async function updateChildProfile(id: number, userId: number, data: { childName?: string; ageBand?: string; weightReference?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(childProfiles).set(data).where(and(eq(childProfiles.id, id), eq(childProfiles.userId, userId)));
}

export async function deleteChildProfile(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(childProfiles).set({ isActive: false }).where(and(eq(childProfiles.id, id), eq(childProfiles.userId, userId)));
}

// ─── Medication Logs ──────────────────────────────────────────────────────────

export async function getMedicationLogs(childProfileId: number, userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(medicationLogs).where(and(eq(medicationLogs.childProfileId, childProfileId), eq(medicationLogs.userId, userId))).orderBy(desc(medicationLogs.timeGiven)).limit(limit);
}

export async function createMedicationLog(data: {
  childProfileId: number; userId: number;
  medicationType: "tylenol" | "advil" | "other";
  timeGiven: number; amountText?: string; note?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(medicationLogs).values({ ...data, amountText: data.amountText ?? null, note: data.note ?? null });
}

export async function deleteMedicationLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(medicationLogs).where(and(eq(medicationLogs.id, id), eq(medicationLogs.userId, userId)));
}

// ─── Temperature Logs ─────────────────────────────────────────────────────────

export async function getTemperatureLogs(childProfileId: number, userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(temperatureLogs).where(and(eq(temperatureLogs.childProfileId, childProfileId), eq(temperatureLogs.userId, userId))).orderBy(desc(temperatureLogs.loggedAt)).limit(limit);
}

export async function createTemperatureLog(data: {
  childProfileId: number; userId: number;
  temperatureValue: string; temperatureUnit: "F" | "C";
  method?: string; loggedAt: number; note?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(temperatureLogs).values({ ...data, method: data.method ?? null, note: data.note ?? null });
}

export async function deleteTemperatureLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(temperatureLogs).where(and(eq(temperatureLogs.id, id), eq(temperatureLogs.userId, userId)));
}

// ─── Fluid Logs ───────────────────────────────────────────────────────────────

export async function getFluidLogs(childProfileId: number, userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fluidLogs).where(and(eq(fluidLogs.childProfileId, childProfileId), eq(fluidLogs.userId, userId))).orderBy(desc(fluidLogs.loggedAt)).limit(limit);
}

export async function createFluidLog(data: {
  childProfileId: number; userId: number;
  fluidType: string; amountText?: string; loggedAt: number; note?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(fluidLogs).values({ ...data, amountText: data.amountText ?? null, note: data.note ?? null });
}

export async function deleteFluidLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(fluidLogs).where(and(eq(fluidLogs.id, id), eq(fluidLogs.userId, userId)));
}

// ─── Output Logs ──────────────────────────────────────────────────────────────

export async function getOutputLogs(childProfileId: number, userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(outputLogs).where(and(eq(outputLogs.childProfileId, childProfileId), eq(outputLogs.userId, userId))).orderBy(desc(outputLogs.loggedAt)).limit(limit);
}

export async function createOutputLog(data: {
  childProfileId: number; userId: number;
  outputType: "wet_diaper" | "urinated" | "vomited" | "diarrhea";
  loggedAt: number; note?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(outputLogs).values({ ...data, note: data.note ?? null });
}

export async function deleteOutputLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(outputLogs).where(and(eq(outputLogs.id, id), eq(outputLogs.userId, userId)));
}

// ─── Symptom Logs ─────────────────────────────────────────────────────────────

export async function getSymptomLogs(childProfileId: number, userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(symptomLogs).where(and(eq(symptomLogs.childProfileId, childProfileId), eq(symptomLogs.userId, userId))).orderBy(desc(symptomLogs.loggedAt)).limit(limit);
}

export async function createSymptomLog(data: {
  childProfileId: number; userId: number;
  symptomKey: string; symptomLabel?: string;
  value: boolean; loggedAt: number; note?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(symptomLogs).values({ ...data, symptomLabel: data.symptomLabel ?? null, note: data.note ?? null });
}

export async function deleteSymptomLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(symptomLogs).where(and(eq(symptomLogs.id, id), eq(symptomLogs.userId, userId)));
}

// ─── Reminders ────────────────────────────────────────────────────────────────

export async function getReminders(userId: number, childProfileId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reminders).where(and(eq(reminders.userId, userId), eq(reminders.childProfileId, childProfileId))).orderBy(desc(reminders.createdAt)).limit(20);
}

export async function createReminder(data: {
  userId: number; childProfileId: number;
  medicationLogId?: number; message: string;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(reminders).values({ ...data, medicationLogId: data.medicationLogId ?? null });
}

export async function markReminderRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(reminders).set({ isRead: true }).where(and(eq(reminders.id, id), eq(reminders.userId, userId)));
}

export async function markAllRemindersRead(userId: number, childProfileId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(reminders).set({ isRead: true }).where(and(eq(reminders.userId, userId), eq(reminders.childProfileId, childProfileId)));
}
