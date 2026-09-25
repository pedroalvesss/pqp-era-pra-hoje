"use client";

import { useEffect } from "react";

interface RouteErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export function RouteError({ error, retry }: RouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  function handleClickRetryButton() {
    retry();
  }

  return (
    <div role="alert" className="flex flex-col items-start gap-4 py-10">
      <h1 className="m-0 text-[34px] font-medium tracking-[-0.045em] md:text-[46px]">deu ruim.</h1>
      <p className="m-0 text-[15px] text-neutral-400">não é você, sou eu. tenta de novo?</p>
      <button onClick={handleClickRetryButton} className="btn btn-primary min-h-11 rounded-xl px-4">
        tentar de novo
      </button>
    </div>
  );
}
