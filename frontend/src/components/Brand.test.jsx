
import {
  describe,
  it,
  expect,
  vi,
  afterEach,
} from "vitest";

import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react";

import Brand from "./Brand.jsx";

afterEach(() => {
  cleanup();
});

describe("Brand", () => {
  it("menampilkan nama aplikasi", () => {
    render(<Brand onClick={() => {}} />);

    expect(
      screen.getByRole("button").textContent
    ).toContain("Herba");

    expect(
      screen.getByRole("button").textContent
    ).toContain("Nusantara");
  });

  it("menjalankan callback ketika diklik", () => {
    const onClick = vi.fn();

    render(<Brand onClick={onClick} />);

    fireEvent.click(
      screen.getByRole("button")
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
