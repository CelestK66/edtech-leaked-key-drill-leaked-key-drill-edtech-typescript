import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { InfraiClient, InfraiError } from "./infrai_client.js";
import { buildEducatorReport, drillInputSchema } from "./learner_deadlines.js";

const createdKeySchema = z.object({
  key_id: z.string().min(1),
  key_secret: z.string().min(1)
}).passthrough();

async function main(): Promise<void> {
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("Set INFRAI_API_KEY before running the drill");

  const inputPath = process.argv[2] ?? "drill-input.json";
  const input = drillInputSchema.parse(
    JSON.parse(await readFile(inputPath, "utf8"))
  );
  const infrai = new InfraiClient(apiKey, process.env.INFRAI_BASE_URL);
  const temporary = createdKeySchema.parse(
    await infrai.createTemporaryKey(`${input.drillId}:create`)
  );

  console.log("Temporary drill key created; store this one-time plaintext value securely:");
  console.log(temporary.key_secret);

  try {
    await infrai.reportSuspectedCompromise(temporary.key_id);
    const logs = await infrai.searchLogs();
    const educatorReport = buildEducatorReport(input, logs, new Date());
    await infrai.rotateKey(temporary.key_id, `${input.drillId}:rotate`);

    console.log(JSON.stringify({
      drillId: input.drillId,
      temporaryKeyId: temporary.key_id,
      status: "reported-rotated-confirmed",
      educatorReport
    }, null, 2));
  } finally {
    await infrai.revokeKey(temporary.key_id);
  }
}

main().catch((error: unknown) => {
  if (error instanceof InfraiError) {
    console.error(JSON.stringify({ code: error.code, status: error.status }));
    process.exitCode = error.status >= 400 && error.status < 500 ? 2 : 1;
    return;
  }
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
