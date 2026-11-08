export const categories = ['早餐', '午餐', '晚餐', '甜點/飲料'];
export const WEEK = 7 * 24 * 60 * 60 * 1000;
export function validScore(n) { return typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 5 && Math.abs(n * 10 - Math.round(n * 10)) < 1e-8; }
export function validDate(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s; }
export function today() { return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
export function validateReview(r, restaurants, maxDate = today()) {
  if (!r || typeof r !== 'object' || !restaurants.some(x => x.id === r.restaurantId)) throw Error('請選擇有效的餐廳');
  if (!validScore(r.score)) throw Error('評分須為 1.0–5.0，最多一位小數');
  if (!validDate(r.visitedOn) || r.visitedOn > maxDate) throw Error('請填寫有效的用餐日期，不能晚於今天');
  for (const [k, limit] of [['author',40],['text',2000],['authorId',100],['id',100]]) if (typeof r[k] !== 'string' || !r[k].trim() || r[k].length > limit) throw Error(`欄位 ${k} 空白或過長`);
  if (!Number.isFinite(Date.parse(r.updatedAt))) throw Error('更新時間格式錯誤');
  return r;
}
export function remaining(last, now = Date.now()) { return Math.max(0, Date.parse(last) + WEEK - now); }
export function average(reviews, restaurantId) { const rs = reviews.filter(r => r.restaurantId === restaurantId); return rs.length ? rs.reduce((s,r) => s+r.score,0)/rs.length : null; }
export function rank(restaurants, reviews, category = '', tag = '', query = '') {
  return restaurants.filter(r => (!category || r.categories.includes(category)) && (!tag || r.tags.includes(tag)) && `${r.name} ${r.address} ${r.tags.join(' ')}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(r => ({...r, score:average(reviews,r.id), count:reviews.filter(x=>x.restaurantId===r.id).length})).sort((a,b)=>(b.score??-1)-(a.score??-1)||b.count-a.count||a.name.localeCompare(b.name,'zh-TW'));
}
export function mergeReviews(published, local) { const map = new Map(published.map(r=>[`${r.restaurantId}:${r.authorId}`,r])); for(const r of local) { const key=`${r.restaurantId}:${r.authorId}`; const old=map.get(key); if(!old||Date.parse(r.updatedAt)>Date.parse(old.updatedAt))map.set(key,r); } return [...map.values()]; }
