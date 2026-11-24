import React, { useEffect, useState } from "react";
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonToolbar, useIonRouter, useIonToast } from "@ionic/react";
import { bagAddOutline, checkmarkCircle, flashOutline, shareSocialOutline } from "ionicons/icons";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useStore } from "../store";
import { Failed, Pic, Price, ProductCard, Skeleton } from "../components/ui";

export default function Product() {
  const { id } = useParams();
  const { t, lang, add, qtyOf, setQty } = useStore();
  const router = useIonRouter();
  const [toast] = useIonToast();
  const [d, setD] = useState(null);
  const [failed, setFailed] = useState(false);
  const [slide, setSlide] = useState(0);
  const load = () => {
    setFailed(false);
    setD(null);
    api(`products/${id}/`).then(setD).catch((e) => setFailed(e || true));
  };
  useEffect(load, [id, lang]);
  const p = d && d.product;
  const qty = p ? qtyOf(p.id) : 0;
  const share = () => {
    if (navigator.share && p) navigator.share({ title: p.name, url: p.web_url }).catch(() => {});
  };
  return (
    <IonPage>
      <IonHeader className="ion-no-border" style={{ position: "absolute" }}>
        <IonToolbar style={{ "--background": "transparent" }}>
          <IonButtons slot="start"><IonBackButton defaultHref="/home" text="" style={{ background: "rgba(255,255,255,.85)", borderRadius: 14 }} /></IonButtons>
          {p && navigator.share && (
            <IonButtons slot="end">
              <button onClick={share} style={{ background: "rgba(255,255,255,.85)", borderRadius: 14, width: 40, height: 40, display: "grid", placeItems: "center", marginRight: 8 }}>
                <IonIcon icon={shareSocialOutline} style={{ fontSize: 20, color: "#142016" }} />
              </button>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {failed ? <div style={{ paddingTop: 80 }}><Failed onRetry={load} error={failed} /></div> : !p ? (
          <div className="pm-pad" style={{ paddingTop: 70 }}><Skeleton h={320} n={1} grid={false} /><Skeleton h={30} n={3} grid={false} /></div>
        ) : (
          <>
            <div className="pm-gallery" onScroll={(e) => setSlide(Math.round(e.target.scrollLeft / e.target.clientWidth))}>
              {(p.images.length ? p.images : [""]).map((src, i) => <Pic key={i} src={src} lazy={i > 0} />)}
            </div>
            <div className="pm-sheet">
              {p.images.length > 1 && (
                <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: -8, marginBottom: 10 }}>
                  {p.images.map((_, i) => <span key={i} style={{ width: i === slide ? 18 : 6, height: 6, borderRadius: 3, background: i === slide ? "var(--ion-color-primary)" : "var(--pm-line)", transition: "width .2s" }} />)}
                </div>
              )}
              <div className="pm-badges">
                <span className={`pm-badge${p.in_stock ? "" : " warn"}`}>{p.in_stock ? t("inStock") : t("byOrder")}</span>
                {p.is_original && <span className="pm-badge">✓ {t("original")}</span>}
                {p.category_name && <span className="pm-badge" style={{ background: "transparent", border: "1px solid var(--pm-line)", color: "var(--pm-muted)" }}>{p.category_name}</span>}
              </div>
              <h1>{p.name}</h1>
              {p.brand && <div className="pm-muted" style={{ marginBottom: 8 }}>{p.brand} · {p.sku}</div>}
              <Price p={p} big />
              {p.discount > 0 && <div style={{ color: "#e03131", fontWeight: 800, marginTop: 4 }}>−{p.discount}%</div>}
              {p.info.length > 0 && (
                <>
                  <h3 style={{ fontWeight: 800, marginTop: 22 }}>{t("specs")}</h3>
                  <ul className="pm-specs">{p.info.map((l, i) => <li key={i}>{l}</li>)}</ul>
                </>
              )}
              {d.related.length > 0 && (
                <div style={{ marginTop: 26 }}>
                  <h3 style={{ fontWeight: 800 }}>{t("related")}</h3>
                  <div className="pm-hscroll" style={{ margin: "0 -18px", padding: "2px 18px 6px" }}>
                    {d.related.map((r) => <ProductCard key={r.id} p={r} />)}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </IonContent>
      {p && (
        <div className="pm-buybar">
          {qty > 0 ? (
            <div className="pm-qty">
              <button onClick={() => setQty(p.id, qty - 1)}>−</button><span>{qty}</span><button onClick={() => setQty(p.id, qty + 1)}>+</button>
            </div>
          ) : null}
          <button className="pm-btn dark" onClick={() => { if (!qty) { add(p); toast({ message: t("added"), duration: 1200, position: "top", color: "secondary" }); } else router.push("/cart"); }}>
            <IonIcon icon={qty ? checkmarkCircle : bagAddOutline} /> {qty ? t("inCart") : t("addToCart")}
          </button>
          <button className="pm-btn" onClick={() => { if (!qty) add(p); router.push("/checkout"); }}>
            <IonIcon icon={flashOutline} /> {t("buyNow")}
          </button>
        </div>
      )}
    </IonPage>
  );
}
