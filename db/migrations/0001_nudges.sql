ALTER TABLE "demands" ADD COLUMN "late_notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "demands" ADD COLUMN "waiting_since" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "demands" ADD COLUMN "waiting_notified_at" timestamp with time zone;--> statement-breakpoint
-- quem já estava esperando começa a contar a partir de agora
UPDATE "demands" SET "waiting_since" = now() WHERE "status" = 'waiting';
