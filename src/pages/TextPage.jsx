import React, { useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { useStore } from "../store";
import { Failed, Header, Skeleton } from "../components/ui";

const TITLES = { about: "aboutUs", delivery: "deliveryInfo", returns: "returns", privacy: "privacy", offer: "offer" };

export default function TextPage() {
  const { key } = useParams();
  const { t, lang } = useStore();
  const [text, setText] = useState(null);
  const [failed, setFailed] = useState(false);
  const load = () => {
    setFailed(false);
    api(`pages/${key}/`).then((d) => setText(d.text || "—")).catch(() => setFailed(true));
  };
  useEffect(load, [key, lang]);
  return (
    <IonPage>
      <Header title={t(TITLES[key] || "home")} back="/profile" />
      <IonContent>
        <div className="pm-pad" style={{ whiteSpace: "pre-line", lineHeight: 1.6, fontSize: 15 }}>
          {failed ? <Failed onRetry={load} /> : text === null ? <Skeleton h={20} n={8} grid={false} /> : text}
        </div>
      </IonContent>
    </IonPage>
  );
}
