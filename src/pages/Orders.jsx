import React, { useEffect, useState } from "react";
import { IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent, useIonRouter } from "@ionic/react";
import { receiptOutline } from "ionicons/icons";
import { api, money } from "../api";
import { useStore } from "../store";
import { Failed, Header, Skeleton } from "../components/ui";

export default function Orders() {
  const { t, lang, add } = useStore();
  const router = useIonRouter();
  const [orders, setOrders] = useState(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(null);
  const load = () => {
    setFailed(false);
    return api("me/orders/").then((d) => setOrders(d.orders)).catch((e) => (e.status === 401 ? router.push("/login") : setFailed(true)));
  };
  useEffect(() => {
    load();
  }, [lang]);
  const date = (s) => new Date(s).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <IonPage>
      <Header title={t("myOrders")} back="/profile" />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={(e) => load().finally(() => e.detail.complete())}><IonRefresherContent /></IonRefresher>
        <div className="pm-pad">
          {failed ? <Failed onRetry={load} /> : !orders ? <Skeleton h={120} n={3} grid={false} /> : orders.length === 0 ? (
            <div className="pm-empty"><div className="big"><IonIcon icon={receiptOutline} /></div><h3>{t("noOrders")}</h3>
              <button className="pm-btn" style={{ maxWidth: 240, margin: "16px auto 0" }} onClick={() => router.push("/catalog")}>{t("goCatalog")}</button></div>
          ) : orders.map((o) => (
            <div className="pm-order" key={o.id} onClick={() => setOpen(open === o.id ? null : o.id)}>
              <div className="top"><b>№{o.id}</b><span className={`pm-status ${o.status}`}>{o.status_label}</span></div>
              <div className="pm-muted" style={{ fontSize: 13 }}>{date(o.created)}</div>
              <div className="pm-thumbs">{o.items.slice(0, 5).map((i, k) => <img key={k} src={i.image || "/icon.png"} alt="" />)}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800 }}><span>{t("total")}</span><span>{money(o.total)}</span></div>
              {open === o.id && (
                <div style={{ marginTop: 10, borderTop: "1px solid var(--pm-line)", paddingTop: 8 }}>
                  {o.items.map((i, k) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 14 }}>
                      <span>{i.name} × {i.qty}</span><span>{money(i.price * i.qty)}</span>
                    </div>
                  ))}
                  <button className="pm-btn ghost" style={{ marginTop: 8, height: 44 }} onClick={(e) => {
                    e.stopPropagation();
                    o.items.filter((i) => i.product).forEach((i) => add({ id: i.product, name: i.name, price: i.price, image: i.image }, i.qty));
                    router.push("/cart");
                  }}>{lang === "ru" ? "Повторить заказ" : "Qayta buyurtma"}</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
}
