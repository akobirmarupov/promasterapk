// The app talks to the Promaster site: /api/app/… (https://promaster.com.uz in the app, the local site in the browser).
import { Capacitor } from "@capacitor/core";

export const SITE = import.meta.env.VITE_SITE || (Capacitor.isNativePlatform() ? "https://promaster.com.uz" : "");

let token = localStorage.getItem("pm-token") || "";
let lang = localStorage.getItem("pm-lang") || "uz";

export function setToken(t) {
  token = t || "";
  if (token) localStorage.setItem("pm-token", token);
  else localStorage.removeItem("pm-token");
}
export function setApiLang(l) {
  lang = l;
}
export const hasToken = () => !!token;

export class ApiError extends Error {
  constructor(code, status) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

export async function api(path, { method = "GET", body } = {}) {
  const sep = path.includes("?") ? "&" : "?";
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${SITE}/api/app/${path}${sep}lang=${lang}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError("network", 0);
  }
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    /* empty body */
  }
  if (!res.ok) {
    if (res.status === 401) setToken("");
    throw new ApiError(data.error || "server", res.status);
  }
  return data;
}

export const money = (n) => `${Math.round(n || 0).toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;
