import React, { useEffect, useState } from "react";
import { IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent, useIonRouter } from "@ionic/react";
import { menuOutline, searchOutline } from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import { api } from "../api";
import { useStore } from "../store";
import { Bell, Failed, ProductCard, Skeleton } from "../components/ui";

export default function Home() {
  const { t, lang, customer, setMenuOpen } = useStore();
  const router = useIonRouter();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const load = () => {
    setFailed(false);
    return api("home/").then(setData).catch(() => setFailed(true));
  };
  useEffect(() => {
    load();
  }, [lang]);

  const open = (a) => {
    if (!a) return;
    if (a.type === "product") router.push(`/product/${a.id}`);
    else if (a.type === "category") router.push(`/products?category=${a.slug}`);
    else if (a.type === "filter") router.push(`/products?filter=${a.filter}`);
    else if (a.type === "url") Browser.open({ url: a.url }).catch(() => window.open(a.url, "_blank"));
  };
  const titles = { sale: t("sale"), new: t("new"), latest: t("latest") };
  const more = { sale: "/products?filter=sale", new: "/products?filter=new", latest: "/products" };
  const first = customer && customer.name ? customer.name.split(" ")[0] : "";

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={(e) => load().finally(() => e.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>
        <div className="pm-hero">
          <div className="brand">
            <img src="/icon.png" alt="" /><b>proMaster</b>
            <span className="pm-head-actions">
              <Bell />
              <button className="pm-iconbtn" aria-label={t("menu")} onClick={() => setMenuOpen(true)}><IonIcon icon={menuOutline} /></button>
            </span>
          </div>
          <h1>{t("hello")}{first ? `, ${first}` : ""}!</h1>
          <p>{lang === "ru" ? "Инструменты и хозтовары — с доставкой" : "Asbob-uskuna va xo'jalik mollari — yetkazib berish bilan"}</p>
          <div className="pm-search" onClick={() => router.push("/products?focus=1")}>
            <IonIcon icon={searchOutline} /> {t("search")}
          </div>
        </div>

        {failed ? (
          <Failed onRetry={load} />
        ) : !data ? (
          <div className="pm-pad pm-lift"><Skeleton h={170} n={1} grid={false} /><Skeleton /></div>
        ) : (
          <>
            {data.banners.length > 0 && (
              <div className="pm-banners pm-lift">
                {data.banners.map((b) => (
                  <div key={b.id} className="pm-banner" onClick={() => open(b.action)}>
                    {b.kind === "video" ? <video src={b.media} autoPlay muted loop playsInline /> : <img src={b.media} alt="" />}
                    {(b.title || b.text) && (
                      <div className="cap"><b>{b.title}</b><span>{b.text}</span></div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {data.sections.filter((s) => s.products.length).map((s, i) => (
              <div className={`pm-section${i === 0 && !data.banners.length ? " pm-lift" : ""}`} key={s.key}>
                <div className="pm-section-head">
                  <h2>{titles[s.key]}</h2>
                  <button onClick={() => router.push(more[s.key])}>{t("seeAll")}</button>
                </div>
                <div className="pm-hscroll">
                  {s.products.map((p) => <ProductCard key={p.id} p={p} />)}
                </div>
              </div>
            ))}
            <div style={{ height: 24 }} />
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
