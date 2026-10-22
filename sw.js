// 미니 스마트팜 웹페이지 오프라인 캐시 (서비스 워커)
// 집에서 한 번 열어 두면, 인터넷이 없는 곳에서도 화면이 열리게 해 줌
const CACHE = "smartfarm-v1";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  // 버전이 바뀌면 예전 캐시 삭제
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // 인터넷이 되면 최신 파일을 받아 캐시에 저장, 안 되면 저장해 둔 파일 사용
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./index.html")))
  );
});
