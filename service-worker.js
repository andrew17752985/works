// service-worker.js

const CACHE_NAME = 'my-cache';
const DATA_STORE_NAME = 'my-data-store';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/app.js',
        '/service-worker.js' // Додайте ваш файл Service Worker в кеш
        // ... (додайте інші ресурси, які потрібно кешувати)
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data.action === 'storeData') {
    storeData(event.data.data);
  }
});

function storeData(data) {
  const request = indexedDB.open('my-database', 1);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const store = db.createObjectStore(DATA_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    store.createIndex('name', 'name', { unique: false });
    store.createIndex('price', 'price', { unique: false });
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction([DATA_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(DATA_STORE_NAME);
    store.add(data);
    transaction.oncomplete = () => {
      db.close();
    };
  };

  request.onerror = (event) => {
    console.error('Error opening database:', event.target.errorCode);
  };
}
