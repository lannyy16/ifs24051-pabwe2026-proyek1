import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HerbDetailModal from "./components/HerbDetailModal.jsx";
import useAuth from "./hooks/useAuth.js";
import useHerbs from "./hooks/useHerbs.js";
import usePageRouter from "./hooks/usePageRouter.js";
import useSavedHerbs from "./hooks/useSavedHerbs.js";
import HomePage from "./pages/HomePage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import FinderPage from "./pages/FinderPage.jsx";
import ArticlesPage from "./pages/ArticlesPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";

export default function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { herbs, loading, error } = useHerbs(search, reloadKey);
  const { savedIds, toggleSaved } = useSavedHerbs();
  const auth = useAuth();

  // Tutup detail herbal dan hapus pesan error saat berpindah halaman.
  const { clearError: clearAuthError } = auth;
  const resetTransientState = useCallback(() => {
    setSelectedHerb(null);
    clearAuthError();
  }, [clearAuthError]);

  const { page, goTo } = usePageRouter(resetTransientState);

  // Perbarui herbal yang sedang dipilih jika datanya berubah
  useEffect(() => {
    if (!selectedHerb) {
      return;
    }

    const updatedHerb = herbs.find((item) => item.id === selectedHerb.id);

    if (updatedHerb) {
      setSelectedHerb(updatedHerb);
    }
  }, [herbs, selectedHerb]);

  // Navigasi halaman
  const navigate = useCallback(
    (nextPage, nextCategory) => {
      goTo(nextPage);
      resetTransientState();

      if (nextPage === "Katalog Herbal") {
        setCategory(nextCategory || "Semua");

        if (nextCategory && nextCategory !== "Semua") {
          setSearch("");
        }
      }
    },
    [goTo, resetTransientState],
  );

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
  const { submit: submitAuth } = auth;
  const handleAuth = useCallback(
    async (form) => {
      const isSuccess = await submitAuth(form, page === "Daftar");

      if (isSuccess) {
        navigate("Dashboard");
      }
    },
    [page, submitAuth, navigate],
  );

  // Logout
  const { logout: logoutUser } = auth;
  const handleLogout = useCallback(() => {
    logoutUser();
    navigate("Beranda");
  }, [logoutUser, navigate]);

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
            user={auth.user}
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
            error={auth.error}
            onSwitch={navigate}
            loading={auth.loading}
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
        user={auth.user}
        onLogout={handleLogout}
      />

      <main className="wrap">{renderPage()}</main>

      <Footer onNavigate={navigate} />
    </>
  );
}
