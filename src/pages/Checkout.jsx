import React, { useEffect, useState } from "react";
import { IonContent, IonPage, useIonRouter } from "@ionic/react";
import { api, money } from "../api";
import { useStore } from "../store";
import { Header } from "../components/ui";

export default function Checkout() {
  const { t, tErr, cart, total, customer, clearCart } = useStore();
  const router = useIonRouter();
  const [name, setName] = useState(customer ? customer.name : "");
  const [phone, setPhone] = useState("+998 ");
  const [mode, setMode] = useState("delivery");
  const [addresses, setAddresses] = useState([]);
  const [addrId, setAddrId] = useState(null);
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (customer) setName((n) => n || customer.name);
    if (!customer) return;
    api("me/addresses/").then((d) => {
      setAddresses(d.addresses);
      const def = d.addresses.find((a) => a.is_default);
      if (def) setAddrId(def.id);
    }).catch(() => {});
  }, [customer]);

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError(t("errName"));
    if (mode === "delivery" && !addrId && !address.trim()) return setError(t("errAddress"));
    setBusy(true);
    try {
      const body = {
        name, delivery: mode, comment,
        items: cart.map((i) => ({ id: i.id, qty: i.qty })),
        ...(customer ? {} : { phone }),
        ...(mode === "delivery" ? (addrId ? { address_id: addrId } : { address }) : {}),
      };
      const r = await api("orders/", { method: "POST", body });
      clearCart();
      router.push(`/thanks/${r.id}`, "root", "replace");
    } catch (e) {
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
          <div className="pm-field"><label>{t("name")}</label><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
          {customer ? (
            <div className="pm-field"><label>{t("phone")}</label><input value={customer.phone} disabled /></div>
          ) : (
            <div className="pm-field"><label>{t("phone")}</label><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" /></div>
          )}
          <div className="pm-seg">
            <button className={mode === "delivery" ? "on" : ""} onClick={() => setMode("delivery")}>{t("delivery")}</button>
            <button className={mode === "pickup" ? "on" : ""} onClick={() => setMode("pickup")}>{t("pickup")}</button>
          </div>
          {mode === "delivery" && (
            <>
              {addresses.length > 0 && (
                <div className="pm-chips" style={{ padding: "0 0 12px", flexWrap: "wrap" }}>
                  {addresses.map((a) => (
                    <button key={a.id} className={`pm-chip${addrId === a.id ? " on" : ""}`} onClick={() => setAddrId(a.id)}>{a.title || a.address.slice(0, 22)}</button>
                  ))}
                  <button className={`pm-chip${!addrId ? " on" : ""}`} onClick={() => setAddrId(null)}>+ {t("newAddress")}</button>
                </div>
              )}
              {!addrId && <div className="pm-field"><label>{t("address")}</label><textarea rows={2} value={address} onChange={(e) => setAddress(e.target.value)} /></div>}
            </>
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
