import { describe, expect, it } from "vitest";
import { getAuthFormData, getSubmitLabel } from "./authForm.js";

describe("getAuthFormData", () => {
  it("merapikan nama dan email, tetapi tidak mengubah kata sandi", () => {
    const formData = new FormData();
    formData.set("name", "  Sari ");
    formData.set("email", "  SARI@Mail.COM ");
    formData.set("password", " rahasia ");
    formData.set("confirmation", " rahasia ");

    expect(getAuthFormData(formData)).toEqual({
      name: "Sari",
      email: "sari@mail.com",
      password: " rahasia ",
      confirmation: " rahasia ",
    });
  });

  it("memakai string kosong untuk field yang tidak ada", () => {
    expect(getAuthFormData(new FormData())).toEqual({
      name: "",
      email: "",
      password: "",
      confirmation: "",
    });
  });
});

describe("getSubmitLabel", () => {
  it.each([
    [false, false, "Masuk"],
    [true, false, "Daftar"],
    [false, true, "Memproses login..."],
    [true, true, "Memproses pendaftaran..."],
  ])("isRegister=%s loading=%s -> %s", (isRegister, loading, label) => {
    expect(getSubmitLabel(isRegister, loading)).toBe(label);
  });
});
