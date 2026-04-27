import Stripe from "stripe";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  activateSubscription, createChildProfile, createFluidLog, createFreeSubscription,
  createMedicationLog, createOutputLog, createReminder, createSymptomLog,
  createTemperatureLog, deleteChildProfile, deleteFluidLog, deleteMedicationLog,
  deleteOutputLog, deleteSymptomLog, deleteTemperatureLog, getActiveSubscription,
  getChildProfile, getChildProfiles, getFluidLogs, getMedicationLogs, getOutputLogs,
  getReminders, getSymptomLogs, getTemperatureLogs, getUserSubscriptions,
  markAllRemindersRead, markReminderRead, updateChildProfile,
} from "./db";
import { getPlanById, getPlanEndDate, PLANS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-04-22.dahlia" });

const subscriptionRouter = router({
  getActive: protectedProcedure.query(async ({ ctx }) => {
    await createFreeSubscription(ctx.user.id);
    return getActiveSubscription(ctx.user.id);
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => getUserSubscriptions(ctx.user.id)),
  getPlans: publicProcedure.query(() => PLANS),
  createCheckout: protectedProcedure
    .input(z.object({ planId: z.enum(["3day", "7day", "3month", "annual"]), origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plan = getPlanById(input.planId);
      if (!plan) throw new Error("Invalid plan");
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [{ price_data: { currency: "usd", product_data: { name: `FeverPlan ${plan.name}`, description: plan.description }, unit_amount: plan.price }, quantity: 1 }],
        customer_email: ctx.user.email ?? undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: { user_id: ctx.user.id.toString(), plan_id: input.planId, customer_email: ctx.user.email ?? "", customer_name: ctx.user.name ?? "" },
        allow_promotion_codes: true,
        success_url: `${input.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/pricing`,
      });
      return { url: session.url };
    }),
  verifyPayment: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.retrieve(input.sessionId);
      if (session.payment_status !== "paid") return { success: false };
      const planId = session.metadata?.plan_id as "3day" | "7day" | "3month" | "annual";
      const endDate = getPlanEndDate(planId);
      if (!endDate) return { success: false };
      await activateSubscription(ctx.user.id, planId, endDate, session.customer?.toString() ?? "", session.id);
      return { success: true, planId };
    }),
});

const childProfilesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => getChildProfiles(ctx.user.id)),
  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => getChildProfile(input.id, ctx.user.id)),
  create: protectedProcedure
    .input(z.object({ childName: z.string().min(1).max(128), ageBand: z.string().optional(), weightReference: z.string().optional() }))
    .mutation(async ({ ctx, input }) => createChildProfile(ctx.user.id, input.childName, input.ageBand, input.weightReference)),
  update: protectedProcedure
    .input(z.object({ id: z.number(), childName: z.string().min(1).max(128).optional(), ageBand: z.string().optional(), weightReference: z.string().optional() }))
    .mutation(async ({ ctx, input }) => { const { id, ...data } = input; return updateChildProfile(id, ctx.user.id, data); }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => deleteChildProfile(input.id, ctx.user.id)),
});

const medicationLogsRouter = router({
  list: protectedProcedure
    .input(z.object({ childProfileId: z.number(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => getMedicationLogs(input.childProfileId, ctx.user.id, input.limit)),
  create: protectedProcedure
    .input(z.object({ childProfileId: z.number(), medicationType: z.enum(["tylenol", "advil", "other"]), timeGiven: z.number(), amountText: z.string().optional(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const result = await createMedicationLog({ ...input, userId: ctx.user.id });
      const medName = input.medicationType === "tylenol" ? "Tylenol" : input.medicationType === "advil" ? "Advil" : "medication";
      const timeStr = new Date(input.timeGiven).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      await createReminder({ userId: ctx.user.id, childProfileId: input.childProfileId, message: `You logged ${medName} at ${timeStr} — tap to log the next dose when ready.` });
      return result;
    }),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => deleteMedicationLog(input.id, ctx.user.id)),
});

const temperatureLogsRouter = router({
  list: protectedProcedure
    .input(z.object({ childProfileId: z.number(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => getTemperatureLogs(input.childProfileId, ctx.user.id, input.limit)),
  create: protectedProcedure
    .input(z.object({ childProfileId: z.number(), temperatureValue: z.string(), temperatureUnit: z.enum(["F", "C"]), method: z.string().optional(), loggedAt: z.number(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => createTemperatureLog({ ...input, userId: ctx.user.id })),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => deleteTemperatureLog(input.id, ctx.user.id)),
});

const fluidLogsRouter = router({
  list: protectedProcedure
    .input(z.object({ childProfileId: z.number(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => getFluidLogs(input.childProfileId, ctx.user.id, input.limit)),
  create: protectedProcedure
    .input(z.object({ childProfileId: z.number(), fluidType: z.string(), amountText: z.string().optional(), loggedAt: z.number(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => createFluidLog({ ...input, userId: ctx.user.id })),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => deleteFluidLog(input.id, ctx.user.id)),
});

const outputLogsRouter = router({
  list: protectedProcedure
    .input(z.object({ childProfileId: z.number(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => getOutputLogs(input.childProfileId, ctx.user.id, input.limit)),
  create: protectedProcedure
    .input(z.object({ childProfileId: z.number(), outputType: z.enum(["wet_diaper", "urinated", "vomited", "diarrhea"]), loggedAt: z.number(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => createOutputLog({ ...input, userId: ctx.user.id })),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => deleteOutputLog(input.id, ctx.user.id)),
});

const symptomLogsRouter = router({
  list: protectedProcedure
    .input(z.object({ childProfileId: z.number(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => getSymptomLogs(input.childProfileId, ctx.user.id, input.limit)),
  create: protectedProcedure
    .input(z.object({ childProfileId: z.number(), symptomKey: z.string(), symptomLabel: z.string().optional(), value: z.boolean(), loggedAt: z.number(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => createSymptomLog({ ...input, userId: ctx.user.id })),
  delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => deleteSymptomLog(input.id, ctx.user.id)),
});

const remindersRouter = router({
  list: protectedProcedure.input(z.object({ childProfileId: z.number() })).query(async ({ ctx, input }) => getReminders(ctx.user.id, input.childProfileId)),
  markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => markReminderRead(input.id, ctx.user.id)),
  markAllRead: protectedProcedure.input(z.object({ childProfileId: z.number() })).mutation(async ({ ctx, input }) => markAllRemindersRead(ctx.user.id, input.childProfileId)),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  subscriptions: subscriptionRouter,
  childProfiles: childProfilesRouter,
  medicationLogs: medicationLogsRouter,
  temperatureLogs: temperatureLogsRouter,
  fluidLogs: fluidLogsRouter,
  outputLogs: outputLogsRouter,
  symptomLogs: symptomLogsRouter,
  reminders: remindersRouter,
});

export type AppRouter = typeof appRouter;
