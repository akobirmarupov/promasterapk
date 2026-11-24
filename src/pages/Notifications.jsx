// 🔔 Bildirishnomalar: orders (accepted / status changed) and answers from support. Opening the page = all read.
import React, { useEffect, useState } from "react";
import { IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent, useIonRouter } from "@ionic/react";
import { chatbubblesOutline, megaphoneOutline, notificationsOutline, receiptOutline } from "ionicons/icons";
import { api } from "../api";
import { useStore } from "../store";
import { Failed, Header, Skeleton } from "../components/ui";

const ICON = { order: receiptOutline, support: chatbubblesOutline, info: megaphoneOutline };

export default function Notifications() {
  const { t, lang, customer, refreshBadges } = useStore();
  const router = useIonRouter();
  const [list, setList] = useState(null);
  const [failed, setFailed] = useState(false);
  const load = () => {
    setFailed(false);
    return api("me/notifications/")
      .then((d) => {
        setList(d.notifications);
        if (d.unread) api("me/notifications/", { method: "POST", body: {} }).then(refreshBadges).catch(() => {});
      })
      .catch((e) => (e.status === 401 ? router.push("/login") : setFailed(true)));
  };
  useEffect(() => {
    if (customer) load();
  }, [customer, lang]);
  const date = (s) => new Date(s).toLocaleString(lang === "ru" ? "ru-RU" : "uz-UZ",
    { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const open = (n) => {
    if (n.kind === "support") router.push("/support");
    else if (n.kind === "order") router.push("/profile/orders");
  };
  return (
    <IonPage>
      <Header title={t("notifications")} back="/home" bell={false} />
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={(e) => load().finally(() => e.detail.complete())}><IonRefresherContent /></IonRefresher>
        <div className="pm-pad">
          {failed ? <Failed onRetry={load} /> : !list ? <Skeleton h={76} n={4} grid={false} /> : list.length === 0 ? (
            <div className="pm-empty"><div className="big"><IonIcon icon={notificationsOutline} /></div><h3>{t("noNotifications")}</h3></div>
          ) : list.map((n) => (
            <div key={n.id} className={`pm-notif${n.read ? "" : " unread"}`} onClick={() => open(n)}>
              <span className="ic"><IonIcon icon={ICON[n.kind] || megaphoneOutline} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>{n.title}</b>
                {n.text && <p>{n.text}</p>}
                <small>{date(n.created)}</small>
              </div>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
}
