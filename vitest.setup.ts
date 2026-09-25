import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// "server-only" explode fora do bundler do Next
vi.mock("server-only", () => ({}));

// Radix (Select, Popover) usa APIs de ponteiro/scroll que o jsdom não implementa
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.scrollIntoView ??= () => {};

afterEach(() => cleanup());
