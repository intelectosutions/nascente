import { pgTable, serial, varchar, date, timestamp, integer, text, index, uniqueIndex } from "drizzle-orm/pg-core";

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  nome: varchar("nome", { length: 200 }).notNull(),
  codigo: varchar("codigo", { length: 32 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const animals = pgTable(
  "animals",
  {
    id: serial("id").primaryKey(),
    propertyId: integer("property_id").notNull().references(() => properties.id),
    nSisbov: varchar("n_sisbov", { length: 32 }).notNull(),
    nManejo: varchar("n_manejo", { length: 32 }),
    sexo: varchar("sexo", { length: 4 }),
    raca: varchar("raca", { length: 32 }),
    dataNasc: date("data_nasc"),
    dataBrincagem: date("data_brincagem"),
    dataEnvioSisbov: date("data_envio_sisbov"),
    dataLibAbate: date("data_lib_abate"),
    status: varchar("status", { length: 16 }).notNull().default("ATIVO"),
    dataSaida: date("data_saida"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    sisbovUnique: uniqueIndex("animals_sisbov_unique").on(t.propertyId, t.nSisbov),
    statusIdx: index("animals_status_idx").on(t.propertyId, t.status),
  })
);

export const herdBalances = pgTable("herd_balances", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id")
    .notNull()
    .references(() => properties.id)
    .unique(),
  m0_2: integer("m_0_2").notNull().default(0),
  f0_2: integer("f_0_2").notNull().default(0),
  m3_8: integer("m_3_8").notNull().default(0),
  f3_8: integer("f_3_8").notNull().default(0),
  m9_12: integer("m_9_12").notNull().default(0),
  f9_12: integer("f_9_12").notNull().default(0),
  m13_24: integer("m_13_24").notNull().default(0),
  f13_24: integer("f_13_24").notNull().default(0),
  m25_36: integer("m_25_36").notNull().default(0),
  f25_36: integer("f_25_36").notNull().default(0),
  m37plus: integer("m_37_plus").notNull().default(0),
  f37plus: integer("f_37_plus").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const uploadBatches = pgTable("upload_batches", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  filename: varchar("filename", { length: 255 }),
  rowCount: integer("row_count").notNull(),
  newCount: integer("new_count").notNull().default(0),
  updatedCount: integer("updated_count").notNull().default(0),
  exitedCount: integer("exited_count").notNull().default(0),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").references(() => uploadBatches.id),
  action: varchar("action", { length: 32 }).notNull(),
  entityType: varchar("entity_type", { length: 32 }).notNull(),
  entityRef: varchar("entity_ref", { length: 64 }),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type AnimalRow = typeof animals.$inferSelect;
export type AnimalInsert = typeof animals.$inferInsert;
export type UploadBatch = typeof uploadBatches.$inferSelect;
export type HerdBalance = typeof herdBalances.$inferSelect;
export type PushSubscriptionRow = typeof pushSubscriptions.$inferSelect;
