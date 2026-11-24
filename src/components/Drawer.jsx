// The «☰» side menu (opened from the home page): profile sections, catalog shortcuts, store info, sign in / out.
import React from "react";
import { IonIcon, useIonRouter } from "@ionic/react";
import {
  chatbubblesOutline, closeOutline, documentTextOutline, flameOutline, gridOutline, homeOutline, informationCircleOutline,
  languageOutline, locationOutline, logInOutline, logOutOutline, moonOutline, notificationsOutline, personOutline,
  receiptOutline, shieldCheckmarkOutline, sparklesOutline, sunnyOutline,
} from "ionicons/icons";
import { useStore } from "../store";

export default function Drawer() {
  const { t, lang, customer, menuOpen, setMenuOpen, signOut, dark, setDark, badges } = useStore();
  const router = useIonRouter();
  const go = (path) => {
    setMenuOpen(false);
    router.push(path);
  };
  const Item = ({ icon, label, path, onClick, danger, badge }) => (
    <button className={danger ? "danger" : ""} onClick={onClick || (() => go(path))}>
      <IonIcon icon={icon} /> <span>{label}</span>
      {badge > 0 && <span className="pm-count">{badge}</span>}
    </button>
  );
  const need = (path) => (customer ? path : "/login");
  return (
    <>
      <div className={`pm-drawer-bg${menuOpen ? " on" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside className={`pm-drawer${menuOpen ? " on" : ""}`} aria-hidden={!menuOpen}>
        <div className="top">
          <div className="pm-avatar">{customer && customer.name ? customer.name.trim()[0].toUpperCase() : "👤"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b>{customer ? customer.name || customer.phone : t("guest")}</b>
            <div className="sub">{customer ? customer.phone : t("guestHint")}</div>
          </div>
          <button className="x" aria-label="close" onClick={() => setMenuOpen(false)}><IonIcon icon={closeOutline} /></button>
        </div>
        <nav>
          <Item icon={homeOutline} label={t("home")} path="/home" />
          <Item icon={gridOutline} label={t("catalog")} path="/catalog" />
          <Item icon={flameOutline} label={t("sale")} path="/products?filter=sale" />
          <Item icon={sparklesOutline} label={t("new")} path="/products?filter=new" />
          <div className="sep" />
          <Item icon={notificationsOutline} label={t("notifications")} path={need("/notifications")} badge={badges.notifications} />
          <Item icon={chatbubblesOutline} label={t("support")} path="/support" badge={badges.support} />
          <div className="sep" />
          <Item icon={personOutline} label={t("personal")} path={need("/profile/settings")} />
          <Item icon={receiptOutline} label={t("myOrders")} path={need("/profile/orders")} />
          <Item icon={locationOutline} label={t("addresses")} path={need("/profile/addresses")} />
          <Item icon={languageOutline} label={`${t("language")}: ${lang === "ru" ? "Русский" : "O'zbekcha"}`} path="/profile/settings" />
          <Item icon={dark ? sunnyOutline : moonOutline} label={dark ? t("lightMode") : t("darkMode")} onClick={() => setDark(!dark)} />
          <div className="sep" />
          <Item icon={informationCircleOutline} label={t("aboutUs")} path="/page/about" />
          <Item icon={documentTextOutline} label={t("deliveryInfo")} path="/page/delivery" />
          <Item icon={shieldCheckmarkOutline} label={t("returns")} path="/page/returns" />
          <Item icon={documentTextOutline} label={t("privacy")} path="/page/privacy" />
          <Item icon={documentTextOutline} label={t("offer")} path="/page/offer" />
          <div className="sep" />
          {customer ? (
            <Item icon={logOutOutline} label={t("logout")} danger onClick={() => { setMenuOpen(false); signOut(); }} />
          ) : (
            <Item icon={logInOutline} label={`${t("signIn")} / ${t("register")}`} path="/login" />
          )}
        </nav>
      </aside>
    </>
  );
}
