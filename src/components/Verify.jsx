// The unfinished Telegram confirmation (registration or password reset). It lives in the store and on the phone,
// so after the customer comes back from Telegram — even to the home page or after the app restarted — Profile and
// Login show this box with the code field; the phone number is not asked again. The code works 5 minutes, once,
// and only with this phone's request token.
import React, { useEffect, useRef, useState } from "react";
import { IonIcon, useIonAlert } from "@ionic/react";
import { paperPlane, shieldCheckmark } from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import { api } from "../api";
import { useStore } from "../store";

const openUrl = (url) => Browser.open({ url }).catch(() => window.open(url, "_blank"));

function useCountdown(until) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, Math.round((new Date(until) - new Date()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [until]);
  return left;
}

export default function Verify({ onDone, compact }) {
  const { t, tErr, pending, setPending, signIn } = useStore();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [alert] = useIonAlert();
  const poll = useRef(null);
  const left = useCountdown(pending && pending.expires);

  // waiting for Telegram → ask the server every 2.5 s whether the code was sent
  useEffect(() => {
    clearInterval(poll.current);
    if (!pending || pending.status !== "link_telegram") return undefined;
    const check = () =>
      api(`auth/status/?request=${pending.request}`)
        .then((d) => {
          if (d.status === "code_sent") setPending({ ...pending, status: "code_sent", expires: d.expires || pending.expires });
          // (the code field is already on screen; only the hint and the timer change)
          else if (d.status === "expired") setPending(null);
        })
        .catch(() => {});
    check();
    poll.current = setInterval(check, 2500);
    return () => clearInterval(poll.current);
  }, [pending && pending.request, pending && pending.status]);

  if (!pending) return null;
  const waiting = pending.status === "link_telegram";
  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  const verify = async () => {
    setError("");
    setBusy(true);
    try {
      const d = await api("auth/verify/", { method: "POST", body: { request: pending.request, code } });
      signIn(d.token, d.customer);
      setCode("");
      if (d.password_sent) await alert({ header: "✅", message: t("registered"), buttons: ["OK"] });
      else await alert({ header: "🔑", message: `${t("passwordShown")} ${d.password}`, buttons: ["OK"] });
      if (onDone) onDone();
    } catch (e) {
      setError(tErr(e));
      if (e.code === "expired") setPending(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`pm-verify${compact ? " compact" : ""}`}>
      <div className="head">
        <span className="ic"><IonIcon icon={waiting ? paperPlane : shieldCheckmark} /></span>
        <div>
          <b>{t("verifyTitle")}</b>
          <div className="pm-muted">{pending.phone} · {t("timeLeft")} {mm}</div>
        </div>
      </div>
      {error && <div className="pm-error">{error}</div>}
      <p className="pm-muted" style={{ margin: "4px 0 10px" }}>{waiting ? t("linkHint") : t("verifyHint")}</p>
      {pending.bot_url && (
        <button className="pm-btn" style={{ background: "#229ED9", marginBottom: 12 }} onClick={() => openUrl(pending.bot_url)}>
          <IonIcon icon={paperPlane} /> {t("openTelegram")}
        </button>
      )}
      {/* the code field is always here — the customer types the code as soon as the bot sends it */}
      <input className="pm-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" />
      {waiting && <p className="pm-muted" style={{ textAlign: "center", margin: "8px 0 0", fontSize: 13 }}>{t("waiting")}</p>}
      <button className="pm-btn" style={{ marginTop: 12 }} disabled={busy || code.length !== 6} onClick={verify}>{t("confirm2")}</button>
      <button className="pm-link" onClick={() => setPending(null)}>{t("changePhone")}</button>
    </div>
  );
}

export function startConfirm(setPending, d, phone, purpose) {
  // auth/start answer → saved as «pending» (the code box appears at once) and the Telegram bot opens right away —
  // with «Start» for a new chat, or just the chat where the code has already arrived
  const expires = d.expires || new Date(Date.now() + 15 * 60 * 1000).toISOString();
  const botUrl = d.bot_url || (d.bot ? `https://t.me/${d.bot}` : "");
  setPending({ request: d.request, phone, purpose, status: d.status, bot_url: botUrl, expires });
  if (botUrl) openUrl(botUrl);
}
