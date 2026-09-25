import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { NowProvider, useNow } from "../NowContext";
import { NewDemandProvider, useNewDemand } from "../NewDemandContext";

vi.mock("next/dynamic", () => ({
  default: () =>
    function FakeDialog() {
      return <div role="dialog">nova demanda</div>;
    },
}));

function ShowNow() {
  const { now, tz } = useNow();
  return (
    <span>
      {now} {tz}
    </span>
  );
}

describe("NowProvider", () => {
  afterEach(() => vi.useRealTimers());

  it("começa com o agora do servidor e anda a cada 30s", () => {
    vi.useFakeTimers({ now: 5000 });
    render(
      <NowProvider initialNow={1000} tz="America/Belem">
        <ShowNow />
      </NowProvider>,
    );
    expect(screen.getByText("1000 America/Belem")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByText("35000 America/Belem")).toBeInTheDocument();
  });
});

function OpenButton() {
  const { openNewDemand } = useNewDemand();
  return <button onClick={openNewDemand}>abrir</button>;
}

describe("NewDemandProvider", () => {
  it("atalho N abre fora de inputs", () => {
    render(
      <NewDemandProvider projects={[]} workdayEnd="18:00">
        <input aria-label="campo" />
      </NewDemandProvider>,
    );
    fireEvent.keyDown(screen.getByLabelText("campo"), { key: "n" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: "n" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("botão abre pelo contexto", () => {
    render(
      <NewDemandProvider projects={[]} workdayEnd="18:00">
        <OpenButton />
      </NewDemandProvider>,
    );
    fireEvent.click(screen.getByText("abrir"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
