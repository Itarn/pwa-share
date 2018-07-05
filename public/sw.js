var cacheName = 'bs-0-2-1';
var cacheFiles = [
  './',
  './index.html',
  './skeleton.json',
  './index.js',
  './style.css',
  './img/book.png',
  './img/loading.svg'
];

// 缓存文件资源

self.addEventListener('install', function(e) {
  // e.waitUntil()
  // TODO: why 无法在打印台看到日志
  console.log('sw state: install');
  var cachOpenPromise = caches.open(cacheName).then(function(cache){
    return cache.addAll(cacheFiles);
  })
  e.waitUntil(cachOpenPromise);
})

// 使用缓存资源

var apiCacheName = 'api-0-1-1'
self.addEventListener('fetch', function (e) {
  // step2: 缓存 xhr 数据
  var cacheRequestUrls = [
    '/book?'
  ]
  console.log('现在正在请求' + e.request.url);
  var needCache = cacheRequestUrls.some(function(url){
    return e.request.url.indexOf(url) > -1
  })
  if (needCache) {
    caches.open(apiCacheName).then(function(cache){
      return fetch(e.request).then(function(response){
        // 返回响应
        // 缓存
        cache.put(e.request.url, response.clone());
        return response
      })
    })
  } else {
    // 接收 promise 作为参数，向浏览器返回数据
    e.respondWith(
      caches.match(e.request).then(function(cache){
        return cache || fetch(e.request);
      }).catch(function(err){
        console.log(err);
        return fetch(e.request);
      })
    );
  }
});

// 更新策略

self.addEventListener('activate', function(e){
  console.log('sw state: activate');
  var cachPromise = caches.keys().then(function(keys){
    return Promise.all(keys.map(function(key){
      if (key !== cacheName) {
        return caches.delete(key);
      }
    }))
    e.waitUntil(cachPromise);
    return self.clients.claim();
  });
});