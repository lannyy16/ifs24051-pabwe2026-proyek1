import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ArticlesPage from "./ArticlesPage.jsx";

describe("ArticlesPage", () => {
  it("menampilkan daftar artikel", () => {
    render(<ArticlesPage />);

    expect(screen.getByText("Artikel herbal")).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });
});
