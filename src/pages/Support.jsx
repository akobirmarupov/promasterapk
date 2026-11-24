// 💬 Qo'llab-quvvatlash: the customer writes → the shop's Telegram chat gets it with his name, phone and orders;
// the shop replies there → the answer appears here (and in 🔔). Refreshed every 10 s while the page is open.
import React, { useEffect, useRef, useState } from "react";
import { IonContent, IonIcon, IonPage, useIonRouter, useIonViewDidLeave, useIonViewWillEnter } from "@ionic/react";
import { chatbubblesOutline, send } from "ionicons/icons";
import { api } from "../api";
import { useStore } from "../store";
import { Header } from "../components/ui";

export default function Support() {
  const { t, tErr, lang, customer, refreshBadges } = useStore();
  const router = useIonRouter();
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const content = useRef(null);
  const timer = useRef(null);

  const load = () =>
    api("me/support/")
      .then((d) => {
        setMsgs((old) => {
          if (!old || old.length !== d.messages.length) setTimeout(() => content.current && content.current.scrollToBottom(250), 50);
          return d.messages;
        });
        refreshBadges();
      })
      .catch((e) => e.status === 401 && router.push("/login"));

  useIonViewWillEnter(() => {
    if (!customer) return;
    load();
    timer.current = setInterval(load, 10000);
  }, [customer]);
  useIonViewDidLeave(() => clearInterval(timer.current));
  useEffect(() => () => clearInterval(timer.current), []);

  const sendMsg = async () => {
    if (!text.trim()) return;
    setError("");
    setBusy(true);
    try {
      const d = await api("me/support/", { method: "POST", body: { text } });
      setText("");
      setMsgs(d.messages);
      setTimeout(() => content.current && content.current.scrollToBottom(250), 50);
    } catch (e) {
      setError(tErr(e));
    } finally {
      setBusy(false);
    }
  };
  const time = (s) => new Date(s).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
    <IonPage>
      <Header title={t("support")} back="/profile" />
      <IonContent ref={content}>
        {!customer ? (
          <div className="pm-pad" style={{ textAlign: "center", paddingTop: 40 }}>
            <div className="pm-login-ic"><IonIcon icon={chatbubblesOutline} /></div>
            <p className="pm-muted" style={{ margin: "16px 0" }}>{t("supportLogin")}</p>
            <button className="pm-btn" onClick={() => router.push("/login")}>{t("signIn")} / {t("register")}</button>
          </div>
        ) : (
          <div className="pm-chat">
            <div className="pm-chat-hint">{t("supportHint")}</div>
            {(msgs || []).map((m) => (
              <div key={m.id} className={`pm-bubble ${m.staff ? "shop" : "me"}`}>
                {m.staff && <b style={{ display: "block", fontSize: 12.5, color: "var(--ion-color-primary)" }}>proMaster</b>}
                {m.text}
                <small>{time(m.created)}</small>
              </div>
            ))}
          </div>
        )}
      </IonContent>
      {customer && (
        <div className="pm-composer">
          {error && <div className="pm-error" style={{ position: "absolute", bottom: 70, left: 12, right: 12 }}>{error}</div>}
          <textarea rows={1} value={text} placeholder={t("writeMessage")} onChange={(e) => setText(e.target.value)} />
          <button aria-label="send" disabled={busy || !text.trim()} onClick={sendMsg}><IonIcon icon={send} /></button>
        </div>
      )}
    </IonPage>
  );
}
