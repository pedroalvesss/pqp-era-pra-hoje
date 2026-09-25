import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-start justify-center gap-4 px-6 md:px-12">
      <h1 className="m-0 text-[34px] font-medium tracking-[-0.045em] md:text-[46px]">nada aqui.</h1>
      <p className="m-0 text-[15px] text-neutral-400">essa página não existe. nem no papel.</p>
      <Link href="/" className="btn btn-primary min-h-11 rounded-xl px-4">
        voltar pro início
      </Link>
    </main>
  );
}
