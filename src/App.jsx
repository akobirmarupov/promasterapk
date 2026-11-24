import React, { useEffect } from "react";
import { Redirect, Route } from "react-router-dom";
import { IonApp, IonBadge, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { bagHandle, gridOutline, home, personCircleOutline } from "ionicons/icons";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

import { useStore } from "./store";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Products from "./pages/Products";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Thanks from "./pages/Thanks";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Settings from "./pages/Settings";
import TextPage from "./pages/TextPage";
import Drawer from "./components/Drawer";
import Notifications from "./pages/Notifications";
import Support from "./pages/Support";

export default function App() {
  const { t, count } = useStore();
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#3AA71F" }).catch(() => {});
    SplashScreen.hide().catch(() => {});
  }, []);
  return (
    <IonApp>
      <IonReactRouter>
        <Drawer />
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home" component={Home} />
            <Route exact path="/catalog" component={Catalog} />
            <Route exact path="/products" component={Products} />
            <Route exact path="/product/:id" component={Product} />
            <Route exact path="/cart" component={Cart} />
            <Route exact path="/checkout" component={Checkout} />
            <Route exact path="/thanks/:id" component={Thanks} />
            <Route exact path="/profile" component={Profile} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/profile/orders" component={Orders} />
            <Route exact path="/profile/addresses" component={Addresses} />
            <Route exact path="/profile/settings" component={Settings} />
            <Route exact path="/page/:key" component={TextPage} />
            <Route exact path="/notifications" component={Notifications} />
            <Route exact path="/support" component={Support} />
            <Route exact path="/"><Redirect to="/home" /></Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={home} />
              <IonLabel>{t("home")}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="catalog" href="/catalog">
              <IonIcon icon={gridOutline} />
              <IonLabel>{t("catalog")}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="cart" href="/cart">
              <IonIcon icon={bagHandle} />
              <IonLabel>{t("cart")}</IonLabel>
              {count > 0 && <IonBadge>{count}</IonBadge>}
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
              <IonIcon icon={personCircleOutline} />
              <IonLabel>{t("profile")}</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}
