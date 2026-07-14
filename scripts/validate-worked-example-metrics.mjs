import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migrationUrl = new URL(
  "../src/server/db/migrations/0003_add_worked_example_lighting_metrics.sql",
  import.meta.url,
);
const fixtureUrl = new URL(
  "../src/features/projects/data/worked-example-lighting-metrics-v1.json",
  import.meta.url,
);
const migration = await readFile(migrationUrl, "utf8");
const payloadMatch = migration.match(
  /\$worked_example_metrics\$\s*([\s\S]*?)\s*\$worked_example_metrics\$::jsonb/,
);
assert.ok(payloadMatch, "The data migration must embed the canonical metrics payload.");
const payload = JSON.parse(payloadMatch[1]);
const canonicalPayload = JSON.parse(await readFile(fixtureUrl, "utf8"));
assert.deepEqual(payload, canonicalPayload, "The migration payload must match the canonical fixture.");

assert.equal(payload.schemaVersion, "worked-example-lighting-metrics-v1");
assert.deepEqual(Object.keys(payload.metricDefinitions), [
  "photopicVerticalLux",
  "melanopicDER",
  "melanopicEDILux",
]);
assert.equal(
  payload.metricDefinitions.melanopicEDILux.equation,
  "melanopicEDILux = photopicVerticalLux * melanopicDER",
);

const expectedTemplates = {
  "northbridge-academy": ["Teaching-day schedule", "Educational Setting", 10],
  "meridian-tower": ["Core-office day schedule", "Optimal Office Lighting", 12],
  "st-anselm-outpatient": ["Day-shift clinical schedule", "Healthcare Environment", 12],
  "harbor-heights": ["Resident wind-down schedule", "Resident wind-down schedule", 16],
};
assert.equal(Object.keys(payload.templates).length, payload.qualityChecks.expectedTemplateCount);
assert.deepEqual(Object.keys(payload.templates), Object.keys(expectedTemplates));

const requiredPointFields = [
  "time",
  "photopicVerticalLux",
  "melanopicDER",
  "melanopicEDILux",
  "source",
  "notes",
  "assumptionIds",
  "citationIds",
  "calculation",
];
let pointCount = 0;
for (const [templateKey, template] of Object.entries(payload.templates)) {
  const [scenarioName, scheduleName, expectedPointCount] = expectedTemplates[templateKey];
  assert.equal(template.templateVersion, "2026-07-10-v1");
  assert.equal(template.scenarioName, scenarioName);
  assert.equal(template.scheduleName, scheduleName);
  assert.equal(template.points.length, expectedPointCount);
  pointCount += template.points.length;

  let previousTime = -1;
  for (const point of template.points) {
    for (const field of requiredPointFields) {
      assert.ok(Object.hasOwn(point, field), `${templateKey}/${point.time} is missing ${field}.`);
    }
    assert.ok(point.time > previousTime, `${templateKey} point times must be strictly increasing.`);
    previousTime = point.time;
    assert.equal(point.source, "estimated");
    assert.match(point.notes, /not measured\./);
    assert.ok(
      Math.abs(
        point.calculation.unroundedMelanopicEDILux -
          point.photopicVerticalLux * point.melanopicDER,
      ) < 1e-9,
      `${templateKey}/${point.time} has inconsistent unrounded EDI.`,
    );
    assert.equal(
      point.melanopicEDILux,
      Math.floor(point.calculation.unroundedMelanopicEDILux + 0.5),
      `${templateKey}/${point.time} does not use positive half-up EDI rounding.`,
    );
    assert.ok(
      Math.abs(point.melanopicEDILux - point.photopicVerticalLux * point.melanopicDER) <=
        payload.qualityChecks.ediEquationToleranceLux,
      `${templateKey}/${point.time} exceeds the EDI tolerance.`,
    );
    for (const assumptionId of point.assumptionIds) {
      assert.ok(payload.assumptions[assumptionId], `Unknown assumption ID: ${assumptionId}.`);
    }
    for (const citationId of point.citationIds) {
      assert.ok(payload.citations[citationId], `Unknown citation ID: ${citationId}.`);
    }
  }
}

for (const definition of Object.values(payload.metricDefinitions)) {
  for (const citationId of definition.citationIds) {
    assert.ok(payload.citations[citationId], `Unknown metric citation ID: ${citationId}.`);
  }
}
for (const assumption of Object.values(payload.assumptions)) {
  for (const citationId of assumption.citationIds) {
    assert.ok(payload.citations[citationId], `Unknown assumption citation ID: ${citationId}.`);
  }
}

assert.equal(pointCount, payload.qualityChecks.expectedPointCount);
assert.equal(payload.qualityChecks.allRequestedFieldsPresent, true);
assert.ok(payload.qualityChecks.warnings.length > 0);
console.log(`Validated ${Object.keys(payload.templates).length} templates and ${pointCount} audited points.`);
