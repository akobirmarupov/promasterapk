// Profile «⋮» menu — the same look and icons as the «☰» side menu (slides in from the right), «Chiqish» in red.
import React from "react";
import { IonIcon, useIonActionSheet, useIonRouter } from "@ionic/react";
import {
  chatbubblesOutline, closeOutline, documentTextOutline, informationCircleOutline, languageOutline, logOutOutline,
  moonOutline, notificationsOutline, shieldCheckmarkOutline, sunnyOutline,
} from "ionicons/icons";
import { useStore } from "../store";

export default function ProfileMenu({ open, onClose }) {
  const { t, lang, setLang, dark, setDark, customer, signOut, badges } = useStore();
  const router = useIonRouter();
  const [sheet] = useIonActionSheet();
  const go = (path) => {
    onClose();
    router.push(path);
  };
  const chooseLang = () =>
    sheet({
      header: t("language"),
      buttons: [
        { text: `${lang === "uz" ? "✓ " : ""}O'zbekcha`, handler: () => setLang("uz") },
        { text: `${lang === "ru" ? "✓ " : ""}Русский`, handler: () => setLang("ru") },
        { text: t("cancel"), role: "cancel" },
      ],
    });
  const Item = ({ icon, label, path, onClick, danger, badge }) => (
    <button className={danger ? "danger" : ""} onClick={onClick || (() => go(path))}>
      <IonIcon icon={icon} /> <span>{label}</span>
      {badge > 0 && <span className="pm-count">{badge}</span>}
    </button>
  );
  return (
    <>
      <div className={`pm-drawer-bg${open ? " on" : ""}`} onClick={onClose} />
      <aside className={`pm-drawer right${open ? " on" : ""}`} aria-hidden={!open}>
        <div className="top">
          <b style={{ flex: 1, fontSize: 18 }}>{t("more")}</b>
          <button className="x" aria-label="close" onClick={onClose}><IonIcon icon={closeOutline} /></button>
        </div>
        <nav>
          <Item icon={languageOutline} label={`${t("language")}: ${lang === "ru" ? "Русский" : "O'zbekcha"}`}
            onClick={() => { onClose(); setTimeout(chooseLang, 200); }} />
          <Item icon={dark ? sunnyOutline : moonOutline} label={dark ? t("lightMode") : t("darkMode")} onClick={() => setDark(!dark)} />
          <div className="sep" />
          <Item icon={notificationsOutline} label={t("notifications")} path={customer ? "/notifications" : "/login"} badge={badges.notifications} />
          <Item icon={chatbubblesOutline} label={t("support")} path="/support" badge={badges.support} />
          <div className="sep" />
          <Item icon={informationCircleOutline} label={t("aboutUs")} path="/page/about" />
          <Item icon={documentTextOutline} label={t("deliveryInfo")} path="/page/delivery" />
          <Item icon={shieldCheckmarkOutline} label={t("returns")} path="/page/returns" />
          <Item icon={documentTextOutline} label={t("privacy")} path="/page/privacy" />
          <Item icon={documentTextOutline} label={t("offer")} path="/page/offer" />
          {customer && (
            <>
              <div className="sep" />
              <Item icon={logOutOutline} label={t("logout")} danger onClick={() => { onClose(); signOut(); }} />
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
