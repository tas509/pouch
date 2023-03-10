// from: https://github.com/codepo8/github-page-pwa/blob/main/sw.js

const GHPATH = '/pouch';
const APP_PREFIX = 'tba_';
const VERSION = 'version_002';
const URLS = [
  `${GHPATH}/`,
  `${GHPATH}/manifest.webmanifest`,
  `${GHPATH}/index.html`,
  `${GHPATH}/kidstv.html`,
  `${GHPATH}/app.js`,
  `${GHPATH}/backend.js`,
  `${GHPATH}/app_import_export.js`,
  `${GHPATH}/export-1678178762593.json`,

  `${GHPATH}/css/styles.css`,
  `${GHPATH}/css/bootstrap.min.css`,
  `${GHPATH}/js/jquery-3.6.0.min.js`,

  `${GHPATH}/js/pouchdb.min.js`,
  `${GHPATH}/js/pouchdb.find.js`,
  
  `${GHPATH}/img/favicon-16x16.png`,
  `${GHPATH}/img/favicon-32x32.png`,
  `${GHPATH}/img/mouse-192x192.png`,
  `${GHPATH}/img/mouse-512x512.png`
]

const CACHE_NAME = APP_PREFIX + VERSION
self.addEventListener('fetch', function (e) {
  console.log('Fetch request : ' + e.request.url);
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) {
        console.log('Responding with cache : ' + e.request.url);
        return request
      } else {
        console.log('File is not cached, fetching : ' + e.request.url);
        return fetch(e.request)
      }
    })
  )
})

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('Installing cache : ' + CACHE_NAME);
      return cache.addAll(URLS)
    })
  )
})

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      let cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX)
      })
      cacheWhitelist.push(CACHE_NAME);
      return Promise.all(keyList.map(function (key, i) {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log('Deleting cache : ' + keyList[i] );
          return caches.delete(keyList[i])
        }
      }))
    })
  )
})
