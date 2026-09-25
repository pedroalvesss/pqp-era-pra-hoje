import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// "server-only" explode fora do bundler do Next
vi.mock("server-only", () => ({}));

afterEach(() => cleanup());
