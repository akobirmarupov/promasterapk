// Two tabs: «Kirish» (phone + password) and «Ro'yxatdan o'tish» (phone + name → Telegram → code → the bot sends the
// password). «Parolni unutdingizmi?» is the same Telegram flow with purpose=reset.
import React, { useState } from "react";
import { IonContent, IonIcon, IonPage, useIonRouter } from "@ionic/react";
import { lockClosed, personAdd } from "ionicons/icons";
import { api } from "../api";
import { useStore } from "../store";
import { Header } from "../components/ui";
import Verify, { startConfirm } from "../components/Verify";

export default function Login() {
  const { t, tErr, signIn, pending, setPending } = useStore();
  const router = useIonRouter();
  const [tab, setTab] = useState("login"); // login | register | reset
  const [phone, setPhone] = useState("+998 ");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const done = () => router.push("/profile", "back", "pop");

  const login = async () => {
    setError("");
    setBusy(true);
    try {
      const d = await api("auth/login/", { method: "POST", body: { phone, password } });
      signIn(d.token, d.customer);
      done();
    } catch (e) {
      setError(tErr(e));
    } finally {
      setBusy(false);
    }
  };
  const confirm = async (purpose) => {
    setError("");
    setBusy(true);
    try {
      const d = await api("auth/start/", { method: "POST", body: { phone, purpose, name } });
      startConfirm(setPending, d, phone, purpose);
    } catch (e) {
      setError(tErr(e));
      if (e.code === "exists") setTab("login");
    } finally {
      setBusy(false);
    }
  };

  const title = tab === "reset" ? t("resetTitle") : tab === "register" ? t("register") : t("signIn");
  return (
    <IonPage>
      <Header title={title} back="/profile" />
      <IonContent>
        <div className="pm-pad">
          {pending ? (
            <Verify onDone={done} />
          ) : (
            <>
              {tab !== "reset" && (
                <div className="pm-seg">
                  <button className={tab === "login" ? "on" : ""} onClick={() => { setTab("login"); setError(""); }}>{t("signIn")}</button>
                  <button className={tab === "register" ? "on" : ""} onClick={() => { setTab("register"); setError(""); }}>{t("register")}</button>
                </div>
              )}
              <div style={{ textAlign: "center", margin: "6px 0 18px" }}>
                <div className="pm-login-ic"><IonIcon icon={tab === "register" ? personAdd : lockClosed} /></div>
                <p className="pm-muted" style={{ marginTop: 12 }}>
                  {tab === "login" ? t("signInHint") : tab === "register" ? t("registerHint") : t("resetHint")}
                </p>
              </div>
              {error && <div className="pm-error">{error}</div>}

              <div className="pm-field"><label>{t("phone")}</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" /></div>

              {tab === "login" && (
                <>
                  <div className="pm-field"><label>{t("password")}</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                      onKeyDown={(e) => e.key === "Enter" && login()} /></div>
                  <button className="pm-btn" disabled={busy || !password} onClick={login}>{t("signIn")}</button>
                  <button className="pm-btn ghost" style={{ marginTop: 10 }} onClick={() => { setTab("reset"); setError(""); }}>{t("forgot")}</button>
                </>
              )}
              {tab === "register" && (
                <>
                  <div className="pm-field"><label>{t("fullName")}</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
                  <button className="pm-btn" disabled={busy || phone.replace(/\D/g, "").length < 12 || !name.trim()}
                    onClick={() => confirm("register")}>{t("confirmTg")}</button>
                </>
              )}
              {tab === "reset" && (
                <>
                  <button className="pm-btn" disabled={busy || phone.replace(/\D/g, "").length < 12} onClick={() => confirm("reset")}>{t("confirmTg")}</button>
                  <button className="pm-btn ghost" style={{ marginTop: 10 }} onClick={() => setTab("login")}>{t("cancel")}</button>
                </>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
