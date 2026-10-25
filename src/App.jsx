
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

// =====================================================
// KONFIGURASI
// =====================================================

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

const USER_STORAGE_KEY = "herbanusantara-demo-user";
const TOKEN_STORAGE_KEY = "herbanusantara-token";
const SAVED_STORAGE_KEY = "herbanusantara-saved-herbs";

// =====================================================
// ROUTING
// =====================================================

const ROUTES = {
  Beranda: "/",
  "Katalog Herbal": "/katalog",
  "Herbal Finder": "/finder",
  Artikel: "/artikel",
  Dashboard: "/dashboard",
  Masuk: "/auth/login",
  Daftar: "/auth/register",
};

const PATH_TO_PAGE = {
  ...Object.fromEntries(
    Object.entries(ROUTES).map(([name, path]) => [
      path,
      name,
    ])
  ),

  "/login": "Masuk",
  "/register": "Daftar",
};

function pageFromPath(pathname) {
  const cleanPath =
    (pathname || "/")
      .toLowerCase()
      .replace(/\/+$/, "") || "/";

  return PATH_TO_PAGE[cleanPath] || "Beranda";
}

// =====================================================
// STORAGE
// =====================================================

function readSessionUser() {
  try {
    const value = sessionStorage.getItem(USER_STORAGE_KEY);

    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function readToken() {
  return sessionStorage.getItem(TOKEN_STORAGE_KEY) || "";
}

function readSavedIds() {
  try {
    const value = JSON.parse(
      localStorage.getItem(SAVED_STORAGE_KEY) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveSession(user, token) {
  sessionStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify(user)
  );

  sessionStorage.setItem(
    TOKEN_STORAGE_KEY,
    token
  );
}

function clearSession() {
  sessionStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

// =====================================================
// API HELPER
// =====================================================

async function apiRequest(endpoint, options = {}) {
  const token = readToken();

  const headers = {
    ...(options.headers || {}),
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Tidak dapat terhubung ke backend. Pastikan server berjalan."
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSession();
    }

    throw new Error(
      result.message || "Terjadi kesalahan pada server."
    );
  }

  return result;
}

// =====================================================
// APP
// =====================================================

export default function App() {
  // ---------------------------------------------------
  // STATE
  // ---------------------------------------------------

  const [page, setPage] = useState(() =>
    pageFromPath(window.location.pathname)
  );

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("Semua");

  const [selectedHerb, setSelectedHerb] = useState(null);

  const [user, setUser] = useState(readSessionUser);

  const [savedIds, setSavedIds] = useState(readSavedIds);

  const [authError, setAuthError] = useState("");

  const [authLoading, setAuthLoading] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  // ---------------------------------------------------
  // HERBAL API
  // ---------------------------------------------------

  const {
    herbs,
    loading,
    error,
  } = useHerbs(search, reloadKey);

  // ---------------------------------------------------
  // SAVED HERBS
  // ---------------------------------------------------

  useEffect(() => {
    localStorage.setItem(
      SAVED_STORAGE_KEY,
      JSON.stringify(savedIds)
    );
  }, [savedIds]);

  // ---------------------------------------------------
  // RESTORE USER SESSION
  // ---------------------------------------------------

  useEffect(() => {
    const token = readToken();

    if (!token) {
      setUser(null);
      return;
    }

    let cancelled = false;

    async function restoreSession() {
      try {
        const result = await apiRequest("/auth/me");

        const authenticatedUser =
          result.data?.user;

        if (!authenticatedUser) {
          throw new Error(
            "Data pengguna tidak ditemukan."
          );
        }

        if (cancelled) return;

        setUser(authenticatedUser);

        sessionStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(authenticatedUser)
        );
      } catch {
        if (cancelled) return;

        clearSession();
        setUser(null);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------------------------------------------------
  // BROWSER NAVIGATION
  // ---------------------------------------------------

  useEffect(() => {
    const onPopState = () => {
      setPage(
        pageFromPath(window.location.pathname)
      );

      setSelectedHerb(null);
      setAuthError("");
    };

    window.addEventListener(
      "popstate",
      onPopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        onPopState
      );
    };
  }, []);

  // ---------------------------------------------------
  // UPDATE SELECTED HERB
  // ---------------------------------------------------

  useEffect(() => {
    if (!selectedHerb) return;

    const updatedHerb = herbs.find(
      (item) => item.id === selectedHerb.id
    );

    if (updatedHerb) {
      setSelectedHerb(updatedHerb);
    }
  }, [herbs, selectedHerb]);

  // ---------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------

  const navigate = useCallback(
    (nextPage, nextCategory) => {
      setPage(nextPage);

      const nextPath = ROUTES[nextPage] || "/";

      if (
        window.location.pathname !== nextPath
      ) {
        window.history.pushState(
          {},
          "",
          nextPath
        );
      }

      setSelectedHerb(null);
      setAuthError("");

      if (nextPage === "Katalog Herbal") {
        setCategory(nextCategory || "Semua");

        if (
          nextCategory &&
          nextCategory !== "Semua"
        ) {
          setSearch("");
        }
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    []
  );

  // ---------------------------------------------------
  // TOGGLE SAVED HERBS
  // ---------------------------------------------------

  const toggleSaved = useCallback((id) => {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }, []);

  // ---------------------------------------------------
  // AUTHENTICATION
  // ---------------------------------------------------

  const handleAuth = useCallback(
    async (form) => {
      setAuthError("");

      const email = String(form.email || "")
        .trim()
        .toLowerCase();

      const password = String(
        form.password || ""
      );

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        setAuthError(
          "Masukkan alamat email yang valid."
        );

        return;
      }

      if (!password) {
        setAuthError(
          "Kata sandi wajib diisi."
        );

        return;
      }

      // -------------------------------------------------
      // REGISTER
      // -------------------------------------------------

      if (page === "Daftar") {
        const name = String(form.name || "").trim();

        if (name.length < 2) {
          setAuthError(
            "Nama minimal 2 karakter."
          );

          return;
        }

        if (password.length < 8) {
          setAuthError(
            "Kata sandi harus minimal 8 karakter."
          );

          return;
        }

        if (
          password !== String(form.confirmation || "")
        ) {
          setAuthError(
            "Konfirmasi kata sandi tidak cocok."
          );

          return;
        }

        setAuthLoading(true);

        try {
          const result = await apiRequest(
            "/auth/register",
            {
              method: "POST",

              body: JSON.stringify({
                name,
                email,
                password,
              }),
            }
          );

          const authenticatedUser =
            result.data?.user;

          const token = result.data?.token;

          if (!authenticatedUser || !token) {
            throw new Error(
              "Registrasi berhasil, tetapi data autentikasi tidak lengkap."
            );
          }

          saveSession(
            authenticatedUser,
            token
          );

          setUser(authenticatedUser);

          navigate("Dashboard");
        } catch (error) {
          setAuthError(error.message);
        } finally {
          setAuthLoading(false);
        }

        return;
      }

      // -------------------------------------------------
      // LOGIN
      // -------------------------------------------------

      setAuthLoading(true);

      try {
        const result = await apiRequest(
          "/auth/login",
          {
            method: "POST",

            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        const authenticatedUser =
          result.data?.user;

        const token = result.data?.token;

        if (!authenticatedUser || !token) {
          throw new Error(
            "Login berhasil, tetapi data autentikasi tidak lengkap."
          );
        }

        saveSession(
          authenticatedUser,
          token
        );

        setUser(authenticatedUser);

        navigate("Dashboard");
      } catch (error) {
        setAuthError(error.message);
      } finally {
        setAuthLoading(false);
      }
    },
    [page, navigate]
  );

  // ---------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------

  const logout = useCallback(() => {
    clearSession();

    setUser(null);

    setAuthError("");

    navigate("Beranda");
  }, [navigate]);

  // ---------------------------------------------------
  // PAGE
  // ---------------------------------------------------

  const catalogPage = useMemo(
    () => page === "Katalog Herbal",
    [page]
  );

  let content;

  // ---------------------------------------------------
  // HERB DETAIL
  // ---------------------------------------------------

  if (selectedHerb) {
    content = (
      <HerbDetailModal
        herb={selectedHerb}
        onClose={() => setSelectedHerb(null)}
        saved={savedIds.includes(selectedHerb.id)}
        onToggleSave={toggleSaved}
      />
    );

  // ---------------------------------------------------
  // HOME
  // ---------------------------------------------------

  } else if (page === "Beranda") {
    content = (
      <HomePage
        herbs={herbs}
        onNavigate={navigate}
        onSelectHerb={setSelectedHerb}
      />
    );

  // ---------------------------------------------------
  // CATALOG
  // ---------------------------------------------------

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
        onRetry={() =>
          setReloadKey((key) => key + 1)
        }
      />
    );

  // ---------------------------------------------------
  // FINDER
  // ---------------------------------------------------

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

  // ---------------------------------------------------
  // ARTICLES
  // ---------------------------------------------------

  } else if (page === "Artikel") {
    content = <ArticlesPage />;

  // ---------------------------------------------------
  // DASHBOARD
  // ---------------------------------------------------

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

  // ---------------------------------------------------
  // AUTH
  // ---------------------------------------------------

  } else if (
    page === "Masuk" ||
    page === "Daftar"
  ) {
    content = (
      <AuthPage
        mode={page}
        onSubmit={handleAuth}
        error={authError}
        onSwitch={navigate}
        loading={authLoading}
      />
    );

  // ---------------------------------------------------
  // DEFAULT
  // ---------------------------------------------------

  } else {
    content = (
      <HomePage
        herbs={herbs}
        onNavigate={navigate}
        onSelectHerb={setSelectedHerb}
      />
    );
  }

  // ---------------------------------------------------
  // RENDER
  // ---------------------------------------------------

  return (
    <>
      <Navbar
        page={page}
        onNavigate={navigate}
        user={user}
        onLogout={logout}
      />

      <main className="wrap">
        {content}
      </main>

      <Footer
        onNavigate={navigate}
      />
    </>
  );
}
