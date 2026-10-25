
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
  "/": "Beranda",
  "/katalog": "Katalog Herbal",
  "/finder": "Herbal Finder",
  "/artikel": "Artikel",
  "/dashboard": "Dashboard",
  "/auth/login": "Masuk",
  "/auth/register": "Daftar",
  "/login": "Masuk",
  "/register": "Daftar",
};

function pageFromPath(pathname) {
  const cleanPath =
    (pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";

  return PATH_TO_PAGE[cleanPath] || "Beranda";
}

// =====================================================
// STORAGE
// =====================================================

function readSessionUser() {
  try {
    const value = globalThis.sessionStorage.getItem(
      USER_STORAGE_KEY
    );

    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function readToken() {
  try {
    return (
      globalThis.sessionStorage.getItem(TOKEN_STORAGE_KEY) || ""
    );
  } catch {
    return "";
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

function saveSession(user, token) {
  globalThis.sessionStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify(user)
  );

  globalThis.sessionStorage.setItem(
    TOKEN_STORAGE_KEY,
    token
  );
}

function clearSession() {
  globalThis.sessionStorage.removeItem(USER_STORAGE_KEY);
  globalThis.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

// =====================================================
// API HELPER
// =====================================================

async function apiRequest(endpoint, options = {}) {
  const token = readToken();
  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new TypeError(
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
// AUTH HELPERS
// =====================================================

function getStringValue(value) {
  return typeof value === "string" ? value : "";
}

function validateAuthForm(form, isRegister) {
  const email = getStringValue(form.email)
    .trim()
    .toLowerCase();

  const password = getStringValue(form.password);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      error: "Masukkan alamat email yang valid.",
    };
  }

  if (!password) {
    return {
      error: "Kata sandi wajib diisi.",
    };
  }

  if (!isRegister) {
    return {
      email,
      password,
    };
  }

  const name = getStringValue(form.name).trim();
  const confirmation = getStringValue(form.confirmation);

  if (name.length < 2) {
    return {
      error: "Nama minimal 2 karakter.",
    };
  }

  if (password.length < 8) {
    return {
      error: "Kata sandi harus minimal 8 karakter.",
    };
  }

  if (password !== confirmation) {
    return {
      error: "Konfirmasi kata sandi tidak cocok.",
    };
  }

  return {
    name,
    email,
    password,
  };
}

function getAuthError(requestError, fallback) {
  return requestError instanceof Error
    ? requestError.message
    : fallback;
}

function getAuthResult(result) {
  const authenticatedUser = result.data?.user;
  const token = result.data?.token;

  if (!authenticatedUser || !token) {
    throw new Error(
      "Autentikasi berhasil, tetapi data pengguna atau token tidak lengkap."
    );
  }

  return {
    authenticatedUser,
    token,
  };
}

async function registerUser(form) {
  const result = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(form),
  });

  return getAuthResult(result);
}

async function loginUser(form) {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(form),
  });

  return getAuthResult(result);
}

// =====================================================
// PAGE CONTENT
// =====================================================

function HomeContent({ herbs, navigate, setSelectedHerb }) {
  return (
    <HomePage
      herbs={herbs}
      onNavigate={navigate}
      onSelectHerb={setSelectedHerb}
    />
  );
}

function CatalogContent({
  herbs,
  search,
  setSearch,
  category,
  setCategory,
  setSelectedHerb,
  savedIds,
  toggleSaved,
  loading,
  error,
  setReloadKey,
}) {
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
}

function FinderContent({ setSearch, setCategory, navigate }) {
  const handleChooseTopic = (keyword) => {
    setSearch(keyword);
    setCategory("Semua");
    navigate("Katalog Herbal");
  };

  return <FinderPage onChooseTopic={handleChooseTopic} />;
}

function DashboardContent({
  user,
  herbs,
  savedIds,
  setSelectedHerb,
  toggleSaved,
  navigate,
}) {
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
}

function AuthContent({
  page,
  handleAuth,
  authError,
  navigate,
  authLoading,
}) {
  return (
    <AuthPage
      mode={page}
      onSubmit={handleAuth}
      error={authError}
      onSwitch={navigate}
      loading={authLoading}
    />
  );
}

function renderPage({
  page,
  selectedHerb,
  herbs,
  loading,
  error,
  search,
  setSearch,
  category,
  setCategory,
  savedIds,
  toggleSaved,
  setSelectedHerb,
  setReloadKey,
  user,
  navigate,
  handleAuth,
  authError,
  authLoading,
}) {
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
    case "Beranda":
      return (
        <HomeContent
          herbs={herbs}
          navigate={navigate}
          setSelectedHerb={setSelectedHerb}
        />
      );

    case "Katalog Herbal":
      return (
        <CatalogContent
          herbs={herbs}
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          setSelectedHerb={setSelectedHerb}
          savedIds={savedIds}
          toggleSaved={toggleSaved}
          loading={loading}
          error={error}
          setReloadKey={setReloadKey}
        />
      );

    case "Herbal Finder":
      return (
        <FinderContent
          setSearch={setSearch}
          setCategory={setCategory}
          navigate={navigate}
        />
      );

    case "Artikel":
      return <ArticlesPage />;

    case "Dashboard":
      return (
        <DashboardContent
          user={user}
          herbs={herbs}
          savedIds={savedIds}
          setSelectedHerb={setSelectedHerb}
          toggleSaved={toggleSaved}
          navigate={navigate}
        />
      );

    case "Masuk":
    case "Daftar":
      return (
        <AuthContent
          page={page}
          handleAuth={handleAuth}
          authError={authError}
          navigate={navigate}
          authLoading={authLoading}
        />
      );

    default:
      return (
        <HomeContent
          herbs={herbs}
          navigate={navigate}
          setSelectedHerb={setSelectedHerb}
        />
      );
  }
}

