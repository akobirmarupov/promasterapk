// App state: cart, signed-in customer, language, the unfinished Telegram confirmation, the side menu.
// Kept on the phone (localStorage). The app is always light (no dark mode).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, hasToken, setApiLang, setToken } from "./api";
import { ERR, T } from "./i18n";

const Ctx = createContext(null);
const load = (k, d) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    return v ?? d;
  } catch (e) {
    return d;
  }
};

export function StoreProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("pm-lang") || "uz");
  // the registration / password reset waiting for the Telegram code: {request, phone, purpose, expires}
  const [pending, setPendingState] = useState(() => {
    const p = load("pm-pending", null);
    return p && new Date(p.expires) > new Date() ? p : null;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState(() => load("pm-cart", []));  // [{id, name, price, image, qty}]
  const [customer, setCustomer] = useState(null);
  const [ready, setReady] = useState(!hasToken());

  setApiLang(lang);
  useEffect(() => localStorage.setItem("pm-cart", JSON.stringify(cart)), [cart]);
  useEffect(() => {
    localStorage.removeItem("pm-dark"); // the old dark-mode switch is gone
    document.body.classList.remove("dark");
  }, []);
  useEffect(() => {
    if (pending) localStorage.setItem("pm-pending", JSON.stringify(pending));
    else localStorage.removeItem("pm-pending");
    if (!pending) return undefined;
    const ms = new Date(pending.expires) - new Date();
    const timer = setTimeout(() => setPendingState(null), Math.max(0, ms)); // forget it when it expires
    return () => clearTimeout(timer);
  }, [pending]);
  useEffect(() => {
    if (!hasToken()) return;
    api("me/").then((d) => setCustomer(d.customer)).catch(() => setCustomer(null)).finally(() => setReady(true));
  }, []);

  const t = useCallback((k) => (T[lang] && T[lang][k]) || T.uz[k] || k, [lang]);
  const tErr = useCallback((e) => t(ERR[e && e.code] || (e && e.code === "network" ? "noNet" : "errServer")), [t]);

  const value = useMemo(
    () => ({
      lang,
      t,
      tErr,
      ready,
      pending,
      setPending: setPendingState,
      menuOpen,
      setMenuOpen,
      setLang(l) {
        localStorage.setItem("pm-lang", l);
        setApiLang(l);
        setLangState(l);
        if (hasToken()) api("me/", { method: "PATCH", body: { lang: l } }).catch(() => {});
      },
      cart,
      count: cart.reduce((s, i) => s + i.qty, 0),
      total: cart.reduce((s, i) => s + i.qty * i.price, 0),
      qtyOf: (id) => (cart.find((i) => i.id === id) || {}).qty || 0,
      add(p, qty = 1) {
        setCart((c) => {
          const ex = c.find((i) => i.id === p.id);
          if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: Math.min(999, i.qty + qty) } : i));
          return [...c, { id: p.id, name: p.name, price: p.price, image: p.image, qty }];
        });
      },
      setQty(id, qty) {
        setCart((c) => (qty <= 0 ? c.filter((i) => i.id !== id) : c.map((i) => (i.id === id ? { ...i, qty } : i))));
      },
      clearCart: () => setCart([]),
      customer,
      setCustomer,
      signIn(token, c) {
        setToken(token);
        setCustomer(c);
        setPendingState(null);
        if (c && c.lang && c.lang !== lang) {
          localStorage.setItem("pm-lang", c.lang);
          setLangState(c.lang);
        }
      },
      async signOut() {
        try {
          await api("me/logout/", { method: "POST", body: {} });
        } catch (e) {
          /* the token may be gone already */
        }
        setToken("");
        setCustomer(null);
      },
    }),
    [lang, t, tErr, ready, pending, menuOpen, cart, customer]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
