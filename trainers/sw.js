// Service worker портала тренажёров.
// ЭТОТ ФАЙЛ — ШАБЛОН: publish.js подставляет версию кэша и список файлов
// и кладёт готовый sw.js в deploy-site/trainers/sw.js. Руками sw.js не править!

const CACHE_VERSION = 'd74e9245e000';
const PRECACHE = 'trainers-' + CACHE_VERSION;   // кэш своих файлов (портал, тренажёры, иконки)
const RUNTIME = 'trainers-cdn-v1';              // кэш внешних ресурсов (шрифты, MathJax)

// Список своих файлов для предзагрузки — генерируется publish.js из сборки
const PRECACHE_URLS = [
  "/trainers/",
  "/trainers/manifest.webmanifest",
  "/trainers/icons/apple-touch-icon.png",
  "/trainers/icons/icon-192.png",
  "/trainers/icons/icon-512.png",
  "/trainers/icons/icon-maskable-192.png",
  "/trainers/icons/icon-maskable-512.png",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20sin%20cos.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20tg%20ctg.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%B2%D1%8B%D0%BD%D0%B5%D1%81%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BE%D0%B1%D1%89%D0%B5%D0%B3%D0%BE%20%D0%BC%D0%BD%D0%BE%D0%B6%D0%B8%D1%82%D0%B5%D0%BB%D1%8F.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%B2%D1%8B%D1%87%D0%B8%D1%82%D0%B0%D0%BD%D0%B8%D0%B5%20%D0%B4%D0%BE%20100.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%B4%D0%B8%D0%B0%D0%B3%D0%BD%D0%BE%D1%81%D1%82%D0%B8%D0%BA%D0%B0%209%20%D0%BA%D0%BB%D0%B0%D1%81%D1%81.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%B4%D1%80%D0%BE%D0%B1%D0%B8%20%D0%B2%20%D0%B4%D0%B5%D1%81%D1%8F%D1%82%D0%B8%D1%87%D0%BD%D1%8B%D0%B5.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BA%D0%B2%D0%B0%D0%B4%D1%80%D0%B0%D1%82%D0%BD%D1%8B%D0%B5%20%D0%BA%D0%BE%D1%80%D0%BD%D0%B8.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BA%D0%B2%D0%B0%D0%B4%D1%80%D0%B0%D1%82%D0%BD%D1%8B%D0%B5%20%D1%83%D1%80%D0%B0%D0%B2%D0%BD%D0%B5%D0%BD%D0%B8%D1%8F.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BA%D0%B2%D0%B0%D0%B4%D1%80%D0%B0%D1%82%D1%8B%2011-29.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BB%D0%B8%D0%BD%D0%B5%D0%B9%D0%BD%D1%8B%D0%B5%20%D1%83%D1%80%D0%B0%D0%B2%D0%BD%D0%B5%D0%BD%D0%B8%D1%8F.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BB%D0%BE%D0%B3%D0%B0%D1%80%D0%B8%D1%84%D0%BC%D1%8B%20%D0%BF%D0%BE%20%D0%BE%D0%B4%D0%BD%D0%BE%D0%BC%D1%83.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BB%D0%BE%D0%B3%D0%B0%D1%80%D0%B8%D1%84%D0%BC%D1%8B.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D0%B5%D1%86.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BE%D1%81%D0%BD%D0%BE%D0%B2%D0%BD%D0%BE%D0%B5%20%D1%82%D1%80%D0%B8%D0%B3%D0%BE%D0%BD%D0%BE%D0%BC%D0%B5%D1%82%D1%80%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B5%20%D1%82%D0%BE%D0%B6%D0%B4%D0%B5%D1%81%D1%82%D0%B2%D0%BE.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BE%D1%82%D1%80%D0%B8%D1%86%D0%B0%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9%20%D0%B8%20%D0%BD%D1%83%D0%BB%D0%B5%D0%B2%D0%BE%D0%B9%20%D0%BF%D0%BE%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D0%B5%D0%BB%D1%8C.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BF%D0%B8%D1%84%D0%B0%D0%B3%D0%BE%D1%80%D0%BE%D0%B2%D1%8B%20%D1%82%D1%80%D0%BE%D0%B9%D0%BA%D0%B8.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BF%D0%BB%D0%BE%D1%89%D0%B0%D0%B4%D0%B8%20%D1%84%D0%B8%D0%B3%D1%83%D1%80.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BF%D1%80%D0%B8%D0%B7%D0%BD%D0%B0%D0%BA%D0%B8%20%D0%B4%D0%B5%D0%BB%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D0%B8.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D0%BF%D1%80%D0%BE%D1%86%D0%B5%D0%BD%D1%82%D1%8B%20%D0%BE%D1%82%20%D1%87%D0%B8%D1%81%D0%BB%D0%B0.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%80%D0%B0%D0%B4%D0%B8%D0%B0%D0%BD%D1%8B%20%D0%B2%20%D0%B3%D1%80%D0%B0%D0%B4%D1%83%D1%81%D1%8B.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%80%D0%B0%D1%81%D0%BA%D1%80%D1%8B%D1%82%D0%B8%D0%B5%20%D1%81%D0%BA%D0%BE%D0%B1%D0%BE%D0%BA.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%81%D0%B2%D0%BE%D0%B9%D1%81%D1%82%D0%B2%D0%B0%20%D0%BB%D0%BE%D0%B3%D0%B0%D1%80%D0%B8%D1%84%D0%BC%D0%BE%D0%B2.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%81%D0%B2%D0%BE%D0%B9%D1%81%D1%82%D0%B2%D0%B0%20%D1%81%D1%82%D0%B5%D0%BF%D0%B5%D0%BD%D0%B5%D0%B9.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%81%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%B8%20%D0%B2%D1%8B%D1%87%D0%B8%D1%82%D0%B0%D0%BD%D0%B8%D0%B5%20%D0%B4%D1%80%D0%BE%D0%B1%D0%B5%D0%B9.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%81%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%B8%20%D0%B2%D1%8B%D1%87%D0%B8%D1%82%D0%B0%D0%BD%D0%B8%D0%B5%20%D1%81%20%D1%80%D0%B0%D0%B7%D0%BD%D1%8B%D0%BC%D0%B8%20%D0%B7%D0%BD%D0%B0%D0%BA%D0%B0%D0%BC%D0%B8.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%81%D0%BE%D0%BA%D1%80%D0%B0%D1%89%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%B4%D1%80%D0%BE%D0%B1%D0%B5%D0%B9.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%81%D1%82%D0%B5%D0%BF%D0%B5%D0%BD%D0%B8%202-9.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%82%D0%B0%D0%B1%D0%BB%D0%B8%D1%86%D0%B0%20%D1%83%D0%BC%D0%BD%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%82%D0%B5%D0%BE%D1%80%D0%B5%D0%BC%D0%B0%20%D0%B2%D0%B8%D0%B5%D1%82%D0%B0.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%83%D0%BC%D0%BD%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%B8%20%D0%B4%D0%B5%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%B4%D1%80%D0%BE%D0%B1%D0%B5%D0%B9.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%83%D0%BC%D0%BD%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B4%D0%B5%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BD%D0%B0%200.1%200.01%200.001.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%83%D0%BC%D0%BD%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B4%D0%B5%D0%BB%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BD%D0%B0%2010%20100%201000.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%84%D0%BE%D1%80%D0%BC%D1%83%D0%BB%D1%8B%20%D0%BF%D1%80%D0%B8%D0%B2%D0%B5%D0%B4%D0%B5%D0%BD%D0%B8%D1%8F.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%84%D1%81%D1%83%20%D0%BA%D0%B2%D0%B0%D0%B4%D1%80%D0%B0%D1%82%20%D1%81%D1%83%D0%BC%D0%BC%D1%8B.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%84%D1%81%D1%83%20%D1%80%D0%B0%D0%B7%D0%BD%D0%BE%D1%81%D1%82%D1%8C%20%D0%BA%D0%B2%D0%B0%D0%B4%D1%80%D0%B0%D1%82%D0%BE%D0%B2.html",
  "/trainers/trainers/%D1%82%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80%20-%20%D1%86%D0%B5%D0%BB%D0%B0%D1%8F%20%D1%87%D0%B0%D1%81%D1%82%D1%8C%20%D0%BA%D0%BE%D1%80%D0%BD%D1%8F.html"
];

