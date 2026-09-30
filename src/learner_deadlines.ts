import { z } from "zod";

export const drillInputSchema = z.object({
  drillId: z.string().min(1),
  courses: z.array(z.object({
    courseId: z.string().min(1),
    title: z.string().min(1),
    learnerIds: z.array(z.string().min(1)).min(1),
    deadline: z.string().datetime()
  })).min(1)
});

export type DrillInput = z.infer<typeof drillInputSchema>;

export type EducatorAction = {
  courseId: string;
  title: string;
  impactedLearners: string[];
  hoursToDeadline: number;
  priority: "contact-now" | "monitor";
};

function searchableLogText(logs: unknown): string {
  return JSON.stringify(logs).toLowerCase();
}

export function buildEducatorReport(
  input: DrillInput,
  logs: unknown,
  now: Date
): EducatorAction[] {
  const logText = searchableLogText(logs);

  return input.courses.flatMap((course) => {
    const impactedLearners = course.learnerIds.filter((learnerId) =>
      logText.includes(learnerId.toLowerCase())
    );
    const courseWasSeen = logText.includes(course.courseId.toLowerCase());
    if (!courseWasSeen && impactedLearners.length === 0) return [];

    const hoursToDeadline = Math.max(
      0,
      Math.ceil((Date.parse(course.deadline) - now.getTime()) / 3_600_000)
    );
    return [{
      courseId: course.courseId,
      title: course.title,
      impactedLearners,
      hoursToDeadline,
      priority: hoursToDeadline <= 24 ? "contact-now" as const : "monitor" as const
    }];
  });
}
