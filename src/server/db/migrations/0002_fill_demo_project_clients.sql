-- Populate the client field for the built-in worked examples without overwriting
-- a value the user has already supplied on an existing copied project.
UPDATE "worked_example_templates"
SET "definition" = jsonb_set(
  "definition",
  '{project,client}',
  to_jsonb(
    CASE "key"
      WHEN 'northbridge-academy' THEN 'Northbridge Academy Classrooms'
      WHEN 'meridian-tower' THEN 'Meridian Tower Class A Offices'
      WHEN 'st-anselm-outpatient' THEN 'St. Anselm Outpatient Facility'
      WHEN 'harbor-heights' THEN 'Harbor Heights Apartments'
    END
  ),
  true
)
WHERE "key" IN ('northbridge-academy', 'meridian-tower', 'st-anselm-outpatient', 'harbor-heights');

--> statement-breakpoint
UPDATE "projects"
SET "client" = CASE "name"
  WHEN 'Example — Northbridge Academy classrooms' THEN 'Northbridge Academy Classrooms'
  WHEN 'Example — Meridian Tower Class A offices' THEN 'Meridian Tower Class A Offices'
  WHEN 'Example — St. Anselm outpatient facility' THEN 'St. Anselm Outpatient Facility'
  WHEN 'Example — Harbor Heights apartments' THEN 'Harbor Heights Apartments'
END
WHERE COALESCE("client", '') = ''
  AND "name" IN (
    'Example — Northbridge Academy classrooms',
    'Example — Meridian Tower Class A offices',
    'Example — St. Anselm outpatient facility',
    'Example — Harbor Heights apartments'
  );
