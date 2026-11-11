import {config} from './config.js';
import {categories, rank, validateReview, mergeReviews, remaining, today} from './core.js';
const $ = s => document.querySelector(s);
const esc = v => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const repo = `https://github.com/${config.repository}`;
let restaurants=[], published=[], demos=[], local=[], category='', selectedTag='', query='', storageOK=true;
let guest;
try { guest=localStorage.getItem('shiguang-guest'); if(!guest){guest=crypto.randomUUID();localStorage.setItem('shiguang-guest',guest);} local=JSON.parse(localStorage.getItem('shiguang-reviews')||'[]');if(!Array.isArray(local))local=[]; } catch {guest=crypto.randomUUID();storageOK=false;local=[];}
const authorId=`guest:${guest}`;
let toastTimer;
function notify(message){const toast=$('#toast');const host=document.querySelector('dialog[open]')||document.body;host.append(toast);toast.textContent=message;toast.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',4500);}
function currentReviews(){return mergeReviews([...published,...($('#demo').checked?demos:[])],local);}
function visibleRestaurants(){return restaurants.filter(r=>$('#demo').checked||!r.demo);}
function openDialog(selector){$('#toast').style.display='none';document.body.append($('#toast'));document.querySelectorAll('dialog[open]').forEach(d=>d.close());$(selector).showModal();}
document.querySelectorAll('dialog .close').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const b=d.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)d.close();}}));
$('#repo-link').href=repo;$('#feedback-link').href=`${repo}/issues/new?template=bug.yml`;$('#submit-git').href=`${repo}/blob/main/CONTRIBUTING.md`;
function render(){
 const reviews=currentReviews();let rows=rank(visibleRestaurants(),reviews,category,selectedTag,query);
 const ranked=[...rows];if($('#sort').value==='count')rows.sort((a,b)=>b.count-a.count||(b.score??-1)-(a.score??-1));if($('#sort').value==='name')rows.sort((a,b)=>a.name.localeCompare(b.name,'zh-TW'));
 $('#results').textContent=`${rows.length} 間餐廳`;
 $('#cards').innerHTML=rows.length?rows.map(r=>`<article class="card"><div class="card-art ${esc(r.art||'table')}"><span class="art-label">${r.demo?'虛構示範':'社群共編'}</span><div class="dish" aria-hidden="true"></div></div><div class="card-body"><p class="card-category">${esc(r.categories.join(' / '))}</p><h3>${esc(r.name)}</h3><div class="card-location">⌖ ${esc(r.address)}</div><p class="card-desc">${esc(r.description)}</p><div class="tags">${r.tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join('')}</div><div class="card-bottom"><div class="score"><span>★</span> ${r.score===null?'—':r.score.toFixed(1)} <small>(${r.count})</small></div><button data-detail="${esc(r.id)}" aria-label="查看 ${esc(r.name)} 的評價">查看食記 ↗</button></div>${local.some(x=>x.restaurantId===r.id)?'<p class="pending">含本機未公開評價</p>':''}</div></article>`).join(''):'<p class="empty">還沒有符合條件的餐廳，試試其他分類或關鍵字。</p>';
 $('#leaderboard').innerHTML=ranked.filter(r=>r.score!==null).slice(0,5).map((r,i)=>`<li><span class="rank-number">${String(i+1).padStart(2,'0')}</span><div class="rank-name"><button data-detail="${esc(r.id)}">${esc(r.name)}</button><small>${esc(r.categories.join(' · '))} ${r.demo?'／示範':''} ${local.some(x=>x.restaurantId===r.id)?'／含本機草稿':''}</small></div><span class="rank-score">${r.score.toFixed(1)} <small>★</small></span></li>`).join('')||'<li>尚無評分，留下第一篇食記吧。</li>';
 document.querySelectorAll('[data-detail]').forEach(b=>b.onclick=()=>detail(b.dataset.detail));
}
function renderReview(review) {
 const photos = (Array.isArray(review.photos) ? review.photos : []).filter(photo =>
  photo && /^[a-z0-9-]+\.jpg$/.test(photo.file) && typeof photo.alt === 'string'
 );
 const gallery = photos.length ? `<div class="review-photos">${photos.map(photo => `
  <figure>
   <a href="./data/${photo.file}" target="_blank" rel="noopener">
    <img src="./data/${photo.file}" alt="${esc(photo.alt)}" loading="lazy" decoding="async">
   </a>
   <figcaption>${esc(photo.alt)}</figcaption>
  </figure>`).join('')}</div>` : '';
 const source = local.some(item => item.id === review.id) ? '本機未公開' : 'Git 共編';
 return `<article class="review">
  <div class="review-head"><strong>${esc(review.author)}</strong><span>★ ${review.score.toFixed(1)}</span></div>
  <p class="hint">用餐 ${esc(review.visitedOn)} · ${source} · 更新 ${esc(new Date(review.updatedAt).toLocaleDateString('zh-TW'))}</p>
  <p>${esc(review.text)}</p>${gallery}
 </article>`;
}

