import { relations, sql } from "drizzle-orm";
import {
  exposurePointSourceValues,
  projectTypeValues,
  scenarioSourceValues,
} from "@/domain/constants";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const projectTypeEnum = pgEnum("project_type", projectTypeValues);
export const scenarioSourceEnum = pgEnum("scenario_source", scenarioSourceValues);

export type ProjectType = (typeof projectTypeValues)[number];
export type ScenarioSource = (typeof scenarioSourceValues)[number];

type LightingExposurePointSnapshot = {
  time: number;
  // Legacy visualizer fields are optional so imported/measured PRD exposure points can be stored.
  intensity?: number;
  temperature?: number;
  photopicVerticalLux?: number;
  melanopicDER?: number;
  melanopicEDILux?: number;
  cctK?: number;
  source: (typeof exposurePointSourceValues)[number];
  notes?: string;
};

type LightingScheduleSnapshot = {
  name: string;
  description: string;
  schedule: LightingExposurePointSnapshot[];
  citations: string[];
};

type JsonObject = Record<string, unknown>;

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .notNull()
  .$onUpdate(() => new Date());

export const appUsers = pgTable(
  "app_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    email: text("email"),
    displayName: text("display_name"),
    imageUrl: text("image_url"),
    createdAt,
    updatedAt,
  },
  (table) => [uniqueIndex("app_users_clerk_user_id_idx").on(table.clerkUserId)],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => appUsers.id, { onDelete: "cascade" }),
    organizationId: text("organization_id"),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    client: text("client").notNull().default(""),
    location: text("location").notNull().default(""),
    projectType: projectTypeEnum("project_type").notNull(),
    tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("projects_owner_updated_at_idx").on(table.ownerId, table.updatedAt.desc()),
    index("projects_org_updated_at_idx").on(table.organizationId, table.updatedAt.desc()),
    index("projects_project_type_idx").on(table.projectType),
  ],
);

export const scenarios = pgTable(
  "scenarios",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    source: scenarioSourceEnum("source").notNull(),
    presetName: text("preset_name"),
    schedule: jsonb("schedule").$type<LightingScheduleSnapshot>().notNull(),
    scheduleInputs: jsonb("schedule_inputs").$type<JsonObject | null>(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("scenarios_project_updated_at_idx").on(table.projectId, table.updatedAt.desc()),
    index("scenarios_source_idx").on(table.source),
  ],
);

export const roiSnapshots = pgTable(
  "roi_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    scenarioId: uuid("scenario_id").references(() => scenarios.id, { onDelete: "set null" }),
    inputs: jsonb("inputs").$type<JsonObject>().notNull(),
    assumptionsVersion: text("assumptions_version").notNull(),
    assumptions: jsonb("assumptions").$type<JsonObject>().notNull(),
    results: jsonb("results").$type<JsonObject>().notNull(),
    createdAt,
  },
  (table) => [
    index("roi_snapshots_project_created_at_idx").on(table.projectId, table.createdAt.desc()),
    index("roi_snapshots_scenario_created_at_idx").on(table.scenarioId, table.createdAt.desc()),
  ],
);

export const reportSnapshots = pgTable(
  "report_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    scenarioId: uuid("scenario_id").references(() => scenarios.id, { onDelete: "set null" }),
    roiSnapshotId: uuid("roi_snapshot_id").references(() => roiSnapshots.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    reportVersion: text("report_version").notNull(),
    reportData: jsonb("report_data").$type<JsonObject>().notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt,
  },
  (table) => [
    index("report_snapshots_project_created_at_idx").on(table.projectId, table.createdAt.desc()),
    index("report_snapshots_scenario_created_at_idx").on(table.scenarioId, table.createdAt.desc()),
  ],
);

export const appUsersRelations = relations(appUsers, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(appUsers, {
    fields: [projects.ownerId],
    references: [appUsers.id],
  }),
  scenarios: many(scenarios),
  roiSnapshots: many(roiSnapshots),
  reportSnapshots: many(reportSnapshots),
}));

export const scenariosRelations = relations(scenarios, ({ one, many }) => ({
  project: one(projects, {
    fields: [scenarios.projectId],
    references: [projects.id],
  }),
  roiSnapshots: many(roiSnapshots),
  reportSnapshots: many(reportSnapshots),
}));

export const roiSnapshotsRelations = relations(roiSnapshots, ({ one, many }) => ({
  project: one(projects, {
    fields: [roiSnapshots.projectId],
    references: [projects.id],
  }),
  scenario: one(scenarios, {
    fields: [roiSnapshots.scenarioId],
    references: [scenarios.id],
  }),
  reportSnapshots: many(reportSnapshots),
}));

export const reportSnapshotsRelations = relations(reportSnapshots, ({ one }) => ({
  project: one(projects, {
    fields: [reportSnapshots.projectId],
    references: [projects.id],
  }),
  scenario: one(scenarios, {
    fields: [reportSnapshots.scenarioId],
    references: [scenarios.id],
  }),
  roiSnapshot: one(roiSnapshots, {
    fields: [reportSnapshots.roiSnapshotId],
    references: [roiSnapshots.id],
  }),
}));

export type AppUser = typeof appUsers.$inferSelect;
export type NewAppUser = typeof appUsers.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Scenario = typeof scenarios.$inferSelect;
export type NewScenario = typeof scenarios.$inferInsert;
export type RoiSnapshot = typeof roiSnapshots.$inferSelect;
export type NewRoiSnapshot = typeof roiSnapshots.$inferInsert;
export type ReportSnapshot = typeof reportSnapshots.$inferSelect;
export type NewReportSnapshot = typeof reportSnapshots.$inferInsert;
