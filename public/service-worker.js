const CACHE_NAME = "static-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/assets/js/index.js",
  "/assets/css/styles.css",
  "/assets/js/db.js",
  "/assets/images/icon-192x192.png",
  "/assets/images/icon-512x512.png",
  "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
  
];

// install
self.addEventListener("install", function (evt) {
  // pre cache image data
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {return cache.addAll(FILES_TO_CACHE)
    })
  );

  self.skipWaiting();
    
  // pre cache all static assets
  

  // tell the browser to activate this service worker immediately once it
  // has finished installing
  
});

// activate
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// fetch
self.addEventListener("fetch", (evt) => {
  if (evt.request.url.includes("/api/") && evt.request.method === 'GET') {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(evt.request)
          .then((response) => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request, response.clone());
            }

            return response;
          })
          .catch(()=> {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch((err) => console.log(err))
    );

    return;
  }

  evt.respondWith(
    caches.match(evt.request).then(response => {
        return response || fetch(evt.request);
      })
    )
  
});
