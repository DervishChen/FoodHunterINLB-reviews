# 第三方與授權

本網站無 npm 套件、第三方圖片、圖示或遠端字型。餐桌與食物插畫由 CSS 原創繪製，適用本專案 MIT License。

CI 使用官方 GitHub Actions：

- actions/checkout：MIT，https://github.com/actions/checkout/blob/main/LICENSE
- actions/setup-node：MIT，https://github.com/actions/setup-node/blob/main/LICENSE

它們僅用於 CI，不打包至網站。版本固定於 `.github/workflows/validate.yml`；升級應審查版本、完整依賴授權與安全公告。GitHub Pages 平台本身由 GitHub 依其服務條款提供，並非本專案散布的元件。

Google Maps iframe、Maps JavaScript API 及 Places API 為外部專有服務，非 MIT/BSD 開源元件。本專案不重新散布 Google SDK。Google Maps API 腳本只在管理員提供金鑰、設定真實 Place ID 且使用者點選載入時才讀取。
