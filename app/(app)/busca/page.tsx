import { getDemands } from "@/services/demandasService/getDemands";
import { getProjects } from "@/services/projetosService/getProjects";
import { SearchView } from "./_components/SearchView";

export default async function SearchPage({ searchParams }: PageProps<"/busca">) {
  const [demands, projects, params] = await Promise.all([getDemands(), getProjects(), searchParams]);
  const q = typeof params.q === "string" ? params.q : "";
  return <SearchView demands={demands} projects={projects} initialQuery={q} />;
}
