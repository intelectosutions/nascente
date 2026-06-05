CREATE TABLE IF NOT EXISTS "herd_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"age_0_2" integer DEFAULT 0 NOT NULL,
	"age_3_8" integer DEFAULT 0 NOT NULL,
	"age_9_12" integer DEFAULT 0 NOT NULL,
	"age_13_24" integer DEFAULT 0 NOT NULL,
	"age_25_36" integer DEFAULT 0 NOT NULL,
	"age_37_plus" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "herd_balances_property_id_unique" UNIQUE("property_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "herd_balances" ADD CONSTRAINT "herd_balances_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
