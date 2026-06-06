CREATE TYPE "public"."project_type" AS ENUM('office', 'healthcare', 'education', 'residential', 'retail', 'hospitality', 'custom');--> statement-breakpoint
CREATE TYPE "public"."scenario_source" AS ENUM('standard_preset', 'custom', 'imported', 'quick_save');--> statement-breakpoint
CREATE TABLE "app_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" text NOT NULL,
	"email" text,
	"display_name" text,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"organization_id" text,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"client" text DEFAULT '' NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"project_type" "project_type" NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"scenario_id" uuid,
	"roi_snapshot_id" uuid,
	"name" text NOT NULL,
	"report_version" text NOT NULL,
	"report_data" jsonb NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roi_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"scenario_id" uuid,
	"inputs" jsonb NOT NULL,
	"assumptions_version" text NOT NULL,
	"assumptions" jsonb NOT NULL,
	"results" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"source" "scenario_source" NOT NULL,
	"preset_name" text,
	"schedule" jsonb NOT NULL,
	"schedule_inputs" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_app_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_snapshots" ADD CONSTRAINT "report_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_snapshots" ADD CONSTRAINT "report_snapshots_scenario_id_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_snapshots" ADD CONSTRAINT "report_snapshots_roi_snapshot_id_roi_snapshots_id_fk" FOREIGN KEY ("roi_snapshot_id") REFERENCES "public"."roi_snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roi_snapshots" ADD CONSTRAINT "roi_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roi_snapshots" ADD CONSTRAINT "roi_snapshots_scenario_id_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "app_users_clerk_user_id_idx" ON "app_users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "projects_owner_updated_at_idx" ON "projects" USING btree ("owner_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "projects_org_updated_at_idx" ON "projects" USING btree ("organization_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "projects_project_type_idx" ON "projects" USING btree ("project_type");--> statement-breakpoint
CREATE INDEX "report_snapshots_project_created_at_idx" ON "report_snapshots" USING btree ("project_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "report_snapshots_scenario_created_at_idx" ON "report_snapshots" USING btree ("scenario_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "roi_snapshots_project_created_at_idx" ON "roi_snapshots" USING btree ("project_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "roi_snapshots_scenario_created_at_idx" ON "roi_snapshots" USING btree ("scenario_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "scenarios_project_updated_at_idx" ON "scenarios" USING btree ("project_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "scenarios_source_idx" ON "scenarios" USING btree ("source");--> statement-breakpoint
CREATE OR REPLACE FUNCTION "assert_roi_snapshot_project_scope"()
RETURNS trigger AS $$
BEGIN
	IF NEW."scenario_id" IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM "scenarios"
		WHERE "scenarios"."id" = NEW."scenario_id"
		AND "scenarios"."project_id" = NEW."project_id"
	) THEN
		RAISE EXCEPTION 'roi_snapshots.scenario_id must belong to the same project_id';
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "roi_snapshots_project_scope_check"
BEFORE INSERT OR UPDATE OF "project_id", "scenario_id" ON "roi_snapshots"
FOR EACH ROW EXECUTE FUNCTION "assert_roi_snapshot_project_scope"();--> statement-breakpoint
CREATE OR REPLACE FUNCTION "assert_report_snapshot_project_scope"()
RETURNS trigger AS $$
BEGIN
	IF NEW."scenario_id" IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM "scenarios"
		WHERE "scenarios"."id" = NEW."scenario_id"
		AND "scenarios"."project_id" = NEW."project_id"
	) THEN
		RAISE EXCEPTION 'report_snapshots.scenario_id must belong to the same project_id';
	END IF;

	IF NEW."roi_snapshot_id" IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM "roi_snapshots"
		WHERE "roi_snapshots"."id" = NEW."roi_snapshot_id"
		AND "roi_snapshots"."project_id" = NEW."project_id"
	) THEN
		RAISE EXCEPTION 'report_snapshots.roi_snapshot_id must belong to the same project_id';
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "report_snapshots_project_scope_check"
BEFORE INSERT OR UPDATE OF "project_id", "scenario_id", "roi_snapshot_id" ON "report_snapshots"
FOR EACH ROW EXECUTE FUNCTION "assert_report_snapshot_project_scope"();