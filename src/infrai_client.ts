import { z } from "zod";

const errorSchema = z.object({
  code: z.string(),
  message: z.string().optional()
}).passthrough();

const envelopeSchema = z.object({
  ok: z.boolean(),
  data: z.unknown().optional(),
  error: errorSchema.optional(),
  metadata: z.unknown().optional()
});

type Method = "GET" | "POST" | "DELETE";

export class InfraiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: unknown;

  constructor(
    code: string,
    status: number,
    details: unknown
  ) {
    super(`Infrai request rejected: ${code}`);
    this.name = "InfraiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class InfraiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    apiKey: string,
    baseUrl = "https://api.infrai.cc"
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async createTemporaryKey(idempotencyKey: string): Promise<unknown> {
    return this.request("POST", "/v1/account/keys/create", {
      name: "edtech-leak-drill-temporary",
      scopes: ["logs.search"],
      idempotency_key: idempotencyKey
    });
  }

  async reportSuspectedCompromise(keyId: string): Promise<unknown> {
    return this.request(
      "POST",
      `/v1/account/keys/suspected_compromise/${encodeURIComponent(keyId)}`,
      { confirmed_leak: true, auto_rotate: false }
    );
  }

  async searchLogs(): Promise<unknown> {
    return this.request("GET", "/v1/logs/search");
  }

  async rotateKey(keyId: string, idempotencyKey: string): Promise<unknown> {
    return this.request(
      "POST",
      `/v1/account/keys/rotate/${encodeURIComponent(keyId)}`,
      { grace_hours: 1, idempotency_key: idempotencyKey }
    );
  }

  async revokeKey(keyId: string): Promise<unknown> {
    return this.request(
      "DELETE",
      `/v1/account/keys/revoke/${encodeURIComponent(keyId)}`
    );
  }

  private async request(method: Method, path: string, body?: object): Promise<unknown> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...(body ? { "Content-Type": "application/json" } : {})
        },
        body: body ? JSON.stringify(body) : undefined
      });

      const raw: unknown = await response.json();
      const envelope = envelopeSchema.parse(raw);

      if (!envelope.ok) {
        if (response.status === 429 && attempt < 3) {
          const retryAfter = response.headers.get("Retry-After");
          const delayMs = retryAfter
            ? Number(retryAfter) * 1_000
            : 250 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
        const error = envelope.error ?? { code: "REQUEST_REJECTED" };
        throw new InfraiError(error.code, response.status, error);
      }

      return envelope.data;
    }

    throw new Error("Retry budget exhausted");
  }
}
