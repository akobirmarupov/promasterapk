import React, { useEffect, useRef, useState } from "react";
import { IonContent, IonIcon, IonPage, useIonRouter } from "@ionic/react";
import { paperPlane, shieldCheckmark } from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import { api } from "../api";
import { useStore } from "../store";
import { Header } from "../components/ui";

export default function Login() {
  const { t, tErr, signIn } = useStore();
  const router = useIonRouter();
  const [phone, setPhone] = useState("+998 ");
  const [step, setStep] = useState("phone"); // phone → link → code
  const [req, setReq] = useState("");
  const [botUrl, setBotUrl] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const poll = useRef(null);

  useEffect(() => () => clearInterval(poll.current), []);
  useEffect(() => {
    clearInterval(poll.current);
    if (step !== "link") return;
    poll.current = setInterval(() => {
      api(`auth/status/?request=${req}`).then((d) => {
        if (d.status === "code_sent") setStep("code");
        else if (d.status === "expired") { setError(t("errExpired")); setStep("phone"); }
      }).catch(() => {});
    }, 2500);
  }, [step, req]);

  const start = async () => {
    setError("");
    setBusy(true);
    try {
      const d = await api("auth/start/", { method: "POST", body: { phone } });
      setReq(d.request);
      if (d.status === "code_sent") setStep("code");
      else {
        setBotUrl(d.bot_url);
        setStep("link");
        if (d.bot_url) Browser.open({ url: d.bot_url }).catch(() => window.open(d.bot_url, "_blank"));
      }
    } catch (e) {
      setError(tErr(e));
    } finally {
      setBusy(false);
    }
  };
  const verify = async () => {
    setError("");
    setBusy(true);
    try {
      const d = await api("auth/verify/", { method: "POST", body: { request: req, code } });
      signIn(d.token, d.customer);
      router.push("/profile", "back", "pop");
    } catch (e) {
      setError(tErr(e));
      if (e.code === "expired") setStep("phone");
    } finally {
      setBusy(false);
    }
  };

  return (
    <IonPage>
      <Header title={t("loginTitle")} back="/profile" />
      <IonContent>
        <div className="pm-pad">
          <div style={{ textAlign: "center", margin: "10px 0 24px" }}>
            <div style={{ width: 80, height: 80, borderRadius: 26, margin: "0 auto", display: "grid", placeItems: "center", background: "linear-gradient(140deg,#0e3b1f,#2f9e0c)", color: "#fff", fontSize: 38 }}>
              <IonIcon icon={step === "code" ? shieldCheckmark : paperPlane} />
            </div>
            <p className="pm-muted" style={{ marginTop: 14 }}>{step === "code" ? t("codeHint") : step === "link" ? t("linkHint") : t("loginHint")}</p>
          </div>
          {error && <div className="pm-error">{error}</div>}

          {step === "phone" && (
            <>
              <div className="pm-field"><label>{t("phone")}</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" autoFocus /></div>
              <button className="pm-btn" disabled={busy} onClick={start}>{t("getCode")}</button>
            </>
          )}
          {step === "link" && (
            <>
              <button className="pm-btn" style={{ background: "#229ED9" }} onClick={() => Browser.open({ url: botUrl }).catch(() => window.open(botUrl, "_blank"))}>
                <IonIcon icon={paperPlane} /> {t("openTelegram")}
              </button>
              <p className="pm-muted" style={{ textAlign: "center", marginTop: 18 }}>{t("waiting")}</p>
              <button className="pm-btn ghost" style={{ marginTop: 10 }} onClick={() => setStep("phone")}>{t("changePhone")}</button>
            </>
          )}
          {step === "code" && (
            <>
              <div className="pm-field"><label>{t("code")}</label>
                <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus
                  style={{ fontSize: 28, letterSpacing: 10, textAlign: "center", fontWeight: 800 }} /></div>
              <button className="pm-btn" disabled={busy || code.length !== 6} onClick={verify}>{t("enter")}</button>
              <button className="pm-btn ghost" style={{ marginTop: 10 }} onClick={() => { setCode(""); setStep("phone"); }}>{t("changePhone")}</button>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
