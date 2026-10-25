import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AuthPage from "./AuthPage.jsx";

describe("AuthPage", () => {
  it("mode masuk: mengirim data form dan berpindah ke daftar", () => {
    const onSubmit = vi.fn();
    const onSwitch = vi.fn();
    const { container } = render(
      <AuthPage mode="Masuk" onSubmit={onSubmit} onSwitch={onSwitch} />,
    );

    expect(screen.queryByLabelText(/Nama lengkap/)).toBeNull();

    fireEvent.change(container.querySelector("#username"), {
      target: { value: "  SARI@mail.com " },
    });
    fireEvent.change(container.querySelector("#password"), {
      target: { value: "rahasia123" },
    });
    fireEvent.submit(container.querySelector("form"));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "",
      email: "sari@mail.com",
      password: "rahasia123",
      confirmation: "",
    });

    fireEvent.click(screen.getByText("Daftar sekarang"));
    expect(onSwitch).toHaveBeenCalledWith("Daftar");
  });

  it("mode daftar: menampilkan kolom tambahan dan pindah ke masuk", () => {
    const onSwitch = vi.fn();
    const { container } = render(
      <AuthPage mode="Daftar" onSubmit={vi.fn()} onSwitch={onSwitch} />,
    );

    expect(container.querySelector("#name")).toBeTruthy();
    expect(container.querySelector("#confirmation")).toBeTruthy();
    expect(screen.getByText("Buat akun")).toBeTruthy();

    fireEvent.click(screen.getByText("Masuk", { selector: ".auth-switch button" }));
    expect(onSwitch).toHaveBeenCalledWith("Masuk");
  });

  it("menampilkan/menyembunyikan kata sandi", () => {
    const { container } = render(
      <AuthPage mode="Masuk" onSubmit={vi.fn()} onSwitch={vi.fn()} />,
    );
    const input = container.querySelector("#password");

    expect(input.type).toBe("password");
    fireEvent.click(screen.getByLabelText("Tampilkan kata sandi"));
    expect(input.type).toBe("text");
    fireEvent.click(screen.getByLabelText("Sembunyikan kata sandi"));
    expect(input.type).toBe("password");
  });

  it("menampilkan error dan tidak mengirim saat loading", () => {
    const onSubmit = vi.fn();
    const { container, rerender } = render(
      <AuthPage
        mode="Masuk"
        onSubmit={onSubmit}
        onSwitch={vi.fn()}
        error="Login gagal"
      />,
    );

    expect(screen.getByRole("alert").textContent).toBe("Login gagal");

    rerender(
      <AuthPage mode="Masuk" onSubmit={onSubmit} onSwitch={vi.fn()} loading />,
    );
    expect(screen.getByText("Memproses login...")).toBeTruthy();
    fireEvent.submit(container.querySelector("form"));
    expect(onSubmit).not.toHaveBeenCalled();

    rerender(
      <AuthPage mode="Daftar" onSubmit={onSubmit} onSwitch={vi.fn()} loading />,
    );
    expect(screen.getByText("Memproses pendaftaran...")).toBeTruthy();
  });
});
