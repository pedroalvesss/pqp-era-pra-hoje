import { getDemands } from "@/services/demandasService/getDemands";
import { getProfile } from "@/services/perfisService/getProfile";
import { getProjects } from "@/services/projetosService/getProjects";
import { HomeView } from "./_components/HomeView";
import { WelcomeToast } from "./_components/WelcomeToast";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const [demands, projects, profile, params] = await Promise.all([
    getDemands(),
    getProjects(),
    getProfile(),
    searchParams,
  ]);

  return (
    <>
      <HomeView demands={demands} projects={projects} userName={profile.name} workdayEnd={profile.workdayEnd} />
      {params.novo === "1" && <WelcomeToast />}
    </>
  );
}
