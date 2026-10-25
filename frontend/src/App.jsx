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
const ACCOUNTS_STORAGE_KEY = "herbanusantara-demo-accounts";

// Pemetaan halaman <-> URL agar halaman bisa dibuka langsung lewat path (mis. /auth/login)
const ROUTES = {
  "Beranda": "/",
  "Katalog Herbal": "/katalog",
  "Herbal Finder": "/finder",
  "Artikel": "/artikel",
  "Dashboard": "/dashboard",
  "Masuk": "/auth/login",
  "Daftar": "/auth/register",
};
const PATH_TO_PAGE = {
  ...Object.fromEntries(Object.entries(ROUTES).map(([name, path]) => [path, name])),
  "/login": "Masuk",
  "/register": "Daftar",
};
function pageFromPath(pathname) {
  const clean = (pathname || "/").toLowerCase().replace(/\/+$/, "") || "/";
  return PATH_TO_PAGE[clean] || "Beranda";
}
async function hashPassword(password) {
  if (!globalThis.crypto?.subtle) return password;
  const bytes = new TextEncoder().encode(password);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function readAccounts() {
  try { const value = JSON.parse(localStorage.getItem(ACCOUNTS_STORAGE_KEY) || "[]"); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
function readSessionUser() {
  try { return JSON.parse(sessionStorage.getItem(USER_STORAGE_KEY) || "null"); }
  catch { return null; }
}
function readSavedIds() {
  try { const value = JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY) || "[]"); return Array.isArray(value) ? value : []; }
  catch { return []; }
}

export default function App() {
  const [page, setPage] = useState(() => pageFromPath(window.location.pathname));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [selectedHerb, setSelectedHerb] = useState(null);
  const [user, setUser] = useState(readSessionUser);
  const [savedIds, setSavedIds] = useState(readSavedIds);
  const [accounts, setAccounts] = useState(readAccounts);
  const [authError, setAuthError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const { herbs, loading, error } = useHerbs(search, reloadKey);

  useEffect(() => { localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds)); }, [savedIds]);
  useEffect(() => { localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => {
    const onPopState = () => { setPage(pageFromPath(window.location.pathname)); setSelectedHerb(null); setAuthError(""); };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  useEffect(() => { if (selectedHerb) setSelectedHerb(herbs.find((item) => item.id === selectedHerb.id) || selectedHerb); }, [herbs, selectedHerb]);

  const navigate = useCallback((nextPage, nextCategory) => {
    setPage(nextPage);
    const nextPath = ROUTES[nextPage] || "/";
    if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
    setSelectedHerb(null);
    setAuthError("");
    if (nextPage === "Katalog Herbal") {
      setCategory(nextCategory || "Semua");
      if (nextCategory && nextCategory !== "Semua") setSearch("");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleSaved = useCallback((id) => {
    setSavedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }, []);

  const handleAuth = useCallback(async (form) => {
    setAuthError("");
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) { setAuthError("Masukkan alamat email yang valid."); return; }
    if (page === "Daftar") {
      if (form.name.length < 2) { setAuthError("Nama minimal 2 karakter."); return; }
      if (form.password.length < 8) { setAuthError("Kata sandi harus minimal 8 karakter."); return; }
      if (form.password !== form.confirmation) { setAuthError("Konfirmasi kata sandi tidak cocok."); return; }
      if (accounts.some((account) => account.email === form.email)) { setAuthError("Email sudah terdaftar pada browser ini."); return; }
      const passwordHash = await hashPassword(form.password);
      setAccounts((current) => [...current, { name: form.name, email: form.email, passwordHash }]);
      setUser({ name: form.name, email: form.email });
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ name: form.name, email: form.email }));
      navigate("Dashboard");
      return;
    }
    const passwordHash = await hashPassword(form.password);
    const account = accounts.find((item) => item.email === form.email && item.passwordHash === passwordHash);
    if (!account) { setAuthError("Email atau kata sandi salah. Jika belum punya akun, silakan daftar terlebih dahulu."); return; }
    const nextUser = { name: account.name, email: account.email };
    setUser(nextUser);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    navigate("Dashboard");
  }, [accounts, navigate, page]);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    navigate("Beranda");
  }, [navigate]);

  const catalogPage = useMemo(() => page === "Katalog Herbal", [page]);
  let content;
  if (selectedHerb) {
    content = <HerbDetailModal herb={selectedHerb} onClose={() => setSelectedHerb(null)} saved={savedIds.includes(selectedHerb.id)} onToggleSave={toggleSaved}/>;
  } else if (page === "Beranda") {
    content = <HomePage herbs={herbs} onNavigate={navigate} onSelectHerb={setSelectedHerb}/>;
  } else if (catalogPage) {
    content = <CatalogPage herbs={herbs} search={search} onSearch={setSearch} category={category} onCategory={setCategory} onSelectHerb={setSelectedHerb} savedIds={savedIds} onToggleSave={toggleSaved} loading={loading} error={error} onRetry={() => setReloadKey((key) => key + 1)}/>;
  } else if (page === "Herbal Finder") {
    content = <FinderPage onChooseTopic={(keyword) => { setSearch(keyword); setCategory("Semua"); navigate("Katalog Herbal"); }}/>;
  } else if (page === "Artikel") {
    content = <ArticlesPage/>;
  } else if (page === "Dashboard") {
    content = <DashboardPage user={user} herbs={herbs} savedIds={savedIds} onSelectHerb={setSelectedHerb} onToggleSave={toggleSaved} onNavigate={navigate}/>;
  } else if (page === "Masuk" || page === "Daftar") {
    content = <AuthPage mode={page} onSubmit={handleAuth} error={authError} onSwitch={navigate}/>;
  } else {
    content = <HomePage herbs={herbs} onNavigate={navigate} onSelectHerb={setSelectedHerb}/>;
  }

  return <><Navbar page={page} onNavigate={navigate} user={user} onLogout={logout}/><main className="wrap">{content}</main><Footer onNavigate={navigate}/></>;
}
