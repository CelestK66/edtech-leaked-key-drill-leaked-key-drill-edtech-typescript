import assert from "node:assert/strict";
import test from "node:test";
import { buildEducatorReport, drillInputSchema } from "../src/learner_deadlines.js";

test("flags an impacted learner whose course closes within 24 hours", () => {
  const input = drillInputSchema.parse({
    drillId: "drill-2026-09-28",
    courses: [
      {
        courseId: "course-algebra",
        title: "Algebra checkpoint",
        learnerIds: ["learner-42", "learner-77"],
        deadline: "2026-09-29T08:00:00.000Z"
      },
      {
        courseId: "course-history",
        title: "History essay",
        learnerIds: ["learner-11"],
        deadline: "2026-10-10T08:00:00.000Z"
      }
    ]
  });

  const report = buildEducatorReport(
    input,
    [{ message: "request by learner-42 in course-algebra" }],
    new Date("2026-09-28T12:00:00.000Z")
  );

  assert.deepEqual(report, [{
    courseId: "course-algebra",
    title: "Algebra checkpoint",
    impactedLearners: ["learner-42"],
    hoursToDeadline: 20,
    priority: "contact-now"
  }]);
});
