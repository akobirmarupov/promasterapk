import React, { useEffect, useState } from "react";
import { IonContent, IonIcon, IonPage, useIonRouter } from "@ionic/react";
import {
  callOutline, chevronForward, documentTextOutline, informationCircleOutline, locationOutline, logOutOutline,
  logoInstagram, paperPlaneOutline, receiptOutline, settingsOutline, shieldCheckmarkOutline, timeOutline,
} from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import { api } from "../api";
import { useStore } from "../store";

const openUrl = (url) => Browser.open({ url }).catch(() => window.open(url, "_blank"));

export default function Profile() {
  const { t, lang, customer, signOut } = useStore();
  const router = useIonRouter();
  const [store, setStore] = useState(null);
  useEffect(() => {
    api("home/").then((d) => setStore(d.store)).catch(() => {});
  }, [lang]);
  const initials = customer && customer.name ? customer.name.trim()[0].toUpperCase() : "👤";
  const tg = store && store.telegram ? store.telegram.replace(/^@/, "") : "";
  const ig = store && store.instagram ? store.instagram.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "") : "";
  const Row = ({ icon, label, sub, onClick }) => (
    <button onClick={onClick}>
      <span className="ic"><IonIcon icon={icon} /></span>{label}
      <span className="sub">{sub}</span>
      <IonIcon icon={chevronForward} style={{ color: "var(--pm-muted)" }} />
    </button>
  );
  return (
    <IonPage>
      <IonContent>
        <div className="pm-profile-head">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="pm-avatar">{initials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{customer ? customer.name || customer.phone : t("guest")}</div>
              <div style={{ opacity: 0.8, fontSize: 14 }}>{customer ? customer.phone : t("guestHint")}</div>
            </div>
          </div>
          {!customer && (
            <button className="pm-btn" style={{ marginTop: 18, background: "#fff", color: "var(--pm-forest)" }} onClick={() => router.push("/login")}>
              {t("login")}
            </button>
          )}
        </div>

        <div className="pm-menu">
          <Row icon={receiptOutline} label={t("myOrders")} onClick={() => router.push(customer ? "/profile/orders" : "/login")} />
          <Row icon={locationOutline} label={t("addresses")} onClick={() => router.push(customer ? "/profile/addresses" : "/login")} />
          <Row icon={settingsOutline} label={t("settings")} sub={lang === "ru" ? "Русский" : "O'zbekcha"} onClick={() => router.push("/profile/settings")} />
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

        <div className="pm-menu">
          <Row icon={informationCircleOutline} label={t("aboutUs")} onClick={() => router.push("/page/about")} />
          <Row icon={documentTextOutline} label={t("deliveryInfo")} onClick={() => router.push("/page/delivery")} />
          <Row icon={shieldCheckmarkOutline} label={t("returns")} onClick={() => router.push("/page/returns")} />
          <Row icon={documentTextOutline} label={t("privacy")} onClick={() => router.push("/page/privacy")} />
          <Row icon={documentTextOutline} label={t("offer")} onClick={() => router.push("/page/offer")} />
        </div>

        {customer && (
          <div className="pm-menu">
            <button onClick={signOut} style={{ color: "#d92d20" }}>
              <span className="ic" style={{ background: "#ffe8e8", color: "#d92d20" }}><IonIcon icon={logOutOutline} /></span>{t("logout")}
            </button>
          </div>
        )}
        <p className="pm-muted" style={{ textAlign: "center", fontSize: 12, marginBottom: 24 }}>proMaster · {t("version")} 1.0</p>
      </IonContent>
    </IonPage>
  );
}
