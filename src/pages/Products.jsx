import React, { useEffect, useRef, useState } from "react";
import {
  IonButtons, IonBackButton, IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonPage,
  IonSearchbar, IonToolbar,
} from "@ionic/react";
import { useLocation } from "react-router-dom";
import { api } from "../api";
import { useStore } from "../store";
import { Failed, ProductCard, Skeleton } from "../components/ui";

export default function Products() {
  const { t, lang } = useStore();
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const [category, setCategory] = useState(params.get("category") || "");
  const [filter, setFilter] = useState(params.get("filter") || "");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [failed, setFailed] = useState(false);
  const search = useRef(null);

  useEffect(() => {
    setCategory(params.get("category") || "");
    setFilter(params.get("filter") || "");
    if (params.get("focus")) setTimeout(() => search.current && search.current.setFocus(), 400);
  }, [loc.search]);
  useEffect(() => {
    api("categories/").then((d) => setCats(d.categories)).catch(() => {});
  }, [lang]);

  const query = (p) =>
    `products/?page=${p}&sort=${sort}` +
    (category ? `&category=${encodeURIComponent(category)}` : "") +
    (filter ? `&filter=${filter}` : "") +
    (q ? `&q=${encodeURIComponent(q)}` : "");
  const load = () => {
    setFailed(false);
    setItems(null);
    api(query(1))
      .then((d) => { setItems(d.products); setPage(1); setPages(d.pages); })
      .catch(() => setFailed(true));
  };
  useEffect(load, [category, filter, q, sort, lang]);
  const more = (e) => {
    if (page >= pages) return e.target.complete();
    api(query(page + 1))
      .then((d) => { setItems((x) => [...x, ...d.products]); setPage(d.page); })
      .finally(() => e.target.complete());
  };

  const chips = [{ key: "", label: t("all") }, { key: "sale", label: t("sale"), f: true }, { key: "new", label: t("new"), f: true }, ...cats.map((c) => ({ key: c.slug, label: c.name }))];
  const isOn = (c) => (c.f ? filter === c.key : !filter && category === c.key);
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/catalog" text="" /></IonButtons>
          <IonSearchbar ref={search} placeholder={t("search")} debounce={350} value={q} onIonInput={(e) => setQ(e.detail.value || "")} style={{ paddingTop: 10 }} />
        </IonToolbar>
        <div className="pm-chips" style={{ background: "var(--pm-bg)" }}>
          {chips.map((c) => (
            <button key={(c.f ? "f" : "c") + c.key} className={`pm-chip${isOn(c) ? " on" : ""}`}
              onClick={() => { if (c.f) { setFilter(c.key); setCategory(""); } else { setFilter(""); setCategory(c.key); } }}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="pm-chips" style={{ background: "var(--pm-bg)", paddingTop: 0, alignItems: "center" }}>
          <span className="pm-muted" style={{ fontSize: 12.5, fontWeight: 700, flex: "none" }}>{t("sort")}:</span>
          {[["new", t("sortNew")], ["cheap", t("sortCheap")], ["expensive", t("sortExpensive")]].map(([k, l]) => (
            <button key={k} className={`pm-chip${sort === k ? " on" : ""}`} style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setSort(k)}>{l}</button>
          ))}
        </div>
      </IonHeader>
      <IonContent>
        <div className="pm-pad" style={{ paddingTop: 6 }}>
          {failed ? <Failed onRetry={load} /> : !items ? <Skeleton h={230} /> : items.length === 0 ? (
            <div className="pm-empty"><h3>{t("nothing")}</h3></div>
          ) : (
            <div className="pm-grid">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          )}
        </div>
        <IonInfiniteScroll onIonInfinite={more} disabled={!items || page >= pages}>
          <IonInfiniteScrollContent />
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
}
