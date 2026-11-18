import { z } from "zod";

export const HealthSchema = z.object({ status: z.literal("ok"), version: z.string().min(1) });
export type Health = z.infer<typeof HealthSchema>;

export function healthPayload(version: string): Health {
  return HealthSchema.parse({ status: "ok", version });
}
