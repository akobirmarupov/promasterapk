import React from "react";
import { IonContent, IonIcon, IonPage, useIonRouter } from "@ionic/react";
import { checkmarkCircle } from "ionicons/icons";
import { useParams } from "react-router-dom";
import { useStore } from "../store";

export default function Thanks() {
  const { id } = useParams();
  const { t, customer } = useStore();
  const router = useIonRouter();
  return (
    <IonPage>
      <IonContent>
        <div className="pm-empty" style={{ paddingTop: 110 }}>
          <div className="big" style={{ fontSize: 96 }}><IonIcon icon={checkmarkCircle} /></div>
          <h3 style={{ fontSize: 24 }}>{t("thanks")}</h3>
          <p>{t("thanksHint")}</p>
          <p style={{ fontWeight: 800, color: "var(--pm-text)" }}>{t("orderNo")}: №{id}</p>
          <button className="pm-btn" style={{ maxWidth: 280, margin: "20px auto 10px" }} onClick={() => router.push("/home", "root")}>{t("continue")}</button>
          {customer && <button className="pm-btn ghost" style={{ maxWidth: 280, margin: "0 auto" }} onClick={() => router.push("/profile/orders")}>{t("myOrders")}</button>}
        </div>
      </IonContent>
    </IonPage>
  );
}
