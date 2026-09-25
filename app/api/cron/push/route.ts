import { timingSafeEqual } from "node:crypto";
import { sendDueReminders } from "@/services/pushService/sendDueReminders";

function authorized(header: string | null) {
  const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET ?? ""}`);
  const got = Buffer.from(header ?? "");
  return !!process.env.CRON_SECRET && got.length === expected.length && timingSafeEqual(got, expected);
}

// chamado a cada 5 min pelo pg_cron do Supabase (supabase/cron.sql)
export async function POST(request: Request) {
  if (!authorized(request.headers.get("authorization"))) return new Response("nope", { status: 401 });
  return Response.json(await sendDueReminders());
}
