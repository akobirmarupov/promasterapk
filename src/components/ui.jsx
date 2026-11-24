import React from "react";
import { IonBackButton, IonButtons, IonHeader, IonTitle, IonToolbar, useIonRouter, useIonToast } from "@ionic/react";
import {
  addOutline, buildOutline, checkmarkOutline, cloudOfflineOutline, constructOutline, cubeOutline, flashOutline,
  homeOutline, leafOutline, notificationsOutline, resizeOutline, waterOutline,
} from "ionicons/icons";
import { IonIcon } from "@ionic/react";
import { money } from "../api";
import { useStore } from "../store";

// the site's category icon keys → app icons
const CAT_ICONS = {
  power: flashOutline, hand: constructOutline, measure: resizeOutline, plumb: waterOutline,
  garden: leafOutline, fast: buildOutline, house: homeOutline, furniture: cubeOutline,
};
export const catIcon = (k) => CAT_ICONS[k] || cubeOutline;

// 🔔 with the number of unread notifications — at the top of every page
export function Bell({ plain }) {
  const { badges, customer, t } = useStore();
  const router = useIonRouter();
  const n = badges.notifications + badges.support;
  return (
    <button className={`pm-iconbtn${plain ? " plain" : ""}`} aria-label={t("notifications")}
      onClick={() => router.push(customer ? "/notifications" : "/login")}>
      <IonIcon icon={notificationsOutline} />
      {n > 0 && <span className="dot">{n > 99 ? "99+" : n}</span>}
    </button>
  );
}

export function Header({ title, back = "/home", end, bell = true }) {
  return (
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonButtons slot="start">
          <IonBackButton defaultHref={back} text="" />
        </IonButtons>
        <IonTitle style={{ fontWeight: 800 }}>{title}</IonTitle>
        {(end || bell) && <IonButtons slot="end" style={{ gap: 6, marginRight: 8 }}>{end}{bell && <Bell plain />}</IonButtons>}
      </IonToolbar>
    </IonHeader>
  );
}

export function Price({ p, big }) {
  if (big) {
    return (
      <div>
        <span className="pm-price" style={{ fontSize: 26 }}>{money(p.price)}</span>
        {p.old_price > 0 && <span className="pm-old">{money(p.old_price)}</span>}
      </div>
    );
  }
  return (
    <div>
      {p.old_price > 0 && <div className="pm-old" style={{ marginLeft: 0 }}>{money(p.old_price)}</div>}
      <div className="pm-price">{money(p.price)}</div>
    </div>
  );
}

// Product photo; no photo (or it fails to load) → a soft placeholder with the proMaster mark instead of an empty box
export function Pic({ src, className = "", lazy = true }) {
  const [bad, setBad] = React.useState(!src);
  React.useEffect(() => setBad(!src), [src]);
  if (bad) {
    return (
      <div className={`pm-noimg ${className}`} aria-hidden="true">
        <img src="/icon.png" alt="" />
      </div>
    );
  }
  return <img className={className} src={src} alt="" loading={lazy ? "lazy" : undefined} onError={() => setBad(true)} />;
}

export function ProductCard({ p }) {
  const { add, qtyOf, t } = useStore();
  const router = useIonRouter();
  const [toast] = useIonToast();
  const inCart = qtyOf(p.id) > 0;
  return (
    <div className="pm-card" onClick={() => router.push(`/product/${p.id}`)}>
      <div className="img">
        <Pic src={p.image} />
        {p.discount > 0 ? <span className="pm-tag">−{p.discount}%</span> : p.is_new ? <span className="pm-tag new">NEW</span> : null}
        <button
          className={`pm-add${inCart ? " on" : ""}`}
          aria-label={t("addToCart")}
          onClick={(e) => {
            e.stopPropagation();
            add(p);
            toast({ message: t("added"), duration: 1200, position: "top", color: "secondary" });
          }}
        >
          <IonIcon icon={inCart ? checkmarkOutline : addOutline} />
        </button>
      </div>
      <div className="body">
        {p.brand && <div className="brand">{p.brand}</div>}
        <div className="name">{p.name}</div>
        <Price p={p} />
        {!p.in_stock && <div className="pm-off">{t("byOrder")}</div>}
      </div>
    </div>
  );
}

export function Skeleton({ h = 180, n = 4, grid = true }) {
  return (
    <div className={grid ? "pm-grid" : ""}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="pm-skel" style={{ height: h, marginBottom: grid ? 0 : 12 }} />
      ))}
    </div>
  );
}

// error: the ApiError (or true) — network problems, "not found" and server errors get different texts
export function Failed({ onRetry, error }) {
  const { t } = useStore();
  const status = error && typeof error === "object" ? error.status : 0;
  const text = status === 404 ? t("notFound") : status >= 500 ? t("serverErr") : t("noNet");
  return (
    <div className="pm-empty">
      <div className="big"><IonIcon icon={cloudOfflineOutline} /></div>
      <h3>{text}</h3>
      <button className="pm-btn" style={{ maxWidth: 220, margin: "16px auto 0" }} onClick={onRetry}>{t("retry")}</button>
    </div>
  );
}
