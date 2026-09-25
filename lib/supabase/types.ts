// Espelha supabase/migrations. Regerar com `npx supabase gen types typescript` quando o schema mudar.
import type { Company, Dept, Lead, Prio, Status } from "@/lib/constants";

export type ProfileRow = {
  id: string;
  name: string;
  push_enabled: boolean;
  lead: Lead;
  workday_end: string;
  timezone: string;
};

export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type DemandRow = {
  id: string;
  user_id: string;
  title: string;
  due: string;
  prio: Prio;
  requester: string;
  project_id: string | null;
  company: Company | null;
  dept: Dept | null;
  status: Status;
  prev_status: Status | null;
  notes: string;
  notified_at: string | null;
  created_at: string;
  done_at: string | null;
};

export type NotificationRow = {
  id: string;
  user_id: string;
  demand_id: string | null;
  text: string;
  created_at: string;
  read_at: string | null;
};

export type PushSubscriptionRow = {
  endpoint: string;
  user_id: string;
  p256dh: string;
  auth: string;
  created_at: string;
};

type Table<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, "id">;
      projects: Table<ProjectRow, "name" | "color">;
      demands: Table<DemandRow, "title" | "due">;
      notifications: Table<NotificationRow, "user_id" | "text">;
      push_subscriptions: Table<PushSubscriptionRow, "endpoint" | "p256dh" | "auth">;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { demand_status: Status; demand_prio: Prio };
    CompositeTypes: Record<string, never>;
  };
};