function detail(id){
 const r=restaurants.find(x=>x.id===id);if(!r){notify('找不到這間餐廳，請從餐廳列表重新選擇。');return;}
 const mapUrl = typeof r.mapUrl === 'string' && /^https:\/\/maps\.app\.goo\.gl\/[A-Za-z0-9]+$/.test(r.mapUrl)
  ? r.mapUrl
  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.mapQuery || r.name + ' ' + r.address)}${r.placeId ? '&query_place_id=' + encodeURIComponent(r.placeId) : ''}`;
 const shareUrl=new URL(location.href);shareUrl.hash=`restaurant=${encodeURIComponent(id)}`;
 const reviews=currentReviews().filter(x=>x.restaurantId===id).sort((a,b)=>Date.parse(b.updatedAt)-Date.parse(a.updatedAt));
 $('#detail-content').innerHTML=`<p class="eyebrow">${r.demo?'FICTIONAL DEMO':'COMMUNITY REVIEW'}</p><h2>${esc(r.name)}</h2><p class="muted">${esc(r.address)} · ${esc(r.categories.join(' / '))}</p><p class="info-copy">${esc(r.description)}</p><div class="detail-top"><button class="primary" id="review-this">寫下 / 修改我的評價</button><button id="share-this">分享餐廳 ↗</button></div><label class="share-link">餐廳專屬連結<input id="permalink" type="url" readonly value="${esc(shareUrl.href)}" aria-label="餐廳專屬連結，點選後可手動複製"></label><div class="map-box"><p class="hint">${r.demo?'此為虛構餐廳；地圖顯示區域搜尋，不代表店家位置。':'地圖由 Google Maps 提供，載入後將連線至 Google。'}</p><button id="load-map">載入 Google 地圖 ↗</button><div id="map-slot"></div><p id="google-rating" class="hint">${r.demo?'示範餐廳不提供 Google 店家評分。':'Google 評分：尚未載入。需設定 Maps API 金鑰及店家 Place ID。'}</p><a href="${esc(mapUrl)}" target="_blank" rel="noopener">在 Google Maps 查看地圖與最新評分 ↗</a></div><h3>用餐記錄 <small>(${reviews.length})</small></h3>${reviews.map(renderReview).join('')||'<p class="muted">還沒有食記，寫下你的第一個感受。</p>'}`;
 $('#review-this').onclick=()=>openEditor(id);
 $('#permalink').onclick=e=>e.target.select();
 $('#load-map').onclick=()=>{const iframe=document.createElement('iframe');iframe.title=`${r.name} Google 地圖`;iframe.loading='lazy';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.src=`https://maps.google.com/maps?q=${encodeURIComponent(r.mapQuery||r.name+' '+r.address)}&output=embed`;$('#map-slot').replaceChildren(iframe);$('#load-map').hidden=true;if(config.googleMapsApiKey&&r.placeId&&!r.demo)loadGoogleRating(r);};
 $('#share-this').onclick=async()=>{const url=shareUrl;try{if(navigator.share)await navigator.share({title:r.name,url:url.href});else{await navigator.clipboard.writeText(url.href);notify('餐廳連結已複製');}}catch(e){if(e.name!=='AbortError')notify('無法自動分享，請手動複製「餐廳專屬連結」欄位');}};
 openDialog('#detail');
}
let googleReady;
function loadGoogle(){if(!googleReady)googleReady=new Promise((resolve,reject)=>{window.shiguangGoogleReady=resolve;const s=document.createElement('script');s.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(config.googleMapsApiKey)}&v=quarterly&loading=async&callback=shiguangGoogleReady`;s.onerror=reject;document.head.append(s);});return googleReady;}
async function loadGoogleRating(r){const slot=$('#google-rating');slot.textContent='正在讀取 Google Maps 評分…';try{await loadGoogle();const {Place}=await google.maps.importLibrary('places');const place=new Place({id:r.placeId});await place.fetchFields({fields:['rating','userRatingCount','googleMapsURI']});slot.textContent=place.rating==null?'Google Maps 尚無評分':`Google Maps：★ ${place.rating.toFixed(1)}（${place.userRatingCount??0} 則）`; }catch{slot.textContent='Google Maps 評分載入失敗，請使用上方 Google Maps 連結，或檢查金鑰與 API 設定。';}}
const form=$('#review-form');
function existing(id){return mergeReviews(published,local).find(r=>r.restaurantId===id&&r.authorId===authorId);}
function fillExisting(){const r=existing(form.elements.restaurantId.value);form.elements.author.value=r?.author||'';form.elements.visitedOn.value=r?.visitedOn||today();form.elements.score.value=(r?.score??4).toFixed(1);form.elements.text.value=r?.text||'';$('#form-error').textContent='';const ms=r?remaining(r.updatedAt):0;$('#cooldown').textContent=ms?`可再次修改時間：${new Date(Date.parse(r.updatedAt)+7*86400000).toLocaleString('zh-TW')}。`:'每間店家每位旅客一則評價；儲存後 7 天可再修改。';form.querySelector('[type=submit]').disabled=ms>0;}
function openEditor(id){form.reset();form.elements.visitedOn.max=today();form.elements.restaurantId.innerHTML=restaurants.map(r=>`<option value="${esc(r.id)}">${esc(r.name)}${r.demo?'（虛構示範）':''}</option>`).join('');if(id)form.elements.restaurantId.value=id;fillExisting();openDialog('#editor');}
$('#write').onclick=()=>openEditor();form.elements.restaurantId.onchange=fillExisting;
form.onsubmit=e=>{e.preventDefault();try{if(!storageOK)throw Error('瀏覽器無法儲存資料，請開啟網站儲存權限後再試。');const data=Object.fromEntries(new FormData(form));const old=existing(data.restaurantId);if(old&&remaining(old.updatedAt)>0)throw Error('這間餐廳的評價仍在 7 天冷卻期間');const review={...data,score:Number(data.score),authorId,id:old?.id||crypto.randomUUID(),updatedAt:new Date().toISOString()};validateReview(review,restaurants);const next=local.filter(r=>!(r.restaurantId===review.restaurantId&&r.authorId===authorId));next.push(review);localStorage.setItem('shiguang-reviews',JSON.stringify(next));local=next;render();fillExisting();notify('已儲存於此瀏覽器。匯出後經 GitHub 合併才會公開。');}catch(e){$('#form-error').textContent=e.message;}};
$('#export').onclick=()=>{if(!local.length){notify('尚無本機評價可匯出');return;}const blob=new Blob([JSON.stringify(local,null,2)+'\n'],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='my-reviews.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('匯出的是本機評價，請依共編指南整合進 reviews.json');};
$('#google-login').onclick=()=>notify('尚未啟用 Google 登入：需 Client ID 與可驗證身分的服務端，目前可使用旅客模式。');
$('#survey').onclick=()=>window.open(`${repo}/issues/new?template=feedback.yml`,'_blank','noopener');
$('#about').onclick=()=>{$('#info-content').innerHTML=`<h2>關於美食獵人</h2><div class="info-copy"><p>美食獵人的起點，是一起找出土地銀行附近的餐廳，互相分享真正吃過的店、推薦餐點與用餐感受，讓大家的下一餐有更多選擇。Google 評分是一項參考，也歡迎透過彼此的食記，找到適合自己的味道。</p><p>這是一個無資料庫的開源餐廳評價網站。本站的 1.0–5.0 社群評分與 Google Maps 評分分開顯示。示範餐廳為虛構，不代表已收錄土地銀行附近的真實店家。</p><h3>資料如何保存？</h3><p>旅客 ID 與草稿儲存在此瀏覽器 localStorage。清除網站資料或換裝置會失去本機記錄，請先匯出備份。本站不蒐集 IP，無法可靠阻擋跨裝置重複留言。冷卻限制在本機執行，公開 JSON 的修改另有 GitHub 驗證。</p><h3>公開共編</h3><p>匯出 JSON 後，依 <a href="${repo}/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">共編指南</a> 提交 Pull Request。請勿放入電子郵件、IP 或登入憑證；合併後資料會公開在 Git 歷史中。</p><h3>Google 服務</h3><p>點選載入地圖或 Google Maps 連結時才連線至 Google。Google 登入及 IP 防重複需要另行設定可信任服務。目前沒有 Google 登入功能，也不會把本機旅客當成已驗證會員。</p><p>Google 評分僅在提供受限 Maps API 金鑰與有效 Place ID 時即時讀取，不寫入 Git。使用 Google 服務時適用 <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google 隱私權政策</a> 與 <a href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noopener">Google Maps 服務條款</a>。</p><p>程式碼採 MIT 授權，無第三方前端套件。Google 為外部專有服務，並非 MIT 元件。</p></div>`;openDialog('#info');};
$('#search').oninput=e=>{query=e.target.value.trim();render();};$('#tag').onchange=e=>{selectedTag=e.target.value;render();};$('#sort').onchange=render;$('#demo').onchange=render;
function hashDetail(){const match=location.hash.match(/^#restaurant=(.+)$/);if(match){try{detail(decodeURIComponent(match[1]));}catch{notify('餐廳連結格式不正確');}}}window.addEventListener('hashchange',hashDetail);
async function boot(){try{[restaurants,published,demos]=await Promise.all(['restaurants','reviews','demo-reviews'].map(async name=>{const res=await fetch(`./data/${name}.json`);if(!res.ok)throw Error('資料載入失敗');return res.json();}));local=local.filter(r=>{try{validateReview(r,restaurants);return r.authorId===authorId;}catch{return false;}});$('#categories').innerHTML=['全部',...categories].map((c,i)=>`<button aria-pressed="${i===0}" data-category="${i===0?'':esc(c)}">${esc(c)}</button>`).join('');$('#categories').querySelectorAll('button').forEach(b=>b.onclick=()=>{category=b.dataset.category;$('#categories').querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});$('#tag').innerHTML='<option value="">所有標籤</option>'+[...new Set(restaurants.flatMap(r=>r.tags))].sort().map(t=>`<option>${esc(t)}</option>`).join('');render();$('#write').disabled=restaurants.length===0;hashDetail();if(!storageOK)notify('本機儲存不可用，目前只能瀏覽。');}catch{$('#cards').innerHTML='<p class="empty" role="alert">資料載入失敗，請重新整理，或確認網站透過 HTTP 開啟。</p>';$('#write').disabled=true;}}
boot();
