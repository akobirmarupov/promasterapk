// Profile: who I am, my data / orders / addresses, support, the shop's contacts.
// Top right: 🔔 and ⋮ — the ⋮ menu (components/ProfileMenu) holds language, dark/light mode, info pages, «Chiqish».
import React, { useEffect, useState } from "react";
import { IonContent, IonIcon, IonPage, useIonRouter } from "@ionic/react";
import {
  callOutline, chatbubblesOutline, chevronForward, ellipsisVertical, locationOutline, logoInstagram, notificationsOutline,
  paperPlaneOutline, personOutline, receiptOutline, timeOutline,
} from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import { api } from "../api";
import { useStore } from "../store";
import { Bell } from "../components/ui";
import Verify from "../components/Verify";
import ProfileMenu from "../components/ProfileMenu";

const openUrl = (url) => Browser.open({ url }).catch(() => window.open(url, "_blank"));

export default function Profile() {
  const { t, lang, customer, pending, badges } = useStore();
  const router = useIonRouter();
  const [menu, setMenu] = useState(false);
  const [store, setStore] = useState(null);
  useEffect(() => {
    api("home/").then((d) => setStore(d.store)).catch(() => {});
  }, [lang]);
  const initials = customer && customer.name ? customer.name.trim()[0].toUpperCase() : "👤";
  const tg = store && store.telegram ? store.telegram.replace(/^@/, "") : "";
  const ig = store && store.instagram ? store.instagram.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "") : "";
  const Row = ({ icon, label, sub, onClick, badge }) => (
    <button onClick={onClick}>
      <span className="ic"><IonIcon icon={icon} /></span>{label}
      {badge > 0 && <span className="pm-count">{badge}</span>}
      <span className="sub">{sub}</span>
      <IonIcon icon={chevronForward} style={{ color: "var(--pm-muted)" }} />
    </button>
  );
  const need = (path) => router.push(customer ? path : "/login");
  return (
    <IonPage>
      <IonContent>
        <div className="pm-profile-head">
          <div className="pm-head-actions" style={{ justifyContent: "flex-end", marginBottom: 10 }}>
            <Bell />
            <button className="pm-iconbtn" aria-label={t("more")} onClick={() => setMenu(true)}><IonIcon icon={ellipsisVertical} /></button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="pm-avatar">{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{customer ? customer.name || customer.phone : t("guest")}</div>
              <div style={{ opacity: 0.85, fontSize: 14 }}>{customer ? customer.phone : t("guestHint")}</div>
            </div>
          </div>
          {!customer && !pending && (
            <button className="pm-btn" style={{ marginTop: 18, background: "#fff", color: "var(--pm-forest)" }} onClick={() => router.push("/login")}>
              {t("signIn")} / {t("register")}
            </button>
          )}
        </div>

        {!customer && pending && (
          <div style={{ margin: "16px" }}>
            {/* came back from Telegram: the code is asked right here, the phone is not asked again */}
            <Verify compact />
          </div>
        )}

        <div className="pm-menu">
          <Row icon={personOutline} label={t("personal")} sub={customer ? customer.name : ""} onClick={() => need("/profile/settings")} />
          <Row icon={receiptOutline} label={t("myOrders")} onClick={() => need("/profile/orders")} />
          <Row icon={locationOutline} label={t("addresses")} onClick={() => need("/profile/addresses")} />
          <Row icon={notificationsOutline} label={t("notifications")} badge={badges.notifications} onClick={() => need("/notifications")} />
          <Row icon={chatbubblesOutline} label={t("support")} badge={badges.support} onClick={() => router.push("/support")} />
        </div>

        {store && (
          <div className="pm-menu">
            {store.phone && <Row icon={callOutline} label={t("call")} sub={store.phone} onClick={() => (window.location.href = `tel:${store.phone.replace(/[^\d+]/g, "")}`)} />}
            {tg && <Row icon={paperPlaneOutline} label="Telegram" sub={`@${tg}`} onClick={() => openUrl(`https://t.me/${tg}`)} />}
            {ig && <Row icon={logoInstagram} label="Instagram" sub={`@${ig}`} onClick={() => openUrl(`https://instagram.com/${ig}`)} />}
            {store.hours && <Row icon={timeOutline} label={t("workHours")} sub={store.hours} />}
            {store.address && <Row icon={locationOutline} label={store.address} onClick={() => store.lat && openUrl(`https://yandex.uz/maps/?pt=${store.lng},${store.lat}&z=17&l=map`)} />}
          </div>
        )}
        <p className="pm-muted" style={{ textAlign: "center", fontSize: 12, marginBottom: 24 }}>proMaster · {t("version")} 1.2</p>
      </IonContent>
      <ProfileMenu open={menu} onClose={() => setMenu(false)} />
    </IonPage>
  );
}
