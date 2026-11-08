# 美食獵人 Food Hunter

從「土地銀行附近吃什麼？」出發，互相分享吃過的餐廳、推薦餐點與真實用餐感受，讓大家的下一餐有更多選擇。Google 評分是一項參考，彼此的食記與社群評價則提供更多選擇依據。

這是一個繁體中文、響應式、無資料庫的開源餐廳評價靜態網站。目前尚未指定哪一間土地銀行或周邊範圍，起始資料仍是虛構示範；正式店家由大家透過 Git 共編加入。

網站：https://dervishchen.github.io/FoodHunterINLB-reviews/

## 現階段功能

| 功能 | 狀態 |
| --- | --- |
| 早餐、午餐、晚餐、甜點/飲料 | 已完成，可多分類 |
| 1.0–5.0、一位小數評分 | 已完成，含輸入和 JSON 驗證 |
| 分類、標籤、搜尋與排行榜 | 已完成；同分依評價數、店名排序 |
| 用餐日期、暱稱、食記 | 已完成 |
| 旅客評價 | 本機 localStorage；匯出後以 PR 公開 |
| 七天修改限制 | 本機及 Git 資料驗證；並非可信身分或 IP 防重複 |
| Google 地圖 | 點擊後顯示真實 Google 區域/店家地圖；可開啟 Maps |
| Google 店家評分 | 已提供即時讀取程式；需受限金鑰、Place ID、啟用 Places API |
| Google 會員投稿 | 尚未實作；必須另建驗證與投稿服務，不能只解碼前端 JWT |
| 依 IP 防重複 | 尚未實作；純靜態網站無法可信執行 |
| 分享連結 | 已完成 Web Share / 複製；社群 API 串接待後續 |
| Bug / 問卷 / 回覆 | GitHub Issues 表單與留言，需要 GitHub 帳號 |

四間起始餐廳皆為**虛構示範**，示範評分位於獨立 `data/demo-reviews.json`；`data/reviews.json` 起始為空。頁面提供隱藏示範資料選項。沒有假裝 Google 的示範評分。

## 執行與部署

無第三方前端、建置或測試套件，使用瀏覽器原生 ES modules 和 Node 內建工具。Node 24 LTS 可執行檢查，不需要 npm install。

```sh
node --test scripts/core.test.mjs
node scripts/validate.mjs
node scripts/build.mjs
python -m http.server 4173
```

開啟 http://localhost:4173/，不能直接用 file:// 開啟，因為 JSON 透過 fetch 讀取。

GitHub Pages 使用 **Deploy from a branch → main → /(root)**。網站檔案位於根目錄且使用相對路徑，適用 repository 子路徑。`dist/` 是可選的純靜態產物；Pages 不需要 Node 建置。PR / main 的 Validate contributions 工作流程執行資料與測試檢查。

## 修改資料

依 [CONTRIBUTING.md](CONTRIBUTING.md) 新增正式餐廳及評價。正式評價以 `restaurantId + authorId` 唯一；修改須保留 ID 並至少間隔七天。新增作者不等於可信新身分，維護者須人工審核。

## Google 設定

編輯 `config.js` 的 `googleMapsApiKey`，在正式餐廳中填入有效 `placeId`。啟用 Maps JavaScript API / Places API (New)，設定 HTTP referrer 及 API 限制與帳務預算。此為公開瀏覽器金鑰，不能放任何服務端密鑰。使用 `v=quarterly`；評分於使用者按下地圖載入時讀取、標示 Google Maps，不儲存至 Git 或 localStorage。未設定時顯示未啟用並提供 Maps 連結。請先確認 Google 平台計費；本專案未替你申請付費服務。

Google 登入按鈕目前僅提供狀態說明；`googleClientId`、`reviewServiceUrl` 為未接通的整合預留欄位，填值不會自動啟用登入。未來若維持無資料庫，可增加小型可信服務驗證 Google token、限流，並用 GitHub App 建 PR；密鑰只留在服務端。不要讓訪客在瀏覽器使用管理員 PAT。IP 防重複還需要邊緣服務、隱私告知與資料保留政策；共用 IP、VPN 都會影響準確性。僅以 IP 也不能保證一人一票。

官方參考：[Google token 驗證](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)、[Places 政策](https://developers.google.com/maps/documentation/places/web-service/policies)、[GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 開源與維護

採用「公開瀏覽、指定朋友共同維護」：網站與原始碼公開，儲存庫的直接寫入權限只授予擁有者邀請的協作者。朋友接受 GitHub 邀請後，以 branch 與 Pull Request 協作；一般訪客可回饋或提出 Fork PR，但不能直接改動本儲存庫。完整流程見 [CONTRIBUTING.md](CONTRIBUTING.md)。

原始碼與原創 CSS 插畫採 MIT。沒有 npm 依賴，沒有外部圖片、字型套件或 GPL 元件。CI Actions 採 MIT 授權；詳見 [THIRD_PARTY.md](THIRD_PARTY.md)。外部 Google API 為專有服務，依 Google 條款使用；若「所有服務也必須 MIT/BSD」，則需取消 Google Maps 需求。

GitHub Actions 的七天檢查是協作規則，不是不可繞過的存取控制。建議維護者在 Repository Rulesets 設定 main 必須經 PR、通過 Validate contributions 並取得審核；本專案不宣稱已設定分支保護。不保證任何軟體永無風險，定期檢查版本及 GitHub 安全公告。
