import { DemandDrawer } from "@/components/demand-detail/DemandDrawer";
import { loadDemand } from "../../../d/[id]/_components/loadDemand";

// intercepta /d/[id] vindo de dentro do app e abre como drawer por cima da tela atual
export default async function DemandDrawerPage({ params }: PageProps<"/d/[id]">) {
  const { id } = await params;
  const { demand, projects } = await loadDemand(id);
  return <DemandDrawer demand={demand} projects={projects} />;
}
