import React from "react";
import { IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";
import { bagHandleOutline, trashOutline } from "ionicons/icons";
import { money } from "../api";
import { useStore } from "../store";

export default function Cart() {
  const { t, cart, setQty, total, count, clearCart } = useStore();
  const router = useIonRouter();
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle style={{ fontWeight: 800, fontSize: 22 }}>{t("cart")}</IonTitle>
          {cart.length > 0 && <IonButton slot="end" fill="clear" color="medium" onClick={clearCart}>{t("clear")}</IonButton>}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {cart.length === 0 ? (
          <div className="pm-empty">
            <div className="big"><IonIcon icon={bagHandleOutline} /></div>
            <h3>{t("emptyCart")}</h3>
            <p>{t("emptyCartHint")}</p>
            <button className="pm-btn" style={{ maxWidth: 240, margin: "18px auto 0" }} onClick={() => router.push("/catalog")}>{t("goCatalog")}</button>
          </div>
        ) : (
          <div className="pm-pad">
            {cart.map((i) => (
              <div className="pm-line" key={i.id}>
                <img src={i.image || "/icon.png"} alt="" onClick={() => router.push(`/product/${i.id}`)} />
                <div className="info">
                  <div className="nm">{i.name}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <b>{money(i.price * i.qty)}</b>
                    <div className="pm-qty">
                      <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="−">{i.qty === 1 ? <IonIcon icon={trashOutline} style={{ fontSize: 17 }} /> : "−"}</button>
                      <span>{i.qty}</span>
                      <button onClick={() => setQty(i.id, Math.min(999, i.qty + 1))}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="pm-summary">
              <div className="row"><span>{count} {t("items")}</span><span>{money(total)}</span></div>
              <div className="row total"><span>{t("total")}</span><span>{money(total)}</span></div>
            </div>
            <div style={{ height: 90 }} />
          </div>
        )}
      </IonContent>
      {cart.length > 0 && (
        <div className="pm-buybar" style={{ bottom: 0 }}>
          <button className="pm-btn" onClick={() => router.push("/checkout")}>{t("checkout")} · {money(total)}</button>
        </div>
      )}
    </IonPage>
  );
}
