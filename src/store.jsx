// App state: cart, signed-in customer, language, dark mode. Kept on the phone (localStorage).
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
  const [dark, setDarkState] = useState(() => load("pm-dark", false));
  const [cart, setCart] = useState(() => load("pm-cart", []));  // [{id, name, price, image, qty}]
  const [customer, setCustomer] = useState(null);
  const [ready, setReady] = useState(!hasToken());

  setApiLang(lang);
  useEffect(() => localStorage.setItem("pm-cart", JSON.stringify(cart)), [cart]);
  useEffect(() => {
    document.body.classList.toggle("dark", !!dark);
    document.documentElement.classList.toggle("ion-palette-dark", !!dark);
    localStorage.setItem("pm-dark", JSON.stringify(!!dark));
  }, [dark]);
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
      dark,
      ready,
      setDark: setDarkState,
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
    [lang, t, tErr, dark, ready, cart, customer]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
