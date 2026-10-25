import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HerbDetailModal from "./components/HerbDetailModal.jsx";
import useHerbs from "./hooks/useHerbs.js";
import HomePage from "./pages/HomePage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import FinderPage from "./pages/FinderPage.jsx";
import ArticlesPage from "./pages/ArticlesPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import {
  fetchCurrentUser,
  getAuthError,
  loginUser,
  registerUser,
  validateAuthForm,
} from "./services/authService.js";
import { ROUTES, pageFromPath } from "./utils/routes.js";
import {
  clearSession,
  readSavedIds,
  readSessionUser,
  readToken,
  saveSession,
  saveSessionUser,
  writeSavedIds,
} from "./utils/session.js";

export default function App() {
  const [page, setPage] = useState(() =>
    pageFromPath(globalThis.location.pathname),
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [user, setUser] = useState(readSessionUser);
  const [savedIds, setSavedIds] = useState(readSavedIds);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const { herbs, loading, error } = useHerbs(search, reloadKey);

  // Simpan herbal favorit
  useEffect(() => {
    writeSavedIds(savedIds);
  }, [savedIds]);

  // Pulihkan sesi pengguna
  useEffect(() => {
    if (!readToken()) {
      setUser(null);
      return undefined;
    }

    let cancelled = false;

    async function restoreSession() {
      try {
        const authenticatedUser = await fetchCurrentUser();

        if (cancelled) {
          return;
        }

        setUser(authenticatedUser);
        saveSessionUser(authenticatedUser);
      } catch {
        if (cancelled) {
          return;
        }

        clearSession();
        setUser(null);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Navigasi browser (tombol back/forward)
  useEffect(() => {
    const onPopState = () => {
      setPage(pageFromPath(globalThis.location.pathname));
      setSelectedHerb(null);
      setAuthError("");
    };

    globalThis.addEventListener("popstate", onPopState);

    return () => {
      globalThis.removeEventListener("popstate", onPopState);
    };
  }, []);

  // Perbarui herbal yang sedang dipilih jika datanya berubah
  useEffect(() => {
    if (!selectedHerb) {
      return;
    }

    const updatedHerb = herbs.find(
      (item) => item.id === selectedHerb.id,
    );

    if (updatedHerb) {
      setSelectedHerb(updatedHerb);
    }
  }, [herbs, selectedHerb]);

  // Navigasi halaman
  const navigate = useCallback((nextPage, nextCategory) => {
    setPage(nextPage);

    const nextPath = ROUTES[nextPage] || "/";

    if (globalThis.location.pathname !== nextPath) {
      globalThis.history.pushState(null, "", nextPath);
    }

    setSelectedHerb(null);
    setAuthError("");

    if (nextPage === "Katalog Herbal") {
      setCategory(nextCategory || "Semua");

      if (nextCategory && nextCategory !== "Semua") {
        setSearch("");
      }
    }

    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Simpan atau hapus herbal favorit
  const toggleSaved = useCallback((id) => {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  // Dipanggil dari halaman Finder
  const chooseTopic = useCallback(
    (keyword) => {
      setSearch(keyword);
      setCategory("Semua");
      navigate("Katalog Herbal");
    },
    [navigate],
  );

  // Login dan registrasi
  const handleAuth = useCallback(
    async (form) => {
      setAuthError("");

      const isRegister = page === "Daftar";
      const validatedForm = validateAuthForm(form, isRegister);

      if (validatedForm.error) {
        setAuthError(validatedForm.error);
        return;
      }

      setAuthLoading(true);

      try {
        const authResult = isRegister
          ? await registerUser(validatedForm)
          : await loginUser(validatedForm);

        saveSession(authResult.authenticatedUser, authResult.token);
        setUser(authResult.authenticatedUser);
        navigate("Dashboard");
      } catch (requestError) {
        const fallback = isRegister
          ? "Registrasi gagal. Silakan coba lagi."
          : "Login gagal. Silakan coba lagi.";

        setAuthError(getAuthError(requestError, fallback));
      } finally {
        setAuthLoading(false);
      }
    },
    [page, navigate],
  );

  // Logout
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setAuthError("");
    navigate("Beranda");
  }, [navigate]);

  function renderPage() {
    if (selectedHerb) {
      return (
        <HerbDetailModal
          herb={selectedHerb}
          onClose={() => setSelectedHerb(null)}
          saved={savedIds.includes(selectedHerb.id)}
          onToggleSave={toggleSaved}
        />
      );
    }

    switch (page) {
      case "Katalog Herbal":
        return (
          <CatalogPage
            herbs={herbs}
            search={search}
            onSearch={setSearch}
            category={category}
            onCategory={setCategory}
            onSelectHerb={setSelectedHerb}
            savedIds={savedIds}
            onToggleSave={toggleSaved}
            loading={loading}
            error={error}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        );

      case "Herbal Finder":
        return <FinderPage onChooseTopic={chooseTopic} />;

      case "Artikel":
        return <ArticlesPage />;

      case "Dashboard":
        return (
          <DashboardPage
            user={user}
            herbs={herbs}
            savedIds={savedIds}
            onSelectHerb={setSelectedHerb}
            onToggleSave={toggleSaved}
            onNavigate={navigate}
          />
        );

      case "Masuk":
      case "Daftar":
        return (
          <AuthPage
            mode={page}
            onSubmit={handleAuth}
            error={authError}
            onSwitch={navigate}
            loading={authLoading}
          />
        );

      default:
        return (
          <HomePage
            herbs={herbs}
            onNavigate={navigate}
            onSelectHerb={setSelectedHerb}
          />
        );
    }
  }

  return (
    <>
      <Navbar
        page={page}
        onNavigate={navigate}
        user={user}
        onLogout={logout}
      />

      <main className="wrap">{renderPage()}</main>

      <Footer onNavigate={navigate} />
    </>
  );
}
