import { healthPayload } from "shared";

export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json(healthPayload(process.env.APP_VERSION ?? "dev"));
}
