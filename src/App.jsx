import { useCallback, useEffect, useMemo, useState } from "react";
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

const USER_STORAGE_KEY = "herbanusantara-demo-user";
const SAVED_STORAGE_KEY = "herbanusantara-saved-herbs";

function readSessionUser() {
  try {
    return JSON.parse(
      globalThis.sessionStorage.getItem(USER_STORAGE_KEY) || "null"
    );
  } catch {
    return null;
  }
}

function readSavedIds() {
  try {
    const value = JSON.parse(
      globalThis.localStorage.getItem(SAVED_STORAGE_KEY) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [page, setPage] = useState("Beranda");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [user, setUser] = useState(readSessionUser);
  const [savedIds, setSavedIds] = useState(readSavedIds);
  const [accounts, setAccounts] = useState([]);
  const [authError, setAuthError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const { herbs, loading, error } = useHerbs(search, reloadKey);
  const catalogPage = useMemo(
    () => page === "Katalog Herbal",
    [page]
  );

  useEffect(() => {
    globalThis.localStorage.setItem(
      SAVED_STORAGE_KEY,
      JSON.stringify(savedIds)
    );
  }, [savedIds]);

  useEffect(() => {
    if (!selectedHerb) return;

    const updatedHerb = herbs.find(
      (item) => item.id === selectedHerb.id
    );

    if (updatedHerb) {
      setSelectedHerb(updatedHerb);
    }
  }, [herbs, selectedHerb]);

  const navigate = useCallback((nextPage, nextCategory) => {
    setPage(nextPage);
    setSelectedHerb(null);
    setAuthError("");

    if (nextPage === "Katalog Herbal") {
      setCategory(nextCategory || "Semua");

      if (nextCategory && nextCategory !== "Semua") {
        setSearch("");
      }
    }

    globalThis.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const toggleSaved = useCallback((id) => {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }, []);

  const handleAuth = useCallback(
    (form) => {
      setAuthError("");

      if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
        setAuthError("Masukkan alamat email yang valid.");
        return;
      }

      if (page === "Daftar") {
        if (form.name.length < 2) {
          setAuthError("Nama minimal 2 karakter.");
          return;
        }

        if (form.password.length < 8) {
          setAuthError("Kata sandi harus minimal 8 karakter.");
          return;
        }

        if (form.password !== form.confirmation) {
          setAuthError("Konfirmasi kata sandi tidak cocok.");
          return;
        }

        const emailExists = accounts.some(
          (account) => account.email === form.email
        );

        if (emailExists) {
          setAuthError(
            "Email sudah terdaftar pada sesi demo ini."
          );
          return;
        }

        setAccounts((current) => [
          ...current,
          {
            name: form.name,
            email: form.email,
            password: form.password,
          },
        ]);

        const newUser = {
          name: form.name,
          email: form.email,
        };

        setUser(newUser);

        globalThis.sessionStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(newUser)
        );

        navigate("Dashboard");
        return;
      }

      const account = accounts.find(
        (item) =>
          item.email === form.email &&
          item.password === form.password
      );

      if (!account) {
        setAuthError(
          "Akun tidak ditemukan pada sesi demo ini. Silakan daftar terlebih dahulu."
        );
        return;
      }

      const nextUser = {
        name: account.name,
        email: account.email,
      };

      setUser(nextUser);

      globalThis.sessionStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(nextUser)
      );

      navigate("Dashboard");
    },
    [accounts, navigate, page]
  );

  const logout = useCallback(() => {
    setUser(null);
    globalThis.sessionStorage.removeItem(USER_STORAGE_KEY);
    navigate("Beranda");
  }, [navigate]);

  let content;

  if (selectedHerb) {
    content = (
      <HerbDetailModal
        herb={selectedHerb}
        onClose={() => setSelectedHerb(null)}
        saved={savedIds.includes(selectedHerb.id)}
        onToggleSave={toggleSaved}
      />
    );
  } else if (page === "Beranda") {
    content = (
      <HomePage
        herbs={herbs}
        onNavigate={navigate}
        onSelectHerb={setSelectedHerb}
      />
    );
  } else if (catalogPage) {
    content = (
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
  } else if (page === "Herbal Finder") {
    content = (
      <FinderPage
        onChooseTopic={(keyword) => {
          setSearch(keyword);
          setCategory("Semua");
          navigate("Katalog Herbal");
        }}
      />
    );
  } else if (page === "Artikel") {
    content = <ArticlesPage />;
  } else if (page === "Dashboard") {
    content = (
      <DashboardPage
        user={user}
        herbs={herbs}
        savedIds={savedIds}
        onSelectHerb={setSelectedHerb}
        onToggleSave={toggleSaved}
        onNavigate={navigate}
      />
    );
  } else if (page === "Masuk" || page === "Daftar") {
    content = (
      <AuthPage
        mode={page}
        onSubmit={handleAuth}
        error={authError}
        onSwitch={navigate}
      />
    );
  } else {
    content = (
      <HomePage
        herbs={herbs}
        onNavigate={navigate}
        onSelectHerb={setSelectedHerb}
      />
    );
  }

  return (
    <>
      <Navbar
        page={page}
        onNavigate={navigate}
        user={user}
        onLogout={logout}
      />
      <main className="wrap">{content}</main>
      <Footer onNavigate={navigate} />
    </>
  );
}