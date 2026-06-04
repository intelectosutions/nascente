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
