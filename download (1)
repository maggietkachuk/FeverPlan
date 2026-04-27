import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Subscriptions
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planType: mysqlEnum("planType", ["free", "3day", "7day", "3month", "annual"]).notNull().default("free"),
  status: mysqlEnum("status", ["active", "expired", "cancelled", "pending"]).notNull().default("pending"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSessionId: varchar("stripeSessionId", { length: 256 }),
  stripePriceId: varchar("stripePriceId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;

// Child profiles
export const childProfiles = mysqlTable("child_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  childName: varchar("childName", { length: 128 }).notNull(),
  ageBand: varchar("ageBand", { length: 64 }),
  weightReference: varchar("weightReference", { length: 64 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChildProfile = typeof childProfiles.$inferSelect;

// Medication logs
export const medicationLogs = mysqlTable("medication_logs", {
  id: int("id").autoincrement().primaryKey(),
  childProfileId: int("childProfileId").notNull(),
  userId: int("userId").notNull(),
  medicationType: mysqlEnum("medicationType", ["tylenol", "advil", "other"]).notNull(),
  timeGiven: bigint("timeGiven", { mode: "number" }).notNull(), // UTC ms
  amountText: varchar("amountText", { length: 128 }),
  note: text("note"),
  reminderSent: boolean("reminderSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MedicationLog = typeof medicationLogs.$inferSelect;

// Temperature logs
export const temperatureLogs = mysqlTable("temperature_logs", {
  id: int("id").autoincrement().primaryKey(),
  childProfileId: int("childProfileId").notNull(),
  userId: int("userId").notNull(),
  temperatureValue: varchar("temperatureValue", { length: 16 }).notNull(),
  temperatureUnit: mysqlEnum("temperatureUnit", ["F", "C"]).notNull().default("F"),
  method: varchar("method", { length: 64 }),
  loggedAt: bigint("loggedAt", { mode: "number" }).notNull(), // UTC ms
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TemperatureLog = typeof temperatureLogs.$inferSelect;

// Fluid logs
export const fluidLogs = mysqlTable("fluid_logs", {
  id: int("id").autoincrement().primaryKey(),
  childProfileId: int("childProfileId").notNull(),
  userId: int("userId").notNull(),
  fluidType: varchar("fluidType", { length: 64 }).notNull(),
  amountText: varchar("amountText", { length: 128 }),
  loggedAt: bigint("loggedAt", { mode: "number" }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FluidLog = typeof fluidLogs.$inferSelect;

// Output logs
export const outputLogs = mysqlTable("output_logs", {
  id: int("id").autoincrement().primaryKey(),
  childProfileId: int("childProfileId").notNull(),
  userId: int("userId").notNull(),
  outputType: mysqlEnum("outputType", ["wet_diaper", "urinated", "vomited", "diarrhea"]).notNull(),
  loggedAt: bigint("loggedAt", { mode: "number" }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OutputLog = typeof outputLogs.$inferSelect;

// Symptom logs
export const symptomLogs = mysqlTable("symptom_logs", {
  id: int("id").autoincrement().primaryKey(),
  childProfileId: int("childProfileId").notNull(),
  userId: int("userId").notNull(),
  symptomKey: varchar("symptomKey", { length: 64 }).notNull(),
  symptomLabel: varchar("symptomLabel", { length: 128 }),
  value: boolean("value").default(true).notNull(),
  loggedAt: bigint("loggedAt", { mode: "number" }).notNull(),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SymptomLog = typeof symptomLogs.$inferSelect;

// Reminders
export const reminders = mysqlTable("reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  childProfileId: int("childProfileId").notNull(),
  medicationLogId: int("medicationLogId"),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Reminder = typeof reminders.$inferSelect;
