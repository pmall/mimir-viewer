import { pgTable, text, jsonb, real } from "drizzle-orm/pg-core";

export const targetFingerprints = pgTable("target_fingerprints", {
  targetId: text("target_id").primaryKey(),
  sequence: text("sequence").notNull(),
  positions: jsonb("positions").notNull().$type<number[]>(),
  mask: jsonb("mask").notNull().$type<boolean[]>(),
  rsasa: jsonb("rsasa").notNull().$type<number[]>(),
  smoothedRsasa: jsonb("smoothed_rsasa").notNull().$type<number[]>(),
  plddt: jsonb("plddt").notNull().$type<number[]>(),
  rsasaThreshold: real("rsasa_threshold"),
});