// =====================================================
// APP
// =====================================================

export default function App() {
  const [page, setPage] = useState(() =>
    pageFromPath(globalThis.location.pathname)
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [user, setUser] = useState(readSessionUser);
  const [savedIds, setSavedIds] = useState(readSavedIds);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const {
    herbs,
    loading,
    error,
  } = useHerbs(search, reloadKey);

  // Simpan herbal favorit
  useEffect(() => {
    try {
      globalThis.localStorage.setItem(
        SAVED_STORAGE_KEY,
        JSON.stringify(savedIds)
      );
    } catch {
      // Penyimpanan lokal mungkin tidak tersedia.
    }
  }, [savedIds]);

  // Pulihkan sesi pengguna
  useEffect(() => {
    const token = readToken();

    if (!token) {
      setUser(null);
      return undefined;
    }

    let cancelled = false;

    async function restoreSession() {
      try {
        const result = await apiRequest("/auth/me");
        const authenticatedUser = result.data?.user;

        if (!authenticatedUser) {
          throw new Error("Data pengguna tidak ditemukan.");
        }

        if (cancelled) {
          return;
        }

        setUser(authenticatedUser);

        globalThis.sessionStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(authenticatedUser)
        );
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

  // Navigasi browser
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

  // Perbarui herbal yang sedang dipilih
  useEffect(() => {
    if (!selectedHerb) {
      return;
    }

    const updatedHerb = herbs.find(
      (item) => item.id === selectedHerb.id
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

    globalThis.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  // Simpan atau hapus herbal favorit
  const toggleSaved = useCallback((id) => {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }, []);

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

        saveSession(
          authResult.authenticatedUser,
          authResult.token
        );

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
    [page, navigate]
  );

  // Logout
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setAuthError("");
    navigate("Beranda");
  }, [navigate]);

  // Konten halaman
  const content = useMemo(
    () =>
      renderPage({
        page,
        selectedHerb,
        herbs,
        loading,
        error,
        search,
        setSearch,
        category,
        setCategory,
        savedIds,
        toggleSaved,
        setSelectedHerb,
        setReloadKey,
        user,
        navigate,
        handleAuth,
        authError,
        authLoading,
      }),
    [
      page,
      selectedHerb,
      herbs,
      loading,
      error,
      search,
      category,
      savedIds,
      toggleSaved,
      user,
      navigate,
      handleAuth,
      authError,
      authLoading,
    ]
  );

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
