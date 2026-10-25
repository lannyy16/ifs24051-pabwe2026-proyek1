import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FinderPage from "./FinderPage.jsx";

describe("FinderPage", () => {
  it("mengirim kata kunci topik yang dipilih", () => {
    const onChooseTopic = vi.fn();
    render(<FinderPage onChooseTopic={onChooseTopic} />);

    fireEvent.click(screen.getByText("Mual ringan"));
    fireEvent.click(screen.getByText("Pencernaan"));

    expect(onChooseTopic).toHaveBeenNthCalledWith(1, "jahe");
    expect(onChooseTopic).toHaveBeenNthCalledWith(2, "");
  });
});