// Внешние ресурсы, нужные тренажёрам офлайн
const CDN_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net'];

const FONTS_CSS = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap';

const MATHJAX_BASE = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5';
// MathJax догружает шрифты формул динамически — кэшируем весь набор заранее,
// иначе офлайн формулы останутся без глифов
const MATHJAX_URLS = [
  MATHJAX_BASE + '/tex-mml-chtml.js',
].concat([
  'MathJax_AMS-Regular', 'MathJax_Calligraphic-Bold', 'MathJax_Calligraphic-Regular',
  'MathJax_Fraktur-Bold', 'MathJax_Fraktur-Regular',
  'MathJax_Main-Bold', 'MathJax_Main-Italic', 'MathJax_Main-Regular',
  'MathJax_Math-BoldItalic', 'MathJax_Math-Italic', 'MathJax_Math-Regular',
  'MathJax_SansSerif-Bold', 'MathJax_SansSerif-Italic', 'MathJax_SansSerif-Regular',
  'MathJax_Script-Regular',
  'MathJax_Size1-Regular', 'MathJax_Size2-Regular', 'MathJax_Size3-Regular', 'MathJax_Size4-Regular',
  'MathJax_Typewriter-Regular', 'MathJax_Vector-Bold', 'MathJax_Vector-Regular', 'MathJax_Zero',
].map((f) => MATHJAX_BASE + '/output/chtml/fonts/woff-v2/' + f + '.woff'));

