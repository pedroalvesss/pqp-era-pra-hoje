import Link from "next/link";

export default function DemandNotFound() {
  return (
    <div className="flex flex-col items-start gap-4 py-10">
      <h1 className="m-0 text-[34px] font-medium tracking-[-0.045em] md:text-[46px]">sumiu.</h1>
      <p className="m-0 text-[15px] text-neutral-400">essa demanda foi apagada ou nunca existiu.</p>
      <Link href="/" className="btn btn-primary min-h-11 rounded-xl px-4">
        voltar pro início
      </Link>
    </div>
  );
}
