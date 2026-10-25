import { describe, expect, it } from "vitest";
import {
  herbDescription,
  herbEmoji,
  herbNameLatin,
} from "./herbFormatters.js";

describe("herbFormatters", () => {
  it("memakai nilai cadangan", () => {
    expect(herbNameLatin({})).toBe("Nama ilmiah belum tersedia");
    expect(herbNameLatin({ latin: "Latin" })).toBe("Latin");
    expect(herbDescription({})).toBe(
      "Belum ada deskripsi untuk tanaman ini.",
    );
    expect(herbDescription({ desc: "singkat" })).toBe("singkat");
    expect(herbEmoji({})).toBe("🌿");
  });
});