// --- Установка: предзагрузка всего необходимого ---
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    // Свои файлы — атомарно: если хоть один не скачался, установка не засчитывается
    const precache = await caches.open(PRECACHE);
    await precache.addAll(PRECACHE_URLS);

    // Внешние ресурсы — по одному, сбой любого НЕ ломает установку
    const runtime = await caches.open(RUNTIME);
    await Promise.all(MATHJAX_URLS.map((u) =>
      runtime.match(u).then((hit) => hit || runtime.add(u).catch(() => {}))
    ));

    // CSS Google Fonts + файлы шрифтов, на которые он ссылается
    try {
      const resp = await fetch(FONTS_CSS);
      if (resp.ok) {
        const css = await resp.text();
        await runtime.put(FONTS_CSS, new Response(css, { headers: { 'Content-Type': 'text/css' } }));
        const urls = css.match(/url\((https:[^)]+)\)/g) || [];
        await Promise.all(urls.map((m) => {
          const u = m.slice(4, -1);
          return runtime.match(u).then((hit) => hit || runtime.add(u).catch(() => {}));
        }));
      }
    } catch (e) { /* офлайн-установка без шрифтов — не критично */ }

    await self.skipWaiting();
  })());
});

// --- Активация: удаляем кэши старых версий ---
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((k) => k.startsWith('trainers-') && k !== PRECACHE && k !== RUNTIME)
      .map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// --- Обработка запросов ---

// Для страниц: сначала сеть (с таймаутом 3 с), при неудаче — кэш
async function networkFirst(request) {
  try {
    const resp = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]);
    if (resp && resp.ok) {
      const cache = await caches.open(PRECACHE);
      cache.put(request, resp.clone());
      return resp;
    }
    throw new Error('bad response');
  } catch (e) {
    const hit = await caches.match(request, { ignoreSearch: true });
    return hit || caches.match('/trainers/');
  }
}

// Для ресурсов: сначала кэш, при промахе — сеть с докэшированием
async function cacheFirst(request, cacheName) {
  const hit = await caches.match(request);
  if (hit) return hit;
  const resp = await fetch(request);
  if (resp && (resp.ok || resp.type === 'opaque')) {
    const cache = await caches.open(cacheName);
    cache.put(request, resp.clone());
  }
  return resp;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
  } else if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(request, RUNTIME));
  } else if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, PRECACHE));
  }
});
