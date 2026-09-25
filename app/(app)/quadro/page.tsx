import { PageTitle } from "@/components/PageTitle";
import { getDemands } from "@/services/demandasService/getDemands";
import { getProjects } from "@/services/projetosService/getProjects";
import { KanbanBoard } from "./_components/KanbanBoard";

export default async function BoardPage() {
  const [demands, projects] = await Promise.all([getDemands(), getProjects()]);
  return (
    <>
      <PageTitle>quadro</PageTitle>
      <KanbanBoard demands={demands} projects={projects} />
    </>
  );
}
