import Link from "next/link";
import { chipClass } from "@/components/Chip";
import { DemandRow } from "@/components/DemandRow";
import { PageTitle } from "@/components/PageTitle";
import { getDemands } from "@/services/demandasService/getDemands";
import { getProjects } from "@/services/projetosService/getProjects";
import { STATUS_FILTERS, applyFilters, filterHref, parseStatus } from "./_components/listFilters";
import { ProjectSelect } from "./_components/ProjectSelect";

export default async function DemandsPage({ searchParams }: PageProps<"/demandas">) {
  const [demands, projects, params] = await Promise.all([getDemands(), getProjects(), searchParams]);
  const status = parseStatus(params.status);
  const project = projects.some((p) => p.id === params.projeto) ? String(params.projeto) : null;
  const { list, counts } = applyFilters(demands, status, project);

  return (
    <>
      <PageTitle>demandas</PageTitle>
      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_FILTERS.map(({ id, label }) => (
          <Link
            key={id}
            href={filterHref(id, project)}
            aria-current={status === id ? "page" : undefined}
            className={`${chipClass(status === id)} items-baseline gap-[5px] leading-[34px]`}
          >
            {label}
            <span className="tabular text-[11px] opacity-60">{counts[id]}</span>
          </Link>
        ))}
        <ProjectSelect projects={projects} status={status} value={project} />
      </div>
      <div className="-mt-3 flex flex-col">
        {list.map((d) => (
          <DemandRow key={d.id} demand={d} projects={projects} withStatus />
        ))}
        {list.length === 0 && (
          <p className="m-0 px-3 py-8 text-[15px] text-neutral-400">
            nada aqui. ou você é muito eficiente, ou o filtro tá errado.
          </p>
        )}
      </div>
    </>
  );
}
