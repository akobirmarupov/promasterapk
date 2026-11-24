import React, { useEffect, useState } from "react";
import { IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent, useIonRouter } from "@ionic/react";
import { searchOutline } from "ionicons/icons";
import { Browser } from "@capacitor/browser";
import { api } from "../api";
import { useStore } from "../store";
import { catIcon, Failed, ProductCard, Skeleton } from "../components/ui";

export default function Home() {
  const { t, lang, customer } = useStore();
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
          <div className="brand"><img src="/icon.png" alt="" /><b>proMaster</b></div>
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

            <div className={`pm-section${data.banners.length ? "" : " pm-lift"}`}>
              <div className="pm-section-head">
                <h2>{t("categories")}</h2>
                <button onClick={() => router.push("/catalog")}>{t("seeAll")}</button>
              </div>
              <div className="pm-cats">
                {data.categories.slice(0, 8).map((c) => (
                  <div key={c.id} className={`pm-cat${c.theme === "gold" ? " gold" : ""}`} onClick={() => router.push(`/products?category=${c.slug}`)}>
                    <div className="ic"><IonIcon icon={catIcon(c.icon)} /></div>
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {data.sections.filter((s) => s.products.length).map((s) => (
              <div className="pm-section" key={s.key}>
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
