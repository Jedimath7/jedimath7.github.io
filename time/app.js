import { CONFIG } from './config.js?v=2';
import { DAYS, SHORT_DAYS, HOURS, SLOT_COUNT, emptySlots, slotIndex, applyPaint, validateAnswer, dayIntervals } from './model.js?v=4';
const $ = id => document.getElementById(id);
const serviceReady = !!CONFIG.apiUrl && CONFIG.acceptingResponses !== false;
const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9Z"/></svg>';
const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
const media = matchMedia('(max-width: 760px)');
let slots = emptySlots(), tool = 'available', painting = null, busy = false, recordId = null;
let lastPoint = null;
let dirty = false;
let lastClear = 0;
const draftKey = 'student-availability-draft-v1';
const tokenPattern = /^[a-f0-9]{64}$/;
const fragment = new URLSearchParams(location.hash.slice(1));
let token = fragment.get('edit');
if (token && !tokenPattern.test(token)) token = null;
if (!token) { const bytes = crypto.getRandomValues(new Uint8Array(32)); token = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join(''); }
let hasSavedAnswer = fragment.has('edit') && tokenPattern.test(fragment.get('edit') || '');
// Личная ссылка хранится во фрагменте: она не передаётся хостингу в URL запроса.
function draftSave() {
  try { localStorage.setItem(draftKey, JSON.stringify({ name: $('student-name').value, grade: $('student-grade').value, slots, token, recordId, saved: hasSavedAnswer, dirty })); } catch { /* Черновик необязателен. */ }
}
function restoreDraft() {
  const requestedToken = hasSavedAnswer ? token : null;
  try {
    const saved = JSON.parse(localStorage.getItem(draftKey) || 'null');
    if (!saved || !tokenPattern.test(saved.token) || !Array.isArray(saved.slots) || saved.slots.length !== SLOT_COUNT || saved.slots.some(v => ![0,1,2].includes(v))) return;
    if (requestedToken && saved.token !== requestedToken) return;
    dirty = !!saved.dirty; token = saved.token; slots = saved.slots; recordId = saved.recordId || null; hasSavedAnswer = !!saved.saved;
    $('student-name').value = String(saved.name || '').slice(0,80); $('student-grade').value = String(saved.grade || '');
  } catch { /* Повреждённый черновик не мешает заполнению. */ }
}
function live(text) { $('live-status').textContent = text; }
function showMessage(text) { $('form-message').textContent = text; $('form-message').hidden = !text; }
function visibleDays() { return [0,1,2,3,4]; }

