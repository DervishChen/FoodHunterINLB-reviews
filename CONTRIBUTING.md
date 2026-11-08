# 一起共編美食獵人

歡迎修正網頁、新增店家與分享食記。Fork → 開分支 → 編輯 → 執行驗證 → Pull Request → 維護者審核合併。

## 新增餐廳

在 `data/restaurants.json` 加入物件，ID 使用小寫英數與短橫線。填入真實店名、地址，勿冒用示範店家。範例：

```json
{"id":"your-restaurant","name":"真實店名","categories":["午餐","晚餐"],"tags":["麵食"],"address":"真實地址","mapQuery":"店名與地址","placeId":"","description":"自己的簡短介紹","art":"noodle","demo":false}
```

分類限早餐、午餐、晚餐、甜點/飲料；art 可為 morning/noodle/table/cafe。Place ID 可先留空，地圖會依名稱地址搜尋。不要抄錄 Google 評論、評分或圖片進 Git。

## 提交評價

1. 網站以旅客模式填寫店家、暱稱、用餐日期、1.0–5.0 一位小數及食記。
2. 按「匯出我的評價 JSON」備份。
3. 將匯出的每個物件新增／替換到 **data/reviews.json 的陣列中**，不要整份覆蓋其他人的評價，也不要上傳無法被網站讀取的 my-reviews.json 到根目錄。
4. 同店、同 authorId 保留一則，修改保留 id 與 authorId，updatedAt 與上一版至少相隔七天，且不可填未來時間。只用餐日期不影響冷卻時間。
5. 請只提交自己寫的評價，不要修改別人的身分。維護者以 PR 作者、歷史、內容人工確認；guest ID 不是已驗證身分。

資料結構：id、restaurantId、authorId、author、score、visitedOn (YYYY-MM-DD)、updatedAt (ISO timestamp)、text。請勿公開 email、IP、Google token 或憑證。

執行 `node --test scripts/core.test.mjs` 和 `node scripts/validate.mjs`。CI 在 PR 與 main push 上也會比較之前的評價以檢查冷卻時間。管理員仍可更改規則；請設定必要檢查與分支審核。刪除不當內容目前會被防刪除檢查擋下，需要維護者在經審核 PR 中明確調整政策；刪除檔案也不等於清除 Git 歷史。

## Bug、建議與問卷

GitHub Issues → New issue 選擇問題回報或使用回饋問卷，後續在 issue 留言討論。所有回覆公開；目前沒有匿名回饋服務。

## 授權原則

專案採 MIT。只接受 MIT、BSD-2-Clause、BSD-3-Clause 相容授權的新增元件；若需其他寬鬆授權先討論。不接受 GPL、GPL-2.0、GPL-3.0、AGPL、LGPL 或不明授權依賴。新增套件時必須提交完整傳遞依賴授權清單與鎖檔、檢查官方穩定版本及已知公告。不得擅自加入追蹤器或 IP 蒐集服務。
