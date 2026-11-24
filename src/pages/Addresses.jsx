import React, { useEffect, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { homeOutline, locationOutline, trashOutline } from "ionicons/icons";
import { api } from "../api";
import { useStore } from "../store";
import { Failed, Header, Skeleton } from "../components/ui";

export default function Addresses() {
  const { t, tErr } = useStore();
  const [list, setList] = useState(null);
  const [failed, setFailed] = useState(false);
  const [form, setForm] = useState(null); // {title, address, landmark}
  const [error, setError] = useState("");
  const load = () => {
    setFailed(false);
    api("me/addresses/").then((d) => setList(d.addresses)).catch(() => setFailed(true));
  };
  useEffect(load, []);
  const save = async () => {
    setError("");
    try {
      const d = await api("me/addresses/", { method: "POST", body: form });
      setList(d.addresses);
      setForm(null);
    } catch (e) {
      setError(tErr(e));
    }
  };
  const act = async (id, method, body) => {
    try {
      const d = await api(`me/addresses/${id}/`, { method, body });
      setList(d.addresses);
    } catch (e) {
      setError(tErr(e));
    }
  };
  return (
    <IonPage>
      <Header title={t("addresses")} back="/profile" />
      <IonContent>
        <div className="pm-pad">
          {error && <div className="pm-error">{error}</div>}
          {failed ? <Failed onRetry={load} /> : !list ? <Skeleton h={80} n={2} grid={false} /> : (
            <>
              {list.length === 0 && !form && <div className="pm-empty"><div className="big"><IonIcon icon={locationOutline} /></div><h3>{t("noAddresses")}</h3></div>}
              {list.map((a) => (
                <div className="pm-order" key={a.id}>
                  <div className="top">
                    <b style={{ display: "flex", gap: 8, alignItems: "center" }}><IonIcon icon={homeOutline} />{a.title || t("address")}</b>
                    {a.is_default ? <span className="pm-status">{t("default")}</span> : (
                      <button className="pm-chip" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => act(a.id, "PATCH", { is_default: true })}>{t("makeDefault")}</button>
                    )}
                  </div>
                  <div>{a.address}</div>
                  {a.landmark && <div className="pm-muted" style={{ fontSize: 13 }}>{t("landmark")}: {a.landmark}</div>}
                  <button style={{ background: "none", color: "#d92d20", marginTop: 8, display: "flex", gap: 6, alignItems: "center", fontWeight: 700 }} onClick={() => act(a.id, "DELETE")}>
                    <IonIcon icon={trashOutline} /> {t("delete")}
                  </button>
                </div>
              ))}
              {form ? (
                <div className="pm-order">
                  <div className="pm-field"><label>{t("title")}</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div className="pm-field"><label>{t("address")}</label><textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                  <div className="pm-field"><label>{t("landmark")}</label><input value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} /></div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="pm-btn ghost" onClick={() => setForm(null)}>{t("cancel")}</button>
                    <button className="pm-btn" onClick={save}>{t("save")}</button>
                  </div>
                </div>
              ) : (
                <button className="pm-btn" onClick={() => setForm({ title: "", address: "", landmark: "" })}>+ {t("newAddress")}</button>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
