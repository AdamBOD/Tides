var cacheName = 'tidesCache';
var filesToCache = [
    'index.html',
    'assets/js/main.js',
    'assets/lib/jquery/jquery-3.5.1.min.js',
    'assets/lib/jquery/jquery-ui.min.js',
    "assets/lib/jquery/jquery-ui.min.css",
    "assets/lib/jquery/jquery-ui.structure.min.css",
    "assets/lib/jquery/jquery-ui.theme.min.css",
    'assets/lib/moment/moment.js',
    'assets/lib/OwlCarousel/owl.carousel.min.js',
    'assets/lib/OwlCarousel/owl.carousel.min.css',
    'assets/lib/OwlCarousel/owl.theme.default.min.css',
    'assets/css/main.css',
    'assets/images/waves.png',
    'assets/images/Sea.png'
];

this.addEventListener ('install', (event) => {
    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[Service Worker] Caching app shell');
            return cache.addAll(filesToCache);
        }).then (function () { console.log('[Service Worker] Cached app shell');})
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
});