import React, { useState } from "react";
import { IonContent, IonPage, IonToggle } from "@ionic/react";
import { api } from "../api";
import { useStore } from "../store";
import { Header } from "../components/ui";

export default function Settings() {
  const { t, lang, setLang, dark, setDark, customer, setCustomer } = useStore();
  const [name, setName] = useState(customer ? customer.name : "");
  const [saved, setSaved] = useState(false);
  const saveName = async () => {
    const d = await api("me/", { method: "PATCH", body: { name } });
    setCustomer(d.customer);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  return (
    <IonPage>
      <Header title={t("settings")} back="/profile" />
      <IonContent>
        <div className="pm-pad">
          <label className="pm-muted" style={{ fontWeight: 700, fontSize: 13, marginLeft: 4 }}>{t("language")}</label>
          <div className="pm-seg" style={{ marginTop: 6 }}>
            <button className={lang === "uz" ? "on" : ""} onClick={() => setLang("uz")}>O'zbekcha</button>
            <button className={lang === "ru" ? "on" : ""} onClick={() => setLang("ru")}>Русский</button>
          </div>
          <div className="pm-menu" style={{ margin: "0 0 16px" }}>
            <button onClick={() => setDark(!dark)}>{t("dark")}<IonToggle slot="end" checked={!!dark} style={{ marginLeft: "auto" }} /></button>
          </div>
          {customer && (
            <>
              <div className="pm-field"><label>{t("myName")}</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <button className="pm-btn" onClick={saveName}>{saved ? "✓" : t("save")}</button>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
