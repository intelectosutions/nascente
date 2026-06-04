CREATE TABLE IF NOT EXISTS "animals" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"n_sisbov" varchar(32) NOT NULL,
	"n_manejo" varchar(32),
	"sexo" varchar(4),
	"raca" varchar(32),
	"data_nasc" date,
	"data_brincagem" date,
	"data_envio_sisbov" date,
	"data_lib_abate" date,
	"status" varchar(16) DEFAULT 'ATIVO' NOT NULL,
	"data_saida" date,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer,
	"action" varchar(32) NOT NULL,
	"entity_type" varchar(32) NOT NULL,
	"entity_ref" varchar(64),
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"nome" varchar(200) NOT NULL,
	"codigo" varchar(32),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "properties_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "upload_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"filename" varchar(255),
	"row_count" integer NOT NULL,
	"new_count" integer DEFAULT 0 NOT NULL,
	"updated_count" integer DEFAULT 0 NOT NULL,
	"exited_count" integer DEFAULT 0 NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "animals" ADD CONSTRAINT "animals_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_batch_id_upload_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."upload_batches"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "upload_batches" ADD CONSTRAINT "upload_batches_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "animals_sisbov_unique" ON "animals" USING btree ("property_id","n_sisbov");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "animals_status_idx" ON "animals" USING btree ("property_id","status");