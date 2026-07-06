# 三多轉 85 公車

只是我綠色出勤的小工具。Web/PWA + Capacitor Android app，用高雄 iBus+ 即時到站資料與固定時刻表，判斷出門、轉捷運、轉公車時哪個選項最快。

## 功能

- `85 公車`：從 R8 三多商圈到 85 大樓，或從 85 回 R8 三多商圈。
- `高醫通勤`：比較高醫接駁車與高醫、三民國中周邊公車，出門到 R12 後驛或從 R12 後驛回高醫。
- `捷運`：離線顯示 R12 後驛與 R8 三多商圈來回的平常日列車估算。
- 顯示建議捷運出口、站牌、抵達時間、走路時間與安全緩衝。
- 下拉手勢更新站點，左右滑切換 tab。

目的地是公開地標地址：`802 高雄市苓雅區意誠里自強三路 3 號`。

## 架構

- `public/`：純前端 PWA。
- `src/worker.js`：Cloudflare Worker，代理固定白名單站牌的 `/api/eta`。
- `android/`：Capacitor Android 專案。
- `scripts/generate-runtime-config.js`：依 `.env` 產生 Native 版需要的 runtime config。

Web 版部署在同一個 Worker 上時直接呼叫同源 `/api/eta`。Android/Capacitor 版不能用同源 Worker，因此 build 前會從 `.env` 的 `WORKER_ORIGIN` 產生 `public/runtime-config.js`；該檔案被 git 忽略。

## 環境設定

```bash
cp .env.example .env
cp .dev.vars.example .dev.vars
```

`.env`：

```dotenv
WORKER_ORIGIN=https://your-worker.example.com
IBUS_SUBSCRIPTION_KEY=replace-with-your-key
```

`.dev.vars` 給 `wrangler dev` 使用：

```dotenv
IBUS_SUBSCRIPTION_KEY=replace-with-your-key
```

正式部署請把 key 設成 Cloudflare Worker secret：

```bash
npx wrangler secret put IBUS_SUBSCRIPTION_KEY
```

## 本機執行

```bash
npm install
npm run dev
```

Wrangler 會顯示本機網址，通常是 `http://localhost:8787`。PWA 安裝與 Service Worker 需要 `localhost` 或 HTTPS。

## 部署

```bash
npm run deploy
```

`deploy` 會先產生 web 用的空 runtime config，避免公開部署包裡寫死私人 Worker 網址。

## Android

```bash
npm run android:sync
npm run android:build
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

`android:sync` 會先用 `.env` 產生 Native runtime config，再同步 Capacitor Android 專案。

## 資料來源

- 高雄 iBus+ 即時到站 API：由 Cloudflare Worker 代理固定站牌查詢。
- 高雄捷運 R8 三多商圈平常日時刻表：https://www.krtc.com.tw/Guide/train_times?n=R8
- 高雄捷運 R12 後驛平常日時刻表：https://www.krtc.com.tw/Guide/train_times?n=R12
- 高雄捷運站間行駛時間：https://www.krtc.com.tw/Guide/time_between_train

捷運 tab 是離線估算，特殊日、臨時調度、末班車異動與颱風停班請以高捷公告、現場資訊或高捷 e 遊行為準。