function updateHint() {
  $('grid-help').textContent = tool === 'best' ? 'Нажмите на час, чтобы добавить звёздочку. Ещё раз — убрать её.' : media.matches ? 'Нажимайте на часы. Листайте сетку обычным движением пальца.' : 'Нажимайте на часы или выделяйте проведением мыши.';
}
function renderGrid() {
  const grid = $('time-grid'), days = visibleDays();
  grid.innerHTML = ''; grid.style.setProperty('--visible-days', days.length);
  grid.append(document.createElement('span'));
  days.forEach(day => { const el = document.createElement('div'); el.className = 'day-heading'; el.textContent = SHORT_DAYS[day]; el.title = DAYS[day]; grid.append(el); });
  HOURS.forEach((hour, row) => {
    const label = document.createElement('div'); label.className = 'time-label'; label.innerHTML = `<span>${hour}:00</span><span class="end-time">${hour+1}:00</span>`; grid.append(label);
    days.forEach(day => {
      const index = slotIndex(day,row), button = document.createElement('button');
      button.type = 'button'; button.className = 'slot'; button.dataset.index = index; button.dataset.state = slots[index];
      button.setAttribute('aria-label', cellLabel(index)); button.setAttribute('aria-pressed', String(slots[index] > 0));
      button.innerHTML = slots[index] === 2 ? star : slots[index] === 1 ? check : '';
      grid.append(button);
    });
  });
  updateHint();
}
function cellLabel(index) { const day = Math.floor(index/11), hour = index%11+9; return `${DAYS[day]}, ${hour}:00–${hour+1}:00: ${slots[index] === 2 ? 'лучшее время' : slots[index] === 1 ? 'могу заниматься' : 'не выбрано'}`; }
function refreshCell(index) {
  const cell = $('time-grid').querySelector(`[data-index="${index}"]`); if (!cell) return;
  cell.dataset.state = slots[index]; cell.innerHTML = slots[index] === 2 ? star : slots[index] === 1 ? check : '';
  cell.setAttribute('aria-label', cellLabel(index)); cell.setAttribute('aria-pressed', String(slots[index]>0));
}
function makeSummary(target) {
  target.replaceChildren();
  DAYS.forEach((day, index) => {
    const intervals = dayIntervals(slots,index); if (!intervals.length) return;
    const div = document.createElement('div'); div.className = 'summary-day';
    const title = document.createElement('strong'); title.textContent = day;
    const times = document.createElement('p'); times.textContent = intervals.join(', '); div.append(title,times);
    const best = dayIntervals(slots,index,true);
    if (best.length) { const p = document.createElement('p'); p.className='best-line'; p.innerHTML = star; const span = document.createElement('span'); span.textContent = best.join(', '); p.append(span); div.append(p); }
    target.append(div);
  });
}
function renderSummary() {
  const count = slots.filter(Boolean).length, best = slots.filter(v=>v===2).length;
  $('summary-count').textContent = count ? `Выбрано часов: ${count}${best ? ` · лучших: ${best}` : ''}` : 'Пока нет выбранных часов';
  makeSummary($('summary-days'));
  $('mobile-count').textContent = count ? `Выбрано: ${count} ч` : 'Часы не выбраны';
  syncMobileBar();
}
function paint(index) {
  if (!painting || painting.visited.has(index)) return;
  painting.visited.add(index);
  dirty = true; slots = applyPaint(slots,index,tool,painting.value); refreshCell(index); renderSummary(); draftSave(); showMessage('');
}
function cellAt(x,y) { const cell = document.elementFromPoint(x,y)?.closest('.slot'); return cell && $('time-grid').contains(cell) ? Number(cell.dataset.index) : null; }
function finishPaint() { if (painting) { painting = null; lastPoint = null; live(`Выбрано часов: ${slots.filter(Boolean).length}.`); } }
$('time-grid').addEventListener('pointerdown', event => {
  const cell = event.target.closest('.slot'); if (!cell || event.pointerType !== 'mouse' || busy || event.button !== 0) return;
  event.preventDefault(); cell.focus({preventScroll:true});
  const index = Number(cell.dataset.index);
  painting = { value: tool === 'best' ? slots[index] !== 2 : slots[index] === 0, visited: new Set(), pointerId:event.pointerId };
  $('time-grid').setPointerCapture(event.pointerId); lastPoint={x:event.clientX,y:event.clientY}; paint(index);
});
$('time-grid').addEventListener('pointermove', event => {
  if (!painting || event.pointerId !== painting.pointerId) return;
  event.preventDefault();
  const start=lastPoint||{x:event.clientX,y:event.clientY};
  const steps=Math.ceil(Math.hypot(event.clientX-start.x,event.clientY-start.y)/8)||1;
  for(let step=1;step<=steps;step++){ const i=cellAt(start.x+(event.clientX-start.x)*step/steps,start.y+(event.clientY-start.y)*step/steps); if(i!==null)paint(i); }
  lastPoint={x:event.clientX,y:event.clientY};
});
['pointerup','pointercancel','lostpointercapture'].forEach(type => $('time-grid').addEventListener(type,finishPaint));
window.addEventListener('blur',finishPaint);
$('time-grid').addEventListener('click', event => {
  const cell = event.target.closest('.slot'); if (!cell || (event.detail !== 0 && event.pointerType === 'mouse') || busy) return;
  const i=Number(cell.dataset.index);
  painting={value:tool==='best'?slots[i]!==2:slots[i]===0,visited:new Set()}; paint(i); finishPaint();
});
document.querySelectorAll('[data-tool]').forEach(button=>button.addEventListener('click',()=>{
  finishPaint(); tool=button.dataset.tool;
  document.querySelectorAll('[data-tool]').forEach(b=>{ const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active)); }); updateHint();
}));
function syncMobileBar() {
  const rect=$('submit-answer').getBoundingClientRect();
  $('review-answer').textContent=busy?'Сохраняем…':hasSavedAnswer?'Сохранить изменения':'Отправить ответ';
  $('mobile-save').hidden=!media.matches || $('availability-form').hidden || (rect.top>=0 && rect.bottom<=innerHeight);
}
window.addEventListener('scroll',syncMobileBar,{passive:true});
window.addEventListener('resize',syncMobileBar);
new MutationObserver(syncMobileBar).observe($('availability-form'),{attributes:true,attributeFilter:['hidden']});
media.addEventListener('change',()=>{finishPaint();renderGrid();syncMobileBar();});
$('clear-grid').addEventListener('click',()=>{
  if (!slots.some(Boolean)) return;
  if (Date.now()-lastClear>4000) { lastClear=Date.now();$('clear-grid').textContent='Подтвердить'; live('Нажмите «Подтвердить», чтобы очистить сетку.'); setTimeout(()=>{$('clear-grid').textContent='Очистить';},4000);return; }
  dirty=true;slots=emptySlots();lastClear=0;$('clear-grid').textContent='Очистить';renderGrid();renderSummary();draftSave();
});
$('student-name').addEventListener('input',()=>{dirty=true;draftSave();});$('student-grade').addEventListener('change',()=>{dirty=true;draftSave();});
function apiRequest(action) {
  return new Promise((resolve,reject)=>{
    if(!serviceReady) return reject(new Error('Приём ответов пока не открыт. Попробуйте позже.'));
    let url;try{url=new URL(CONFIG.apiUrl);if(url.protocol!=='https:'||url.hostname!=='script.google.com'||!url.pathname.endsWith('/exec'))throw new Error();}catch{return reject(new Error('Сервис ответов пока не настроен. Сообщите преподавателю.'));}
    const nonce=crypto.randomUUID(), frame=document.createElement('iframe'),form=document.createElement('form'),input=document.createElement('input');
    frame.name=`reply-${nonce}`;frame.hidden=true;frame.title='Сохранение ответа';form.hidden=true;form.method='POST';form.action=CONFIG.apiUrl;form.target=frame.name;
    input.type='hidden';input.name='payload';input.value=JSON.stringify({version:1,action,nonce,replyOrigin:location.origin,token,name:$('student-name').value.trim(),grade:Number($('student-grade').value),slots});form.append(input);
    let timeout;
    function cleanup(){clearTimeout(timeout);window.removeEventListener('message',onMessage);form.remove();frame.remove();}
    function onMessage(event){
      if(!/^https:\/\/(?:(?:[a-z0-9-]+\.)*script|[a-z0-9-]+-script)\.googleusercontent\.com$/.test(event.origin)&&event.origin!=='https://script.google.com')return;
      const msg=event.data;if(!msg||msg.channel!=='student-availability-v1'||msg.nonce!==nonce)return;
      cleanup();if(msg.ok === true)resolve(msg.data);else reject(new Error(typeof msg.error==='string'?msg.error:'Не удалось сохранить ответ. Попробуйте ещё раз.'));
    }
    window.addEventListener('message',onMessage);timeout=setTimeout(()=>{cleanup();reject(new Error('Сервис не ответил вовремя. Ваш выбор сохранён в этом браузере. Попробуйте отправить ещё раз.'));},30000);
    document.body.append(frame,form);form.submit();
  });
}
function validateServerAnswer(data) {
  if (!data || typeof data.id !== "string" || !data.id || typeof data.createdAt !== "string" || !Number.isFinite(Date.parse(data.createdAt)) || typeof data.updatedAt !== "string" || !Number.isFinite(Date.parse(data.updatedAt))) throw new Error("Сервис вернул неполный ответ. Попробуйте позже.");
  const error = validateAnswer(data); if(error) throw new Error("Сервис вернул неполный ответ. Попробуйте позже.");
}
function applyServerAnswer(data) {
  validateServerAnswer(data);
  if(!data||typeof data.name!=='string'||!Number.isInteger(Number(data.grade))||Number(data.grade)<1||Number(data.grade)>11||!Array.isArray(data.slots)||data.slots.length!==SLOT_COUNT||data.slots.some(v=>![0,1,2].includes(v)))throw new Error('Сервис вернул неполный ответ. Попробуйте позже.');
  recordId=data.id;$('student-name').value=data.name;$('student-grade').value=String(data.grade);slots=data.slots;renderGrid();renderSummary();draftSave();
}
function setBusy(value){busy=value;$('submit-answer').disabled=value;$('review-answer').disabled=value;$('review-answer').textContent=value?'Сохраняем…':hasSavedAnswer?'Сохранить изменения':'Отправить ответ';$('submit-answer').textContent=value?'Сохраняем…':hasSavedAnswer?'Сохранить изменения':'Отправить ответ';$('identity-fields').disabled=value;$('clear-grid').disabled=value;}
$('availability-form').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;finishPaint();const error=validateAnswer({name:$('student-name').value,grade:$('student-grade').value,slots});
  if(error){showMessage(error);if(!$('student-name').value.trim())$('student-name').focus();else if(!$('student-grade').value)$('student-grade').focus();return;}
  showMessage('');setBusy(true);draftSave();
  try{const data=await apiRequest('save');validateServerAnswer(data);recordId=data.id;hasSavedAnswer=true;dirty=false;draftSave();history.replaceState(null,'',`#edit=${token}`);$('availability-form').hidden=true;$('success').hidden=false;makeSummary($('saved-summary'));const link=new URL(location.href);link.search='';link.hash=`edit=${token}`;$('edit-link').value=link.href;$('success-title').tabIndex=-1;$('success-title').focus();$('success').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});}catch(error){showMessage(error.message);}finally{setBusy(false);}
});
$('copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('edit-link').value);$('copy-status').textContent='Ссылка скопирована.';}catch{$('edit-link').select();$('copy-status').textContent='Выделили ссылку. Скопируйте её вручную.';}});
$('edit-answer').addEventListener('click',()=>{$('success').hidden=true;$('availability-form').hidden=false;$('submit-answer').textContent='Сохранить изменения';$('student-name').focus();});
restoreDraft();renderGrid();renderSummary();
if(!serviceReady){$('connection-note').hidden=false;$('connection-note').textContent='Приём ответов пока не открыт. Можно попробовать выбрать время; отправка станет доступна после подключения.';}
if(hasSavedAnswer){
  $('submit-answer').textContent='Сохранить изменения';
  if(serviceReady){setBusy(true);$('load-note').hidden=false;$('load-note').textContent='Загружаем ваш ответ…';apiRequest('load').then(data=>{validateServerAnswer(data);if(dirty){recordId=data.id;$('load-note').textContent='Восстановлен ваш несохранённый черновик. Нажмите «Сохранить изменения», чтобы отправить его преподавателю.';}else{applyServerAnswer(data);$('load-note').hidden=true;}}).catch(error=>{$('load-note').textContent=error.message;}).finally(()=>setBusy(false));}
}

