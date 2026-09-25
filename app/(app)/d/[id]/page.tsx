import { DemandPage } from "@/components/demand-detail/DemandPage";
import { loadDemand } from "./_components/loadDemand";

export default async function DemandFullPage({ params }: PageProps<"/d/[id]">) {
  const { id } = await params;
  const { demand, projects } = await loadDemand(id);
  return <DemandPage demand={demand} projects={projects} />;
}
