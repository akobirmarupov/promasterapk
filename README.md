# proMaster — mobil ilova (Android)

proMaster do'konining o'z dizayniga ega ilovasi: bosh sahifa (bannerlar, kategoriyalar, chegirmalar), katalog va qidiruv,
tovar sahifasi, savat, buyurtma, profil (Telegram kod bilan kirish, buyurtmalarim, manzillarim, til va qorong'i rejim).
Mahsulot, narx va buyurtmalar **promaster.com.uz** saytining bazasidan (`/api/app/…`) keladi.

Texnologiya: Ionic + React (Vite) + Capacitor 7. APK / AAB **GitHub Actions**'da yig'iladi.

## Faylni olish
GitHub → **Actions** → oxirgi «Build proMaster app» → pastda **Artifacts**:
- `proMaster-debug-apk` — telefonga o'rnatib sinash uchun;
- `proMaster-release-play-market` — imzolangan **AAB** (Play Market'ga shu yuklanadi) va APK.
  Faqat quyidagi uchta secret qo'shilganda chiqadi.

## Imzo kaliti (bir marta)
Settings → Secrets and variables → Actions → New repository secret:
`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS` (= `upload`). Qiymatlar kompyuterdagi `promasterapk-keys/`
papkasida (repozitoriyada emas). Kalitni yo'qotmang — usiz ilovani yangilab bo'lmaydi.

## Kompyuterda sinash
```bash
npm install
npm run dev        # http://127.0.0.1:5174 — /api mahalliy Promaster saytiga (127.0.0.1:8000) boradi
```

## Play Market uchun
`store-assets/`: ikona 512×512 va banner 1024×500. Maxfiylik siyosati: https://promaster.com.uz/maxfiylik-siyosati/
