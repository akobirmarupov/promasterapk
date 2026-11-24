// Personal data: name and surname, language, change password. (No dark mode — the app is always light.)
import React, { useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { api } from "../api";
import { useStore } from "../store";
import { Header } from "../components/ui";

export default function Settings() {
  const { t, tErr, lang, setLang, customer, setCustomer } = useStore();
  const [name, setName] = useState(customer ? customer.name : "");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState({ name: "", pw: "" });
  const [error, setError] = useState({ name: "", pw: "" });
  useEffect(() => setName(customer ? customer.name : ""), [customer]);

  const flash = (k) => {
    setMsg((m) => ({ ...m, [k]: t("saved") }));
    setTimeout(() => setMsg((m) => ({ ...m, [k]: "" })), 1800);
  };
  const saveName = async () => {
    setError((x) => ({ ...x, name: "" }));
    try {
      const d = await api("me/", { method: "PATCH", body: { name } });
      setCustomer(d.customer);
      flash("name");
    } catch (e) {
      setError((x) => ({ ...x, name: tErr(e) }));
    }
  };
  const savePw = async () => {
    setError((x) => ({ ...x, pw: "" }));
    try {
      await api("me/", { method: "PATCH", body: { old_password: oldPw, new_password: newPw } });
      setOldPw("");
      setNewPw("");
      flash("pw");
    } catch (e) {
      setError((x) => ({ ...x, pw: tErr(e) }));
    }
  };

  return (
    <IonPage>
      <Header title={customer ? t("personal") : t("language")} back="/profile" />
      <IonContent>
        <div className="pm-pad">
          {customer && (
            <div className="pm-box">
              <h3>{t("personal")}</h3>
              {error.name && <div className="pm-error">{error.name}</div>}
              <div className="pm-field"><label>{t("fullName")}</label><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
              <div className="pm-field"><label>{t("phone")}</label><input value={customer.phone} disabled /></div>
              <button className="pm-btn" onClick={saveName}>{msg.name ? `✓ ${msg.name}` : t("save")}</button>
            </div>
          )}

          <div className="pm-box">
            <h3>{t("language")}</h3>
            <div className="pm-seg" style={{ marginBottom: 0 }}>
              <button className={lang === "uz" ? "on" : ""} onClick={() => setLang("uz")}>O'zbekcha</button>
              <button className={lang === "ru" ? "on" : ""} onClick={() => setLang("ru")}>Русский</button>
            </div>
          </div>

          {customer && (
            <div className="pm-box">
              <h3>{t("changePassword")}</h3>
              {error.pw && <div className="pm-error">{error.pw}</div>}
              <div className="pm-field"><label>{t("oldPassword")}</label><input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} autoComplete="current-password" /></div>
              <div className="pm-field"><label>{t("newPassword")}</label><input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password" /></div>
              <button className="pm-btn" disabled={!oldPw || newPw.length < 6} onClick={savePw}>{msg.pw ? `✓ ${msg.pw}` : t("save")}</button>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
