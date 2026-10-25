import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Bersihkan DOM setelah setiap test agar antar-test tidak saling memengaruhi.
afterEach(() => {
  cleanup();
});
