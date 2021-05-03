var cacheName = 'tidesCache';
var filesToCache = [
    'index.html',
    'register-sw.js',
    'manifest.json',
    'assets/js/main.js',
    'assets/css/main.css',
    'assets/lib/jquery/jquery-3.5.1.min.js',
    'assets/lib/jquery/jquery-ui.min.js',
    'assets/lib/jquery/jquery-ui.min.css',
    'assets/lib/jquery/jquery-ui.structure.min.css',
    'assets/lib/jquery/jquery-ui.theme.min.css',
    'assets/lib/moment/moment.js',
    'assets/lib/OwlCarousel/owl.carousel.min.js',
    'assets/lib/OwlCarousel/owl.carousel.min.css',
    'assets/lib/OwlCarousel/owl.theme.default.min.css',
    'assets/images/DirectionIcon.png',
    'assets/images/Sea.png',
    'assets/images/waves.png',
    'assets/images/icons/favicon.ico',
    'assets/images/icons/icon-72x72.png',
    'assets/images/icons/icon-96x96.png',
    'assets/images/icons/icon-128x128.png',
    'assets/images/icons/icon-144x144.png',
    'assets/images/icons/icon-152x152.png',
    'assets/images/icons/icon-192x192.png',
    'assets/images/icons/icon-384x384.png',
    'assets/images/icons/icon-512x512.png',
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