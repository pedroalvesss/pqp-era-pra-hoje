import { PageTitle } from "@/components/PageTitle";
import { getDemands } from "@/services/demandasService/getDemands";
import { getProfile } from "@/services/perfisService/getProfile";
import { getProjects } from "@/services/projetosService/getProjects";
import { getRequestNow } from "@/lib/requestNow";
import { NewProjectCard } from "./_components/NewProjectCard";
import { ProjectCard } from "./_components/ProjectCard";
import { projectStats } from "./_components/projectStats";

export default async function ProjectsPage() {
  const [demands, projects, profile] = await Promise.all([getDemands(), getProjects(), getProfile()]);
  const cards = projectStats(projects, demands, getRequestNow(), profile.timezone);

  return (
    <>
      <PageTitle>projetos</PageTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5">
        {cards.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
        <NewProjectCard />
      </div>
    </>
  );
}
