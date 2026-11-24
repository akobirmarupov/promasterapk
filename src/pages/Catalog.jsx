import React, { useEffect, useState } from "react";
import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";
import { chevronForward, searchOutline } from "ionicons/icons";
import { api } from "../api";
import { useStore } from "../store";
import { catIcon, Failed, Skeleton } from "../components/ui";

export default function Catalog() {
  const { t, lang } = useStore();
  const router = useIonRouter();
  const [cats, setCats] = useState(null);
  const [failed, setFailed] = useState(false);
  const load = () => {
    setFailed(false);
    api("categories/").then((d) => setCats(d.categories)).catch(() => setFailed(true));
  };
  useEffect(load, [lang]);
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar><IonTitle style={{ fontWeight: 800, fontSize: 22 }}>{t("catalog")}</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="pm-pad">
          <div className="pm-search" style={{ boxShadow: "none", border: "1px solid var(--pm-line)" }} onClick={() => router.push("/products?focus=1")}>
            <IonIcon icon={searchOutline} /> {t("search")}
          </div>
          <div style={{ height: 14 }} />
          {failed ? <Failed onRetry={load} /> : !cats ? <Skeleton h={70} n={6} grid={false} /> : (
            <div className="pm-menu" style={{ margin: 0 }}>
              <button onClick={() => router.push("/products")}>
                <span className="ic"><IonIcon icon={catIcon("house")} /></span>{t("all")}
                <IonIcon icon={chevronForward} className="sub" />
              </button>
              {cats.map((c) => (
                <button key={c.id} onClick={() => router.push(`/products?category=${c.slug}`)}>
                  <span className="ic"><IonIcon icon={catIcon(c.icon)} /></span>
                  {c.name}
                  <span className="sub">{c.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
