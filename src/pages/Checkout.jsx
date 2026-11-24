// Checkout: only a signed-in customer (phone confirmed in Telegram) can order. The phone comes from the account,
// the name and the address are filled in from the profile and can only be edited here.
import React, { useEffect, useState } from "react";
import { IonContent, IonIcon, IonPage, useIonRouter } from "@ionic/react";
import { createOutline, lockClosed } from "ionicons/icons";
import { api, money } from "../api";
import { useStore } from "../store";
import { Header } from "../components/ui";

export default function Checkout() {
  const { t, tErr, cart, total, customer, setCustomer, clearCart } = useStore();
  const router = useIonRouter();
  const [name, setName] = useState(customer ? customer.name : "");
  const [editName, setEditName] = useState(false);
  const [mode, setMode] = useState("delivery");
  const [addresses, setAddresses] = useState([]);
  const [addrId, setAddrId] = useState(null);
  const [address, setAddress] = useState("");
  const [saveAddr, setSaveAddr] = useState(true);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!customer) return;
    setName((n) => n || customer.name);
    setEditName(!customer.name);
    api("me/addresses/").then((d) => {
      setAddresses(d.addresses);
      const def = d.addresses.find((a) => a.is_default) || d.addresses[0];
      if (def) setAddrId(def.id);
    }).catch(() => {});
  }, [customer]);

  if (!customer) {
    return (
      <IonPage>
        <Header title={t("order")} back="/cart" />
        <IonContent>
          <div className="pm-pad" style={{ textAlign: "center", paddingTop: 40 }}>
            <div className="pm-login-ic"><IonIcon icon={lockClosed} /></div>
            <h3 style={{ margin: "18px 0 6px" }}>{t("loginToOrder")}</h3>
            <p className="pm-muted">{t("loginToOrderHint")}</p>
            <button className="pm-btn" style={{ marginTop: 18 }} onClick={() => router.push("/login")}>{t("signIn")} / {t("register")}</button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError(t("errName"));
    if (mode === "delivery" && !addrId && !address.trim()) return setError(t("errAddress"));
    setBusy(true);
    try {
      const body = {
        name, delivery: mode, comment,
        items: cart.map((i) => ({ id: i.id, qty: i.qty })),
        ...(mode === "delivery" ? (addrId ? { address_id: addrId } : { address, save_address: saveAddr }) : {}),
      };
      const r = await api("orders/", { method: "POST", body });
      if (name.trim() !== customer.name) setCustomer({ ...customer, name: name.trim() });
      clearCart();
      router.push(`/thanks/${r.id}`, "root", "replace");
    } catch (e) {
      if (e.status === 401) router.push("/login");
      setError(tErr(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <IonPage>
      <Header title={t("order")} back="/cart" />
      <IonContent>
        <div className="pm-pad">
          {error && <div className="pm-error">{error}</div>}
          <div className="pm-box">
            <div className="pm-kv">
              <div><label>{t("fullName")}</label>
                {editName ? <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" autoFocus />
                  : <b>{name}</b>}</div>
              {!editName && <button className="pm-edit" onClick={() => setEditName(true)}><IonIcon icon={createOutline} /> {t("edit")}</button>}
            </div>
            <div className="pm-kv"><div><label>{t("phone")}</label><b>{customer.phone}</b></div></div>
          </div>

          <div className="pm-seg">
            <button className={mode === "delivery" ? "on" : ""} onClick={() => setMode("delivery")}>{t("delivery")}</button>
            <button className={mode === "pickup" ? "on" : ""} onClick={() => setMode("pickup")}>{t("pickup")}</button>
          </div>
          {mode === "delivery" && (
            <div className="pm-box">
              <label className="pm-label">{t("address")}</label>
              {addresses.length > 0 && (
                <div className="pm-addr-list">
                  {addresses.map((a) => (
                    <button key={a.id} className={`pm-addr${addrId === a.id ? " on" : ""}`} onClick={() => setAddrId(a.id)}>
                      <b>{a.title || t("address")}</b><span>{a.address}{a.landmark ? ` · ${a.landmark}` : ""}</span>
                    </button>
                  ))}
                  <button className={`pm-addr${!addrId ? " on" : ""}`} onClick={() => setAddrId(null)}><b>+ {t("newAddress")}</b></button>
                </div>
              )}
              {!addrId && (
                <>
                  <div className="pm-field" style={{ marginTop: 10 }}><textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("address")} /></div>
                  <label className="pm-check"><input type="checkbox" checked={saveAddr} onChange={(e) => setSaveAddr(e.target.checked)} /> {t("saveAddress")}</label>
                </>
              )}
            </div>
          )}
          <div className="pm-field"><label>{t("comment")}</label><textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} /></div>
          <div className="pm-summary" style={{ marginBottom: 110 }}>
            {cart.map((i) => <div className="row" key={i.id}><span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span></div>)}
            <div className="row total"><span>{t("total")}</span><span>{money(total)}</span></div>
          </div>
        </div>
      </IonContent>
      <div className="pm-buybar">
        <button className="pm-btn" disabled={busy || !cart.length} onClick={submit}>{busy ? t("sending") : t("confirm")}</button>
      </div>
    </IonPage>
  );
}
